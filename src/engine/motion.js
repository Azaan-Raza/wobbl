import { P, MIN_VISIBILITY } from './landmarks.js';
import { computeFeatures } from './features.js';
import { dist2d } from './math.js';

const MOVING_JOINTS = [
  P.leftWrist, P.rightWrist, P.leftElbow, P.rightElbow,
  P.leftKnee, P.rightKnee, P.leftAnkle, P.rightAnkle, P.leftHip, P.rightHip,
];

// For sports without a drill: finds one burst of movement (a swing, a kick,
// a throw) by how fast the body is moving, so the AI coach gets the moment
// that matters instead of whatever frame a timer happened to land on.
//
// Speed is measured in torso lengths per second, so it doesn't depend on how
// far you stand from the camera.
export class MotionSegmenter {
  constructor({ startSpeed = 0.9, stopSpeed = 0.35, stopMs = 300, minMs = 350, maxMs = 6000 } = {}) {
    Object.assign(this, { startSpeed, stopSpeed, stopMs, minMs, maxMs });
    this.prev = null;
    this.speed = 0;
    this.active = null;
    this.quietSince = null;
  }

  // frame = { t, pose, world }. Returns a finished movement or null.
  push(frame) {
    const f = computeFeatures(frame);
    const speed = this.measure(frame, f);
    if (speed == null) return null;
    this.speed = this.speed * 0.6 + speed * 0.4;
    const sample = { t: frame.t, speed: this.speed, f };

    if (!this.active) {
      if (this.speed >= this.startSpeed) {
        this.active = { frames: [sample], start: frame.t };
        this.quietSince = null;
      }
      return null;
    }

    this.active.frames.push(sample);
    if (frame.t - this.active.start > this.maxMs) {
      this.active = null;
      return null;
    }
    if (this.speed < this.stopSpeed) {
      this.quietSince ??= frame.t;
      if (frame.t - this.quietSince >= this.stopMs) {
        const done = this.active;
        this.active = null;
        if (frame.t - done.start < this.minMs) return null;
        return toMovement(done.frames);
      }
    } else {
      this.quietSince = null;
    }
    return null;
  }

  measure(frame, f) {
    const pose = frame.pose;
    if (!pose || !f.torsoLength) {
      this.prev = null;
      return null;
    }
    const prev = this.prev;
    this.prev = { t: frame.t, pose };
    if (!prev) return null;
    const dt = (frame.t - prev.t) / 1000;
    if (dt <= 0 || dt > 0.5) return null;

    let total = 0;
    let n = 0;
    for (const i of MOVING_JOINTS) {
      const a = pose[i];
      const b = prev.pose[i];
      if ((a?.visibility ?? 0) < MIN_VISIBILITY || (b?.visibility ?? 0) < MIN_VISIBILITY) continue;
      total += dist2d(a, b);
      n += 1;
    }
    return n ? total / n / f.torsoLength / dt : null;
  }
}

// Start, fastest point, end, plus the joint angles at each.
function toMovement(frames) {
  const peak = frames.reduce((best, s) => (s.speed > best.speed ? s : best), frames[0]);
  const pick = [frames[0], peak, frames[frames.length - 1]];
  return {
    start: frames[0].t,
    end: frames[frames.length - 1].t,
    keyTimes: pick.map((s) => s.t),
    angles: pick.map((s) => anglesOf(s.f)),
  };
}

const ANGLE_KEYS = ['kneeL', 'kneeR', 'hipL', 'hipR', 'elbowL', 'elbowR', 'armRaiseL', 'armRaiseR', 'trunkLean'];

export function anglesOf(f) {
  const out = {};
  for (const k of ANGLE_KEYS) if (f[k] != null) out[k] = Math.round(f[k]);
  return out;
}
