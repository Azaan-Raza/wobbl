<div align="center">

# Acuity Kinetic

### A coach that watches you train.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38BDF8?logo=tailwindcss&logoColor=white)

Point your camera at yourself, pick your sport, and hear one short correction at a time, while you're still moving.

</div>

---

## Contents

1. [What it does](#what-it-does)
2. [How a cue is made](#how-a-cue-is-made)
3. [Tech stack](#tech-stack)
4. [Running it locally](#running-it-locally)
5. [Environment variables](#environment-variables)
6. [Project structure](#project-structure)
7. [Deploying](#deploying)

---

## What it does

- A light, single-page site: hero, how it works, live demo, founder note with the waitlist, FAQ.
- A scripted preview of a live session in the hero: pose overlay, a ring on the joint being corrected, and the cue the athlete hears.
- A live demo that uses your webcam:
  - The camera stays off until you press "turn on camera", so the permission prompt never fires on page load.
  - On-device pose detection draws a skeleton overlay and tells you whether you are too close, too far, or well framed.
  - Every 2.5 seconds it sends one frame to `/api/coach` and shows the cue it gets back.
  - Cues appear newest first, repeats are filtered out, and each one is read aloud (with a mute toggle and a small chime).
  - When nobody is in frame, it skips the call to save quota.
- A waitlist that records signups to a Google Sheet.

[Back to top](#contents)

---

## How a cue is made

1. Capture a frame from the live camera and scale it down to a small JPEG.
2. Check framing with a local pose model (MediaPipe, 33 body landmarks). If no athlete is found, the frame is dropped before anything is sent.
3. Post the frame and the sport to `/api/coach`. That server function adds the sport-specific instructions and calls Gemini with a key that only the server knows.
4. Get back one short cue, fifteen words or fewer. Identical back-to-back cues are discarded.
5. Show the cue at the top of the feed with a timestamp and read it aloud, unless muted.

If a request fails or times out, a brief notice appears and the loop retries on its own.

[Back to top](#contents)

---

## Tech stack

- React 18 and Vite
- Tailwind CSS (tokens in `tailwind.config.js`), Inter and Geist Mono
- Framer Motion for the few animations that matter
- MediaPipe Tasks Vision for in-browser pose detection
- Gemini (default `gemini-2.5-flash-lite`) behind a Vercel serverless function
- Web Speech API for the voice, Web Audio for the chime

[Back to top](#contents)

---

## Running it locally

You need Node 18 or newer.

```bash
npm install
cp .env.example .env   # then paste your Gemini key into GEMINI_API_KEY
npm run dev
```

Open the printed URL (usually `http://localhost:5173`) in Chrome. The dev server runs `/api/coach` for you, so local behaves the same as production and the key never reaches the browser.

[Back to top](#contents)

---

## Environment variables

| Variable | Where | Required | What it is |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | server | yes | Gemini key used by `/api/coach`. Get one free at https://aistudio.google.com/app/apikey |
| `COACH_MODEL` | server | no | Override the model id. Defaults to `gemini-2.5-flash-lite`. |
| `VITE_WAITLIST_URL` | browser | no | Google Apps Script web app URL for the waitlist, ending in `/exec`. Without it the form works in the UI but records nothing. |

Never give the Gemini key a `VITE_` prefix in client code: anything referenced as `import.meta.env.VITE_*` is baked into the public bundle.

[Back to top](#contents)

---

## Project structure

```
.
├── api/
│   └── coach.js              # POST /api/coach: validates input, calls Gemini server-side
├── public/favicon.svg
├── index.html
├── tailwind.config.js        # design tokens (colors, type scale, shadows)
├── vite.config.js            # runs /api in the dev server
└── src/
    ├── App.jsx               # page layout, sport state, toasts
    ├── index.css             # pill buttons, window chrome, focus styles
    ├── components/
    │   ├── Nav.jsx
    │   ├── Hero.jsx
    │   ├── HeroSession.jsx   # scripted live-session preview
    │   ├── HowItWorks.jsx
    │   ├── Demo.jsx          # camera, capture loop, controls
    │   ├── CameraFeed.jsx    # webcam, pose overlay, framing pill
    │   ├── FeedbackPanel.jsx # the cue feed
    │   ├── FounderNote.jsx   # founder letter and waitlist form
    │   ├── Faq.jsx
    │   ├── Footer.jsx
    │   ├── WindowBar.jsx     # Mac-style title bar
    │   └── Toast.jsx
    └── utils/
        ├── coachApi.js       # client: POST to /api/coach
        ├── coachPrompt.js    # prompt and request shape, used by the server
        ├── captureFrame.js
        ├── poseDetector.js
        ├── speechOutput.js
        ├── soundFx.js
        ├── sports.js
        └── waitlist.js
```

[Back to top](#contents)

---

## Deploying

On Vercel:

1. Add `GEMINI_API_KEY` under Project Settings, Environment Variables (Production and Preview).
2. Delete the old `VITE_GEMINI_API_KEY` variable once `GEMINI_API_KEY` is set, and rotate the old key in Google AI Studio, because earlier builds shipped it in the public bundle.
3. Push. Vercel builds the site and deploys `api/coach.js` as a serverless function.

The camera and speech features need HTTPS, which Vercel provides.

[Back to top](#contents)

---

<div align="center">

© 2026 Acuity Kinetic

</div>
