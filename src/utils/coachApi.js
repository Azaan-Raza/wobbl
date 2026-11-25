// Asks our own /api/coach endpoint for one cue about a rep. Only the AI mode
// uses this; drills with their own rules never leave the device.
const REQUEST_TIMEOUT_MS = 9000;

export async function getAiCue({ image, sport, metrics }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, sport, metrics }),
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
