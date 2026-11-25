// wobbl, the mascot: a little figure drawn like the tracking overlay, with
// joints as dots. It wobbles once when it appears and again on hover.
// `wave` waves the raised arm a couple of times. `head` draws just the face,
// for small spots like the nav where the full figure would be too thin.
const INK = '#000000';
const GREEN = '#00E07A';

export default function Wobbl({ size = 40, wave = false, head = false, className = '', title }) {
  const a11y = title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };

  if (head) {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} className={`wobbl-mascot ${className}`} {...a11y}>
        <circle cx="32" cy="32" r="26" fill={GREEN} stroke={INK} strokeWidth="4.5" />
        <circle cx="24" cy="29" r="3.6" fill={INK} />
        <circle cx="40" cy="29" r="3.6" fill={INK} />
        <path d="M23 40 Q32 47 41 40" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  const dots = [
    [46, 108], [66, 108], [40, 126], [72, 126], // knees, feet
    [56, 90], // hips
    [40, 78], [34, 92], // lower arm: elbow, hand
  ];
  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      className={`wobbl-mascot ${className}`}
      {...a11y}
    >
      <ellipse cx="56" cy="131" rx="28" ry="4.5" fill={INK} fillOpacity="0.08" />
      <g stroke={INK} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M56 90 L46 108 L40 126" />
        <path d="M56 90 L66 108 L72 126" />
        <path d="M56 90 L56 56" />
        <path d="M56 66 L40 78 L34 92" />
        <g className={wave ? 'wobbl-wave' : undefined}>
          <path d="M56 66 L80 60 L96 42" />
          <circle cx="80" cy="60" r="4.5" fill={GREEN} strokeWidth="2.8" />
          <circle cx="96" cy="42" r="4.5" fill={GREEN} strokeWidth="2.8" />
        </g>
      </g>
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill={GREEN} stroke={INK} strokeWidth="2.8" />
      ))}
      <circle cx="56" cy="34" r="22" fill={GREEN} stroke={INK} strokeWidth="4.5" />
      <circle cx="49" cy="32" r="3" fill={INK} />
      <circle cx="63" cy="32" r="3" fill={INK} />
      <path d="M49 41 Q56 46 63 41" stroke={INK} strokeWidth="3.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
