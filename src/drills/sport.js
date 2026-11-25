import { ANGLES, P } from '../engine/landmarks.js';

const seconds = (v) => `${v.toFixed(1)} s`;
const share = (v) => `${Math.round(v * 100)}%`;

export const squat = {
  id: 'squat',
  product: 'sport',
  name: 'Squat',
  blurb: 'Depth, chest position, heels and tempo on every rep.',
  mode: 'rep',
  setup: [
    'Stand side-on to the camera, about 2.5 m (8 ft) away.',
    'Your whole body, feet included, needs to be in frame.',
    'Face the camera instead if you want knee tracking checked.',
  ],
  needs: [
    [P.leftHip, P.rightHip],
    [P.leftKnee, P.rightKnee],
    [P.leftAnkle, P.rightAnkle],
  ],
  missingHint: 'Step back until your feet are in the frame.',
  frame: 'full',
  rep: {
    signal: 'knee',
    direction: 'down',
    rest: 155,
    active: 140,
    minMs: 500,
    power: 'back', // standing up is the working phase
    fatigue: true,
    phases: ['down', 'bottom', 'up'],
    speedUnit: 'knee, degrees per second',
  },
  live: {
    check: 'depth',
    label: 'knee',
    arc: (f) => ANGLES.knee[f.nearSide],
    read: (f) => f.kneeNear,
  },
  checks: [
    {
      id: 'depth',
      label: 'Depth',
      measure: (rep) => rep.min('knee'),
      fault: (v) => v > 100,
      target: 'knee under 100°',
      weight: 30,
      cue: 'Sit lower. Get your thighs down to parallel.',
      fixed: "That's the depth. Keep it.",
      joints: [P.leftKnee, P.rightKnee],
    },
    {
      id: 'chest',
      label: 'Chest up',
      views: ['side', 'angled'],
      measure: (rep) => rep.at('trunkLean'),
      fault: (v) => v > 50,
      target: 'torso lean under 50°',
      weight: 25,
      cue: "Chest up. You're folding forward at the bottom.",
      fixed: 'Chest is staying up now.',
      joints: [P.leftShoulder, P.rightShoulder, P.leftHip, P.rightHip],
    },
    {
      id: 'heels',
      label: 'Heels down',
      views: ['side', 'angled'],
      measure: (rep) => rep.max('heelLift'),
      fault: (v) => v > 0.06,
      format: (v) => (v > 0.06 ? 'lifting' : 'flat'),
      target: 'flat',
      weight: 20,
      cue: 'Keep your heels on the floor. Push through the whole foot.',
      fixed: 'Heels are staying down.',
      joints: [P.leftHeel, P.rightHeel],
    },
    {
      id: 'knees',
      label: 'Knees out',
      views: ['front'],
      measure: (rep) => rep.max('kneeValgus'),
      fault: (v) => v > 0.15,
      format: (v) => `${share(Math.max(0, v))} inward`,
      target: 'under 15% inward',
      weight: 25,
      cue: 'Push your knees out so they track over your toes.',
      fixed: 'Knees are tracking well now.',
      joints: [P.leftKnee, P.rightKnee],
    },
    {
      id: 'balance',
      label: 'Even weight',
      views: ['front'],
      measure: (rep) => {
        const v = rep.at('hipShift');
        return v == null ? null : Math.abs(v);
      },
      fault: (v) => v > 0.2,
      format: (v) => `${share(v)} of hip width`,
      target: 'hips shift under 20%',
      weight: 15,
      cue: "You're shifting to one side. Keep your weight even on both feet.",
      fixed: 'Weight is even now.',
      joints: [P.leftHip, P.rightHip],
    },
    {
      id: 'tempo',
      label: 'Lowering speed',
      measure: (rep) => rep.toExtremeMs / 1000,
      fault: (v) => v < 0.6,
      format: seconds,
      spreadFormat: (v) => `±${v.toFixed(1)} s`,
      target: '0.6 s or slower down',
      weight: 10,
      cue: 'Slow down on the way down. Control it.',
      fixed: 'Good, controlled tempo.',
      joints: [],
    },
  ],
};

