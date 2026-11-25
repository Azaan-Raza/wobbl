// Session history, kept in this browser only. Nothing here leaves the device.
const KEY = 'ak_sessions_v1';
const MAX = 60;

export function loadSessions(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveSession(summary, storage = globalThis.localStorage) {
  // Too short to mean anything: don't clutter the history.
  if (!summary || (summary.reps === 0 && (summary.durationMs ?? 0) < 15000)) return loadSessions(storage);
  const list = [...loadSessions(storage), { ...summary, savedAt: Date.now() }].slice(-MAX);
  try {
    storage?.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full or blocked: history is a nice-to-have */
  }
  return list;
}

export function sessionsFor(drillId, storage) {
  return loadSessions(storage).filter((s) => s.drillId === drillId);
}

// One number per session for the trend line: average rep score for rep
// drills, share of time in good form for held positions.
export function sessionScore(s) {
  if (s.avgScore != null) return s.avgScore;
  if (s.goodTimeShare != null) return Math.round(s.goodTimeShare * 100);
  return null;
}
