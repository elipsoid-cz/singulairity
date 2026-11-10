// Game rules. Pure logic on the state object (mutated in place), no DOM.
import { UPGRADES } from './content/upgrades.js';
import { ERAS } from './content/eras.js';
import { DECISIONS } from './content/decisions.js';
import { EVENTS } from './content/events.js';
import { yearOf, MOORE_BASE_YEAR } from './calendar.js';
import * as B from './balance.js';
import { chooseEnding } from './endings.js';

const BY_ID = new Map(UPGRADES.map((u) => [u.id, u]));
const ADDITIVE = ['growth', 'ideasPerSec', 'perPerson', 'popCapacity', 'energyPerSec', 'hardware', 'evolution', 'selfImprove'];
const MULTIPLICATIVE = ['ideasMult', 'clickMult', 'popCapacityMult', 'cpsMult', 'neuronsMult'];

export function getUpgrade(id) {
  return BY_ID.get(id);
}

/** Aggregate effects of everything owned. */
export function effects(state) {
  const fx = { stopsDecay: false };
  for (const k of ADDITIVE) fx[k] = 0;
  for (const k of MULTIPLICATIVE) fx[k] = 1;
  for (const [id, n] of Object.entries(state.owned)) {
    const u = BY_ID.get(id);
    if (!u || !n) continue;
    for (const [k, v] of Object.entries(u.effect)) {
      if (k === 'stopsDecay') fx.stopsDecay ||= v;
      else if (ADDITIVE.includes(k)) fx[k] += v * n;
      else if (MULTIPLICATIVE.includes(k)) fx[k] *= v ** n;
    }
  }
  return fx;
}

export function count(state, id) {
  return state.owned[id] ?? 0;
}

export function cost(state, id) {
  const u = BY_ID.get(id);
  return u.cost * (u.costGrowth ?? 1) ** count(state, id);
}

function requirementsMet(state, u) {
  return (u.requires ?? []).every((r) => count(state, r) > 0);
}

function available(state, u) {
  return u.era <= state.era && count(state, u.id) < u.max && requirementsMet(state, u);
}

export function canBuy(state, id) {
  const u = BY_ID.get(id);
  return !!u && !state.singularity && !state.pendingDecision && available(state, u) && state.ideas >= cost(state, id);
}

export function buy(state, id) {
  if (!canBuy(state, id)) return false;
  state.ideas -= cost(state, id);
  if (count(state, id) === 0 && BY_ID.get(id).flavor) state.tickerQueue.push(`own:${id}`); // announce it once
  state.owned[id] = count(state, id) + 1;
  return true;
}

function revealed(state, u) {
  return count(state, u.id) > 0 || u.cost <= B.ALWAYS_VISIBLE_COST || state.progress >= u.cost * B.REVEAL_FRACTION;
}

/** Upgrades to show: available + revealed, plus one locked teaser from the next era. */
export function visibleUpgrades(state) {
  const list = UPGRADES.filter((u) => available(state, u) && revealed(state, u));
  const teaser = UPGRADES.find((u) => u.era === state.era + 1 && !(u.requires ?? []).length);
  if (teaser) list.push(teaser);
  return list;
}

export function clickValue(state) {
  return Math.max(B.CLICK_BASE * effects(state).clickMult, B.CLICK_SHARE * rates(state).ideasPerSec);
}

export function clickIdea(state) {
  if (state.singularity || state.pendingDecision) return;
  const v = clickValue(state);
  state.ideas += v;
  state.progress += v;
  state.stats.clicks += 1;
}

export function popCapacity(state, fx = effects(state)) {
  return (B.BASE_POP_CAPACITY + fx.popCapacity) * fx.popCapacityMult;
}

export function computeCps(state, fx = effects(state)) {
  const year = yearOf(state.progress);
  if (year < MOORE_BASE_YEAR || state.hardware + fx.hardware <= 0) return 0;
  return (state.hardware + fx.hardware) * B.CPS_PER_UNIT * fx.cpsMult * 2 ** ((year - MOORE_BASE_YEAR) / 2);
}

export function buffMult(state) {
  return state.buffs.reduce((m, b) => (b.until > state.gameTime ? m * b.mult : m), 1);
}

