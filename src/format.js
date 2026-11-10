// Number, year and duration formatting. Pure functions, no DOM.

const SCALES = [
  'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion',
  'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion',
  'tredecillion', 'quattuordecillion', 'quindecillion', 'sexdecillion',
  'septendecillion', 'octodecillion', 'novemdecillion', 'vigintillion',
];

const INFINITY_AT = 1e300;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function group(n) {
  return Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatNumber(n) {
  if (!Number.isFinite(n) || Math.abs(n) >= INFINITY_AT) return '∞';
  const sign = n < 0 ? '-' : '';
  const a = Math.abs(n);
  if (a < 100 && a % 1 !== 0) return sign + a.toFixed(1);
  if (a < 1e6) return sign + group(a);
  const exp = Math.floor(Math.log10(a));
  const scaleIndex = Math.floor(exp / 3) - 2;
  if (scaleIndex < SCALES.length) {
    const value = a / 10 ** ((scaleIndex + 2) * 3);
    return `${sign}${value.toFixed(2)} ${SCALES[scaleIndex]}`;
  }
  return `${sign}${(a / 10 ** exp).toFixed(2)}×10^${exp}`;
}

export function formatYear(year) {
  const y = Math.floor(year);
  if (y < 0) return `${group(-y)} BCE`;
  return `${y} CE`;
}

export function formatDate(year) {
  const y = Math.floor(year);
  const ms = Date.UTC(y, 0, 1) + (year - y) * 365 * 86400000;
  const d = new Date(ms);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} ${hh}:${mm}`;
}

export function formatDuration(seconds) {
  if (seconds < 60) return `${Math.round(seconds)} s`;
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${min % 60} min`;
}

const SPEED_UNITS = [
  ['years/s', 1],
  ['days/s', 1 / 365],
  ['hours/s', 1 / (365 * 24)],
  ['min/s', 1 / (365 * 24 * 60)],
  ['s/s', 1 / (365 * 24 * 3600)],
];

/** Calendar speed in years per second, shown in a readable unit. */
export function formatSpeed(yearsPerSec) {
  if (!(yearsPerSec > 0)) return 'time stands still';
  for (const [unit, size] of SPEED_UNITS) {
    const v = yearsPerSec / size;
    if (v >= 1 || unit === 's/s') return `${v >= 100 ? formatNumber(Math.round(v)) : v.toFixed(1)} ${unit}`;
  }
  return 'time stands still';
}

/** Numbers shown in the HUD: after the singularity they are simply infinite. */
export function progressLabel(state, value) {
  return state.singularity ? '∞' : formatNumber(value);
}
