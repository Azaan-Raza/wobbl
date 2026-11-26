import { useId, useMemo } from 'react';

// Painted backdrops: a sky, a low sun and five ridges of rolling hills, far to
// near, with film grain on top. The ridges are drawn from a few sine waves,
// so every scene has the same slow wobble as the name. Each palette is a time
// of day; sections pick one so the page moves from dusk to morning.
export const PALETTES = {
  dusk: {
    sky: ['#14205A', '#3C4FB8', '#9C8BD6', '#F3B08A'],
    sun: '#FFE1BC',
    ridges: ['#A894D0', '#7B70BE', '#5A55A6', '#3C3C86', '#232560'],
  },
  dawn: {
    sky: ['#8FA9E6', '#C9C3E8', '#F2D3D8', '#FCE7D4'],
    sun: '#FFF6E8',
    ridges: ['#D9C4DE', '#BCA6D1', '#9C88BE', '#7C6BA8', '#5C4F8E'],
  },
  day: {
    sky: ['#3F78DD', '#7FAAF0', '#BFD6F7', '#EAF2FC'],
    sun: '#FFFFFF',
    ridges: ['#B3CDF0', '#89AEE4', '#6390D4', '#4672BD', '#2F559E'],
  },
  ember: {
    sky: ['#2A1838', '#7E3550', '#D9725D', '#F7C08A'],
    sun: '#FFE6B8',
    ridges: ['#D88C72', '#B56766', '#8C4A5C', '#61344D', '#3B2139'],
  },
  night: {
    sky: ['#05060E', '#10163A', '#262C68', '#4A4596'],
    sun: '#D4DAFF',
    ridges: ['#3A3D7A', '#2B2E63', '#1F224C', '#151735', '#0B0C1F'],
  },
  sage: {
    sky: ['#9CC4BA', '#CFE3D8', '#EEF2E3', '#FAF5E6'],
    sun: '#FFFDF3',
    ridges: ['#B9D6C4', '#93BDA6', '#6EA288', '#4F866E', '#336855'],
  },
};

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const W = 1600;
const H = 1000;

export default function Landscape({ palette = 'dusk', seed = 7, horizon = 0.56, sun = [0.72, 0.5], grain = true, className = '' }) {
  const id = useId().replace(/:/g, '');
  const p = PALETTES[palette];

  const ridges = useMemo(() => {
    const rand = seeded(seed);
    return p.ridges.map((color, i) => {
      const base = H * (horizon + i * 0.085);
      const amp = 18 + i * 16;
      const waves = [0, 1, 2].map((k) => ({
        f: (0.0016 + rand() * 0.0022) * (k + 1),
        ph: rand() * Math.PI * 2,
        a: amp / (k + 1.2),
      }));
      const pts = [];
      for (let x = -20; x <= W + 20; x += 20) {
        const y = base + waves.reduce((sum, w) => sum + w.a * Math.sin(x * w.f + w.ph), 0);
        pts.push(`${x},${y.toFixed(1)}`);
      }
      return { color, d: `M-20,${H} L${pts.join(' L')} L${W + 20},${H} Z` };
    });
  }, [p, seed, horizon]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={`absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          {p.sky.map((c, i) => (
            <stop key={c} offset={`${(i / (p.sky.length - 1)) * horizon * 100 + (i === p.sky.length - 1 ? 8 : 0)}%`} stopColor={c} />
          ))}
        </linearGradient>
        <radialGradient id={`sun-${id}`}>
          <stop offset="0%" stopColor={p.sun} stopOpacity="1" />
          <stop offset="18%" stopColor={p.sun} stopOpacity="0.85" />
          <stop offset="45%" stopColor={p.sun} stopOpacity="0.25" />
          <stop offset="100%" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
        {ridges.map((r, i) => (
          <linearGradient key={i} id={`r${i}-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={r.color} />
            <stop offset="100%" stopColor={ridges[Math.min(i + 1, ridges.length - 1)].color} />
          </linearGradient>
        ))}
        {grain && (
          <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.55" />
            </feComponentTransfer>
          </filter>
        )}
      </defs>
      <rect width={W} height={H} fill={`url(#sky-${id})`} />
      <circle cx={W * sun[0]} cy={H * sun[1]} r={H * 0.42} fill={`url(#sun-${id})`} />
      {ridges.map((r, i) => (
        <path key={i} d={r.d} fill={`url(#r${i}-${id})`} />
      ))}
      {grain && (
        <rect width={W} height={H} filter={`url(#grain-${id})`} opacity="0.35" style={{ mixBlendMode: 'overlay' }} />
      )}
    </svg>
  );
}
