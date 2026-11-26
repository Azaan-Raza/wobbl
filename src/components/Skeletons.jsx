import { useId } from 'react';

// Tracker-style skeletons for the product showcase, drawn the way the app
// draws them on a dark camera feed: glowing bones, white joints, faults in
// red with a ring. No bodies, no faces.
const BONE = '#A9B8FF';
const GLOW = '#6F86FF';
const FAULT = '#FF5A3D';

function Skeleton({ viewBox, joints, bones, faults = [], ring, children, label }) {
  const id = useId().replace(/:/g, '');
  const bad = new Set(faults);
  const color = (a, b) => (bad.has(a) && bad.has(b) ? FAULT : BONE);
  return (
    <svg viewBox={viewBox} className="h-full w-full" role="img" aria-label={label}>
      <defs>
        <filter id={`g-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {children}
      <g filter={`url(#g-${id})`} opacity="0.6">
        {bones.map(([a, b]) => (
          <line key={`g${a}${b}`} x1={joints[a][0]} y1={joints[a][1]} x2={joints[b][0]} y2={joints[b][1]} stroke={bad.has(a) && bad.has(b) ? FAULT : GLOW} strokeWidth="7" strokeLinecap="round" />
        ))}
      </g>
      {bones.map(([a, b]) => (
        <line key={`${a}${b}`} x1={joints[a][0]} y1={joints[a][1]} x2={joints[b][0]} y2={joints[b][1]} stroke={color(a, b)} strokeWidth="3" strokeLinecap="round" />
      ))}
      {Object.entries(joints).map(([k, [x, y]]) => (
        <circle key={k} cx={x} cy={y} r={bad.has(k) ? 5.5 : 4.5} fill="#FFFFFF" stroke={bad.has(k) ? FAULT : BONE} strokeWidth="2.2" />
      ))}
      {ring && <circle cx={joints[ring][0]} cy={joints[ring][1]} r="15" fill="none" stroke={FAULT} strokeWidth="2" />}
    </svg>
  );
}

function arcPath(a, b, c, r) {
  const ua = Math.atan2(a[1] - b[1], a[0] - b[0]);
  const uc = Math.atan2(c[1] - b[1], c[0] - b[0]);
  let d = uc - ua;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const p1 = [b[0] + r * Math.cos(ua), b[1] + r * Math.sin(ua)];
  const p2 = [b[0] + r * Math.cos(ua + d), b[1] + r * Math.sin(ua + d)];
  return `M${b[0]},${b[1]} L${p1[0]},${p1[1]} A${r},${r} 0 0 ${d > 0 ? 1 : 0} ${p2[0]},${p2[1]} Z`;
}

// Tae Kwon Do front stance, side-on. Front knee at 142°, not bent enough.
const STANCE = {
  ear: [311, 79],
  shoulder: [308, 116],
  elbowP: [366, 132],
  wristP: [424, 138],
  elbowC: [270, 170],
  wristC: [298, 208],
  hip: [300, 226],
  kneeF: [370.3, 278.9],
  ankleF: [392.6, 362],
  heelF: [381, 370],
  toeF: [436, 370],
  kneeB: [243.4, 293.4],
  ankleB: [191.6, 362],
  heelB: [181, 370],
  toeB: [222, 370],
};
const STANCE_BONES = [
  ['shoulder', 'elbowP'], ['elbowP', 'wristP'], ['shoulder', 'elbowC'], ['elbowC', 'wristC'],
  ['shoulder', 'hip'], ['hip', 'kneeF'], ['kneeF', 'ankleF'], ['ankleF', 'heelF'], ['heelF', 'toeF'], ['ankleF', 'toeF'],
  ['hip', 'kneeB'], ['kneeB', 'ankleB'], ['ankleB', 'heelB'], ['heelB', 'toeB'], ['ankleB', 'toeB'],
  ['shoulder', 'ear'],
];

export function StanceSkeleton() {
  const j = STANCE;
  return (
    <Skeleton
      viewBox="120 40 400 360"
      joints={j}
      bones={STANCE_BONES}
      faults={['hip', 'kneeF', 'ankleF']}
      ring="kneeF"
      label="Front stance skeleton, front knee marked at 142 degrees"
    >
      <line x1="120" x2="520" y1="372" y2="372" stroke="#FFFFFF" strokeOpacity="0.12" />
      <circle cx="315" cy="76" r="22" fill="none" stroke={BONE} strokeWidth="2.5" />
      <path d={arcPath(j.hip, j.kneeF, j.ankleF, 32)} fill={FAULT} fillOpacity="0.2" stroke={FAULT} strokeWidth="2" />
      <rect x="404" y="226" width="58" height="28" rx="14" fill={FAULT} />
      <text x="433" y="245" textAnchor="middle" fontSize="16" fontWeight="600" fill="#fff" fontFamily="'Instrument Sans Variable', system-ui, sans-serif">
        142°
      </text>
    </Skeleton>
  );
}

// Right hand at the piano, from the side. The wrist sits below the knuckles.
const HAND = {
  wrist: [236, 284],
  mcp: [330, 252],
  pip: [364, 262],
  dip: [382, 280],
  tip: [388, 298],
  thumb: [262, 292],
  thumbTip: [306, 299],
};
const HAND_BONES = [
  ['wrist', 'mcp'], ['mcp', 'pip'], ['pip', 'dip'], ['dip', 'tip'], ['wrist', 'thumb'], ['thumb', 'thumbTip'],
];

export function HandSkeleton() {
  const j = HAND;
  return (
    <Skeleton viewBox="150 190 320 160" joints={j} bones={HAND_BONES} faults={['wrist', 'mcp']} ring="wrist" label="Hand skeleton at the piano, wrist below the knuckle line">
      <line x1="200" x2="470" y1="301" y2="301" stroke="#FFFFFF" strokeOpacity="0.2" />
      <line x1="160" x2="440" y1={j.mcp[1]} y2={j.mcp[1]} stroke={BONE} strokeOpacity="0.7" strokeDasharray="4 5" />
      <line x1={j.wrist[0] - 28} x2={j.wrist[0] - 28} y1={j.mcp[1]} y2={j.wrist[1]} stroke={FAULT} strokeWidth="2" />
      <text x="166" y={j.mcp[1] - 8} fontSize="12" fill={BONE} fontFamily="'Instrument Sans Variable', system-ui, sans-serif">
        knuckle line
      </text>
    </Skeleton>
  );
}

// Seated at a laptop, from its camera. Dashed: the posture saved at the start.
const DESK = {
  nose: [320, 214],
  earL: [362, 200],
  earR: [278, 200],
  neck: [320, 286],
  shoulderL: [430, 290],
  shoulderR: [210, 290],
};
const DESK_BONES = [
  ['shoulderL', 'shoulderR'], ['neck', 'nose'],
];

export function DeskSkeleton() {
  const j = DESK;
  return (
    <Skeleton viewBox="170 110 300 210" joints={j} bones={DESK_BONES} faults={['neck', 'nose']} ring="nose" label="Upper body skeleton at a desk, head lower than the saved baseline">
      <circle cx="320" cy="160" r="40" fill="none" stroke={BONE} strokeOpacity="0.7" strokeDasharray="4 5" />
      <circle cx="320" cy="206" r="44" fill="none" stroke={BONE} strokeWidth="2.5" />
      <line x1="250" x2="250" y1="174" y2={j.nose[1]} stroke={FAULT} strokeWidth="2" />
      <text x="200" y="150" fontSize="12" fill={BONE} fontFamily="'Instrument Sans Variable', system-ui, sans-serif">
        your baseline
      </text>
    </Skeleton>
  );
}
