// Small geometry helpers. Points are { x, y, z? }. Image coordinates have
// y pointing down, so "up" is negative y.
const RAD = 180 / Math.PI;

export function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y, z: (a.z ?? 0) - (b.z ?? 0) };
}

export function mid(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: ((a.z ?? 0) + (b.z ?? 0)) / 2 };
}

export function dist2d(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Angle at b, in degrees, between b->a and b->c. 180 means a straight line.
export function angleAt(a, b, c, { flat = false } = {}) {
  const u = sub(a, b);
  const v = sub(c, b);
  if (flat) {
    u.z = 0;
    v.z = 0;
  }
  const nu = Math.hypot(u.x, u.y, u.z);
  const nv = Math.hypot(v.x, v.y, v.z);
  if (nu === 0 || nv === 0) return null;
  const cos = (u.x * v.x + u.y * v.y + u.z * v.z) / (nu * nv);
  return Math.acos(Math.min(1, Math.max(-1, cos))) * RAD;
}

// How far the line from `bottom` up to `top` leans away from vertical, in
// degrees (0 = upright, 90 = horizontal). Image coordinates.
export function leanFromVertical(top, bottom) {
  const dx = top.x - bottom.x;
  const dy = bottom.y - top.y; // positive when top is above bottom
  return Math.abs(Math.atan2(dx, dy) * RAD);
}

// Tilt of the line a-b away from horizontal, in degrees (0 = level).
export function tiltFromHorizontal(a, b) {
  const t = Math.abs(Math.atan2(b.y - a.y, b.x - a.x) * RAD);
  return t > 90 ? 180 - t : t;
}

export function mean(values) {
  const v = values.filter((x) => x != null && Number.isFinite(x));
  return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
}

export function median(values) {
  const v = values.filter((x) => x != null && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}
