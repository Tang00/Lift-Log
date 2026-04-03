export const MAX_WEIGHT = 9999;
export const MAX_REPS = 99;
export const MAX_EXERCISES = 20;
export const MAX_SETS = 10;
export const MAX_TEMPLATES = 20;

export function clampIntegerString(value: string, max: number) {
  if (value === "") {
    return value;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return "";
  }

  return String(Math.min(Math.max(parsed, 0), max));
}

export function clampDecimalString(value: string, max: number) {
  if (value === "") {
    return value;
  }

  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return "";
  }

  return String(Math.min(Math.max(parsed, 0), max));
}