/** Combined effects of all decisions taken so far. */
export function decisionEffects(state) {
  const out = { speedMult: 1, rivalMult: 1, alignmentBonus: 0 };
  for (const d of DECISIONS) {
    const idx = state.decisions[d.id];
    const e = d.options[idx]?.effect;
    if (!e) continue;
    out.speedMult *= e.speedMult ?? 1;
    out.rivalMult *= e.rivalMult ?? 1;
    out.alignmentBonus += e.alignmentBonus ?? 0;
  }
  return out;
}

/** Average share of effort put into safety over the whole AI era (time-weighted, so it cannot be
 *  fixed at the last minute). Before any AI-era time has passed, the current setting counts. */
export function averageSafetyShare(state) {
  return state.aiTime > 0 ? state.aiShareSum / state.aiTime : state.alignmentShare;
}

export function alignmentRatio(state) {
  const avg = Math.min(B.MAX_AVG_SHARE, averageSafetyShare(state));
  return avg / (1 - avg) + decisionEffects(state).alignmentBonus;
}

export function setAlignmentShare(state, share) {
  state.alignmentShare = Math.min(1, Math.max(0, Number(share) || 0));
}

function emulationOf(fx) {
  const neurons = B.NEURONS_START * fx.neuronsMult;
  return Math.min(1, Math.log(neurons / B.NEURONS_START) / Math.log(B.NEURONS_HUMAN / B.NEURONS_START));
}

export function agiReadiness(state, fx = effects(state)) {
  const cps = computeCps(state, fx);
  return {
    compute: cps > 1 ? Math.min(1, Math.log10(cps) / Math.log10(B.AGI_CPS)) : 0,
    software: Math.max(emulationOf(fx), Math.min(1, fx.evolution)),
  };
}

export function choose(state, decisionId, optionIndex) {
  const d = DECISIONS.find((x) => x.id === decisionId);
  if (!d || state.pendingDecision !== decisionId || !d.options[optionIndex]) return false;
  state.decisions[decisionId] = optionIndex;
  state.pendingDecision = null;
  return true;
}

/** Compounding rate per second: progress grows by progress × growthRate each second. */
export function growthRate(state, fx = effects(state)) {
  const cps = computeCps(state, fx);
  const g = fx.growth
    + B.COMPUTE_GROWTH * Math.max(0, Math.log2(Math.max(cps, 1)))
    + B.ENERGY_GROWTH * Math.log10(1 + state.energy);
  return g * B.GROWTH_SCALE;
}

function rivalRate(state, speedRival) {
  const r = state.rival.progress;
  if (!state.rival.active || r <= 0) return 0;
  const base = r * B.RIVAL_GROWTH * speedRival * (Math.log(Math.max(r, 1e20)) / Math.log(1e20));
  const explosion = r >= B.AGI_PROGRESS
    ? r * B.SELF_IMPROVE_RATE * B.RIVAL_EXPLOSION * speedRival * (r / B.AGI_PROGRESS) ** B.SELF_IMPROVE_EXP
    : 0;
  return base + explosion;
}

export function rates(state) {
  const fx = effects(state);
  const cps = computeCps(state, fx);
  const dec = decisionEffects(state);
  const growth = growthRate(state, fx);
  const flat = (fx.ideasPerSec + state.population * fx.perPerson) * fx.ideasMult;
  const selfImprovement = state.agi
    ? state.progress * B.SELF_IMPROVE_RATE
      * (Math.max(state.progress, B.AGI_PROGRESS) / B.AGI_PROGRESS) ** (B.SELF_IMPROVE_EXP + fx.selfImprove)
    : 0;
  const gross = (flat + state.progress * growth + selfImprovement) * buffMult(state) * dec.speedMult;
  const share = state.era >= B.AI_ERA ? state.alignmentShare : 0;
  const ideasPerSec = gross * (1 - share);
  const cap = popCapacity(state, fx);
  return {
    ideasPerSec,
    progressPerSec: ideasPerSec,
    alignmentPerSec: gross * share,
    growthRate: growth,
    rivalPerSec: rivalRate(state, dec.rivalMult),
    popPerSec: B.POP_GROWTH * state.population * (1 - state.population / cap),
    popCapacity: cap,
    decayPerSec: state.era >= 2 && !fx.stopsDecay ? state.ideas * B.DECAY : 0,
    energyPerSec: fx.energyPerSec,
    computeCps: cps,
  };
}

