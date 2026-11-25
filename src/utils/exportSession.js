// Session export, for athletes and coaches who keep their own logs. Rep
// drills export one row per rep; held positions export the score each second.
export function toCsv(summary, drill) {
  if (summary.mode === 'hold') {
    const rows = (summary.timeline || []).map((p) => [p.s, p.score]);
    return toLines([['second', 'score'], ...rows]);
  }
  const ids = drill.checks.map((c) => c.id);
  const head = ['rep', 'set', 'score', 'down_s', 'pause_s', 'up_s', 'speed_per_s', 'velocity_loss', ...ids];
  const sec = (ms) => (ms == null ? '' : (ms / 1000).toFixed(2));
  const rows = (summary.repLog || []).map((r) => [
    r.index,
    r.set,
    r.score ?? '',
    sec(r.downMs),
    sec(r.pauseMs),
    sec(r.upMs),
    r.speed ?? '',
    r.loss == null ? '' : r.loss.toFixed(2),
    ...ids.map((id) => r.values?.[id] ?? ''),
  ]);
  return toLines([head, ...rows]);
}

export function toJson(summary, drill) {
  const { replay, ...rest } = summary;
  return JSON.stringify({ drill: drill.id, drillName: drill.name, exportedAt: new Date().toISOString(), ...rest }, null, 2);
}

export function downloadText(filename, text, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toLines(rows) {
  const cell = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return `${rows.map((r) => r.map(cell).join(',')).join('\n')}\n`;
}
