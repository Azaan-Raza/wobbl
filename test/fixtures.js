import { P } from '../src/engine/landmarks.js';

// Synthetic poses with known joint angles, in normalized image coordinates
// (y points down). Good enough to check the engine's math and timing.
const RAD = Math.PI / 180;

export function blankPose() {
  return Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0 }));
}

function put(pose, index, x, y) {
  pose[index] = { x, y, z: 0, visibility: 1 };
}

function both(pose, left, right, x, y) {
  put(pose, left, x, y);
  put(pose, right, x, y);
}

// Side view, facing image right. `knee` is the knee angle in degrees, `lean`
// the torso lean forward from vertical. Both legs overlap.
export function sideSquatPose({ knee = 175, lean = 5, heelLift = 0 } = {}) {
  const pose = blankPose();
  const L = 0.2; // shin and thigh length
  const a = ((180 - knee) / 2) * RAD;
  const ankle = { x: 0.5, y: 0.9 };
  const k = { x: ankle.x + L * Math.sin(a), y: ankle.y - L * Math.cos(a) };
  const hip = { x: k.x - L * Math.sin(a), y: k.y - L * Math.cos(a) };
  const sh = { x: hip.x + 0.3 * Math.sin(lean * RAD), y: hip.y - 0.3 * Math.cos(lean * RAD) };

  both(pose, P.leftAnkle, P.rightAnkle, ankle.x, ankle.y);
  both(pose, P.leftKnee, P.rightKnee, k.x, k.y);
  both(pose, P.leftHip, P.rightHip, hip.x, hip.y);
  both(pose, P.leftShoulder, P.rightShoulder, sh.x, sh.y);
  both(pose, P.leftElbow, P.rightElbow, sh.x + 0.1, sh.y + 0.05);
  both(pose, P.leftWrist, P.rightWrist, sh.x + 0.2, sh.y + 0.05);
  both(pose, P.leftHeel, P.rightHeel, ankle.x - 0.03, ankle.y + 0.01 - heelLift);
  both(pose, P.leftFoot, P.rightFoot, ankle.x + 0.06, ankle.y + 0.01);
  put(pose, P.nose, sh.x + 0.04, sh.y - 0.08);
  both(pose, P.leftEar, P.rightEar, sh.x, sh.y - 0.08);
  return pose;
}

// Side view front stance, facing image right. Left leg in front.
export function frontStancePose({ front = 120, back = 175, lean = 3, backHeelLift = 0 } = {}) {
  const pose = blankPose();
  const L = 0.18;
  const hip = { x: 0.5, y: 0.55 };
  const fk = { x: hip.x + L * Math.sin(front * RAD), y: hip.y - L * Math.cos(front * RAD) };
  const fa = { x: fk.x, y: fk.y + L };
  const phi = 35 * RAD;
  const phi2 = phi - (180 - back) * RAD;
  const bk = { x: hip.x - L * Math.sin(phi), y: hip.y + L * Math.cos(phi) };
  const ba = { x: bk.x - L * Math.sin(phi2), y: bk.y + L * Math.cos(phi2) };
  const sh = { x: hip.x + 0.3 * Math.sin(lean * RAD), y: hip.y - 0.3 * Math.cos(lean * RAD) };

  both(pose, P.leftHip, P.rightHip, hip.x, hip.y);
  put(pose, P.leftKnee, fk.x, fk.y);
  put(pose, P.leftAnkle, fa.x, fa.y);
  put(pose, P.leftHeel, fa.x - 0.03, fa.y + 0.01);
  put(pose, P.leftFoot, fa.x + 0.06, fa.y + 0.01);
  put(pose, P.rightKnee, bk.x, bk.y);
  put(pose, P.rightAnkle, ba.x, ba.y);
  put(pose, P.rightHeel, ba.x - 0.03, ba.y + 0.01 - backHeelLift);
  put(pose, P.rightFoot, ba.x + 0.06, ba.y + 0.01);
  both(pose, P.leftShoulder, P.rightShoulder, sh.x, sh.y);
  put(pose, P.nose, sh.x + 0.04, sh.y - 0.08);
  return pose;
}

