// The intelligence staircase. Era 7 starts at "Human" (AGI) and climbs to the top at the singularity.
import { P_SINGULARITY, AGI_PROGRESS } from '../balance.js';

export const STAIRCASE = [
  { name: 'Ant' },
  { name: 'Chicken' },
  { name: 'Chimp' },
  { name: 'Human' },
  { name: 'Einstein' },
  { name: 'Two steps above us' },
  { name: 'Ten steps above us' },
  { name: 'A thousand steps' },
  { name: 'A million steps' },
  { name: 'Beyond the staircase' },
];

const HUMAN = 3;

export function staircaseLevel(state) {
  if (state.era < 7) return Math.min(HUMAN - 0.01, (Math.log10(Math.max(1, state.progress)) / 30) * HUMAN);
  const t = Math.log(Math.max(state.progress, AGI_PROGRESS) / AGI_PROGRESS) / Math.log(P_SINGULARITY / AGI_PROGRESS);
  return Math.min(STAIRCASE.length - 1, HUMAN + Math.max(0, t) * (STAIRCASE.length - 1 - HUMAN));
}
