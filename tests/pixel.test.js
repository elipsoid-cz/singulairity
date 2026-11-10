import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSprite, TRANSPARENT } from '../src/render/pixel.js';
import { PALETTES } from '../src/render/palettes.js';
import { SCENE_SIZES } from '../src/render/scenes.js';

test('parseSprite reads size and palette indices', () => {
  const s = parseSprite(['.1.', '1a1']);
  assert.equal(s.w, 3);
  assert.equal(s.h, 2);
  assert.deepEqual([...s.px], [TRANSPARENT, 1, TRANSPARENT, 1, 10, 1]);
  assert.equal(TRANSPARENT, 255);
});

test('parseSprite rejects ragged rows', () => {
  assert.throws(() => parseSprite(['11', '1']));
});

test('palettes grow with the eras', () => {
  assert.equal(PALETTES[1].length, 2);
  assert.equal(PALETTES[2].length, 2);
  assert.equal(PALETTES[3].length, 4);
  assert.equal(PALETTES[4].length, 16);
  assert.equal(PALETTES[5].length, 256);
  assert.ok(PALETTES[6].length >= 8);
});

test('palettes have no duplicate colours', () => {
  for (const [era, pal] of Object.entries(PALETTES)) {
    assert.equal(new Set(pal.map((c) => c.toLowerCase())).size, pal.length, `era ${era}`);
    for (const c of pal) assert.match(c, /^#[0-9a-f]{6}$/i);
  }
});

test('scene resolution grows with the eras', () => {
  assert.deepEqual(SCENE_SIZES[1], [64, 36]);
  assert.deepEqual(SCENE_SIZES[3], [96, 54]);
  assert.deepEqual(SCENE_SIZES[4], [128, 72]);
  assert.deepEqual(SCENE_SIZES[5], [192, 108]);
  assert.deepEqual(SCENE_SIZES[6], [320, 180]);
});
