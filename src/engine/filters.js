// One Euro filter (Casiez et al., 2012): smooths jitter when a point is still
// and stays responsive when it moves fast. One filter per coordinate.
class LowPass {
  constructor() {
    this.prev = null;
  }
  filter(x, alpha) {
    this.prev = this.prev == null ? x : alpha * x + (1 - alpha) * this.prev;
    return this.prev;
  }
}

const alphaFor = (cutoff, dt) => {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
};

export class OneEuroFilter {
  constructor({ minCutoff = 1.2, beta = 0.05, dCutoff = 1 } = {}) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.x = new LowPass();
    this.dx = new LowPass();
    this.lastT = null;
    this.lastX = null;
  }

  filter(value, tMs) {
    if (this.lastT == null) {
      this.lastT = tMs;
      this.lastX = value;
      return this.x.filter(value, 1);
    }
    const dt = Math.max(1e-3, (tMs - this.lastT) / 1000);
    const rawDx = (value - this.lastX) / dt;
    const edx = this.dx.filter(rawDx, alphaFor(this.dCutoff, dt));
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    this.lastT = tMs;
    this.lastX = value;
    return this.x.filter(value, alphaFor(cutoff, dt));
  }
}

// Smooths a whole list of landmarks. Points that drop out reset their filters
// so a hand re-entering the frame doesn't glide in from where it left.
export class LandmarkSmoother {
  constructor(options) {
    this.options = options;
    this.filters = [];
    this.lastSeen = [];
  }

  smooth(points, tMs) {
    if (!points) return null;
    return points.map((p, i) => {
      if (!p) return p;
      const stale = this.lastSeen[i] == null || tMs - this.lastSeen[i] > 400;
      if (stale || !this.filters[i]) {
        this.filters[i] = [0, 1, 2].map(() => new OneEuroFilter(this.options));
      }
      this.lastSeen[i] = tMs;
      const [fx, fy, fz] = this.filters[i];
      return {
        ...p,
        x: fx.filter(p.x, tMs),
        y: fy.filter(p.y, tMs),
        z: p.z == null ? p.z : fz.filter(p.z, tMs),
      };
    });
  }

  reset() {
    this.filters = [];
    this.lastSeen = [];
  }
}