export const jumpShot = {
  id: 'jumpshot',
  product: 'sport',
  name: 'Jump shot',
  blurb: 'Leg bend, elbow line, extension and follow-through.',
  mode: 'rep',
  setup: [
    'Face the camera, 3 to 4 m (10 to 13 ft) away, whole body in frame.',
    'Shoot form shots: no hoop needed, a ball or an imaginary one works.',
    'Set your shooting hand below if you shoot lefty.',
  ],
  options: [
    {
      id: 'hand',
      label: 'Shooting hand',
      choices: [
        ['right', 'Right'],
        ['left', 'Left'],
      ],
      default: 'right',
    },
  ],
  views: ['front', 'angled'],
  viewHint: 'Face the camera so I can see your shooting elbow.',
  needs: (s) => [
    P.leftShoulder,
    P.rightShoulder,
    s.hand === 'left' ? P.leftElbow : P.rightElbow,
    s.hand === 'left' ? P.leftWrist : P.rightWrist,
    [P.leftKnee, P.rightKnee],
  ],
  missingHint: 'Step back so I can see you from head to knees, arms included.',
  derive(f, s) {
    if (!f.pose) return;
    const side = s.hand === 'left' ? 'L' : 'R';
    f.shotLift = f[`wristLift${side}`];
    f.shotElbow = f[`elbow${side}`];
    const elbow = f.pose[s.hand === 'left' ? P.leftElbow : P.rightElbow];
    const wrist = f.pose[s.hand === 'left' ? P.leftWrist : P.rightWrist];
    f.elbowFlare = f.shoulderWidth ? Math.abs(elbow.x - wrist.x) / f.shoulderWidth : null;
  },
  frame: 'full',
  rep: {
    signal: 'shotLift',
    direction: 'up',
    rest: 0.15,
    active: 0.75,
    minMs: 300,
    prerollMs: 1200,
    power: 'toward', // the rise into the release
    phases: ['rise', 'release', 'drop'],
    speedUnit: 'wrist, torso lengths per second',
  },
  live: {
    check: 'extension',
    label: 'elbow',
    arc: (f, s) => ANGLES.elbow[s.hand === 'left' ? 'L' : 'R'],
    read: (f) => f.shotElbow,
  },
  checks: [
    {
      id: 'legs',
      label: 'Leg bend',
      measure: (rep) => rep.min('knee', 'before'),
      fault: (v) => v > 150,
      target: 'knee under 150°',
      weight: 25,
      cue: 'Bend your knees before you shoot. Your range comes from your legs.',
      fixed: "There's the leg drive.",
      joints: [P.leftKnee, P.rightKnee],
    },
    {
      id: 'elbow',
      label: 'Elbow under the ball',
      measure: (rep) => rep.phase('before').find((fr) => fr.shotLift >= 0.35)?.elbowFlare ?? null,
      fault: (v) => v > 0.35,
      format: (v) => `${share(v)} of shoulder width out`,
      target: 'under 35%',
      weight: 25,
      cue: 'Tuck your elbow under the ball.',
      fixed: 'Elbow is lined up now.',
      joints: [P.leftElbow, P.rightElbow],
    },
    {
      id: 'extension',
      label: 'Arm extension',
      measure: (rep) => rep.at('shotElbow'),
      fault: (v) => v < 155,
      target: 'elbow over 155°',
      weight: 25,
      cue: 'Finish with your shooting arm straight up.',
      fixed: 'Full extension. Good.',
      joints: [P.leftElbow, P.rightElbow, P.leftWrist, P.rightWrist],
    },
    {
      id: 'follow',
      label: 'Follow-through',
      measure: (rep) => rep.msAfterExtremeUntil((fr) => fr.shotLift != null && fr.shotLift < 0.6) / 1000,
      fault: (v) => v < 0.3,
      format: seconds,
      target: 'hold 0.3 s or longer',
      weight: 15,
      cue: 'Hold your follow-through until the ball lands.',
      fixed: 'Nice, you held it.',
      joints: [P.leftWrist, P.rightWrist],
    },
  ],
};

