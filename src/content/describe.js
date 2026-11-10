// Card text generated from an upgrade's effect, so the numbers shown are always the real ones.
import { GROWTH_SCALE } from '../balance.js';
import { formatNumber } from '../format.js';

const num = (v) => String(+v.toPrecision(2));

const PHRASES = {
  growth: (v) => `+${num(v * GROWTH_SCALE * 100)}%/s growth`,
  ideasPerSec: (v) => `+${formatNumber(v)} ideas/s`,
  perPerson: (v) => `each person adds ${num(v)} ideas/s`,
  ideasMult: (v) => `production ×${num(v)}`,
  clickMult: (v) => `your own ideas ×${num(v)}`,
  popCapacity: (v) => `+${formatNumber(v)} population room`,
  popCapacityMult: (v) => `population room ×${num(v)}`,
  stopsDecay: () => 'ideas no longer fade away',
  energyPerSec: (v) => `+${formatNumber(v)} energy/s`,
  hardware: (v) => `+${formatNumber(v)} computer${v === 1 ? '' : 's'}`,
  cpsMult: (v) => `compute ×${num(v)}`,
  neuronsMult: (v) => `emulate ${num(v)}× more neurons`,
  evolution: (v) => `+${num(v * 100)}% evolved software`,
  selfImprove: () => 'self-improvement accelerates',
};

export function describe(u) {
  const parts = Object.entries(u.effect).map(([k, v]) => PHRASES[k]?.(v)).filter(Boolean);
  let text = parts.join(', ');
  if (u.max > 1) text += Number.isFinite(u.max) ? `, each (up to ${u.max})` : ', each';
  text = `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
  return u.note ? `${text} ${u.note}` : text;
}
