import { computeFeatures, isVisible } from './features.js';
import { LandmarkSmoother } from './filters.js';
import { HoldWindow, RepSegmenter } from './segment.js';
import { repKinematics, spread, velocityLoss } from './kinematics.js';
import { assessSetup } from './setup.js';
import { median } from './math.js';

const DEFAULTS = {
  minGapMs: 3000, // never speak twice within this gap
  cooldownMs: 15000, // don't repeat the same cue within this time
  persistMs: 1500, // hold drills: a fault must last this long before a cue
  praiseAfterMs: 2000, // hold drills: a fixed fault must stay fixed this long
  evalEveryMs: 250, // hold drills: how often to check
  windowMs: 1000, // hold drills: median window
  hintCooldownMs: 9000,
  missingMs: 1200,
  viewMs: 2000,
  setGapMs: 20000, // a pause this long between reps starts a new set
  fatigueLoss: 0.25, // velocity loss that triggers the "slowing down" note
  timelineMs: 1000, // hold drills: how often to log the score for the report
  maxTraces: 60, // reps kept for replay
};

// The coach turns frames into events. It knows nothing about cameras or the
// DOM, so it runs the same in the browser and in tests.
//
// push(frame) returns a list of events:
//   { type: 'hint', id, text }             setup problems: framing, camera angle
//   { type: 'calibrating', progress }      collecting a baseline (posture drills)
//   { type: 'rep', index, score, results } a finished rep with every check
//   { type: 'cue', id, text, joints }      one correction to say out loud
//   { type: 'praise', id, text }           a cued fault that is now fixed
//   { type: 'fatigue', text, loss }        reps in this set are slowing down
//   { type: 'set', index }                 a long pause started a new set
//
// `latest` always holds the newest measurements, the camera check (`setup`)
// and the angle to draw on the overlay (`focus`).
export class Coach {
  constructor(drill, { settings = {}, smooth = true, ...options } = {}) {
    this.drill = drill;
    this.settings = { ...defaultSettings(drill), ...settings };
    this.opts = { ...DEFAULTS, ...drill.timing, ...options };
    this.smoother = smooth ? new LandmarkSmoother() : null;
    this.worldSmoother = smooth ? new LandmarkSmoother() : null;
    this.segmenter = drill.mode === 'rep' ? new RepSegmenter(drill.rep) : null;
    this.window = new HoldWindow(this.opts.windowMs);

    this.baseline = null;
    this.calibration = drill.calibrate ? { frames: [], startedAt: null } : null;

    this.reps = [];
    this.history = new Map(); // check id -> last 3 rep outcomes
    this.faultSince = new Map(); // hold: check id -> when it went wrong
    this.okSince = new Map(); // hold: check id -> when it came right
    this.cued = new Map(); // check id -> when we last said it
    this.lastSpokeAt = -Infinity;
    this.hintAt = new Map();
    this.missingSince = null;
    this.wrongViewSince = null;
    this.lastEvalAt = -Infinity;
    this.startedAt = null;
    this.endedAt = null;

    this.holdTime = { total: 0, good: 0, byCheck: new Map() };
    this.stats = new Map(); // check id -> { label, target, faults, total, values }
    this.sets = []; // rep drills: { index, reps, speeds, warned }
    this.timeline = []; // hold drills: { s, score } once a second
    this.lastTimelineAt = -Infinity;
    this.badDistanceSince = null;

    this.latest = { features: null, results: [], faultJoints: [], score: null, setup: null, focus: null };
  }

  push(frame) {
    const t = frame.t;
    if (this.startedAt == null) this.startedAt = t;
    this.endedAt = t;
    const events = [];

    const pose = this.smoother ? this.smoother.smooth(frame.pose, t) : frame.pose;
    const world = this.worldSmoother ? this.worldSmoother.smooth(frame.world, t) : frame.world;
    const f = computeFeatures({ t, pose, world, hands: frame.hands });
    this.drill.derive?.(f, this.settings);
    this.latest.features = f;
    this.latest.setup = assessSetup(f, this.drill, this.settings);

    this.process(f, t, events);
    this.latest.focus = this.focusOf(f);
    return events;
  }

