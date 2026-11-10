// Entry point: game loop, autosave, wiring between engine and UI.
import { loadGame, saveGame, resetGame } from './save.js';
import { createState } from './state.js';
import { tick, buy, clickIdea, clickValue, setAlignmentShare, choose, claimEvent } from './engine.js';
import { formatNumber, formatDuration } from './format.js';
import { ERAS } from './content/eras.js';
import { mountHud } from './ui/hud.js';
import { mountShop } from './ui/shop.js';
import { mountPanels } from './ui/panels.js';
import { mountModal } from './ui/modal.js';
import { mountTicker } from './ui/ticker.js';
import { DECISIONS } from './content/decisions.js';
import { createPixelCanvas } from './render/pixel.js';
import { sceneFor } from './render/scenes.js';
import { startFinale } from './render/finale3d.js';
import { showEnding } from './ui/ending.js';
import { downloadResultCard } from './ui/card.js';
import { shareText, challengeUrl, parseChallenge, challengeVerdict, shareOrCopy } from './share.js';
import { initAnalytics, track } from './analytics.js';

const MAX_FRAME_DT = 1;      // seconds; a sleeping tab does not fast-forward
const UI_INTERVAL = 250;     // ms
const SAVE_INTERVAL = 10000; // ms
const LOG_SIZE = 30;

const params = new URLSearchParams(location.search);
const speed = Math.max(0.1, Number(params.get('speed')) || 1);

let state = loadGame();
let resetting = false; // blocks the pagehide save while a new game is starting
const $ = (id) => document.getElementById(id);

function log(message) {
  if (state.log[0] === message) return;
  state.log.unshift(message);
  state.log.length = Math.min(state.log.length, LOG_SIZE);
  renderLog();
}

function renderLog() {
  const el = $('log');
  el.replaceChildren(...state.log.slice(0, 6).map((m) => Object.assign(document.createElement('li'), { textContent: m })));
}

/** Per-UI-tick and per-frame hooks for the ticker, modal, scene and ending. */
const extraUi = [];
const extraFrame = [];

const hud = mountHud($('hud'));
const modal = mountModal($('modal'), (id, i) => {
  const d = DECISIONS.find((x) => x.id === id);
  if (choose(state, id, i)) { log(`${d.title}: ${d.options[i].label}.`); updateUi(); }
});
const ticker = mountTicker($('ticker'), () => { if (claimEvent(state)) updateUi(); });
extraUi.push((s) => modal.update(s), (s) => ticker.update(s));

// A friend's challenge arrives in the link (?c=seconds).
const challenge = parseChallenge(location.search);
if (challenge) {
  const banner = $('challenge');
  const close = Object.assign(document.createElement('button'), { type: 'button', textContent: '×', ariaLabel: 'Dismiss' });
  close.addEventListener('click', () => { banner.hidden = true; });
  banner.replaceChildren(
    Object.assign(document.createElement('span'), { textContent: `A friend reached the singularity in ${formatDuration(challenge)}. Can you beat it?` }),
    close,
  );
  banner.hidden = false;
}

$('share-game').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const result = await shareOrCopy({
    title: 'Singulairity',
    text: 'An incremental game about how fast progress accelerates, from the first idea to the AI singularity.',
    url: challengeUrl(location.href, null),
  });
  if (result === 'copied') flashButton(btn, 'Link copied');
  if (result !== 'failed') track('share-game');
});

initAnalytics();
if (challenge) setTimeout(() => track('challenge-opened'), 3000);

// Singularity: play the finale once (only if it happened in this session), then the ending.
const singularAtLoad = state.singularity;
let endingStarted = false;
function restart() {
  resetting = true; resetGame(); state = createState();
  location.href = challengeUrl(location.href, null); // a fresh game, without the old challenge
}

/** Briefly show a confirmation inside the button that was pressed. */
function flashButton(btn, text) {
  if (!btn) return;
  const old = btn.textContent;
  btn.textContent = text;
  setTimeout(() => { btn.textContent = old; }, 2000);
}

