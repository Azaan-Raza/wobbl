// Product illustrations: a plain figure in a light room, with the skeleton the
// tracker draws on top. They share a 640 x 420 frame. The numbers shown beside
// each one are measured from these drawings (front knee 142°, back leg 177°,
// stance 1.8 torso lengths, lean 4°), so the picture and the panel agree.

export const C = {
  wall: '#F4F4F1',
  floor: '#EAEAE5',
  floorLine: '#D9D9D3',
  far: '#C9C9C2',
  near: '#DADAD4',
  bone: '#2346F5',
  fault: '#D13A22',
  muted: '#5B5B58',
};
const FONT = "'Archivo Variable', Archivo, system-ui, sans-serif";

function Room({ floor = 372 }) {
  return (
    <>
      <rect width="640" height={floor} fill={C.wall} />
      <rect y={floor} width="640" height={420 - floor} fill={C.floor} />
      <line x1="0" x2="640" y1={floor} y2={floor} stroke={C.floorLine} />
    </>
  );
}

// A body part: a thick round-capped segment.
function Limb({ from, to, w, color }) {
  return (
    <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={color} strokeWidth={w} strokeLinecap="round" />
  );
}

function Bones({ j, bones, faults = [] }) {
  const bad = new Set(faults);
  return bones.map(([a, b]) => (
    <line
      key={`${a}-${b}`}
      x1={j[a][0]}
      y1={j[a][1]}
      x2={j[b][0]}
      y2={j[b][1]}
      stroke={bad.has(a) && bad.has(b) ? C.fault : C.bone}
      strokeWidth="3"
      strokeLinecap="round"
    />
  ));
}

function Joints({ j, faults = [], r = 5.5, skip = [] }) {
  const bad = new Set(faults);
  return Object.entries(j)
    .filter(([k]) => !skip.includes(k))
    .map(([k, [x, y]]) => (
      <circle key={k} cx={x} cy={y} r={r} fill="#FFFFFF" stroke={bad.has(k) ? C.fault : C.bone} strokeWidth="2.5" />
    ));
}

function Ring({ at }) {
  return <circle cx={at[0]} cy={at[1]} r="17" fill="none" stroke={C.fault} strokeWidth="2.5" />;
}

// The angle at joint `b`, drawn as a filled wedge between the two bones.
function AngleArc({ a, b, c, r = 32, color = C.fault }) {
  const ua = Math.atan2(a[1] - b[1], a[0] - b[0]);
  const uc = Math.atan2(c[1] - b[1], c[0] - b[0]);
  let d = uc - ua;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const p1 = [b[0] + r * Math.cos(ua), b[1] + r * Math.sin(ua)];
  const p2 = [b[0] + r * Math.cos(ua + d), b[1] + r * Math.sin(ua + d)];
  const sweep = d > 0 ? 1 : 0;
  const path = `M${b[0]},${b[1]} L${p1[0]},${p1[1]} A${r},${r} 0 0 ${sweep} ${p2[0]},${p2[1]} Z`;
  return (
    <g>
      <path d={path} fill={color} fillOpacity="0.16" />
      <path d={`M${p1[0]},${p1[1]} A${r},${r} 0 0 ${sweep} ${p2[0]},${p2[1]}`} fill="none" stroke={color} strokeWidth="2.5" />
    </g>
  );
}

