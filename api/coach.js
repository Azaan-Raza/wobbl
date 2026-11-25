// POST /api/coach  { image: <base64 JPEG>, sport: <one of SPORTS>, metrics? } -> { cue }
//
// Used by the AI coach for sports that don't have their own rules yet. The
// image holds three frames from one rep; metrics holds joint angles measured
// on the device at those frames.
//
// Runs on the server (a Vercel function in production, Vite middleware in dev),
// so the Gemini key never reaches the browser. Set GEMINI_API_KEY in Vercel's
// project settings and in your local .env.
import { SPORTS } from '../src/utils/sports.js';
import { DEFAULT_MODEL, buildGeminiBody, extractCue } from '../src/utils/coachPrompt.js';

const REQUEST_TIMEOUT_MS = 8000;
// Three 320px frames at quality 0.7 are well under this; anything bigger is not ours.
const MAX_IMAGE_CHARS = 1_500_000;

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin requests from some browsers omit it
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }
  // Keeps other websites from spending our quota through visitors' browsers.
  if (!sameOrigin(req)) {
    return res.status(403).json({ error: 'Cross-origin requests are not allowed.' });
  }

  // GEMINI_API_KEY is the name to use. The VITE_ name is read only so existing
  // deployments keep working; it is never referenced in client code, so Vite
  // does not put it in the bundle.
  const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY.' });
  }

  const { sport, metrics } = req.body || {};
  const image = req.body?.image ?? req.body?.frame;
  if (typeof image !== 'string' || image.length === 0 || image.length > MAX_IMAGE_CHARS) {
    return res.status(400).json({ error: 'Send one JPEG as base64 in "image".' });
  }
  if (!SPORTS.includes(sport)) {
    return res.status(400).json({ error: 'Unknown sport.' });
  }
  if (metrics != null && !validMetrics(metrics)) {
    return res.status(400).json({ error: 'Metrics must be { angles: [up to 3 objects of numbers] }.' });
  }

  const model = process.env.COACH_MODEL || process.env.VITE_COACH_MODEL || DEFAULT_MODEL;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify(buildGeminiBody(image, sport, metrics)),
        signal: controller.signal,
      }
    );
    if (!upstream.ok) {
      return res.status(502).json({ error: `Model request failed (${upstream.status}).` });
    }
    const cue = extractCue(await upstream.json());
    if (!cue) return res.status(502).json({ error: 'Model returned no cue.' });
    return res.status(200).json({ cue });
  } catch (err) {
    const timedOut = err?.name === 'AbortError';
    return res.status(timedOut ? 504 : 502).json({
      error: timedOut ? 'Model request timed out.' : 'Model request failed.',
    });
  } finally {
    clearTimeout(timeout);
  }
}

function validMetrics(m) {
  if (typeof m !== 'object' || !Array.isArray(m.angles) || m.angles.length > 3) return false;
  return m.angles.every(
    (a) =>
      a &&
      typeof a === 'object' &&
      Object.keys(a).length <= 12 &&
      Object.values(a).every((v) => typeof v === 'number' && Number.isFinite(v))
  );
}
