import { P } from '../engine/landmarks.js';

// Motion for the homepage demo: one set of four bodyweight squats, filmed
// side-on. The first two stop short of parallel, the last two go deep enough.
// Nothing here decides what gets said. The page feeds these frames to the real
// coaching engine, which decides when to cue and when to praise.
export const DEMO_BOTTOMS = [108, 106, 96, 94];
const STAND = 174;
const LEAD_MS = 1200;
const REP_MS = 2400;
const GAP_MS = 800;
const TAIL_MS = 3000;
export const DEMO_MS = LEAD_MS + DEMO_BOTTOMS.length * (REP_MS + GAP_MS) + TAIL_MS;

const RAD = Math.PI / 180;
const ease = (p) => (1 - Math.cos(p * Math.PI)) / 2;

// Knee angle at time t (ms from the start of the set).
export function kneeAt(t) {
  for (const [i, bottom] of DEMO_BOTTOMS.entries()) {
    const start = LEAD_MS + i * (REP_MS + GAP_MS);
    const p = (t - start) / REP_MS;
    if (p >= 0 && p <= 1) {
      // A controlled way down, a short pause at the bottom, then up.
      const d = p < 0.5 ? ease(p / 0.5) : p < 0.58 ? 1 : 1 - ease((p - 0.58) / 0.42);
      return STAND - (STAND - bottom) * d;
    }
  }
  return STAND;
}

export function repStart(i) {
  return LEAD_MS + i * (REP_MS + GAP_MS);
}

export function demoPose(t) {
  return poseFor(kneeAt(t));
}

// The skeleton for a given knee angle, from standing (174°) to deep (about 90°).
export function poseFor(knee) {
  const depth = (STAND - knee) / (STAND - 90);
  const L = 0.19;
  const a = ((180 - knee) / 2) * RAD;
  const lean = (6 + 32 * depth) * RAD;
  const ankle = { x: 0.47, y: 0.88 };
  const k = { x: ankle.x + L * Math.sin(a), y: ankle.y - L * Math.cos(a) };
  const hip = { x: k.x - L * Math.sin(a), y: k.y - L * Math.cos(a) };
  const sh = { x: hip.x + 0.27 * Math.sin(lean), y: hip.y - 0.27 * Math.cos(lean) };
  // Arms hang at the top and reach forward for balance on the way down.
  const reach = Math.min(1, depth * 1.4);
  const armA = (12 + 72 * reach) * RAD; // from straight down toward straight ahead
  const elbow = { x: sh.x + 0.13 * Math.sin(armA), y: sh.y + 0.13 * Math.cos(armA) };
  const wrist = { x: elbow.x + 0.12 * Math.sin(armA + 0.08), y: elbow.y + 0.12 * Math.cos(armA + 0.08) };

  const pose = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0 }));
  const put = (ids, p) => ids.forEach((i) => (pose[i] = { x: p.x, y: p.y, z: 0, visibility: 0.98 }));
  put([P.leftAnkle, P.rightAnkle], ankle);
  put([P.leftKnee, P.rightKnee], k);
  put([P.leftHip, P.rightHip], hip);
  put([P.leftShoulder, P.rightShoulder], sh);
  put([P.leftElbow, P.rightElbow], elbow);
  put([P.leftWrist, P.rightWrist], wrist);
  put([P.leftHeel, P.rightHeel], { x: ankle.x - 0.035, y: ankle.y + 0.012 });
  put([P.leftFoot, P.rightFoot], { x: ankle.x + 0.075, y: ankle.y + 0.012 });
  put([P.leftEar, P.rightEar], { x: sh.x + 0.01 + 0.02 * depth, y: sh.y - 0.085 });
  put([P.nose], { x: sh.x + 0.055 + 0.02 * depth, y: sh.y - 0.08 });
  return pose;
}