// A value tag: filled box with white text, plus an optional muted line under it.
function Tag({ x, y, text, sub, color = C.fault, align = 'start' }) {
  const w = text.length * 11 + 16;
  const left = align === 'start' ? x : x - w;
  return (
    <g fontFamily={FONT}>
      <rect x={left} y={y - 15} width={w} height="28" fill={color} />
      <text x={left + w / 2} y={y + 5} textAnchor="middle" fill="#FFFFFF" fontSize="17" fontWeight="600">
        {text}
      </text>
      {sub && (
        <text x={left} y={y + 34} fill={C.muted} fontSize="13">
          {sub}
        </text>
      )}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Tae Kwon Do front stance (ap kubi), side view. The front knee is at 142°,
// so it isn't bent enough and sits behind the toes.
export const STANCE = {
  ear: [311, 79],
  nose: [334, 83],
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

export function StanceScene({ compact = false }) {
  const j = STANCE;
  const faults = ['hip', 'kneeF', 'ankleF'];
  return (
    <>
      <Room />
      <ellipse cx="310" cy="374" rx="150" ry="7" fill="#000" fillOpacity="0.05" />
      {/* far side */}
      <Limb from={j.shoulder} to={j.elbowC} w={18} color={C.far} />
      <Limb from={j.elbowC} to={j.wristC} w={15} color={C.far} />
      <circle cx={j.wristC[0]} cy={j.wristC[1]} r="10" fill={C.far} />
      <Limb from={j.hip} to={j.kneeB} w={30} color={C.far} />
      <Limb from={j.kneeB} to={j.ankleB} w={22} color={C.far} />
      <Limb from={[j.heelB[0], 366]} to={[j.toeB[0], 367]} w={11} color={C.far} />
      {/* torso and head */}
      <Limb from={[306, 128]} to={[301, 214]} w={46} color={C.near} />
      <Limb from={[309, 110]} to={[312, 92]} w={16} color={C.near} />
      <circle cx="315" cy="76" r="22" fill={C.near} />
      {/* near side */}
      <Limb from={j.hip} to={j.kneeF} w={32} color={C.near} />
      <Limb from={j.kneeF} to={j.ankleF} w={24} color={C.near} />
      <Limb from={[j.heelF[0], 366]} to={[j.toeF[0], 367]} w={12} color={C.near} />
      <Limb from={j.shoulder} to={j.elbowP} w={18} color={C.near} />
      <Limb from={j.elbowP} to={j.wristP} w={15} color={C.near} />
      <circle cx={j.wristP[0]} cy={j.wristP[1]} r="10" fill={C.near} />

      <Bones j={j} bones={STANCE_BONES} faults={faults} />
      <AngleArc a={j.hip} b={j.kneeF} c={j.ankleF} r={34} />
      <Joints j={j} faults={['kneeF']} skip={['nose']} />
      <Ring at={j.kneeF} />
      {!compact && <Tag x={412} y={238} text="142°" sub="target 135° or less" />}
    </>
  );
}
StanceScene.viewBox = '52 46 512 336';
StanceScene.compactViewBox = '52 46 512 336';

// ---------------------------------------------------------------------------
// Right hand at the piano, seen from the side by a camera next to the
// keyboard. The wrist has sagged below the line of the knuckles. Measured from
// this drawing: wrist 0.34 hand-lengths low (over the 0.3 limit), middle
// finger joints at 151°.
export const HAND = {
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

export function PianoScene({ compact = false }) {
  const j = HAND;
  return (
    <>
      <rect width="640" height="520" fill={C.wall} />
      {/* keyboard in profile: white key tops, black keys raised at the back, the case below */}
      <rect x="196" y="300" width="460" height="30" fill="#FFFFFF" stroke={C.floorLine} />
      <rect x="402" y="283" width="250" height="17" fill="#3A3A37" />
      <rect x="180" y="330" width="480" height="190" fill="#C4C4BD" />
      {/* forearm and hand */}
      <Limb from={[-30, 258]} to={j.wrist} w={42} color={C.far} />
      <Limb from={j.wrist} to={j.mcp} w={34} color={C.near} />
      <Limb from={j.thumb} to={j.thumbTip} w={14} color={C.near} />
      <Limb from={j.mcp} to={j.pip} w={17} color={C.near} />
      <Limb from={j.pip} to={j.dip} w={15} color={C.near} />
      <Limb from={j.dip} to={j.tip} w={13} color={C.near} />

      {/* knuckle line */}
      <line x1="150" x2="470" y1={j.mcp[1]} y2={j.mcp[1]} stroke={C.bone} strokeDasharray="5 6" strokeWidth="1.5" />
      {!compact && (
        <text x="478" y={j.mcp[1] + 5} fill={C.bone} fontSize="15" fontFamily={FONT}>
          knuckle line
        </text>
      )}
      {/* how far below the line the wrist is */}
      <line x1={j.wrist[0] - 34} x2={j.wrist[0] - 34} y1={j.mcp[1]} y2={j.wrist[1]} stroke={C.fault} strokeWidth="2" />
      <line x1={j.wrist[0] - 40} x2={j.wrist[0] - 28} y1={j.mcp[1]} y2={j.mcp[1]} stroke={C.fault} strokeWidth="2" />
      <line x1={j.wrist[0] - 40} x2={j.wrist[0] - 28} y1={j.wrist[1]} y2={j.wrist[1]} stroke={C.fault} strokeWidth="2" />

      <Bones j={j} bones={HAND_BONES} faults={['wrist', 'mcp']} />
      <Joints j={j} faults={['wrist']} r={5} />
      <Ring at={j.wrist} />
      {!compact && <Tag x={j.wrist[0] - 48} y={212} text="wrist low" align="end" sub="" />}
    </>
  );
}
PianoScene.viewBox = '60 125 520 341';
PianoScene.compactViewBox = '120 170 420 276';

// ---------------------------------------------------------------------------
// Seated at a laptop, seen from its camera. The dashed outline is the posture
// saved at the start; the head has since dropped and slid forward.
export const DESK = {
  nose: [320, 214],
  earL: [362, 200],
  earR: [278, 200],
  neck: [320, 286],
  shoulderL: [430, 290],
  shoulderR: [210, 290],
};
const DESK_BONES = [
  ['shoulderL', 'shoulderR'], ['neck', 'nose'], ['earL', 'nose'], ['earR', 'nose'],
];

export function DeskScene({ compact = false }) {
  const j = DESK;
  return (
    <>
      <rect width="640" height="420" fill={C.wall} />
      {/* body */}
      <path d="M186 420 L194 334 Q198 290 244 286 L396 286 Q442 290 446 334 L454 420 Z" fill={C.near} />
      <Limb from={[320, 284]} to={[320, 236]} w={44} color={C.near} />
      <circle cx="320" cy="200" r="50" fill={C.near} />

      {/* saved baseline */}
      <circle cx="320" cy="156" r="46" fill="none" stroke={C.bone} strokeWidth="1.5" strokeDasharray="5 6" />
      {!compact && (
        <text x="376" y="118" fill={C.bone} fontSize="14" fontFamily={FONT}>
          your baseline
        </text>
      )}
      {/* drop from the baseline */}
      <line x1="250" x2="250" y1="170" y2={j.nose[1]} stroke={C.fault} strokeWidth="2" />
      <line x1="244" x2="256" y1="170" y2="170" stroke={C.fault} strokeWidth="2" />
      <line x1="244" x2="256" y1={j.nose[1]} y2={j.nose[1]} stroke={C.fault} strokeWidth="2" />

      <Bones j={j} bones={DESK_BONES} faults={['neck', 'nose']} />
      <Joints j={j} faults={['nose']} skip={['neck']} />
      <Ring at={j.nose} />
      {!compact && <Tag x={236} y={186} text="74%" align="end" sub="" />}
    </>
  );
}
DeskScene.viewBox = '70 50 500 328';
DeskScene.compactViewBox = '110 70 420 276';
