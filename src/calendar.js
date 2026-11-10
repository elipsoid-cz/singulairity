// Progress ↔ calendar year. Year is linear in log10(progress) between milestones.
import { MILESTONES, DPU_RATIO } from './balance.js';

export const MOORE_BASE_YEAR = 1945;

const LOGS = MILESTONES.map((m) => Math.log10(m.progress));

export function yearOf(progress) {
  const first = MILESTONES[0];
  const last = MILESTONES[MILESTONES.length - 1];
  if (!(progress > first.progress)) return first.year;
  if (progress >= last.progress) return last.year;
  const lp = Math.log10(progress);
  for (let i = 1; i < MILESTONES.length; i++) {
    if (lp <= LOGS[i]) {
      const t = (lp - LOGS[i - 1]) / (LOGS[i] - LOGS[i - 1]);
      return MILESTONES[i - 1].year + t * (MILESTONES[i].year - MILESTONES[i - 1].year);
    }
  }
  return last.year;
}

export function progressOf(year) {
  const first = MILESTONES[0];
  const last = MILESTONES[MILESTONES.length - 1];
  if (year <= first.year) return first.progress;
  if (year >= last.year) return last.progress;
  for (let i = 1; i < MILESTONES.length; i++) {
    if (year <= MILESTONES[i].year) {
      const t = (year - MILESTONES[i - 1].year) / (MILESTONES[i].year - MILESTONES[i - 1].year);
      return 10 ** (LOGS[i - 1] + t * (LOGS[i] - LOGS[i - 1]));
    }
  }
  return last.progress;
}

export function dpuYear(progress) {
  return yearOf(progress / DPU_RATIO);
}

/** Calendar years that pass per real second at the given progress rate. */
export function yearsPerSecond(progress, progressPerSec) {
  if (!(progress > 0) || !(progressPerSec > 0)) return 0;
  const d = 1e-4;
  const dYearDLn = (yearOf(progress * Math.exp(d)) - yearOf(progress)) / d;
  const v = dYearDLn * (progressPerSec / progress);
  return Number.isFinite(v) ? v : 0;
}
