# wobbl

The form coach that watches every rep.

(Formerly Acuity Kinetic.) wobbl tracks your body (and hands, for music) in the browser, measures joint angles on every frame, checks each rep or held position against rules for that drill, and says one correction out loud when the same mistake keeps showing up.

| Product | Status | Drills |
| --- | --- | --- |
| wobbl Sport | Beta | Squat, jump shot, Tae Kwon Do front stance, AI coach for any other sport |
| wobbl Music | Early access | Piano hand position, guitar fretting hand |
| wobbl Posture | Early access | Sitting at a desk |

## How it works

```
camera ──> MediaPipe pose (33 points) + hands (21 points each), on device, up to 30 fps
       ──> One Euro smoothing
       ──> features: 3D joint angles, torso lean, stance length, heel lift, wrist height...
       ──> drill: rep segmenter (squat, jump shot) or hold window (stance, posture, music)
       ──> checks: each one measures a value and compares it to a target
       ──> coach: decides whether to speak, what to say, and when to praise a fix
       ──> speech, overlay with red joints and a live angle, live numbers, session report
```

On top of the cues, every session also gets:

- **A camera check** that runs on every frame: whole body in frame, distance (too far, too close, at the edge), camera angle, and how confident the tracking is. It tells you how to fix whatever fails and keeps coaching meanwhile.
- **Rep timing**: each rep is split into the way down, the pause and the way up, with the speed of the working phase.
- **Sets and fatigue**: a pause of 20 seconds starts a new set. When the last two reps in a set are 25% slower than the set's best, it tells you to rest (velocity-based training, measured at the knee).
- **Balance**: facing the camera, a squat that shifts toward one side gets flagged.
- **A live angle on the joint** that matters for the drill, red when its check is failing.
- **A report** with score and speed per rep, rep-to-rep spread for every check, a form-over-time chart for held positions, a replay of your best and worst rep side by side, and CSV or JSON export.

The coach only cues a mistake after it shows up in 2 of the last 3 reps (or lasts long enough in a held position), says one thing at a time, won't repeat a cue for at least 15 seconds, and tells you when you've fixed it. Every rep gets a score out of 100 from the weights of the checks it failed.

Sports without their own rules use the AI coach. It detects one burst of movement by body speed, takes three frames (start, fastest point, end), and sends them as one image to Gemini along with the measured joint angles. That's the only path that sends anything off the device.

### Code map

```
src/engine/        pure logic, no DOM: runs the same in the browser and in tests
  landmarks.js     MediaPipe landmark indices and bones
  math.js          angles, leans, medians
  filters.js       One Euro filter for landmark smoothing
  features.js      landmarks -> named measurements; camera-angle detection; hand matching
  segment.js       RepSegmenter (rep drills) and HoldWindow (held positions)
  coach.js         turns frames into events: hint, calibrating, rep, cue, praise, fatigue, set
  kinematics.js    rep phases and speed, velocity loss, rep-to-rep spread
  setup.js         the camera check
  motion.js        movement bursts for the AI coach
  history.js       session history in localStorage
src/drills/        one file per product; each drill is data plus small measure/fault functions
src/tracking/      MediaPipe wrapper, overlay drawing, frame buffer for the AI coach
src/app/           the app at /try/: picker, setup, live view, report, session runner
src/components/    the marketing site: Logo.jsx (the mark), Landscape.jsx (painted backdrops),
                   LiveDemo.jsx (the hero demo, which runs the real Coach on generated motion)
src/demo/motion.js the squat motion for the hero demo
src/utils/exportSession.js   CSV and JSON export
brand/             logo files (mark, lockups, outlined wordmark)
api/coach.js       server function for the AI coach (holds the Gemini key)
test/              unit and coaching tests on synthetic poses with known angles
```

### Adding a drill

A drill is an object in `src/drills/`. Pick `mode: 'rep'` (with a signal that dips or rises during a rep) or `mode: 'hold'`, list the landmarks it needs, and write checks:

```js
{
  id: 'depth',
  label: 'Depth',
  measure: (rep) => rep.min('knee'),   // the number shown and scored
  fault: (v) => v > 100,               // when it counts as a mistake
  target: 'knee under 100°',
  weight: 30,                          // share of the rep score
  cue: 'Sit lower. Get your thighs down to parallel.',
  fixed: "That's the depth. Keep it.",
  joints: [P.leftKnee, P.rightKnee],   // drawn red when this fails
}
```

Then add a synthetic test in `test/coach.test.js` that feeds good and bad versions of the movement. Optional fields: `frame` ('full', 'upper' or 'hands') for the camera check, `live` for the angle drawn on the joint, and in `rep`, `power`, `fatigue` and `phases` for timing.

## Brand

`BRAND.md` covers color, type, logo, components, layout and voice. The short version: white pages with Newsreader serif headlines and Instrument Sans text, rounded cards and pill buttons, the product floating on painted skies, cobalt `#2346F5` for anything tracked or in range, and signal red `#D13A22` only for faults.

## Running it locally

You need Node 18 or newer.

```bash
npm install
cp .env.example .env   # paste your Gemini key into GEMINI_API_KEY (only the AI coach uses it)
npm run dev            # site at http://localhost:5173, app at http://localhost:5173/try/
npm test               # engine, coaching, camera-check and homepage-demo tests (41)
```

Use Chrome. The first session takes a few seconds while the tracking models download. The fonts (Newsreader and Instrument Sans) are bundled, so nothing loads from Google Fonts.

## Environment variables

| Variable | Where | Required | What it is |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | server | for the AI coach | Gemini key used by `/api/coach`. Get one free at https://aistudio.google.com/app/apikey |
| `COACH_MODEL` | server | no | Override the model id. Defaults to `gemini-2.5-flash-lite`. |
| `VITE_WAITLIST_URL` | browser | no | Google Apps Script web app URL for the waitlist, ending in `/exec`. |

Never give the Gemini key a `VITE_` prefix in client code: anything referenced as `import.meta.env.VITE_*` ends up in the public bundle.

## Deploying

On Vercel:

1. Add `GEMINI_API_KEY` under Project Settings, Environment Variables.
2. Delete the old `VITE_GEMINI_API_KEY` variable and rotate that key in Google AI Studio, because earlier builds shipped it in the public bundle.
3. Push. Vercel builds both pages and deploys `api/coach.js` as a serverless function.

## Known limits

- Accuracy depends on the camera's view. Hidden joints are skipped, not guessed.
- Thresholds are starting points, not values validated with coaches yet. Tune them in `src/drills/` as real sessions come in.
- The real tracking path (camera plus MediaPipe models) has to be checked on a real device. The tests cover everything after the tracker.

© 2026 wobbl
