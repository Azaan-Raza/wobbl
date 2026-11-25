import { P, H, MIN_VISIBILITY } from './landmarks.js';
import {
  angleAt,
  dist2d,
  leanFromVertical,
  mean,
  mid,
  tiltFromHorizontal,
} from './math.js';

// Turns one frame of landmarks into named measurements the drills read.
// Joint angles use MediaPipe's 3D world landmarks when available, so they don't
// change much with camera angle. Positions and leans use image coordinates.
//
// frame = { t, pose, world, hands: [{ points, world, handedness }] }
export function computeFeatures(frame) {
  const f = { t: frame.t, pose: frame.pose || null, hands: {} };
  const pose = frame.pose;

  if (pose) Object.assign(f, poseFeatures(pose, frame.world));
  if (frame.hands?.length) f.hands = handFeatures(frame.hands, pose);
  return f;
}

export function isVisible(pose, index) {
  return (pose?.[index]?.visibility ?? 0) >= MIN_VISIBILITY;
}

function poseFeatures(pose, world) {
  const ok = (...ids) => ids.every((i) => isVisible(pose, i));
  const W = world && world.length === pose.length ? world : pose;
  const joint = (a, b, c) => (ok(a, b, c) ? angleAt(W[a], W[b], W[c]) : null);
  const f = {};

  f.kneeL = joint(P.leftHip, P.leftKnee, P.leftAnkle);
  f.kneeR = joint(P.rightHip, P.rightKnee, P.rightAnkle);
  f.hipL = joint(P.leftShoulder, P.leftHip, P.leftKnee);
  f.hipR = joint(P.rightShoulder, P.rightHip, P.rightKnee);
  f.elbowL = joint(P.leftShoulder, P.leftElbow, P.leftWrist);
  f.elbowR = joint(P.rightShoulder, P.rightElbow, P.rightWrist);
  f.armRaiseL = joint(P.leftHip, P.leftShoulder, P.leftElbow);
  f.armRaiseR = joint(P.rightHip, P.rightShoulder, P.rightElbow);
  f.knee = mean([f.kneeL, f.kneeR]);
  f.hip = mean([f.hipL, f.hipR]);

  // In a side view the far shoulder or hip is often hidden, so fall back to
  // whichever one is visible.
  const center = (a, b) => {
    if (ok(a, b)) return mid(pose[a], pose[b]);
    if (ok(a)) return pose[a];
    if (ok(b)) return pose[b];
    return null;
  };
  const shoulders = center(P.leftShoulder, P.rightShoulder);
  const hips = center(P.leftHip, P.rightHip);
  const bothShoulders = ok(P.leftShoulder, P.rightShoulder);
  f.midShoulder = shoulders;
  f.midHip = hips;

  f.shoulderWidth = bothShoulders ? dist2d(pose[P.leftShoulder], pose[P.rightShoulder]) : null;
  f.hipWidth = ok(P.leftHip, P.rightHip) ? dist2d(pose[P.leftHip], pose[P.rightHip]) : null;
  f.torsoLength = shoulders && hips ? dist2d(shoulders, hips) : null;
  f.trunkLean = shoulders && hips ? leanFromVertical(shoulders, hips) : null;
  f.shoulderTilt = bothShoulders
    ? tiltFromHorizontal(pose[P.leftShoulder], pose[P.rightShoulder])
    : null;
  f.view = bothShoulders
    ? classifyView(f.shoulderWidth, f.torsoLength)
    : shoulders && hips
      ? 'side'
      : null;

  // The side nearer the camera, by landmark confidence. In a side view the far
  // leg is often hidden or guessed, so single-leg readouts use this side.
  const vis = (...ids) => ids.reduce((sum, i) => sum + (pose[i]?.visibility ?? 0), 0);
  f.nearSide =
    vis(P.leftHip, P.leftKnee, P.leftAnkle) >= vis(P.rightHip, P.rightKnee, P.rightAnkle) ? 'L' : 'R';
  f.kneeNear = f[`knee${f.nearSide}`] ?? f.knee;

  // Front view only: how far the hips sit to one side of the feet, in hip
  // widths. Signed, positive = toward image right. In a side view the hips
  // overlap and this would be meaningless, so it stays empty.
  if (f.view === 'front' && hips && f.hipWidth && ok(P.leftAnkle, P.rightAnkle)) {
    const feet = mid(pose[P.leftAnkle], pose[P.rightAnkle]);
    f.hipShift = (hips.x - feet.x) / f.hipWidth;
  } else {
    f.hipShift = null;
  }
  f.kneeGap = f.kneeL != null && f.kneeR != null ? Math.abs(f.kneeL - f.kneeR) : null;

  // Which way the athlete faces in a side view: +1 = toward image right.
  f.facing = shoulders && ok(P.nose) ? Math.sign(pose[P.nose].x - shoulders.x) || 1 : null;

  // Heel lift: how far the heel sits above the toe, relative to leg length.
  const heelLift = (hip, ankle, heel, foot) => {
    if (!ok(hip, ankle, heel, foot)) return null;
    const leg = dist2d(pose[hip], pose[ankle]);
    return leg ? (pose[foot].y - pose[heel].y) / leg : null;
  };
  f.heelLiftL = heelLift(P.leftHip, P.leftAnkle, P.leftHeel, P.leftFoot);
  f.heelLiftR = heelLift(P.rightHip, P.rightAnkle, P.rightHeel, P.rightFoot);
  f.heelLift = maxOf(f.heelLiftL, f.heelLiftR);

  // Knees caving in (front view): how far each knee sits inside the straight
  // line from hip to ankle, as a fraction of hip width. Positive = caving in.
  const valgus = (hip, knee, ankle) => {
    if (!hips || !f.hipWidth || !ok(hip, knee, ankle)) return null;
    const h = pose[hip];
    const k = pose[knee];
    const a = pose[ankle];
    const span = a.y - h.y;
    if (Math.abs(span) < 1e-6) return null;
    const lineX = h.x + ((k.y - h.y) / span) * (a.x - h.x);
    return (Math.abs(lineX - hips.x) - Math.abs(k.x - hips.x)) / f.hipWidth;
  };
  f.kneeValgusL = valgus(P.leftHip, P.leftKnee, P.leftAnkle);
  f.kneeValgusR = valgus(P.rightHip, P.rightKnee, P.rightAnkle);
  f.kneeValgus = maxOf(f.kneeValgusL, f.kneeValgusR);

  // Head and neck, for seated posture. Both are relative to shoulder width so
  // they don't change when you lean toward or away from the camera.
  if (bothShoulders && f.shoulderWidth && ok(P.nose)) {
    f.headHeight = (shoulders.y - pose[P.nose].y) / f.shoulderWidth;
  }
  if (f.shoulderWidth) {
    const neck = [];
    if (ok(P.leftEar, P.leftShoulder)) neck.push(pose[P.leftShoulder].y - pose[P.leftEar].y);
    if (ok(P.rightEar, P.rightShoulder)) neck.push(pose[P.rightShoulder].y - pose[P.rightEar].y);
    const m = mean(neck);
    f.neckLength = m == null ? null : m / f.shoulderWidth;
  }

  // Wrist height above the shoulders, in torso lengths. 1.0 = one torso
  // length above the shoulders, roughly a fully raised arm.
  const lift = (wrist) =>
    shoulders && f.torsoLength && ok(wrist) ? (shoulders.y - pose[wrist].y) / f.torsoLength : null;
  f.wristLiftL = lift(P.leftWrist);
  f.wristLiftR = lift(P.rightWrist);

  return f;
}

