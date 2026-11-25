// Landmark indices for MediaPipe's pose model (33 points) and hand model
// (21 points per hand). "left" and "right" are the athlete's own sides.
export const P = {
  nose: 0,
  leftEye: 2,
  rightEye: 5,
  leftEar: 7,
  rightEar: 8,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFoot: 31,
  rightFoot: 32,
};

export const H = {
  wrist: 0,
  thumbMcp: 2,
  thumbTip: 4,
  indexMcp: 5,
  indexPip: 6,
  indexDip: 7,
  middleMcp: 9,
  middlePip: 10,
  middleDip: 11,
  ringMcp: 13,
  ringPip: 14,
  ringDip: 15,
  pinkyMcp: 17,
};

// Bones drawn by the overlay.
export const POSE_BONES = [
  [P.leftShoulder, P.rightShoulder],
  [P.leftShoulder, P.leftElbow],
  [P.leftElbow, P.leftWrist],
  [P.rightShoulder, P.rightElbow],
  [P.rightElbow, P.rightWrist],
  [P.leftShoulder, P.leftHip],
  [P.rightShoulder, P.rightHip],
  [P.leftHip, P.rightHip],
  [P.leftHip, P.leftKnee],
  [P.leftKnee, P.leftAnkle],
  [P.rightHip, P.rightKnee],
  [P.rightKnee, P.rightAnkle],
  [P.leftAnkle, P.leftHeel],
  [P.leftHeel, P.leftFoot],
  [P.leftAnkle, P.leftFoot],
  [P.rightAnkle, P.rightHeel],
  [P.rightHeel, P.rightFoot],
  [P.rightAnkle, P.rightFoot],
];

export const HAND_BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

// Three-point joint angles by side, for drawing an angle on the overlay.
// The middle point is the joint.
export const ANGLES = {
  knee: { L: [P.leftHip, P.leftKnee, P.leftAnkle], R: [P.rightHip, P.rightKnee, P.rightAnkle] },
  elbow: { L: [P.leftShoulder, P.leftElbow, P.leftWrist], R: [P.rightShoulder, P.rightElbow, P.rightWrist] },
  hip: { L: [P.leftShoulder, P.leftHip, P.leftKnee], R: [P.rightShoulder, P.rightHip, P.rightKnee] },
};

// Pose landmarks below this visibility are treated as not seen.
export const MIN_VISIBILITY = 0.5;
