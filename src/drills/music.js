import { angleAt } from '../engine/math.js';
import { H, P } from '../engine/landmarks.js';
import { ofBaseline as ratio, ratioTo } from './helpers.js';

const handOption = (label, fallback) => ({
  id: 'hand',
  label,
  choices: [
    ['right', 'Right'],
    ['left', 'Left'],
  ],
  default: fallback,
});

export const piano = {
  id: 'piano',
  product: 'music',
  name: 'Piano hand position',
  blurb: 'Wrist height and finger curve while you play.',
  mode: 'hold',
  tracksHands: true,
  setup: [
    'Put your phone or laptop beside the keyboard, level with the keys.',
    'Aim it at the side of the hand you picked, about 60 cm (2 ft) away.',
    'Play normally. It checks the hand it can see.',
  ],
  options: [handOption('Hand to watch', 'right')],
  needsHands: (s) => [s.hand],
  missingHint: "I can't see your hand. Move the camera so it's in frame from the side.",
  derive(f, s) {
    const hand = f.hands[s.hand];
    f.wristDrop = hand?.wristDrop ?? null;
    f.fingerAngle = hand?.fingerAngle ?? null;
  },
  timing: { persistMs: 2000, cooldownMs: 20000 },
  checks: [
    {
      id: 'wristLow',
      label: 'Wrist not sagging',
      measure: (ctx) => ctx.get('wristDrop'),
      fault: (v) => v > 0.3,
      format: (v) => (v > 0.3 ? 'below knuckles' : v < -0.6 ? 'above knuckles' : 'level'),
      target: 'level with knuckles',
      weight: 35,
      cue: 'Lift your wrist so it lines up with your knuckles.',
      fixed: 'Wrist is level now.',
      joints: ['hand'],
    },
    {
      id: 'wristHigh',
      label: 'Wrist not too high',
      measure: (ctx) => ctx.get('wristDrop'),
      fault: (v) => v < -0.6,
      format: (v) => (v < -0.6 ? 'above knuckles' : 'level'),
      target: 'level with knuckles',
      weight: 20,
      cue: "Let your wrist drop a little. It's riding high.",
      fixed: 'Better.',
      joints: ['hand'],
    },
    {
      id: 'fingers',
      label: 'Curved fingers',
      measure: (ctx) => ctx.get('fingerAngle'),
      fault: (v) => v > 165,
      target: 'middle joints under 165°',
      weight: 30,
      cue: "Curve your fingers, like you're holding a small ball.",
      fixed: 'Fingers are curved. Good.',
      joints: ['hand'],
    },
  ],
};

export const guitar = {
  id: 'guitar',
  product: 'music',
  name: 'Guitar fretting hand',
  blurb: 'Fretting wrist bend, head position and shoulder tension.',
  mode: 'hold',
  tracksHands: true,
  setup: [
    'Sit facing the camera with your guitar, about 1.5 m (5 ft) away.',
    'Your head, shoulders and fretting arm need to be in frame.',
    "First you'll sit tall for three seconds so it learns your good posture.",
  ],
  options: [handOption('Fretting hand', 'left')],
  needs: (s) => [P.nose, P.leftShoulder, P.rightShoulder, s.hand === 'left' ? P.leftElbow : P.rightElbow],
  needsHands: (s) => [s.hand],
  missingHint: 'Move back so your head, shoulders and fretting hand are all in frame.',
  calibrate: {
    ms: 3000,
    keys: ['headHeight', 'neckLength'],
    prompt: 'Sit tall with relaxed shoulders and look at the camera for three seconds.',
  },
  derive(f, s) {
    const hand = f.hands[s.hand];
    const elbow = f.pose?.[s.hand === 'left' ? P.leftElbow : P.rightElbow];
    if (hand && elbow) {
      const straight = angleAt(elbow, hand.points[H.wrist], hand.points[H.middleMcp], { flat: true });
      f.wristBend = straight == null ? null : 180 - straight;
    } else {
      f.wristBend = null;
    }
  },
  timing: { persistMs: 2500, cooldownMs: 25000 },
  checks: [
    {
      id: 'wristBend',
      label: 'Fretting wrist bend',
      measure: (ctx) => ctx.get('wristBend'),
      fault: (v) => v > 50,
      target: 'under 50°',
      weight: 35,
      cue: 'Ease the bend in your fretting wrist. Bring your elbow in a little.',
      fixed: 'Wrist looks relaxed now.',
      joints: ['hand'],
    },
    {
      id: 'head',
      label: 'Head up',
      measure: (ctx) => ratioTo(ctx, 'headHeight'),
      fault: (v) => v < 0.75,
      format: ratio,
      target: 'over 75% of your baseline',
      weight: 20,
      cue: 'Bring your head up. Try to feel the frets instead of staring at them.',
      fixed: 'Head is up. Good.',
      joints: [P.nose],
    },
    {
      id: 'shoulders',
      label: 'Relaxed shoulders',
      measure: (ctx) => ratioTo(ctx, 'neckLength'),
      fault: (v) => v < 0.8,
      format: ratio,
      target: 'over 80% of your baseline',
      weight: 25,
      cue: 'Drop your shoulders. Let them hang.',
      fixed: 'Shoulders are down.',
      joints: [P.leftShoulder, P.rightShoulder],
    },
  ],
};
