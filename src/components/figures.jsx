// Illustrations of what the tracker sees, one per product. Drawn as the
// overlay looks in the app: green bones, dark joints, a ring on the joint the
// cue is about. All share a 400 x 300 frame.
const G = '#00E07A';

function Bones({ joints, bones }) {
  return bones.map(([a, b]) => (
    <line
      key={`${a}-${b}`}
      x1={joints[a][0]}
      y1={joints[a][1]}
      x2={joints[b][0]}
      y2={joints[b][1]}
      stroke={G}
      strokeOpacity="0.75"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  ));
}

function Dots({ joints, r = 3.6 }) {
  return Object.entries(joints).map(([k, [x, y]]) => (
    <circle key={k} cx={x} cy={y} r={r} fill="#151515" stroke={G} strokeWidth="1.2" />
  ));
}

export function Ring({ at, label }) {
  if (!at) return null;
  return (
    <g>
      <circle cx={at[0]} cy={at[1]} r="14" fill="#FF453A" fillOpacity="0.12" stroke="#FF453A" strokeWidth="2" />
      {label && (
        <text x={at[0] + 20} y={at[1] - 14} fill="#FFFFFF" fontSize="12" fontFamily="Inter, sans-serif">
          {label}
        </text>
      )}
    </g>
  );
}

// Front stance, side view, front knee not bent enough (about 142°).
export const STANCE = {
  shoulderL: [200, 98], shoulderR: [214, 100], elbowR: [256, 102], wristR: [300, 104],
  elbowL: [176, 128], wristL: [196, 150], hipL: [190, 172], hipR: [202, 174],
  kneeR: [246, 210], ankleR: [256, 252], heelR: [246, 258], toeR: [280, 258],
  kneeL: [150, 212], ankleL: [112, 250], heelL: [104, 257], toeL: [128, 258],
};
const STANCE_BONES = [
  ['shoulderL', 'shoulderR'], ['shoulderL', 'hipL'], ['shoulderR', 'hipR'], ['hipL', 'hipR'],
  ['shoulderR', 'elbowR'], ['elbowR', 'wristR'], ['shoulderL', 'elbowL'], ['elbowL', 'wristL'],
  ['hipR', 'kneeR'], ['kneeR', 'ankleR'], ['ankleR', 'heelR'], ['ankleR', 'toeR'], ['heelR', 'toeR'],
  ['hipL', 'kneeL'], ['kneeL', 'ankleL'], ['ankleL', 'heelL'], ['ankleL', 'toeL'], ['heelL', 'toeL'],
];

export function StanceFigure({ ring }) {
  return (
    <>
      <line x1="40" x2="360" y1="262" y2="262" stroke="#2E2E2E" strokeDasharray="4 6" />
      <circle cx="224" cy="66" r="15" fill="none" stroke={G} strokeOpacity="0.6" strokeWidth="2" />
      <line x1="207" y1="99" x2="220" y2="81" stroke={G} strokeOpacity="0.75" strokeWidth="2.5" />
      <Bones joints={STANCE} bones={STANCE_BONES} />
      <Dots joints={STANCE} />
      <Ring at={ring && STANCE[ring]} />
    </>
  );
}

// Right hand on a keyboard, seen from the side, wrist sagging below the
// knuckle line.
export const HAND = {
  elbow: [10, 222], wrist: [118, 204], mcp: [196, 168], pip: [224, 180], dip: [239, 199], tip: [245, 218],
  thumbBase: [150, 206], thumbTip: [186, 220],
};
const HAND_BONES = [
  ['elbow', 'wrist'], ['wrist', 'mcp'], ['mcp', 'pip'], ['pip', 'dip'], ['dip', 'tip'],
  ['wrist', 'thumbBase'], ['thumbBase', 'thumbTip'],
];

export function PianoFigure({ ring }) {
  const whites = Array.from({ length: 13 }, (_, i) => 30 + i * 26);
  const blacks = [0, 1, 3, 4, 5, 7, 8, 10, 11].map((i) => 30 + i * 26 + 18);
  return (
    <>
      <rect x="30" y="222" width="338" height="44" rx="3" fill="#EDEDED" />
      {whites.map((x) => (
        <line key={x} x1={x} x2={x} y1="222" y2="266" stroke="#BDBDBD" />
      ))}
      {blacks.map((x) => (
        <rect key={x} x={x} y="222" width="16" height="26" rx="2" fill="#151515" />
      ))}
      <line x1="196" y1="168" x2="96" y2="168" stroke="#FFFFFF" strokeOpacity="0.45" strokeDasharray="3 5" />
      <text x="60" y="162" fill="#FFFFFF" fillOpacity="0.6" fontSize="11" fontFamily="Inter, sans-serif">
        knuckle line
      </text>
      <Bones joints={HAND} bones={HAND_BONES} />
      <Dots joints={HAND} r={3.2} />
      <Ring at={ring && HAND[ring]} />
    </>
  );
}

// Seated, facing a laptop camera. The dashed head is the baseline taken at
// the start; the solid one has slid forward and down.
export const DESK = {
  nose: [200, 150], earL: [228, 140], earR: [172, 140], shoulderL: [262, 196], shoulderR: [138, 196],
  elbowL: [286, 262], elbowR: [114, 262],
};
const DESK_BONES = [
  ['shoulderL', 'shoulderR'], ['shoulderL', 'elbowL'], ['shoulderR', 'elbowR'],
];

export function DeskFigure({ ring }) {
  return (
    <>
      <circle cx="200" cy="110" r="30" fill="none" stroke="#FFFFFF" strokeOpacity="0.4" strokeDasharray="4 5" />
      <text x="238" y="92" fill="#FFFFFF" fillOpacity="0.6" fontSize="11" fontFamily="Inter, sans-serif">
        your baseline
      </text>
      <circle cx="200" cy="145" r="30" fill="none" stroke={G} strokeOpacity="0.6" strokeWidth="2" />
      <line x1="200" y1="175" x2="200" y2="196" stroke={G} strokeOpacity="0.75" strokeWidth="2.5" />
      <Bones joints={DESK} bones={DESK_BONES} />
      <Dots joints={DESK} />
      <line x1="40" x2="360" y1="276" y2="276" stroke="#2E2E2E" strokeWidth="2" />
      <Ring at={ring && DESK[ring]} />
    </>
  );
}