  process(f, t, events) {
    // 1. Can we see what this drill needs?
    const missing = this.missingParts(f);
    if (missing) {
      this.missingSince ??= t;
      if (t - this.missingSince >= this.opts.missingMs) this.hint(events, 'missing', missing, t);
      this.segmenter?.push({ t }); // lets the segmenter notice the gap
      this.window.clear();
      this.latest.faultJoints = [];
      return;
    }
    this.missingSince = null;

    // Too far, too close or at the edge: say so, but keep coaching.
    const distance = this.latest.setup.items.find((i) => i.id === 'distance');
    if (distance && !distance.ok) {
      this.badDistanceSince ??= t;
      if (t - this.badDistanceSince >= this.opts.viewMs) this.hint(events, 'distance', distance.tip, t);
    } else {
      this.badDistanceSince = null;
    }

    // 2. Is the camera at the right angle?
    if (this.drill.views && f.view && !this.drill.views.includes(f.view)) {
      this.wrongViewSince ??= t;
      if (t - this.wrongViewSince >= this.opts.viewMs) {
        this.hint(events, 'view', this.drill.viewHint, t);
        return;
      }
    } else {
      this.wrongViewSince = null;
    }

    // 3. Baseline for drills that compare you to your own good posture.
    if (this.calibration && !this.baseline) {
      this.calibrate(f, t, events);
      return;
    }

    if (this.drill.mode === 'rep') this.stepRep(f, t, events);
    else this.stepHold(f, t, events);
  }

  // The drill's main angle, drawn on the joint in the overlay: which three
  // points, the measured value and whether the check it belongs to is off.
  focusOf(f) {
    const live = this.drill.live;
    if (!live || !f.pose) return null;
    const points = live.arc(f, this.settings);
    const value = live.read(f, this.settings);
    if (!points || value == null) return null;
    const result = this.latest.results.find((r) => r.id === live.check);
    return { points, value, fault: Boolean(result?.fault), label: live.label };
  }

  // `needs` lists pose landmarks that must be visible. An entry that is an
  // array means any one of them will do (the near side in a side view).
  missingParts(f) {
    const d = this.drill;
    const read = (x) => (typeof x === 'function' ? x(this.settings) : x) || [];
    const needs = read(d.needs);
    const seen = (n) => (Array.isArray(n) ? n.some((i) => isVisible(f.pose, i)) : isVisible(f.pose, n));
    if (needs.length && (!f.pose || !needs.every(seen))) return d.missingHint;
    for (const side of read(d.needsHands)) {
      if (!f.hands[side]) return d.missingHandsHint || d.missingHint;
    }
    return null;
  }

  calibrate(f, t, events) {
    const c = this.calibration;
    const { ms, keys, prompt } = this.drill.calibrate;
    if (c.startedAt == null) {
      c.startedAt = t;
      this.hint(events, 'calibrate', prompt, t, true);
    }
    c.frames.push(f);
    const progress = Math.min(1, (t - c.startedAt) / ms);
    events.push({ type: 'calibrating', progress });
    if (progress < 1) return;

    const baseline = {};
    for (const k of keys) baseline[k] = median(c.frames.map((fr) => fr[k]));
    if (keys.some((k) => baseline[k] == null)) {
      c.frames = [];
      c.startedAt = null; // couldn't measure; try again
      return;
    }
    this.baseline = baseline;
    events.push({ type: 'calibrated', baseline });
  }

