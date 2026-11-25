import { mean } from './math.js';

// Timing and speed of one rep, read from the drill's rep signal (for a squat,
// the knee angle).
//
//   towardMs  from the first movement to arriving at the extreme (the way down)
//   holdMs    time spent at the extreme (the pause at the bottom)
//   backMs    from leaving the extreme to finishing the rep (the way up)
//   speed     how fast the signal moves in the working phase, in signal units
//             per second. For a squat that's degrees per second on the way up.
//
// `power` says which phase is the working one: 'back' for a squat (standing
// up), 'toward' for a jump shot (the rise into the release).
export function repKinematics(rep, { power = 'back', holdBand = 0.12 } = {}) {
  const pts = rep.frames
    .map((fr) => ({ t: fr.t, v: fr[rep.signal] }))
    .filter((p) => p.v != null && Number.isFinite(p.v));
  if (pts.length < 4) return null;

  const ext = rep.extreme[rep.signal];
  const e = pts.findIndex((p) => p.t === rep.extreme.t);
  if (ext == null || e < 0) return null;

  const range = Math.max(Math.abs(pts[0].v - ext), Math.abs(pts[pts.length - 1].v - ext));
  if (!range) return null;

  // "At the extreme" means within 12% of the rep's range from it.
  const near = (p) => Math.abs(p.v - ext) <= range * holdBand;
  let i = e;
  while (i > 0 && near(pts[i - 1])) i -= 1;
  let j = e;
  while (j < pts.length - 1 && near(pts[j + 1])) j += 1;

  const towardMs = Math.max(0, pts[i].t - rep.movedAt);
  const holdMs = pts[j].t - pts[i].t;
  const backMs = Math.max(0, rep.end - pts[j].t);

  const working = power === 'toward' ? towardMs : backMs;
  const travel =
    power === 'toward'
      ? Math.abs(valueAt(pts, rep.movedAt) - pts[i].v)
      : Math.abs(pts[pts.length - 1].v - pts[j].v);

  return {
    towardMs,
    holdMs,
    backMs,
    range,
    speed: working > 0 ? travel / (working / 1000) : null,
  };
}

function valueAt(pts, t) {
  return (pts.find((p) => p.t >= t) ?? pts[0]).v;
}

// Velocity loss within a set: how much slower the latest working phase is than
// the fastest one so far. Strength coaches use 20 to 30% as the point where a
// set stops doing much good and starts building fatigue.
export function velocityLoss(speeds) {
  const valid = speeds.filter((s) => s != null && s > 0);
  if (valid.length < 2) return null;
  const best = Math.max(...valid);
  return 1 - valid[valid.length - 1] / best;
}

// Rep-to-rep spread of a value: the standard deviation.
export function spread(values) {
  const v = values.filter((x) => x != null && Number.isFinite(x));
  if (v.length < 2) return null;
  const m = mean(v);
  return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1));
}