// front: shoulders square to the camera. side: shoulders nearly overlap.
export function classifyView(shoulderWidth, torsoLength) {
  if (shoulderWidth == null || !torsoLength) return null;
  const ratio = shoulderWidth / torsoLength;
  if (ratio > 0.55) return 'front';
  if (ratio < 0.3) return 'side';
  return 'angled';
}

// Hands are matched to the athlete's left and right by which pose wrist they
// sit next to. MediaPipe's own handedness label assumes a mirrored selfie
// image, so it is used, swapped, only when the pose isn't visible.
function handFeatures(hands, pose) {
  const out = {};
  for (const hand of hands) {
    const side = sideOfHand(hand, pose);
    if (!side || out[side]) continue;
    out[side] = describeHand(hand);
  }
  return out;
}

function sideOfHand(hand, pose) {
  const w = hand.points?.[H.wrist];
  if (!w) return null;
  if (pose && (isVisible(pose, P.leftWrist) || isVisible(pose, P.rightWrist))) {
    const dl = isVisible(pose, P.leftWrist) ? dist2d(w, pose[P.leftWrist]) : Infinity;
    const dr = isVisible(pose, P.rightWrist) ? dist2d(w, pose[P.rightWrist]) : Infinity;
    return dl <= dr ? 'left' : 'right';
  }
  if (hand.handedness === 'Left') return 'right';
  if (hand.handedness === 'Right') return 'left';
  return null;
}

function describeHand(hand) {
  const p = hand.points;
  const W = hand.world?.length === p.length ? hand.world : p;
  const size = dist2d(p[H.wrist], p[H.middleMcp]);
  const knuckleY = mean([p[H.indexMcp].y, p[H.middleMcp].y, p[H.ringMcp].y, p[H.pinkyMcp].y]);
  const pip = (mcp, pipJ, dip) => angleAt(W[mcp], W[pipJ], W[dip]);
  return {
    points: p,
    size,
    // Positive when the wrist sits below the knuckle line (a collapsed wrist).
    wristDrop: size ? (p[H.wrist].y - knuckleY) / size : null,
    // Mean bend at the middle finger joints. 180 = completely flat fingers.
    fingerAngle: mean([
      pip(H.indexMcp, H.indexPip, H.indexDip),
      pip(H.middleMcp, H.middlePip, H.middleDip),
      pip(H.ringMcp, H.ringPip, H.ringDip),
    ]),
  };
}

function maxOf(a, b) {
  if (a == null) return b;
  if (b == null) return a;
  return Math.max(a, b);
}
