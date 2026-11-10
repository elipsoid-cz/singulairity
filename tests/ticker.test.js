import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/state.js';
import { progressOf, yearOf } from '../src/calendar.js';
import { TICKER, pickTickerLine, tickerInterval, tickerPool, LIVE_COOLDOWN } from '../src/content/ticker.js';
import { serialize, deserialize } from '../src/save.js';
const isLive = (s, text) => tickerPool(s).some((p) => p.key.startsWith('live:') && p.text === text);
import { UPGRADES } from '../src/content/upgrades.js';
import { EVENTS } from '../src/content/events.js';
import { tick, rates, maybeSpawnEvent, claimEvent } from '../src/engine.js';

function seeded(seed = 1) {
  return () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
}

test('ticker has enough lines and every era year has one', () => {
  assert.ok(TICKER.length >= 80);
  for (const y of [-70000, -40000, -10000, -3000, 0, 1000, 1500, 1800, 1900, 1950, 2000, 2020, 2030, 2040, 2045]) {
    assert.ok(TICKER.some((l) => l.fromYear <= y && y <= l.toYear), `no line for ${y}`);
  }
});

test('pickTickerLine only returns history lines for the current year', () => {
  const s = createState();
  s.progress = progressOf(1800);
  const rng = seeded(3);
  for (let i = 0; i < 50; i++) {
    const text = pickTickerLine(s, rng);
    const line = TICKER.find((l) => l.text === text);
    if (line) assert.ok(line.fromYear <= yearOf(s.progress) && yearOf(s.progress) <= line.toYear);
  }
});

test('a message is shown at most once per game', () => {
  const s = createState();
  s.progress = progressOf(1500); s.era = 3; s.owned = { printing: 1, libraries: 2 };
  const rng = seeded(9);
  const shown = [];
  for (let i = 0; i < 300; i++) {
    const t = pickTickerLine(s, rng);
    if (t !== null) shown.push(t);
  }
  const fixed = shown.filter((t) => !isLive(s, t));
  assert.equal(new Set(fixed).size, fixed.length, 'a history or flavour line repeated');
  assert.ok(fixed.length >= 8);
});

test('live lines come back only after a cooldown, otherwise nothing new is shown', () => {
  const s = createState();
  s.progress = progressOf(1500); s.era = 3;
  const rng = seeded(2);
  while (pickTickerLine(s, rng) !== null) { /* use up everything available now */ }
  assert.equal(pickTickerLine(s, rng), null, 'nothing new at the same moment');
  s.gameTime += LIVE_COOLDOWN + 1;
  const again = pickTickerLine(s, rng);
  assert.ok(again && isLive(s, again), 'a live line may return after the cooldown');
});

test('what was shown survives save and load', () => {
  const s = createState();
  s.progress = progressOf(1500); s.era = 3;
  const first = pickTickerLine(s, seeded(5));
  const loaded = deserialize(serialize(s));
  for (let i = 0; i < 100; i++) assert.notEqual(pickTickerLine(loaded, seeded(i)), first);
});

test('the pool mixes in live numbers but not old discoveries', () => {
  const s = createState();
  s.progress = progressOf(1605); s.era = 3; s.hardware = 0; s.owned = { writing: 1, printing: 1 };
  const texts = tickerPool(s).map((p) => p.text);
  assert.ok(!texts.includes(UPGRADES.find((u) => u.id === 'writing').flavor), 'writing flavour in 1605');
  s.progress = progressOf(2000); s.era = 5; s.hardware = 100;
  assert.ok(tickerPool(s).some((p) => /calculations per second/.test(p.text)), 'live compute line');
});

test('a discovery is announced once, right after you make it', async () => {
  const { buy } = await import('../src/engine.js');
  const s = createState();
  s.progress = progressOf(-9000); s.era = 2; s.ideas = 1e9;
  assert.ok(buy(s, 'writing'));
  const flavour = UPGRADES.find((u) => u.id === 'writing').flavor;
  assert.equal(pickTickerLine(s, seeded(1)), flavour);
  for (let i = 0; i < 200; i++) assert.notEqual(pickTickerLine(s, seeded(i)), flavour);
  assert.ok(buy(s, 'farms')); assert.ok(buy(s, 'farms'));
  assert.equal(s.tickerQueue.filter((k) => k === 'own:farms').length, 1, 'a repeat purchase is not announced again');
});

test('every stretch of the game has a decent pool', () => {
  for (const y of [-60000, -15000, -9000, -5000, 1450, 1500, 1600, 1750, 1850, 1995, 2005, 2015, 2025, 2033, 2040]) {
    const s = createState();
    s.progress = progressOf(y);
    s.era = y < -10000 ? 1 : y < 1440 ? 2 : y < 1760 ? 3 : y < 1945 ? 4 : y < 2012 ? 5 : y < 2035 ? 6 : 7;
    const lines = TICKER.filter((l) => l.fromYear <= y && y <= l.toYear).length;
    assert.ok(lines >= 6, `only ${lines} history lines around ${y}`);
  }
});

test('ticker speeds up with eras', () => {
  const s = createState();
  let prev = Infinity;
  for (let e = 1; e <= 7; e++) {
    s.era = e;
    const t = tickerInterval(s);
    assert.ok(t < prev);
    prev = t;
  }
  s.era = 1; assert.equal(tickerInterval(s), 12);
  s.era = 7; assert.equal(tickerInterval(s), 1.5);
});

test('events spawn with a seeded rng and expire', () => {
  assert.ok(EVENTS.length >= 5);
  const s = createState();
  const rng = seeded(7);
  for (let i = 0; i < 10000 && !s.activeEvent; i++) maybeSpawnEvent(s, 1, rng);
  assert.ok(s.activeEvent, 'should eventually spawn');
  s.gameTime = s.activeEvent.expires + 1;
  maybeSpawnEvent(s, 0, () => 0.99);
  assert.equal(s.activeEvent, null);
});

test('claimEvent grants a temporary buff', () => {
  const s = createState();
  s.owned.elders = 2;
  assert.equal(claimEvent(s), false);
  const base = rates(s).ideasPerSec;
  const ev = EVENTS[0];
  s.activeEvent = { id: ev.id, expires: 10 };
  assert.equal(claimEvent(s), true);
  assert.equal(s.activeEvent, null);
  assert.ok(Math.abs(rates(s).ideasPerSec / base - ev.mult) < 1e-9);
  s.gameTime = ev.duration + 1;
  assert.ok(Math.abs(rates(s).ideasPerSec - base) < 1e-9);
});

test('tick spawns events via the injected rng', () => {
  const s = createState();
  tick(s, 1, () => 0);
  assert.ok(s.activeEvent);
});

test('historians compare this single year with a whole past period', () => {
  const at = (year) => { const s = createState(); s.progress = progressOf(year); s.era = year < 1945 ? 4 : 6; return tickerPool(s); };
  assert.ok(!at(-50000).some((p) => p.key === 'live:historians'), 'no comparison in deep prehistory');
  assert.ok(!at(2030).some((p) => /Calendar check/.test(p.text)), 'calendar check removed');
  const line = at(2030).find((p) => p.key === 'live:historians');
  assert.ok(line, 'comparison in 2030');
  assert.match(line.text, /^Historians say this single year held more change than /);
  assert.ok(!/2030s|2040s/.test(line.text), 'only periods that already ended');
});