// Front view, seated, upper body only. `head` and `neck` scale how high the
// nose and ears sit above the shoulders; `tilt` lowers the right shoulder.
export function deskPose({ head = 1, neck = 1, tilt = 0, scale = 1 } = {}) {
  const pose = blankPose();
  const w = 0.2 * scale;
  const cy = 0.7;
  const dy = Math.tan(tilt * RAD) * w;
  put(pose, P.leftShoulder, 0.5 + w / 2, cy - dy / 2);
  put(pose, P.rightShoulder, 0.5 - w / 2, cy + dy / 2);
  put(pose, P.nose, 0.5, cy - 0.9 * w * head);
  put(pose, P.leftEar, 0.5 + w * 0.3, cy - 0.7 * w * neck);
  put(pose, P.rightEar, 0.5 - w * 0.3, cy - 0.7 * w * neck);
  return pose;
}

// Feed a list of [durationMs, poseFn(progress 0..1)] segments at 30 fps.
export function run(coach, segments, { fps = 30, t0 = 0 } = {}) {
  const events = [];
  let t = t0;
  for (const [ms, poseAt] of segments) {
    const n = Math.round((ms / 1000) * fps);
    for (let i = 0; i < n; i++) {
      t += 1000 / fps;
      for (const e of coach.push({ t, pose: poseAt(i / n), world: null, hands: [] })) {
        events.push({ ...e, t });
      }
    }
  }
  return { events, t };
}

// One squat rep: down to `bottom` degrees and back up over `ms`.
export function squatRep(bottom, { ms = 2000, lean = 10 } = {}) {
  return [
    ms,
    (p) => {
      const depth = Math.sin(p * Math.PI); // 0 -> 1 -> 0
      return sideSquatPose({ knee: 175 - (175 - bottom) * depth, lean: 5 + (lean - 5) * depth });
    },
  ];
}

export const standing = (ms = 600) => [ms, () => sideSquatPose({ knee: 175 })];

// Front view jump shot, right-handed. `lift` is wrist height above the
// shoulders in torso lengths, `knee` the knee angle (bend shown in depth),
// `flare` how far the elbow sits outside the wrist, in shoulder widths.
export function frontShotPose({ lift = -0.2, knee = 175, flare = 0, bentArm = false } = {}) {
  const pose = blankPose();
  const torso = 0.3;
  const sw = 0.2;
  const rs = { x: 0.4, y: 0.4 };
  put(pose, P.rightShoulder, rs.x, rs.y);
  put(pose, P.leftShoulder, rs.x + sw, rs.y);
  put(pose, P.rightHip, 0.42, rs.y + torso);
  put(pose, P.leftHip, 0.58, rs.y + torso);
  put(pose, P.nose, 0.5, rs.y - 0.1);
  const a = ((180 - knee) / 2) * RAD;
  for (const [hip, k, ank, x] of [
    [P.rightHip, P.rightKnee, P.rightAnkle, 0.42],
    [P.leftHip, P.leftKnee, P.leftAnkle, 0.58],
  ]) {
    const hy = rs.y + torso;
    pose[k] = { x, y: hy + 0.2 * Math.cos(a), z: -0.2 * Math.sin(a), visibility: 1 };
    pose[ank] = { x, y: pose[k].y + 0.2 * Math.cos(a), z: 0, visibility: 1 };
  }
  const wrist = { x: rs.x, y: rs.y - lift * torso };
  const elbow = {
    x: (rs.x + wrist.x) / 2 - flare * sw + (bentArm ? 0.06 : 0),
    y: (rs.y + wrist.y) / 2,
  };
  put(pose, P.rightWrist, wrist.x, wrist.y);
  put(pose, P.rightElbow, elbow.x, elbow.y);
  put(pose, P.leftElbow, 0.65, 0.55);
  put(pose, P.leftWrist, 0.62, 0.65);
  return pose;
}

// One shot: load the legs, rise, release, hold the follow-through, drop.
export function shot({ knee = 130, flare = 0.1, bentArm = false, holdMs = 500 } = {}) {
  const lerp = (a, b, p) => a + (b - a) * p;
  return [
    [400, () => frontShotPose()],
    [400, (p) => frontShotPose({ lift: -0.2, knee: lerp(175, knee, p) })],
    [300, (p) => frontShotPose({ lift: lerp(-0.2, 0.45, p), knee: lerp(knee, 175, p), flare })],
    [200, (p) => frontShotPose({ lift: lerp(0.45, 1.1, p), flare: lerp(flare, 0, p), bentArm })],
    [holdMs, () => frontShotPose({ lift: 1.1, bentArm })],
    [300, (p) => frontShotPose({ lift: lerp(1.1, -0.2, p) })],
    [500, () => frontShotPose()],
  ];
}
