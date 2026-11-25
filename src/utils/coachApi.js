// Asks our own /api/coach endpoint for one coaching cue. The endpoint holds the
// Gemini key on the server, so nothing secret ships to the browser.
const REQUEST_TIMEOUT_MS = 9000;

export async function getCoachingFeedback(base64Frame, sport) {
  // Abort a hung request so a dead socket can't freeze the capture loop. An
  // aborted fetch rejects, so the caller's retry path still fires.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ frame: base64Frame, sport }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Request failed (${response.status})`);

    const data = await response.json();
    if (!data?.cue) throw new Error('Empty response');
    return data.cue;
  } finally {
    clearTimeout(timeout);
  }
}