async function shareResult(btn) {
  const result = await shareOrCopy({ title: 'Singulairity', text: shareText(state, location.href) });
  if (result === 'copied') flashButton(btn, 'Copied to clipboard');
  if (result !== 'failed') track('share-result');
}
extraUi.push(async (s) => {
  if (!s.singularity || endingStarted) return;
  endingStarted = true;
  saveGame(s);
  if (!singularAtLoad) {
    track(`ending-${s.ending}`);
    await startFinale(document.body, { force2d: params.has('no3d') });
  }
  showEnding($('ending'), s, {
    onRestart: restart,
    onShare: shareResult,
    onSaveImage: () => { downloadResultCard(s, location.href); track('save-image'); },
    verdict: challenge ? challengeVerdict(s.gameTime, challenge) : null,
  });
});

const px = createPixelCanvas($('scene'));
let lastDraw = 0;
extraFrame.push((s, now) => {
  if (now - lastDraw < 1000 / 30) return;
  lastDraw = now;
  const scene = sceneFor(s.era);
  px.resize(scene.w, scene.h);
  px.setPalette(scene.palette);
  scene.draw(px, s, now / 1000);
});
const FLASH_SECONDS = 1.5; // a fresh discovery blinks in the scene this long
const shop = mountShop($('shop'), (id) => {
  if (!buy(state, id)) return;
  px.flash = { id, until: performance.now() / 1000 + FLASH_SECONDS };
  updateUi();
});
const panels = mountPanels($('panels'), {
  onShare: (v) => setAlignmentShare(state, v),
  onReveal: (msg) => { if (!state.log.includes(msg)) log(msg); },
});

const think = $('think');
think.replaceChildren(
  Object.assign(document.createElement('span'), { textContent: 'Have an idea' }),
  Object.assign(document.createElement('span'), { className: 'think-value' }),
);
think.addEventListener('click', (ev) => {
  if (state.singularity || state.pendingDecision) return;
  const v = clickValue(state);
  clickIdea(state);
  floatText(`+${formatNumber(v)}`, ev);
  updateUi();
});

/** A short "+N" that rises from the click point and fades: flat text, no glow. */
function floatText(text, ev) {
  const r = think.getBoundingClientRect();
  const x = ev.clientX && ev.clientX >= r.left && ev.clientX <= r.right ? ev.clientX - r.left : r.width / 2;
  const el = Object.assign(document.createElement('span'), { className: 'float-text', textContent: text });
  el.style.left = `${x}px`;
  think.append(el);
  el.addEventListener('animationend', () => el.remove());
}
$('reset').addEventListener('click', () => {
  if (!confirm('Start over from the first spark? Your progress will be lost.')) return;
  resetting = true;
  resetGame();
  state = createState();
  location.reload();
});

let lastEra = state.era;
function updateUi() {
  if (state.era !== lastEra) {
    for (let e = lastEra + 1; e <= state.era; e++) { log(`A new era begins: ${ERAS[e - 1].name}.`); track(`era-${e}`); }
    lastEra = state.era;
  }
  document.body.dataset.era = String(state.era);
  think.lastChild.textContent = `+${formatNumber(clickValue(state))}`;
  hud.update(state);
  panels.update(state);
  shop.update(state);
  for (const fn of extraUi) fn(state);
}


// Logic runs on a timer (keeps going at ~1 Hz in background tabs); drawing runs on animation frames.
let last = performance.now();
let uiAcc = 0;
let saveAcc = 0;
function logicTick() {
  const now = performance.now();
  const real = Math.min(MAX_FRAME_DT, Math.max(0, (now - last) / 1000));
  last = now;
  tick(state, real * speed);
  uiAcc += real * 1000;
  saveAcc += real * 1000;
  if (uiAcc >= UI_INTERVAL) { uiAcc = 0; updateUi(); }
  if (saveAcc >= SAVE_INTERVAL) { saveAcc = 0; saveGame(state); }
}

function frame(now) {
  for (const fn of extraFrame) fn(state, now);
  requestAnimationFrame(frame);
}

document.addEventListener('visibilitychange', () => { if (document.hidden && !resetting) saveGame(state); });
window.addEventListener('pagehide', () => { if (!resetting) saveGame(state); });

renderLog();
if (!state.log.length) log('Seventy thousand years ago, someone has the first idea worth sharing.');
updateUi();
setInterval(logicTick, 50);
requestAnimationFrame(frame);

if (params.has('debug')) {
  window.singulairity = { get state() { return state; }, set state(v) { state = v; }, updateUi };
}
