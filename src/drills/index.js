import { squat, jumpShot, frontStance } from './sport.js';
import { piano, guitar } from './music.js';
import { deskPosture } from './posture.js';
import { SPORTS } from '../utils/sports.js';

// Sports without their own rules yet. The AI coach watches for one burst of
// movement and sends three frames from it, plus the measured angles.
export const aiCoach = {
  id: 'ai',
  product: 'sport',
  name: 'Any other sport (AI)',
  blurb: 'For sports without their own rules yet. Slower, less exact, uses the internet.',
  mode: 'ai',
  setup: [
    'Stand where your whole body is in frame.',
    'Do one rep at a time: a swing, a kick, a throw. Pause between reps.',
    'After each rep, three frames from it go to an AI model along with your joint angles.',
  ],
  options: [
    {
      id: 'sport',
      label: 'Sport',
      choices: SPORTS.map((s) => [s, s]),
      default: 'Tennis',
    },
  ],
  checks: [],
};

export const PRODUCTS = [
  {
    id: 'sport',
    name: 'sport',
    status: 'beta',
    line: 'Form checks for lifting, shooting and martial arts.',
    drills: [squat, jumpShot, frontStance, aiCoach],
  },
  {
    id: 'music',
    name: 'music',
    status: 'early access',
    line: 'Hand position and posture for piano and guitar.',
    drills: [piano, guitar],
  },
  {
    id: 'posture',
    name: 'posture',
    status: 'early access',
    line: 'Keeps you from slouching while you study or work.',
    drills: [deskPosture],
  },
];

export const DRILLS = PRODUCTS.flatMap((p) => p.drills);

export function findDrill(id) {
  return DRILLS.find((d) => d.id === id) || null;
}
