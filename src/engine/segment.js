import { median } from './math.js';

// Splits a stream of frames into reps using one signal (for a squat, the knee
// angle). A rep starts when the signal leaves its resting range, must reach
// the "active" threshold, and ends when it comes back to rest. Shallow
// movements that never reach "active" are dropped.
//
// direction 'down': the signal drops during the rep (knee angle in a squat).
// direction 'up':   the signal rises during the rep (wrist height in a shot).
export class RepSegmenter {
  constructor({ signal, direction = 'down', rest, active, minMs = 350, maxMs = 8000, prerollMs = 900 }) {
    this.signal = signal;
    this.direction = direction;
    this.rest = rest;
    this.active = active;
    this.minMs = minMs;
    this.maxMs = maxMs;
    this.prerollMs = prerollMs;
    this.reset();
  }

  reset() {
    this.state = 'rest';
    this.frames = [];
    this.preroll = [];
    this.lastT = null;
  }

  atRest(v) {
    return this.direction === 'down' ? v >= this.rest : v <= this.rest;
  }

  pastActive(v) {
    return this.direction === 'down' ? v <= this.active : v >= this.active;
  }

  // Returns a completed rep, or null.
  push(f) {
    const v = f[this.signal];
    if (v == null) {
      // A long dropout means we lost the athlete; don't stitch reps across it.
      if (this.lastT != null && f.t - this.lastT > 1000) this.reset();
      return null;
    }
    this.lastT = f.t;

    if (this.state === 'rest') {
      this.preroll.push(f);
      while (this.preroll.length && f.t - this.preroll[0].t > this.prerollMs) this.preroll.shift();
      if (!this.atRest(v)) {
        this.state = 'moving';
        this.startT = f.t;
        this.frames = [...this.preroll];
        this.preroll = [];
      }
      return null;
    }

    this.frames.push(f);
    if (f.t - this.startT > this.maxMs) {
      this.reset();
      return null;
    }
    if (this.state === 'moving' && this.pastActive(v)) this.state = 'active';
    if (!this.atRest(v)) return null;

    const done = this.state === 'active' && f.t - this.startT >= this.minMs;
    const frames = this.frames;
    this.state = 'rest';
    this.frames = [];
    this.preroll = [f];
    return done ? new Rep(frames, this.signal, this.direction, this.startT) : null;
  }
}

// One finished rep. Checks read it through min/max/at so they can ask things
// like "lowest knee angle" or "trunk lean at the bottom".
export class Rep {
  constructor(frames, signal, direction, startT) {
    this.frames = frames;
    this.signal = signal;
    this.start = frames[0].t;
    this.movedAt = startT;
    this.end = frames[frames.length - 1].t;
    this.duration = this.end - this.start;

    let best = 0;
    frames.forEach((fr, i) => {
      const v = fr[signal];
      const b = frames[best][signal];
      if (v == null) return;
      if (b == null || (direction === 'down' ? v < b : v > b)) best = i;
    });
    this.extremeIndex = best;
    this.extreme = frames[best];
  }

  phase(which) {
    if (which === 'before') return this.frames.slice(0, this.extremeIndex + 1);
    if (which === 'after') return this.frames.slice(this.extremeIndex);
    return this.frames;
  }

  values(key, which = 'all') {
    return this.phase(which)
      .map((fr) => fr[key])
      .filter((v) => v != null && Number.isFinite(v));
  }

  min(key, which) {
    const v = this.values(key, which);
    return v.length ? Math.min(...v) : null;
  }

  max(key, which) {
    const v = this.values(key, which);
    return v.length ? Math.max(...v) : null;
  }

  // Value at the bottom (or top) of the rep, from a median of nearby frames
  // so one noisy frame can't decide it.
  at(key) {
    const i = this.extremeIndex;
    return median(this.frames.slice(Math.max(0, i - 2), i + 3).map((fr) => fr[key]));
  }

  // Milliseconds from the start of movement to the bottom/top of the rep.
  get toExtremeMs() {
    return this.extreme.t - this.movedAt;
  }

  // Milliseconds after the bottom/top until `test(frame)` first passes.
  msAfterExtremeUntil(test) {
    for (const fr of this.phase('after')) {
      if (test(fr)) return fr.t - this.extreme.t;
    }
    return this.end - this.extreme.t;
  }
}

// For held positions (a stance, sitting posture): the last `windowMs` of
// frames, read through medians so a single bad frame doesn't trigger a cue.
export class HoldWindow {
  constructor(windowMs = 1000) {
    this.windowMs = windowMs;
    this.frames = [];
  }

  push(f) {
    this.frames.push(f);
    while (this.frames.length && f.t - this.frames[0].t > this.windowMs) this.frames.shift();
  }

  get(key) {
    return median(this.frames.map((fr) => fr[key]));
  }

  get latest() {
    return this.frames[this.frames.length - 1];
  }

  clear() {
    this.frames = [];
  }
}
