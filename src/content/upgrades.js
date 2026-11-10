// Upgrade catalogue. Pure data; the engine interprets `effect`.
//
// Prices are given as a position `at` (0..1) inside the era's progress range, so pacing does not
// depend on absolute numbers: cost = eraStart × (eraEnd/eraStart)^at.
//
// Card text is generated from `effect` (see describe.js); `note` adds an explanation.
// effect keys:
//   growth          +X to the compounding rate: progress grows by P × growth per second (Law of Accelerating Returns)
//   ideasPerSec, perPerson, ideasMult, clickMult   flat early-game production (before compounding dominates)
//   popCapacity, popCapacityMult, stopsDecay, energyPerSec, hardware, cpsMult, neuronsMult, evolution, selfImprove
import { ERA_RANGES } from '../balance.js';

function eraCost(era, at) {
  const [lo, hi] = ERA_RANGES[era];
  return lo * (hi / lo) ** at;
}

const R = (o) => ({ max: Infinity, costGrowth: 1.15, requires: [], ...o, cost: eraCost(o.era, o.at) });
const U = (o) => ({ max: 1, requires: [], ...o, cost: eraCost(o.era, o.at) });

export const UPGRADES = [
  // ── Era 1: Hunter-gatherers ──────────────────────────────────────────
  U({ id: 'fire', era: 1, at: 0.25, name: 'Control fire', effect: { perPerson: 0.05, popCapacity: 10 }, flavor: 'Warm nights, longer evenings, more talking.' }),
  R({ id: 'shelter', max: 20, era: 1, at: 0.33, costGrowth: 1.25, name: 'Shelter', effect: { popCapacity: 15 }, flavor: 'A roof of hides keeps the tribe together.' }),
  U({ id: 'tools', era: 1, at: 0.39, name: 'Stone tools', effect: { clickMult: 2 }, flavor: 'A sharp edge changes everything.' }),
  R({ id: 'elders', max: 20, era: 1, at: 0.45, costGrowth: 1.2, name: 'Tribe elder', effect: { ideasPerSec: 0.5 }, flavor: 'Someone has to remember which berries kill you.' }),
  U({ id: 'language', era: 1, at: 0.55, name: 'Language', requires: ['fire'], effect: { ideasMult: 2, growth: 0.0015 }, flavor: 'Now ideas can jump from head to head.' }),
  U({ id: 'storytelling', era: 1, at: 0.67, name: 'Storytelling', requires: ['language'], effect: { perPerson: 0.1, growth: 0.0015 }, flavor: 'Knowledge survives the one who found it.' }),
  U({ id: 'paintings', era: 1, at: 0.77, name: 'Cave paintings', requires: ['storytelling'], effect: { ideasMult: 1.5, clickMult: 2 }, flavor: 'The first external memory.' }),
  U({ id: 'trade', era: 1, at: 0.87, name: 'Trade between tribes', requires: ['language'], effect: { ideasMult: 2, growth: 0.003, popCapacity: 40 }, flavor: 'Obsidian for salt, and a new trick for free.' }),

  // ── Era 2: Agriculture ───────────────────────────────────────────────
  U({ id: 'writing', era: 2, at: 0.05, name: 'Writing', effect: { stopsDecay: true, growth: 0.001 }, flavor: 'Clay remembers what people forget.' }),
  R({ id: 'farms', max: 30, era: 2, at: 0, costGrowth: 1.3, name: 'Farm', effect: { popCapacity: 150, ideasMult: 1.05 }, flavor: 'Fewer hunters, more thinkers.' }),
  R({ id: 'villages', era: 2, at: 0.1, costGrowth: 2, max: 8, name: 'Village', effect: { growth: 0.0007 }, flavor: 'Neighbours compare notes.' }),
  U({ id: 'wheel', era: 2, at: 0.25, name: 'The wheel', effect: { growth: 0.0012 }, flavor: 'Obvious in hindsight. Took a while.' }),
  U({ id: 'irrigation', era: 2, at: 0.4, name: 'Irrigation', effect: { popCapacityMult: 3, growth: 0.0014 }, flavor: 'Rivers, redirected.' }),
  U({ id: 'mathematics', era: 2, at: 0.55, name: 'Mathematics', requires: ['writing'], effect: { growth: 0.0018 }, flavor: 'Counting sheep turns into counting anything.' }),
  U({ id: 'cities', era: 2, at: 0.7, name: 'Cities', effect: { popCapacityMult: 3, growth: 0.002 }, flavor: 'Crowds are idea accelerators.' }),
  U({ id: 'philosophy', era: 2, at: 0.85, name: 'Philosophy', requires: ['mathematics'], effect: { growth: 0.0028 }, flavor: 'Asking why, professionally.' }),

  // ── Era 3: Printing & Science ────────────────────────────────────────
  U({ id: 'printing', era: 3, at: 0, name: 'Printing press', effect: { growth: 0.0004 }, flavor: 'One idea, a thousand copies by Friday.' }),
  R({ id: 'libraries', era: 3, at: 0.05, costGrowth: 3, max: 8, name: 'Library', effect: { growth: 0.0001 }, flavor: 'Quiet rooms full of loud ideas.' }),
  R({ id: 'universities', era: 3, at: 0.3, costGrowth: 3, max: 8, name: 'University', effect: { growth: 0.00015 }, flavor: 'Where curiosity gets a salary.' }),
  U({ id: 'method', era: 3, at: 0.35, name: 'Scientific method', requires: ['printing'], effect: { growth: 0.0005 }, flavor: 'Guess, test, repeat. Mostly repeat.' }),
  U({ id: 'telescope', era: 3, at: 0.5, name: 'Telescope', effect: { growth: 0.0006, clickMult: 10 }, flavor: 'The sky turns out to be much bigger.' }),
  U({ id: 'postal', era: 3, at: 0.65, name: 'Postal network', effect: { growth: 0.0007, popCapacityMult: 2 }, flavor: 'Letters between scientists, weeks instead of never.' }),
  U({ id: 'calculus', era: 3, at: 0.8, name: 'Calculus', requires: ['method'], effect: { growth: 0.0008 }, flavor: 'The mathematics of change, invented twice at once.' }),

  // ── Era 4: Industry ──────────────────────────────────────────────────
  R({ id: 'coal', era: 4, at: 0, costGrowth: 2.5, max: 10, name: 'Coal mine', effect: { energyPerSec: 50 }, note: 'Energy speeds up growth.', flavor: 'Ancient sunlight, dug up.' }),
  U({ id: 'steam', era: 4, at: 0.05, name: 'Steam engine', effect: { growth: 0.0003 }, flavor: 'Muscles are no longer the limit.' }),
  R({ id: 'factories', era: 4, at: 0.15, costGrowth: 3, max: 8, name: 'Factory', effect: { growth: 0.0001 }, flavor: 'Making things that make things.' }),
  U({ id: 'electricity', era: 4, at: 0.3, name: 'Electricity', requires: ['steam'], effect: { growth: 0.0004, energyPerSec: 2000 }, flavor: 'Night becomes optional.' }),
  U({ id: 'telegraph', era: 4, at: 0.45, name: 'Telegraph', effect: { growth: 0.0005 }, flavor: 'News crosses an ocean in minutes.' }),
  U({ id: 'germs', era: 4, at: 0.55, name: 'Germ theory', effect: { popCapacityMult: 5, growth: 0.0006 }, flavor: 'Wash your hands. Seriously.' }),
  R({ id: 'labs', era: 4, at: 0.6, costGrowth: 3, max: 6, name: 'Research lab', effect: { growth: 0.0002 }, flavor: 'Invention, industrialised.' }),
  U({ id: 'assembly', era: 4, at: 0.75, name: 'Assembly line', requires: ['electricity'], effect: { growth: 0.0008 }, flavor: 'Same thing, faster, cheaper, forever.' }),

  // ── Era 5: Information ───────────────────────────────────────────────
  R({ id: 'computers', max: 50, era: 5, at: 0, costGrowth: 1.6, name: 'Computer', effect: { hardware: 1 }, note: 'Compute doubles every 2 years by itself, and every doubling speeds up growth.', flavor: 'Room-sized, then desk-sized, then pocket-sized.' }),
  U({ id: 'transistor', era: 5, at: 0.05, name: 'Transistor', effect: { cpsMult: 3 }, flavor: 'A switch with no moving parts.' }),
  U({ id: 'chips', era: 5, at: 0.25, name: 'Integrated circuit', requires: ['transistor'], effect: { cpsMult: 10 }, flavor: 'A million switches on a fingernail.' }),
  U({ id: 'internet', era: 5, at: 0.45, name: 'The Internet', effect: { growth: 0.0005 }, flavor: 'Every library, every person, one click away.' }),
  R({ id: 'datacenters', max: 30, era: 5, at: 0.55, costGrowth: 2, name: 'Datacenter', effect: { hardware: 25 }, flavor: 'Warehouses that hum.' }),
  U({ id: 'smartphones', era: 5, at: 0.7, name: 'Smartphones', requires: ['internet'], effect: { growth: 0.0007 }, flavor: 'A supercomputer of 1985 in every pocket.' }),
  U({ id: 'opensource', era: 5, at: 0.85, name: 'Open source', requires: ['internet'], effect: { growth: 0.0008 }, flavor: 'Standing on the shoulders of strangers.' }),

  // ── Era 6: Artificial Intelligence ───────────────────────────────────
  R({ id: 'ani', era: 6, at: 0, costGrowth: 3, max: 12, name: 'Narrow AI product', effect: { growth: 0.0008 }, note: 'Another brick toward AGI.', flavor: 'It beats you at chess. It cannot open a door.' }),
  U({ id: 'gpus', era: 6, at: 0.05, name: 'GPU clusters', effect: { cpsMult: 10 }, flavor: 'Graphics cards, repurposed for thinking.' }),
  R({ id: 'scanning', era: 6, at: 0.1, costGrowth: 3, max: 10, name: 'Brain scanning', effect: { neuronsMult: 15 }, note: 'Path to AGI: copy the brain.', flavor: 'First a worm. Then a fly. Then a mouse.' }),
  R({ id: 'genetic', era: 6, at: 0.1, costGrowth: 3, max: 10, name: 'Evolution simulation', effect: { evolution: 0.1 }, note: 'Path to AGI: evolve it.', flavor: 'A billion years of evolution, on a deadline.' }),
  U({ id: 'transformers', era: 6, at: 0.2, name: 'Transformers', effect: { growth: 0.003 }, flavor: 'Attention turns out to be most of what you need.' }),
  R({ id: 'megacluster', max: 40, era: 6, at: 0.35, costGrowth: 2.5, name: 'AI megacluster', effect: { hardware: 1000 }, flavor: 'A city that only thinks.' }),
  U({ id: 'scaling', era: 6, at: 0.5, name: 'Scaling laws', requires: ['transformers'], effect: { growth: 0.003 }, flavor: 'Bigger is reliably better. For now.' }),

  // ── Era 7: Intelligence Explosion ────────────────────────────────────
  U({ id: 'selfcode', era: 7, at: 0.02, name: 'AI writes its own code', effect: { selfImprove: 0.05 }, flavor: 'The researcher is now the research.' }),
  U({ id: 'selfchips', era: 7, at: 0.06, name: 'AI designs its own chips', effect: { selfImprove: 0.05, cpsMult: 100 }, flavor: 'The blueprints stop making sense to us.' }),
  U({ id: 'newphysics', era: 7, at: 0.15, name: 'New physics', effect: { selfImprove: 0.05 }, flavor: 'It explains it to us like we are five. We are not five enough.' }),
  U({ id: 'nanotech', era: 7, at: 0.3, name: 'Molecular nanotechnology', effect: { selfImprove: 0.05 }, flavor: 'Atoms, arranged on request.' }),
  U({ id: 'computronium', era: 7, at: 0.5, name: 'Computronium', effect: { selfImprove: 0.05 }, flavor: 'Matter optimised for thought.' }),
];
