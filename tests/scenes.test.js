import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createState } from '../src/state.js';
import { UPGRADES } from '../src/content/upgrades.js';
import { createPixelCanvas } from '../src/render/pixel.js';
import { sceneFor, SCENE_SIZES } from '../src/render/scenes.js';

/** A canvas stand-in that keeps only the final pixels (fillRect is all the scenes use). */
function fakeCanvas() {
  const c = { width: 1, height: 1, buf: new Uint32Array(1), getContext() { return ctx; } };
  const ctx = {
    fillStyle: '#000000', imageSmoothingEnabled: false,
    fillRect(x, y, w, h) {
      if (c.buf.length !== c.width * c.height) c.buf = new Uint32Array(c.width * c.height);
      const v = parseInt(this.fillStyle.slice(1), 16);
      for (let j = Math.max(0, y); j < Math.min(c.height, y + h); j++)
        for (let i = Math.max(0, x); i < Math.min(c.width, x + w); i++) c.buf[j * c.width + i] = v;
    },
  };
  return c;
}

function render(era, owned, { t = 1, flash = null } = {}) {
  const c = fakeCanvas();
  const px = createPixelCanvas(c);
  px.flash = flash;
  const scene = sceneFor(era);
  px.resize(scene.w, scene.h);
  px.setPalette(scene.palette);
  const s = createState();
  Object.assign(s, { era, owned, population: 50, progress: 1e21, rival: { active: true, progress: 1e20 } });
  scene.draw(px, s, t);
  return Array.from(c.buf).join(',');
}

test('era 2 has more detail than era 1 but the same two colours', () => {
  assert.deepEqual(SCENE_SIZES[1], [64, 36]);
  assert.deepEqual(SCENE_SIZES[2], [96, 54]);
});

for (const u of UPGRADES.filter((x) => x.era <= 6)) {
  test(`discovery "${u.id}" is visible in the era ${u.era} scene`, () => {
    assert.notEqual(render(u.era, { [u.id]: 1 }), render(u.era, {}), `${u.id} draws nothing`);
  });
}

test('a fresh discovery blinks', () => {
  const owned = { wheel: 1 };
  const plain = render(2, owned, { t: 1 });
  const flashing = render(2, owned, { t: 1, flash: { id: 'wheel', until: 2 } });
  const expired = render(2, owned, { t: 1, flash: { id: 'wheel', until: 0.5 } });
  assert.notEqual(flashing, plain);
  assert.equal(expired, plain);
});
