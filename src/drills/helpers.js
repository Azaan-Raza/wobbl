// Today's value as a fraction of the baseline taken during calibration.
export function ratioTo(ctx, key) {
  const now = ctx.get(key);
  const base = ctx.baseline?.[key];
  return now == null || !base ? null : now / base;
}

export const ofBaseline = (v) => `${Math.round(v * 100)}% of your baseline`;
