// The wobbl mark: a lowercase w drawn the way the tracker draws a limb, as
// bones between joints, on a cobalt square. The wordmark is Archivo, set wide.
export const W_POINTS = [
  [7, 10],
  [11.5, 22.5],
  [16, 13.5],
  [20.5, 22.5],
  [25, 10],
];

export function Mark({ size = 24, className = '', title }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : 'true'}
    >
      {title && <title>{title}</title>}
      <rect width="32" height="32" fill="#2346F5" />
      <polyline
        points={W_POINTS.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {W_POINTS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="#FFFFFF" />
      ))}
    </svg>
  );
}

export default function Logo({ size = 24, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark size={size} />
      <span className="display text-[1.375rem] leading-none tracking-[-0.03em]" style={{ fontSize: size * 0.95 }}>
        wobbl
      </span>
    </span>
  );
}