  stepRep(f, t, events) {
    const rep = this.segmenter.push(f);
    if (!rep) return;
    rep.baseline = this.baseline;
    rep.settings = this.settings;
    const results = this.evaluate(rep, rep.extreme.view ?? f.view);
    const score = scoreOf(results);
    const index = this.reps.length + 1;

    // Sets: a long pause since the last rep starts a new one.
    const prev = this.reps[this.reps.length - 1];
    if (!prev || rep.movedAt - prev.end > this.opts.setGapMs) {
      this.sets.push({ index: this.sets.length + 1, reps: 0, speeds: [], warned: false });
      if (prev) events.push({ type: 'set', index: this.sets.length });
    }
    const set = this.sets[this.sets.length - 1];
    const kin = repKinematics(rep, this.drill.rep);
    set.reps += 1;
    set.speeds.push(kin?.speed ?? null);
    const loss = velocityLoss(set.speeds);

    this.reps.push({
      index,
      set: set.index,
      score,
      results,
      at: t,
      end: rep.end,
      duration: rep.duration,
      kin,
      loss,
      faults: jointsOf(this.drill, results),
      trace: this.reps.length < this.opts.maxTraces ? traceOf(rep) : null,
    });
    this.record(results);
    events.push({ type: 'rep', index, score, results, set: set.index, kin, loss });

    for (const r of results) {
      if (r.skipped) continue;
      const h = this.history.get(r.id) || [];
      h.push(r.fault);
      if (h.length > 3) h.shift();
      this.history.set(r.id, h);
    }
    const confirmed = results.filter(
      (r) => !r.skipped && r.fault && (this.history.get(r.id) || []).filter(Boolean).length >= 2
    );
    const fixed = [...this.cued.keys()].filter((id) => {
      const h = this.history.get(id) || [];
      return h.length >= 2 && !h[h.length - 1] && !h[h.length - 2];
    });
    this.latest = { ...this.latest, results, score, faultJoints: jointsOf(this.drill, results) };

    // Slowing down: the last two reps both lost a quarter of the set's best speed.
    let fatigue = null;
    if (this.drill.rep.fatigue && !set.warned && set.speeds.length >= 3) {
      const valid = set.speeds.filter((s) => s > 0);
      const best = Math.max(...valid);
      const lastTwo = set.speeds.slice(-2);
      if (lastTwo.every((s) => s > 0 && 1 - s / best >= this.opts.fatigueLoss)) {
        fatigue = { set, loss };
      }
    }
    this.speak(events, confirmed, fixed, t, fatigue);
  }

  stepHold(f, t, events) {
    this.window.push(f);
    if (t - this.lastEvalAt < this.opts.evalEveryMs) return;
    const dt = Number.isFinite(this.lastEvalAt) ? Math.min(t - this.lastEvalAt, 1000) : 0;
    this.lastEvalAt = t;

    const ctx = holdContext(this.window, this.baseline, this.settings);
    if (this.drill.inPosition && !this.drill.inPosition(ctx)) {
      this.hint(events, 'position', this.drill.positionHint, t);
      this.latest = { ...this.latest, results: [], faultJoints: [], score: null };
      return;
    }

    const results = this.evaluate(ctx, f.view);
    const score = scoreOf(results);
    this.holdTime.total += dt;
    if (score === 100) this.holdTime.good += dt;
    for (const r of results) {
      if (r.skipped) continue;
      const s = this.holdTime.byCheck.get(r.id) || { faultMs: 0, totalMs: 0 };
      s.totalMs += dt;
      if (r.fault) s.faultMs += dt;
      this.holdTime.byCheck.set(r.id, s);

      if (r.fault) {
        this.faultSince.set(r.id, this.faultSince.get(r.id) ?? t);
        this.okSince.delete(r.id);
      } else {
        this.okSince.set(r.id, this.okSince.get(r.id) ?? t);
        this.faultSince.delete(r.id);
      }
    }
    this.record(results, true);
    if (score != null && t - this.lastTimelineAt >= this.opts.timelineMs && this.timeline.length < 7200) {
      this.lastTimelineAt = t;
      this.timeline.push({ s: Math.round((t - this.startedAt) / 100) / 10, score });
    }

    const confirmed = results.filter(
      (r) => r.fault && t - (this.faultSince.get(r.id) ?? t) >= this.opts.persistMs
    );
    const fixed = [...this.cued.keys()].filter(
      (id) => this.okSince.has(id) && t - this.okSince.get(id) >= this.opts.praiseAfterMs
    );
    this.latest = { ...this.latest, results, score, faultJoints: jointsOf(this.drill, confirmed) };
    this.speak(events, confirmed, fixed, t);
  }

