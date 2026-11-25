import { HAND_BONES, MIN_VISIBILITY, POSE_BONES } from '../engine/landmarks.js';

const GOOD = 'rgba(0, 224, 122, 0.9)';
const BAD = '#FF453A';

// Draws the tracked skeleton over the video. Joints named in `faultJoints`
// turn red, so you can see what the current cue is about. `faultJoints` may
// also contain 'hand' to mark the hands.
export function drawOverlay(ctx, width, height, { pose, hands = [], faultJoints = [] }) {
  ctx.clearRect(0, 0, width, height);
  const bad = new Set(faultJoints);
  const seen = (p) => p && (p.visibility ?? 1) >= MIN_VISIBILITY;
  const at = (p) => [p.x * width, p.y * height];
  const scale = Math.max(1, width / 640);

  if (pose) {
    ctx.lineCap = 'round';
    ctx.lineWidth = 3 * scale;
    for (const [a, b] of POSE_BONES) {
      if (!seen(pose[a]) || !seen(pose[b])) continue;
      ctx.strokeStyle = bad.has(a) && bad.has(b) ? BAD : GOOD;
      ctx.beginPath();
      ctx.moveTo(...at(pose[a]));
      ctx.lineTo(...at(pose[b]));
      ctx.stroke();
    }
    // Neck line from between the shoulders to the nose, for posture drills.
    const ls = pose[11];
    const rs = pose[12];
    if (seen(ls) && seen(rs) && seen(pose[0])) {
      ctx.strokeStyle = bad.has(0) ? BAD : GOOD;
      ctx.beginPath();
      ctx.moveTo(((ls.x + rs.x) / 2) * width, ((ls.y + rs.y) / 2) * height);
      ctx.lineTo(...at(pose[0]));
      ctx.stroke();
    }
    for (const [i, p] of pose.entries()) {
      // Of the face points, only the nose and ears are drawn.
      if ((i < 11 && i !== 0 && i !== 7 && i !== 8) || !seen(p)) continue;
      const [x, y] = at(p);
      const hit = bad.has(i);
      ctx.beginPath();
      ctx.arc(x, y, (hit ? 6 : 4) * scale, 0, Math.PI * 2);
      ctx.fillStyle = hit ? BAD : '#151515';
      ctx.fill();
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeStyle = hit ? '#FFFFFF' : GOOD;
      ctx.stroke();
      if (hit) {
        ctx.beginPath();
        ctx.arc(x, y, 14 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 69, 58, 0.55)';
        ctx.lineWidth = 2 * scale;
        ctx.stroke();
      }
    }
  }

  const handBad = bad.has('hand');
  for (const hand of hands) {
    const pts = hand.points;
    ctx.lineWidth = 2 * scale;
    ctx.strokeStyle = handBad ? BAD : GOOD;
    for (const [a, b] of HAND_BONES) {
      ctx.beginPath();
      ctx.moveTo(...at(pts[a]));
      ctx.lineTo(...at(pts[b]));
      ctx.stroke();
    }
    for (const p of pts) {
      const [x, y] = at(p);
      ctx.beginPath();
      ctx.arc(x, y, 2.5 * scale, 0, Math.PI * 2);
      ctx.fillStyle = handBad ? BAD : '#FFFFFF';
      ctx.fill();
    }
  }
}
