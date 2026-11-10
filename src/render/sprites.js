// Hand-drawn sprites as text. Index 1 = main ink, 2/3 = secondary tones (remapped per era).
import { parseSprite } from './pixel.js';

export const PERSON = [
  parseSprite(['.1.', '111', '.1.', '1.1']),
  parseSprite(['.1.', '111', '.1.', '.1.']),
];

export const FIRE = [
  parseSprite(['.1..', '.11.', '1111', '.11.']),
  parseSprite(['..1.', '.11.', '1111', '.11.']),
];

export const SHELTER = parseSprite([
  '...1...',
  '..1.1..',
  '.1...1.',
  '1.....1',
  '1111111',
]);

export const HUT = parseSprite([
  '..111..',
  '.11111.',
  '1111111',
  '.1...1.',
  '.1.1.1.',
  '.1.1.1.',
]);

export const CART = [
  parseSprite(['11111', '1...1', '.1.1.']),
  parseSprite(['11111', '1...1', '1...1']),
];

export const PYRAMID = parseSprite([
  '....1....',
  '...111...',
  '..11111..',
  '.1111111.',
  '111111111',
]);

export const HOUSE = parseSprite([
  '..222..',
  '.22222.',
  '2222222',
  '.31313.',
  '.33333.',
  '.31113.',
]);

export const TOWER = parseSprite([
  '..2..',
  '.222.',
  '.303.',
  '.333.',
  '.313.',
  '.333.',
  '.333.',
  '33133',
]);

export const PRESS = parseSprite([
  '1111111',
  '1.....1',
  '1.222.1',
  '1.....1',
  '1111111',
  '1.....1',
]);

export const TELESCOPE = parseSprite([
  '.....33',
  '...333.',
  '.333...',
  '...1...',
  '..1.1..',
  '.1...1.',
]);

export const FACTORY = parseSprite([
  '.......11.....',
  '.......11.....',
  '.......11.....',
  '1....1.11.....',
  '11...111111...',
  '111..11111111.',
  '11111111111111',
  '1e1e1e1e1e1e11',
  '11111111111111',
]);

export const HEADFRAME = parseSprite([
  '1.....1',
  '.1...1.',
  '..1.1..',
  '...1...',
  '..1.1..',
  '.1...1.',
  '1111111',
]);

export const TRAIN = parseSprite([
  '.11........',
  '.11..77777.',
  '1111.7.7.7.',
  '11111777777',
  '.1.1..1..1.',
]);

export const RACK = parseSprite([
  '11111',
  '1a2a1',
  '11111',
  '1a2b1',
  '11111',
  '1b2a1',
  '11111',
]);

export const SATELLITE = parseSprite([
  '33.1.33',
  '3331333',
  '33.1.33',
]);

// ── Added for "every discovery is visible" ──
export const WHEEL = [
  parseSprite(['..111..', '.1.1.1.', '1..1..1', '1111111', '1..1..1', '.1.1.1.', '..111..']),
  parseSprite(['..111..', '.1...1.', '1.1.1.1', '1..1..1', '1.1.1.1', '.1...1.', '..111..']),
];

export const OX = [
  parseSprite(['........1.', '.11111111.', '1111111111', '.111111111', '.1.1..1.1.', '.1.1..1.1.']),
  parseSprite(['........1.', '.11111111.', '1111111111', '.111111111', '..1.1..1.1', '.1...1...1']),
];

export const SCRIBE = parseSprite([
  '.1....',
  '111.11',
  '.1..11',
  '11....',
]);

export const STELE = parseSprite([
  '.111.',
  '11111',
  '1.1.1',
  '11111',
  '1.1.1',
  '11111',
  '1..11',
  '11111',
  '11111',
]);

export const COLUMN = parseSprite([
  '11111',
  '.111.',
  '.1.1.',
  '.1.1.',
  '.1.1.',
  '.1.1.',
  '.1.1.',
  '11111',
]);

export const SITTER = parseSprite(['.1.', '111', '11.']);

export const SPEAR_HUNTER = parseSprite([
  '...1',
  '.1.1',
  '1111',
  '.1.1',
  '1.11',
]);

export const ELDER = parseSprite([
  '.1.1',
  '1111',
  '.1.1',
  '11.1',
]);

export const HOSPITAL = parseSprite([
  '1111111111',
  '1........1',
  '1...cc...1',
  '1..cccc..1',
  '1...cc...1',
  '1........1',
  '1..1111..1',
  '1..1..1..1',
  '1111111111',
]);

export const LAB = parseSprite([
  '11111111',
  '1......1',
  '1..33..1',
  '1..33..1',
  '1.3333.1',
  '1.3333.1',
  '11111111',
]);

export const TRANSISTOR = parseSprite([
  '.111.',
  '11111',
  '11111',
  '1.1.1',
  '1.1.1',
  '1.1.1',
]);

export const CHIP = parseSprite([
  '.1.1.1.1.',
  '111111111',
  '.1222221.',
  '11222221.',
  '.12222211',
  '.1222221.',
  '111111111',
  '.1.1.1.1.',
]);