  evaluate(ctx, view) {
    return this.drill.checks.map((c) => {
      const base = { id: c.id, label: c.label, target: c.target, weight: c.weight ?? 20 };
      if (c.views && view && !c.views.includes(view)) return { ...base, skipped: 'view', views: c.views };
      let value = null;
      try {
        value = c.measure(ctx);
      } catch {
        value = null;
      }
      if (value == null || Number.isNaN(value)) return { ...base, skipped: 'hidden' };
      const fault = Boolean(c.fault(value, ctx));
      return { ...base, value, fault, display: (c.format || formatDegrees)(value) };
    });
  }

  // Pick at most one thing to say: the most important confirmed fault that
  // isn't cooling down, otherwise praise for something just fixed.
  speak(events, confirmed, fixed, t, fatigue = null) {
    if (t - this.lastSpokeAt < this.opts.minGapMs) return;
    const byId = (id) => this.drill.checks.find((c) => c.id === id);

    const next = confirmed
      .filter((r) => t - (this.cued.get(r.id) ?? -Infinity) >= this.opts.cooldownMs)
      .sort((a, b) => b.weight - a.weight)[0];
    if (next) {
      const check = byId(next.id);
      this.cued.set(next.id, t);
      this.lastSpokeAt = t;
      events.push({ type: 'cue', id: next.id, text: check.cue, joints: check.joints || [] });
      return;
    }

    if (fatigue) {
      fatigue.set.warned = true;
      this.lastSpokeAt = t;
      events.push({
        type: 'fatigue',
        id: 'fatigue',
        loss: fatigue.loss,
        text: this.drill.rep.fatigueCue || 'Your reps are slowing down. Do one or two more, then rest.',
      });
      return;
    }

    const done = fixed.find((id) => byId(id)?.fixed);
    if (done) {
      this.cued.delete(done);
      this.lastSpokeAt = t;
      events.push({ type: 'praise', id: done, text: byId(done).fixed });
      return;
    }
    for (const id of fixed) this.cued.delete(id);
  }

  hint(events, id, text, t, force = false) {
    if (!text) return;
    const last = this.hintAt.get(id) ?? -Infinity;
    if (!force && t - last < this.opts.hintCooldownMs) return;
    this.hintAt.set(id, t);
    this.lastSpokeAt = t;
    events.push({ type: 'hint', id, text });
  }

  record(results, isHold = false) {
    for (const r of results) {
      if (r.skipped) continue;
      const s = this.stats.get(r.id) || { label: r.label, target: r.target, faults: 0, total: 0, values: [] };
      s.total += 1;
      if (r.fault) s.faults += 1;
      if (!isHold || s.values.length < 2000) s.values.push(r.value);
      this.stats.set(r.id, s);
    }
  }

