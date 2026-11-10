// Persistence to localStorage with versioning and defensive loading.
import { createState, SAVE_VERSION } from './state.js';

export { SAVE_VERSION };
export const SAVE_KEY = 'singulairity-save';

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const NULLABLE = { winner: 'string', ending: 'string', pendingDecision: 'string', activeEvent: 'object' };

/** Accept a saved value only if it has the same shape as the default; otherwise keep the default. */
function sanitize(key, def, val) {
  if (key in NULLABLE) {
    if (val === null) return null;
    if (NULLABLE[key] === 'object') return isPlainObject(val) && isNum(val.expires) && typeof val.id === 'string' ? val : def;
    return typeof val === NULLABLE[key] ? val : def;
  }
  if (typeof def === 'number') return isNum(val) ? val : def;
  if (typeof def === 'boolean') return typeof val === 'boolean' ? val : def;
  if (Array.isArray(def)) {
    if (!Array.isArray(val)) return def;
    if (def.length && typeof def[0] === 'number') return val.length === def.length && val.every(isNum) ? val : def;
    if (key === 'log' || key === 'tickerSeen' || key === 'tickerQueue') return val.filter((m) => typeof m === 'string');
    return val.filter((b) => isPlainObject(b) && isNum(b.mult) && isNum(b.until));
  }
  if (isPlainObject(def)) {
    if (!isPlainObject(val)) return def;
    if (key === 'owned' || key === 'decisions' || key === 'tickerLiveAt') {
      return Object.fromEntries(Object.entries(val).filter(([, v]) => isNum(v)));
    }
    const out = { ...def };
    for (const [k, d] of Object.entries(def)) if (k in val) out[k] = sanitize(k, d, val[k]);
    return out;
  }
  return def;
}

export function serialize(state) {
  return JSON.stringify(state);
}

export function deserialize(json) {
  const fresh = createState();
  let data;
  try {
    data = JSON.parse(json);
  } catch {
    return fresh;
  }
  if (!isPlainObject(data) || data.version !== SAVE_VERSION) return fresh;
  for (const [key, def] of Object.entries(fresh)) {
    if (key in data) fresh[key] = sanitize(key, def, data[key]);
  }
  return fresh;
}

export function saveGame(state, storage = globalThis.localStorage) {
  try {
    storage.setItem(SAVE_KEY, serialize(state));
  } catch {
    /* storage full or blocked: the game keeps running */
  }
}

export function loadGame(storage = globalThis.localStorage) {
  try {
    return deserialize(storage.getItem(SAVE_KEY));
  } catch {
    return createState();
  }
}

export function resetGame(storage = globalThis.localStorage) {
  try {
    storage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}
