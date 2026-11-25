// Keeps the last few seconds of small video frames so the AI coach can pull
// the exact moments of a rep after it finishes. Only used in AI mode.
export class FrameBuffer {
  constructor({ width = 320, everyMs = 100, keepMs = 7000 } = {}) {
    Object.assign(this, { width, everyMs, keepMs });
    this.frames = [];
    this.lastAt = -Infinity;
  }

  capture(video, t) {
    if (t - this.lastAt < this.everyMs || !video.videoWidth) return;
    this.lastAt = t;
    const h = Math.round((video.videoHeight / video.videoWidth) * this.width);
    // Reuse canvases that have aged out instead of making new ones.
    const old = this.frames.length && t - this.frames[0].t > this.keepMs ? this.frames.shift() : null;
    const canvas = old?.canvas || document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = h;
    canvas.getContext('2d').drawImage(video, 0, 0, this.width, h);
    this.frames.push({ t, canvas });
  }

  nearest(t) {
    let best = null;
    for (const f of this.frames) {
      if (!best || Math.abs(f.t - t) < Math.abs(best.t - t)) best = f;
    }
    return best;
  }

  // Three frames side by side in one JPEG, as base64 without the data: prefix.
  strip(times, quality = 0.7) {
    const picked = times.map((t) => this.nearest(t)).filter(Boolean);
    if (picked.length !== times.length) return null;
    const w = picked[0].canvas.width;
    const h = picked[0].canvas.height;
    const out = document.createElement('canvas');
    out.width = w * picked.length;
    out.height = h;
    const ctx = out.getContext('2d');
    picked.forEach((f, i) => ctx.drawImage(f.canvas, i * w, 0));
    return out.toDataURL('image/jpeg', quality).split(',')[1] || null;
  }

  clear() {
    this.frames = [];
    this.lastAt = -Infinity;
  }
}