  summary() {
    const durationMs = this.startedAt == null ? 0 : this.endedAt - this.startedAt;
    const scores = this.reps.map((r) => r.score).filter((s) => s != null);
    const checks = this.drill.checks
      .map((c) => {
        const s = this.stats.get(c.id);
        if (!s) return null;
        const hold = this.holdTime.byCheck.get(c.id);
        const typical = median(s.values);
        const sd = this.drill.mode === 'rep' ? spread(s.values) : null;
        const spreadFormat = c.spreadFormat || (c.format ? null : (v) => `±${Math.round(v)}°`);
        return {
          id: c.id,
          label: c.label,
          target: c.target,
          typical: typical == null ? null : (c.format || formatDegrees)(typical),
          spread: sd != null && spreadFormat ? spreadFormat(sd) : null,
          faultRate: this.drill.mode === 'hold'
            ? hold && hold.totalMs ? hold.faultMs / hold.totalMs : 0
            : s.total ? s.faults / s.total : 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.faultRate - a.faultRate);

    return {
      drillId: this.drill.id,
      mode: this.drill.mode,
      startedAt: Date.now() - durationMs,
      durationMs,
      reps: this.reps.length,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
      bestScore: scores.length ? Math.max(...scores) : null,
      goodTimeShare: this.holdTime.total ? this.holdTime.good / this.holdTime.total : null,
      checks,
      repLog: this.reps.map((r) => ({
        index: r.index,
        set: r.set,
        score: r.score,
        downMs: r.kin ? Math.round(r.kin.towardMs) : null,
        pauseMs: r.kin ? Math.round(r.kin.holdMs) : null,
        upMs: r.kin ? Math.round(r.kin.backMs) : null,
        speed: r.kin?.speed != null ? Math.round(r.kin.speed) : null,
        loss: r.loss != null ? Math.round(r.loss * 100) / 100 : null,
        values: Object.fromEntries(
          r.results.filter((x) => !x.skipped).map((x) => [x.id, Math.round(x.value * 100) / 100])
        ),
      })),
      sets: this.sets.map((s) => ({ index: s.index, reps: s.reps, loss: velocityLoss(s.speeds) })),
      timeline: this.timeline,
      replay: this.replay(),
    };
  }

  // Best and worst rep, for the side-by-side replay in the report.
  replay() {
    const traced = this.reps.filter((r) => r.trace?.frames.length && r.score != null);
    if (!traced.length) return null;
    const best = traced.reduce((a, b) => (b.score >= a.score ? b : a));
    const worst = traced.reduce((a, b) => (b.score < a.score ? b : a));
    const pack = (r) => ({ index: r.index, score: r.score, faults: r.faults, frames: r.trace.frames, bottom: r.trace.bottom });
    return { best: pack(best), worst: worst.score < best.score ? pack(worst) : null };
  }
}

// A rep's skeleton, every other frame, rounded, for replay.
function traceOf(rep) {
  const r = (v) => Math.round(v * 1000) / 1000;
  const t0 = rep.frames[0].t;
  const kept = rep.frames.filter((fr, i) => i % 2 === 0 && fr.pose);
  const frames = kept.map((fr) => ({
    t: Math.round(fr.t - t0),
    p: fr.pose.map((pt) => [r(pt.x), r(pt.y), (pt.visibility ?? 0) >= 0.5 ? 1 : 0]),
  }));
  // Index of the kept frame closest to the bottom (or top) of the rep.
  let bottom = 0;
  kept.forEach((fr, i) => {
    if (Math.abs(fr.t - rep.extreme.t) < Math.abs(kept[bottom].t - rep.extreme.t)) bottom = i;
  });
  return { frames, bottom };
}

function holdContext(window, baseline, settings) {
  return {
    get: (k) => window.get(k),
    latest: window.latest,
    baseline,
    settings,
  };
}

export function scoreOf(results) {
  const scored = results.filter((r) => !r.skipped);
  if (!scored.length) return null;
  const total = scored.reduce((s, r) => s + r.weight, 0);
  const lost = scored.filter((r) => r.fault).reduce((s, r) => s + r.weight, 0);
  return Math.round(100 * (1 - lost / total));
}

function jointsOf(drill, results) {
  const out = new Set();
  for (const r of results) {
    if (!r.fault) continue;
    const check = drill.checks.find((c) => c.id === r.id);
    for (const j of check?.joints || []) out.add(j);
  }
  return [...out];
}

function defaultSettings(drill) {
  const s = {};
  for (const opt of drill.options || []) s[opt.id] = opt.default;
  return s;
}

export function formatDegrees(v) {
  return `${Math.round(v)}°`;
}