export const frontStance = {
  id: 'frontstance',
  product: 'sport',
  name: 'Front stance (Tae Kwon Do)',
  blurb: 'Ap kubi: front knee, back leg, stance length, posture, back heel.',
  mode: 'hold',
  setup: [
    'Stand side-on to the camera, about 3 m (10 ft) away.',
    'Get into front stance and hold it. Both feet need to be in frame.',
    'Switch legs whenever you like. It works out which leg is in front.',
  ],
  views: ['side', 'angled'],
  viewHint: 'Turn side-on to the camera so I can see both legs.',
  needs: [P.leftKnee, P.rightKnee, P.leftAnkle, P.rightAnkle, [P.leftHip, P.rightHip]],
  missingHint: 'Step back until both feet are in the frame.',
  derive(f) {
    if (!f.pose || f.facing == null) return;
    const la = f.pose[P.leftAnkle];
    const ra = f.pose[P.rightAnkle];
    const front = (la.x - ra.x) * f.facing > 0 ? 'L' : 'R';
    const back = front === 'L' ? 'R' : 'L';
    f.frontSide = front;
    f.frontKnee = f[`knee${front}`];
    f.backKnee = f[`knee${back}`];
    f.backHeelLift = f[`heelLift${back}`];
    f.stanceLength = f.torsoLength ? Math.abs(la.x - ra.x) / f.torsoLength : null;
  },
  frame: 'full',
  live: {
    check: 'frontKnee',
    label: 'front knee',
    arc: (f) => (f.frontSide ? ANGLES.knee[f.frontSide] : null),
    read: (f) => f.frontKnee,
  },
  inPosition: (ctx) => (ctx.get('stanceLength') ?? 0) > 0.6,
  positionHint: 'Step into your front stance and hold it.',
  timing: { persistMs: 1500 },
  checks: [
    {
      id: 'frontKnee',
      label: 'Front knee bend',
      measure: (ctx) => ctx.get('frontKnee'),
      fault: (v) => v > 135,
      target: '135° or less',
      weight: 30,
      cue: 'Bend your front knee more. Knee over your toes.',
      fixed: 'Front knee looks right.',
      joints: [P.leftKnee, P.rightKnee],
    },
    {
      id: 'backLeg',
      label: 'Back leg straight',
      measure: (ctx) => ctx.get('backKnee'),
      fault: (v) => v < 160,
      target: 'over 160°',
      weight: 25,
      cue: 'Lock your back leg straight.',
      fixed: "Back leg's straight now.",
      joints: [P.leftKnee, P.rightKnee],
    },
    {
      id: 'length',
      label: 'Stance length',
      measure: (ctx) => ctx.get('stanceLength'),
      fault: (v) => v < 1.0,
      format: (v) => `${v.toFixed(1)}× torso`,
      target: '1.0× torso or longer',
      weight: 20,
      cue: 'Make the stance longer. Step your front foot further out.',
      fixed: 'Good length.',
      joints: [P.leftAnkle, P.rightAnkle],
    },
    {
      id: 'upright',
      label: 'Upright torso',
      measure: (ctx) => ctx.get('trunkLean'),
      fault: (v) => v > 15,
      target: 'lean under 15°',
      weight: 15,
      cue: 'Stand tall. Keep your hips under your shoulders.',
      fixed: 'Upright. Good.',
      joints: [P.leftShoulder, P.rightShoulder, P.leftHip, P.rightHip],
    },
    {
      id: 'backHeel',
      label: 'Back heel down',
      measure: (ctx) => ctx.get('backHeelLift'),
      fault: (v) => v > 0.05,
      format: (v) => (v > 0.05 ? 'lifting' : 'flat'),
      target: 'flat',
      weight: 10,
      cue: 'Press your back heel into the floor.',
      fixed: 'Back heel is down.',
      joints: [P.leftHeel, P.rightHeel],
    },
  ],
};
