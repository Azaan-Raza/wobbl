import { describe, expect, it } from 'vitest';
import { Coach } from '../src/engine/coach.js';
import { squat, frontStance } from '../src/drills/sport.js';
import { deskPosture } from '../src/drills/posture.js';
import { DRILLS } from '../src/drills/index.js';
import { run, squatRep, standing, frontStancePose, deskPose } from './fixtures.js';

const ofType = (events, type) => events.filter((e) => e.type === type);

describe('squat coaching', () => {
  it('scores every rep and waits for a pattern before cueing', () => {
    const coach = new Coach(squat, { smooth: false });
    const { events } = run(coach, [standing(), squatRep(125), standing(), squatRep(125), standing()]);

    const reps = ofType(events, 'rep');
    expect(reps).toHaveLength(2);
    const depth = reps[0].results.find((r) => r.id === 'depth');
    expect(depth.fault).toBe(true);
    expect(depth.value).toBeCloseTo(125, 0);
    expect(reps[0].score).toBeLessThan(100);

    // One shallow rep is not enough to say anything; two are.
    const cues = ofType(events, 'cue');
    expect(cues).toHaveLength(1);
    expect(cues[0].id).toBe('depth');
    expect(cues[0].t).toBeGreaterThan(reps[1].t - 1);
  });

  it('does not repeat itself and praises the fix', () => {
    const coach = new Coach(squat, { smooth: false });
    const shallow = [standing(), squatRep(125)];
    const deep = [standing(), squatRep(90)];
    const { events } = run(coach, [...shallow, ...shallow, ...shallow, ...deep, ...deep, standing()]);

    expect(ofType(events, 'cue').filter((c) => c.id === 'depth')).toHaveLength(1);
    const praise = ofType(events, 'praise');
    expect(praise.map((p) => p.id)).toContain('depth');
    const last = ofType(events, 'rep').at(-1);
    expect(last.results.find((r) => r.id === 'depth').fault).toBe(false);
  });

  it('flags folding forward at the bottom', () => {
    const coach = new Coach(squat, { smooth: false });
    const { events } = run(coach, [standing(), squatRep(90, { lean: 65 }), standing(), squatRep(90, { lean: 65 }), standing()]);
    expect(ofType(events, 'cue').map((c) => c.id)).toContain('chest');
  });

  it('asks you to step back when your feet are out of frame', () => {
    const coach = new Coach(squat, { smooth: false });
    const { events } = run(coach, [[2000, () => null]]);
    expect(ofType(events, 'hint')[0].text).toMatch(/feet/);
  });
});

describe('front stance coaching', () => {
  it('waits for the fault to persist, then praises the fix', () => {
    const coach = new Coach(frontStance, { smooth: false });
    const { events } = run(coach, [
      [3000, () => frontStancePose({ front: 160, back: 175 })],
      [3000, () => frontStancePose({ front: 115, back: 175 })],
    ]);
    const cue = ofType(events, 'cue')[0];
    expect(cue.id).toBe('frontKnee');
    expect(cue.t).toBeGreaterThan(1500);
    expect(ofType(events, 'praise').map((p) => p.id)).toContain('frontKnee');
    expect(coach.summary().goodTimeShare).toBeGreaterThan(0.3);
  });
});

describe('desk posture', () => {
  it('learns your baseline, then catches a lasting slouch', () => {
    const coach = new Coach(deskPosture, { smooth: false });
    const { events } = run(coach, [
      [4000, () => deskPose()],
      [5000, () => deskPose({ head: 0.6 })], // under 8 s: no cue yet
      [2000, () => deskPose()],
      [10000, () => deskPose({ head: 0.6 })],
    ]);
    expect(ofType(events, 'calibrated')).toHaveLength(1);
    const cues = ofType(events, 'cue');
    expect(cues).toHaveLength(1);
    expect(cues[0].id).toBe('slouch');
    expect(cues[0].t).toBeGreaterThan(19000);
  });
});

describe('drill definitions', () => {
  it('give every check what the coach and report need', () => {
    for (const d of DRILLS) {
      expect(['rep', 'hold', 'ai']).toContain(d.mode);
      expect(d.setup.length).toBeGreaterThan(0);
      for (const c of d.checks) {
        expect(typeof c.measure).toBe('function');
        expect(typeof c.fault).toBe('function');
        expect(c.cue).toBeTruthy();
        expect(c.target).toBeTruthy();
        expect(c.cue).not.toMatch(/—/);
      }
      if (d.mode === 'rep') expect(d.rep.signal).toBeTruthy();
    }
  });
});

describe('jump shot coaching', () => {
  it('passes a clean shot and catches a flat, flared, short one', async () => {
    const { jumpShot } = await import('../src/drills/sport.js');
    const { shot } = await import('./fixtures.js');

    const good = new Coach(jumpShot, { smooth: false });
    const g = ofType(run(good, shot()).events, 'rep');
    expect(g).toHaveLength(1);
    expect(g[0].results.filter((r) => r.fault)).toEqual([]);
    expect(g[0].score).toBe(100);

    const bad = new Coach(jumpShot, { smooth: false });
    const b = ofType(run(bad, shot({ knee: 172, flare: 0.6, bentArm: true, holdMs: 100 })).events, 'rep');
    expect(b).toHaveLength(1);
    const faults = b[0].results.filter((r) => r.fault).map((r) => r.id).sort();
    expect(faults).toEqual(['elbow', 'extension', 'follow', 'legs']);
  });
});
