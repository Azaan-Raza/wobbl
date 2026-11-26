import { describe, expect, it } from 'vitest';
import { Coach } from '../src/engine/coach.js';
import { squat } from '../src/drills/sport.js';
import { DEMO_MS, demoPose } from '../src/demo/motion.js';

// The homepage demo shows the engine's real decisions. This pins down what a
// visitor sees: four reps, a cue after rep 2, praise after rep 4.
describe('homepage demo', () => {
  it('cues after the second shallow rep and praises the fix', () => {
    const coach = new Coach(squat, { smooth: false });
    const events = [];
    for (let t = 0; t <= DEMO_MS; t += 33) {
      for (const e of coach.push({ t, pose: demoPose(t), world: null, hands: [] })) events.push({ ...e, t });
    }
    const reps = events.filter((e) => e.type === 'rep');
    expect(reps.map((r) => r.score)).toEqual([65, 65, 100, 100]);
    const spoken = events.filter((e) => ['cue', 'praise', 'hint', 'fatigue'].includes(e.type));
    expect(spoken.map((e) => e.type)).toEqual(['cue', 'praise']);
    expect(spoken[0].t).toBeGreaterThan(reps[1].t - 1);
    expect(spoken[0].text).toMatch(/Sit lower/);
    expect(spoken[1].t).toBeGreaterThanOrEqual(reps[3].t);
  });
});
