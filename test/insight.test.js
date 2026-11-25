import { describe, expect, it } from 'vitest';
import { Coach } from '../src/engine/coach.js';
import { computeFeatures } from '../src/engine/features.js';
import { assessSetup } from '../src/engine/setup.js';
import { spread, velocityLoss } from '../src/engine/kinematics.js';
import { ANGLES } from '../src/engine/landmarks.js';
import { saveSession, loadSessions } from '../src/engine/history.js';
import { squat, frontStance } from '../src/drills/sport.js';
import { deskPosture } from '../src/drills/posture.js';
import { toCsv } from '../src/utils/exportSession.js';
import {
  deskPose,
  frontSquatRep,
  frontStancePose,
  phasedRep,
  run,
  sideSquatPose,
  squatRep,
  standing,
  transform,
} from './fixtures.js';

const ofType = (events, type) => events.filter((e) => e.type === type);
const features = (pose, drill) => {
  const f = computeFeatures({ t: 0, pose, world: null, hands: [] });
  drill.derive?.(f, {});
  return f;
};

describe('rep timing', () => {
  it('splits each rep into down, pause and up, and measures speed on the way up', () => {
    const coach = new Coach(squat, { smooth: false });
    const { events } = run(coach, [
      standing(),
      ...phasedRep({ down: 1200, pause: 700, up: 600 }),
      standing(),
      ...phasedRep({ down: 1200, pause: 0, up: 1200 }),
      standing(),
    ]);
    const [quick, slow] = ofType(events, 'rep').map((r) => r.kin);
    expect(quick.holdMs).toBeGreaterThan(slow.holdMs + 450);
    expect(quick.backMs).toBeLessThan(slow.backMs);
    // Same distance in half the time: about twice the speed.
    expect(quick.speed / slow.speed).toBeGreaterThan(1.6);
    expect(quick.speed / slow.speed).toBeLessThan(2.5);
  });

  it('warns once when reps in a set slow down by a quarter', () => {
    const coach = new Coach(squat, { smooth: false });
    const fast = [standing(), squatRep(90, { ms: 1600 })];
    const slow = [standing(), squatRep(90, { ms: 2600 })];
    const { events } = run(coach, [...fast, ...fast, ...fast, ...slow, ...slow, ...slow, standing()]);

    const reps = ofType(events, 'rep');
    const fatigue = ofType(events, 'fatigue');
    expect(fatigue).toHaveLength(1);
    expect(fatigue[0].t).toBeGreaterThan(reps[3].t);
    expect(fatigue[0].loss).toBeGreaterThan(0.25);
    expect(ofType(events, 'cue')).toHaveLength(0);
    expect(coach.summary().sets[0].loss).toBeGreaterThan(0.25);
  });

  it('does not call steady reps fatigue', () => {
    const coach = new Coach(squat, { smooth: false });
    const rep = [standing(), squatRep(90, { ms: 1800 })];
    const { events } = run(coach, [...rep, ...rep, ...rep, ...rep, ...rep, standing()]);
    expect(ofType(events, 'fatigue')).toHaveLength(0);
  });

  it('starts a new set after a long rest', () => {
    const coach = new Coach(squat, { smooth: false });
    const rep = [standing(), squatRep(90)];
    const { events } = run(coach, [...rep, ...rep, standing(21000), squatRep(90), standing()]);
    expect(ofType(events, 'set').map((e) => e.index)).toEqual([2]);
    const s = coach.summary();
    expect(s.sets.map((x) => x.reps)).toEqual([2, 1]);
    expect(s.repLog.map((r) => r.set)).toEqual([1, 1, 2]);
  });

  it('reports how much a check varied from rep to rep', () => {
    const coach = new Coach(squat, { smooth: false });
    run(coach, [standing(), squatRep(90), standing(), squatRep(100), standing(), squatRep(80), standing()]);
    const depth = coach.summary().checks.find((c) => c.id === 'depth');
    expect(depth.spread).toBe('±10°');
    expect(spread([1, 2, 3])).toBe(1);
    expect(velocityLoss([100, 80])).toBeCloseTo(0.2);
  });
});

