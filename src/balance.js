// All tunable constants live here.

export const MILESTONES = [
  { progress: 1, year: -70000, label: 'Language' },
  { progress: 1e4, year: -10000, label: 'Agriculture' },
  { progress: 1e5, year: -3200, label: 'Writing' },
  { progress: 1e7, year: 1440, label: 'Printing press' },
  { progress: 1e10, year: 1760, label: 'Steam engine' },
  { progress: 1e12, year: 1880, label: 'Electricity' },
  { progress: 1e14, year: 1945, label: 'Computer' },
  { progress: 1e17, year: 1990, label: 'Internet' },
  { progress: 1e20, year: 2012, label: 'Deep learning' },
  { progress: 1e30, year: 2035, label: 'AGI' },
  { progress: 1e100, year: 2045, label: 'Singularity' },
];

export const DPU_RATIO = 1000;
export const P_SINGULARITY = 1e100;

// ── Core economy ──
export const CLICK_BASE = 1;
export const CLICK_SHARE = 0.1;      // a click is worth at least this many seconds of current production
export const BASE_POP_CAPACITY = 20;
export const POP_GROWTH = 0.02;      // logistic growth rate per second
export const DECAY = 0.01;           // share of unspent ideas lost per second (era ≥ 2, no writing)
export const SUBSTEP = 0.1;          // seconds of game time per logic step
export const MAX_SUBSTEPS = 2000;    // cap on steps per tick() call
export const REVEAL_FRACTION = 0.25; // upgrade appears once progress ≥ cost × this
export const ALWAYS_VISIBLE_COST = 20;

// Progress range of each era; upgrade prices are positions inside these ranges.
export const ERA_RANGES = [null, [1, 1e4], [1e4, 1e7], [1e7, 1e10], [1e10, 1e14], [1e14, 1e20], [1e20, 1e30], [1e30, 1e100]];

// ── Compounding (Law of Accelerating Returns) ──
export const GROWTH_SCALE = 0.5;       // global pace knob: multiplies the whole compounding rate
export const ENERGY_GROWTH = 0.0002; // growth per order of magnitude of stored energy
export const COMPUTE_GROWTH = 0.0001;// growth per doubling of compute (Moore's law feeds acceleration)

// ── Compute ──
export const CPS_PER_UNIT = 1e-3;    // cps of one computer in 1945 (before multipliers)

// ── AI era ──
export const AI_ERA = 6;
export const MAX_AVG_SHARE = 0.95;   // caps the safety ratio at 19 so it stays finite
export const AGI_CPS = 1e16;
export const NEURONS_START = 302;
export const NEURONS_HUMAN = 1e11;
export const RIVAL_START = 0.5;      // rival progress relative to yours when era 6 begins
export const RIVAL_GROWTH = 0.018;    // rival growth rate per second at progress 1e20; scales with ln(progress)

// ── Intelligence explosion ──
export const AGI_PROGRESS = 1e30;     // reference point of the hyperbolic phase
export const SELF_IMPROVE_RATE = 0.03; // era 7: extra dP/dt = P · rate · (P/AGI_PROGRESS)^exp  (finite-time blow-up)
export const SELF_IMPROVE_EXP = 0.2;
export const RIVAL_EXPLOSION = 0.25;  // rival's self-improvement relative to yours (it is a smaller lab)
export const RIVAL_RATIO = 0.25;      // alignment ratio of a rival-made singularity
export const RIVAL_TREATY_BONUS = 0.2;
export const ENDING_GOOD = 0.8;
export const ENDING_MIDDLE = 0.4;

// ── Lucky events ──
export const EVENT_RATE = 1 / 150;     // expected events per second of game time
export const EVENT_LIFETIME = 10;     // seconds an event stays clickable
