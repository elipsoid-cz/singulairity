import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UPGRADES } from '../src/content/upgrades.js';
import { describe } from '../src/content/describe.js';
import { GROWTH_SCALE } from '../src/balance.js';

const byId = (id) => UPGRADES.find((u) => u.id === id);

test('descriptions show the real growth, after the global pace scale', () => {
  const u = byId('printing');
  const pct = u.effect.growth * GROWTH_SCALE * 100;
  assert.ok(describe(u).includes(`+${+pct.toPrecision(2)}%/s growth`), describe(u));
});

test('repeatables say how many copies exist and that the effect is per copy', () => {
  const d = describe(byId('libraries'));
  assert.match(d, /each/);
  assert.match(d, /up to 8/);
});

test('every effect key is described', () => {
  for (const u of UPGRADES) {
    const d = describe(u);
    assert.ok(d.length > 5, u.id);
    assert.ok(!/undefined|NaN/.test(d), `${u.id}: ${d}`);
  }
});

test('within an era, a pricier one-time discovery never gives less growth', () => {
  for (let era = 1; era <= 7; era++) {
    const once = UPGRADES.filter((u) => u.era === era && u.max === 1 && u.effect.growth)
      .sort((a, b) => a.cost - b.cost);
    for (let i = 1; i < once.length; i++) {
      assert.ok(once[i].effect.growth >= once[i - 1].effect.growth,
        `${once[i].id} costs more than ${once[i - 1].id} but gives less growth`);
    }
  }
});