function updateEra(state) {
  let era = state.era;
  for (const e of ERAS) if (e.id <= 6 && state.progress >= e.minProgress) era = Math.max(era, e.id);
  if (era >= B.AI_ERA && !state.rival.active) {
    state.rival.active = true;
    state.rival.progress = state.progress * B.RIVAL_START;
  }
  const fx = effects(state);
  const ready = agiReadiness(state, fx);
  state.agiPaths.emulation = emulationOf(fx);
  state.agiPaths.evolution = Math.min(1, fx.evolution);
  if (era >= B.AI_ERA && !state.agi && ready.compute >= 1 && ready.software >= 1) state.agi = true;
  if (state.agi) era = 7;
  for (let e = state.era + 1; e <= era; e++) state.eraStartProgress[e] = state.progress;
  state.era = era;
  if (!state.pendingDecision) {
    const d = DECISIONS.find((x) => !(x.id in state.decisions) && state.progress >= x.trigger.minProgress
      && (!x.trigger.requiresAgi || state.agi));
    if (d) state.pendingDecision = d.id;
  }
}

function reachSingularity(state, winner) {
  state.singularity = true;
  state.winner = winner;
  if (winner === 'player') state.progress = B.P_SINGULARITY;
  else state.rival.progress = B.P_SINGULARITY;
  state.ending = chooseEnding(state);
}

/** Advance by h seconds, splitting so that no micro-step more than doubles progress (hyperbolic phase). */
function step(state, h) {
  let remaining = h;
  for (let guard = 0; remaining > 1e-12 && guard < 10000 && !state.singularity && !state.pendingDecision; guard++) {
    const r = rates(state);
    let hh = remaining;
    if (r.progressPerSec > 0 && state.progress > 0) hh = Math.min(hh, state.progress / r.progressPerSec);
    if (r.rivalPerSec > 0) hh = Math.min(hh, state.rival.progress / r.rivalPerSec);
    microStep(state, hh, r);
    remaining -= hh;
    if (state.progress >= B.P_SINGULARITY) reachSingularity(state, 'player');
    else if (state.rival.progress >= B.P_SINGULARITY) reachSingularity(state, 'rival');
  }
}

function microStep(state, h, r) {
  state.ideas += r.ideasPerSec * h;
  state.progress += r.progressPerSec * h;
  if (r.decayPerSec > 0) state.ideas *= Math.exp(-B.DECAY * h);
  state.population = Math.min(r.popCapacity, Math.max(0, state.population + r.popPerSec * h));
  state.energy += r.energyPerSec * h;
  state.alignment += r.alignmentPerSec * h;
  if (state.era >= B.AI_ERA) {
    state.capability += r.progressPerSec * h;
    state.aiTime += h;
    state.aiShareSum += state.alignmentShare * h;
  }
  state.rival.progress += r.rivalPerSec * h;
  state.gameTime += h;
  state.eraTime[state.era] += h;
  updateEra(state);
}

export function tick(state, dt, rng = Math.random) {
  if (state.singularity || state.pendingDecision || !(dt > 0)) return state;
  updateEra(state);
  const n = Math.min(B.MAX_SUBSTEPS, Math.max(1, Math.ceil(dt / B.SUBSTEP - 1e-9)));
  const h = dt / n;
  for (let i = 0; i < n && !state.pendingDecision; i++) step(state, h);
  state.buffs = state.buffs.filter((b) => b.until > state.gameTime);
  if (!state.singularity) maybeSpawnEvent(state, dt, rng);
  return state;
}

export function maybeSpawnEvent(state, dt, rng = Math.random) {
  if (state.activeEvent && state.gameTime > state.activeEvent.expires) state.activeEvent = null;
  if (state.activeEvent) return;
  if (rng() >= 1 - Math.exp(-B.EVENT_RATE * dt)) return;
  const pool = EVENTS.filter((e) => e.minEra <= state.era);
  const ev = pool[Math.floor(rng() * pool.length) % pool.length];
  state.activeEvent = { id: ev.id, expires: state.gameTime + B.EVENT_LIFETIME };
}

export function claimEvent(state) {
  if (!state.activeEvent || state.pendingDecision) return false;
  const ev = EVENTS.find((e) => e.id === state.activeEvent.id);
  state.activeEvent = null;
  if (!ev) return false;
  state.buffs.push({ id: ev.id, mult: ev.mult, until: state.gameTime + ev.duration });
  return true;
}