describe('camera check', () => {
  it('passes a side-on athlete standing at a good distance', () => {
    const setup = assessSetup(features(sideSquatPose(), squat), squat);
    expect(setup.ready).toBe(true);
    expect(setup.items.find((i) => i.id === 'angle').value).toBe('side view');
    expect(setup.items.find((i) => i.id === 'tracking').value).toBe('good');
  });

  it('says when you are too far, at the edge, or cut off', () => {
    const far = assessSetup(features(transform(sideSquatPose(), { scale: 0.4 }), squat), squat);
    expect(far.ready).toBe(false);
    expect(far.items.find((i) => i.id === 'distance').value).toBe('too far');

    const edge = assessSetup(features(transform(sideSquatPose(), { dx: 0.45 }), squat), squat);
    expect(edge.items.find((i) => i.id === 'distance').tip).toMatch(/edge/);

    const pose = sideSquatPose();
    for (const i of [27, 28, 29, 30, 31, 32]) pose[i] = { ...pose[i], visibility: 0.1 };
    const cut = assessSetup(features(pose, squat), squat);
    expect(cut.items.find((i) => i.id === 'inFrame').ok).toBe(false);
  });

  it('checks distance from shoulder width for desk posture', () => {
    expect(assessSetup(features(deskPose(), deskPosture), deskPosture).ready).toBe(true);
    const far = assessSetup(features(deskPose({ scale: 0.5 }), deskPosture), deskPosture);
    expect(far.items.find((i) => i.id === 'distance').value).toBe('too far');
  });

  it('tells you to move closer during a session, without stopping the coaching', () => {
    const coach = new Coach(squat, { smooth: false });
    const { events } = run(coach, [[3000, () => transform(sideSquatPose(), { scale: 0.45 })]]);
    expect(ofType(events, 'hint').map((h) => h.id)).toContain('distance');
    expect(coach.latest.setup.ready).toBe(false);
  });
});

describe('balance (front view)', () => {
  it('catches a squat that shifts to one side', () => {
    const coach = new Coach(squat, { smooth: false });
    const rep = [[600, () => frontSquatRep(95)[1](0)], frontSquatRep(95, { shift: 0.4 })];
    const { events } = run(coach, [...rep, ...rep, [600, () => frontSquatRep(95)[1](0)]]);
    const balance = ofType(events, 'rep')[0].results.find((r) => r.id === 'balance');
    expect(balance.fault).toBe(true);
    expect(ofType(events, 'cue').map((c) => c.id)).toContain('balance');
  });

  it('passes an even squat and skips the check from the side', () => {
    const coach = new Coach(squat, { smooth: false });
    const rep = [[600, () => frontSquatRep(95)[1](0)], frontSquatRep(95)];
    const { events } = run(coach, [...rep, [600, () => frontSquatRep(95)[1](0)]]);
    expect(ofType(events, 'rep')[0].results.find((r) => r.id === 'balance').fault).toBe(false);

    const side = new Coach(squat, { smooth: false });
    const r2 = run(side, [standing(), squatRep(90), standing()]);
    expect(ofType(r2.events, 'rep')[0].results.find((r) => r.id === 'balance').skipped).toBe('view');
  });
});

describe('overlay focus and replay', () => {
  it('names the joint and angle to draw', () => {
    const coach = new Coach(squat, { smooth: false });
    run(coach, [[500, () => sideSquatPose({ knee: 120 })]]);
    expect(coach.latest.focus.points).toEqual(ANGLES.knee.L);
    expect(coach.latest.focus.value).toBeCloseTo(120, 0);

    const stance = new Coach(frontStance, { smooth: false });
    run(stance, [[2500, () => frontStancePose({ front: 150 })]]);
    expect(stance.latest.focus.points).toEqual(ANGLES.knee.L);
    expect(stance.latest.focus.fault).toBe(true);
  });

  it('keeps the best and worst rep for replay, but not in saved history', () => {
    const coach = new Coach(squat, { smooth: false });
    run(coach, [standing(), squatRep(90), standing(), squatRep(125), standing(), squatRep(92), standing()]);
    const s = coach.summary();
    expect(s.replay.best.score).toBeGreaterThan(s.replay.worst.score);
    expect(s.replay.worst.index).toBe(2);
    expect(s.replay.best.frames.length).toBeGreaterThan(10);
    expect(s.replay.best.frames[0].p).toHaveLength(33);

    const store = new Map();
    const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
    saveSession(s, storage);
    const saved = loadSessions(storage)[0];
    expect(saved.replay).toBeUndefined();
    expect(saved.repLog).toHaveLength(3);
  });

  it('logs a held position once a second', () => {
    const coach = new Coach(frontStance, { smooth: false });
    run(coach, [[4000, () => frontStancePose({ front: 120 })]]);
    const { timeline } = coach.summary();
    expect(timeline.length).toBeGreaterThanOrEqual(3);
    expect(timeline.every((p) => p.score === 100)).toBe(true);
  });
});

describe('export', () => {
  it('writes one CSV row per rep with timing and every check', () => {
    const coach = new Coach(squat, { smooth: false });
    run(coach, [standing(), squatRep(90), standing(), squatRep(110), standing()]);
    const lines = toCsv(coach.summary(), squat).trim().split('\n');
    expect(lines[0]).toBe('rep,set,score,down_s,pause_s,up_s,speed_per_s,velocity_loss,depth,chest,heels,knees,balance,tempo');
    expect(lines).toHaveLength(3);
    expect(lines[2].split(',')[0]).toBe('2');
  });
});
