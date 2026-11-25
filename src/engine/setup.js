import { P } from './landmarks.js';

// Camera check. Runs on every frame and answers four questions the athlete
// can act on before (and during) a session:
//
//   inFrame   can it see every body part this drill needs?
//   distance  is the body a sensible size in the picture, and away from the edges?
//   angle     is the camera at the angle the drill needs (side-on, facing)?
//   tracking  how confident is the model about the points that matter?
//
// Returns { ready, items: [{ id, label, ok, value, tip }] }.
export function assessSetup(f, drill, settings = {}) {
  const items = [];
  const pose = f?.pose;
  const kind = drill.frame ?? 'full';
  const read = (x) => (typeof x === 'function' ? x(settings) : x) || [];
  const needs = read(drill.needs);
  const handsNeeded = read(drill.needsHands);
  const vis = (i) => pose?.[i]?.visibility ?? 0;
  // A need can be a group ([leftHip, rightHip]); the best-seen point counts.
  const confidence = needs.map((n) => (Array.isArray(n) ? Math.max(...n.map(vis)) : vis(n)));

  // 1. In frame
  const bodyOk = !needs.length || (pose && confidence.every((c) => c >= 0.5));
  const handsOk = handsNeeded.every((side) => f?.hands?.[side]);
  items.push({
    id: 'inFrame',
    label: kind === 'hands' ? 'Hand in frame' : kind === 'upper' ? 'Head and shoulders in frame' : 'Whole body in frame',
    ok: Boolean(bodyOk && handsOk),
    value: bodyOk && handsOk ? 'yes' : 'no',
    tip: (!handsOk && drill.missingHandsHint) || drill.missingHint,
  });

  // 2. Distance and position
  if (pose && kind !== 'hands') {
    const seen = pose.filter((p, i) => i >= 11 && (p.visibility ?? 0) >= 0.5);
    const atEdge = seen.some((p) => p.x < 0.02 || p.x > 0.98 || p.y < 0.01 || p.y > 0.99);
    let ok = !atEdge;
    let value = 'good';
    let tip = atEdge ? 'Part of you is at the edge of the picture. Move toward the middle.' : null;

    if (kind === 'full') {
      const top = [P.nose, P.leftShoulder, P.rightShoulder].filter((i) => vis(i) >= 0.5).map((i) => pose[i].y);
      const bottom = [P.leftAnkle, P.rightAnkle, P.leftHeel, P.rightHeel]
        .filter((i) => vis(i) >= 0.5)
        .map((i) => pose[i].y);
      if (top.length && bottom.length) {
        const height = Math.max(...bottom) - Math.min(...top);
        if (height < 0.4) {
          ok = false;
          value = 'too far';
          tip = 'Move a step or two closer. You take up less than half the picture.';
        } else if (height > 0.93) {
          ok = false;
          value = 'too close';
          tip = "Step back a little so there's room above your head and under your feet.";
        }
      }
    } else if (kind === 'upper' && f.shoulderWidth != null) {
      if (f.shoulderWidth < 0.16) {
        ok = false;
        value = 'too far';
        tip = 'Sit a bit closer to the camera, or move the laptop toward you.';
      } else if (f.shoulderWidth > 0.7) {
        ok = false;
        value = 'too close';
        tip = 'Sit back a little so both shoulders fit in the picture.';
      }
    }
    items.push({ id: 'distance', label: 'Distance', ok, value, tip });
  }

  // 3. Camera angle. Drills without a required angle still show the one it
  // detected, since some checks only run from one side.
  if (kind !== 'hands' && (drill.views?.length || f?.view)) {
    const ok = drill.views?.length ? Boolean(f?.view && drill.views.includes(f.view)) : true;
    items.push({
      id: 'angle',
      label: 'Camera angle',
      ok,
      value: f?.view ? `${f.view} view` : 'unknown',
      tip: drill.viewHint,
    });
  }

  // 4. Tracking confidence
  if (kind === 'hands') {
    items.push({
      id: 'tracking',
      label: 'Tracking',
      ok: handsOk,
      value: handsOk ? 'good' : 'no hand found',
      tip: 'Add light from the front and keep the whole hand in view.',
    });
  } else if (needs.length) {
    const c = confidence.length ? confidence.reduce((a, b) => a + b, 0) / confidence.length : 0;
    items.push({
      id: 'tracking',
      label: 'Tracking',
      ok: c >= 0.6,
      value: c >= 0.8 ? 'good' : c >= 0.6 ? 'fair' : 'weak',
      confidence: c,
      tip: 'Tracking is shaky. Turn on a light, face a window, or wear clothes that contrast with the wall.',
    });
  }

  return { ready: items.every((i) => i.ok), items };
}
