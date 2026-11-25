import { HAND_BONES, MIN_VISIBILITY, POSE_BONES } from '../engine/landmarks.js';

// Colours for drawing on top of live video. They're brighter than the brand
// colours used on white, and every line gets a dark halo so it reads on any
// background.
const BONE = '#7D96FF';
const FAULT = '#FF5A3D';
const HALO = 'rgba(0, 0, 0, 0.45)';

// Draws the tracked skeleton over the video.
// - Joints in `faultJoints` turn red, so you can see what the last cue was about
//   ('hand' marks the hands).
// - `focus` draws the drill's main angle on its joint, with the live value.
// - The canvas is shown mirrored (like a selfie camera), so text is drawn
//   flipped back to read normally.
export function drawOverlay(ctx, width, height, { pose, hands = [], faultJoints = [], focus = null, mirrored = true }) {
  ctx.clearRect(0, 0, width, height);
  const bad = new Set(faultJoints);
  const seen = (p) => p && (p.visibility ?? 1) >= MIN_VISIBILITY;
  const at = (p) => [p.x * width, p.y * height];
  const scale = Math.max(1, width / 640);

  const line = (a, b, color, w) => {
    ctx.lineCap = 'round';
    ctx.strokeStyle = HALO;
    ctx.lineWidth = (w + 2.5) * scale;
    ctx.beginPath();
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = w * scale;
    ctx.beginPath();
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.stroke();
  };

  if (pose) {
    for (const [a, b] of POSE_BONES) {
      if (!seen(pose[a]) || !seen(pose[b])) continue;
      line(at(pose[a]), at(pose[b]), bad.has(a) && bad.has(b) ? FAULT : BONE, 3);
    }
    // Neck line from between the shoulders to the nose, for posture drills.
    const ls = pose[11];
    const rs = pose[12];
    if (seen(ls) && seen(rs) && seen(pose[0])) {
      line([((ls.x + rs.x) / 2) * width, ((ls.y + rs.y) / 2) * height], at(pose[0]), bad.has(0) ? FAULT : BONE, 3);
    }

    if (focus) drawAngle(ctx, focus, pose, { at, seen, scale, mirrored });

    for (const [i, p] of pose.entries()) {
      // Of the face points, only the nose and ears are drawn.
      if ((i < 11 && i !== 0 && i !== 7 && i !== 8) || !seen(p)) continue;
      const [x, y] = at(p);
      const hit = bad.has(i);
      ctx.beginPath();
      ctx.arc(x, y, (hit ? 6 : 4.5) * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 2 * scale;
      ctx.strokeStyle = hit ? FAULT : BONE;
      ctx.stroke();
      if (hit) {
        ctx.beginPath();
        ctx.arc(x, y, 15 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = FAULT;
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
      }
    }
  }

  const handBad = bad.has('hand');
  for (const hand of hands) {
    const pts = hand.points;
    for (const [a, b] of HAND_BONES) line(at(pts[a]), at(pts[b]), handBad ? FAULT : BONE, 2);
    for (const p of pts) {
      const [x, y] = at(p);
      ctx.beginPath();
      ctx.arc(x, y, 2.8 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.lineWidth = 1.4 * scale;
      ctx.strokeStyle = handBad ? FAULT : BONE;
      ctx.stroke();
    }
  }
}

// An arc between the two bones that meet at a joint, with the angle printed
// beside it. The value comes from the 3D measurement, not the flat drawing.
function drawAngle(ctx, focus, pose, { at, seen, scale, mirrored }) {
  const [ia, ib, ic] = focus.points;
  if (![ia, ib, ic].every((i) => seen(pose[i]))) return;
  const a = at(pose[ia]);
  const b = at(pose[ib]);
  const c = at(pose[ic]);
  const ua = Math.atan2(a[1] - b[1], a[0] - b[0]);
  const uc = Math.atan2(c[1] - b[1], c[0] - b[0]);
  let diff = uc - ua;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  const r = 34 * scale;
  const color = focus.fault ? FAULT : BONE;

  ctx.beginPath();
  ctx.moveTo(...b);
  ctx.arc(b[0], b[1], r, ua, ua + diff, diff < 0);
  ctx.closePath();
  ctx.fillStyle = focus.fault ? 'rgba(255, 90, 61, 0.22)' : 'rgba(125, 150, 255, 0.22)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(b[0], b[1], r, ua, ua + diff, diff < 0);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5 * scale;
  ctx.stroke();

  // Label on the far side of the joint from the arc, so it never sits on a bone.
  const mid = ua + diff / 2 + Math.PI;
  const lx = b[0] + Math.cos(mid) * (r + 26 * scale);
  const ly = b[1] + Math.sin(mid) * (r + 26 * scale);
  const text = `${Math.round(focus.value)}°`;
  ctx.save();
  ctx.translate(lx, ly);
  if (mirrored) ctx.scale(-1, 1);
  ctx.font = `600 ${18 * scale}px "Archivo Variable", Archivo, system-ui, sans-serif`;
  const w = ctx.measureText(text).width + 14 * scale;
  const h = 26 * scale;
  ctx.fillStyle = color;
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = focus.fault ? '#FFFFFF' : '#0B1240';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 1 * scale);
  ctx.restore();
}
