// Builds og.png (1200×630), the link preview image, from the game's own pixel scenes.
// Run: node scripts/make-og.mjs   (no dependencies: a fillRect-only canvas stand-in and a tiny PNG encoder)
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { createPixelCanvas } from '../src/render/pixel.js';
import { sceneFor } from '../src/render/scenes.js';
import { createState } from '../src/state.js';
import { UPGRADES } from '../src/content/upgrades.js';

const W = 1200; const H = 630; const BG = 0x101014; const INK = 0xf1f1f1; const MUTED = 0xa0a0ab;
const img = new Uint32Array(W * H).fill(BG);
const rect = (x, y, w, h, c) => {
  for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) img[j * W + i] = c;
};

// 5×7 pixel font, only the letters we need.
const FONT = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  I: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '#####'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
  U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
  '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
};
function text(str, x, y, px, color, invertFrom = -1, invertTo = -1) {
  [...str].forEach((ch, k) => {
    const g = FONT[ch]; const cx = x + k * 6 * px;
    const inv = k >= invertFrom && k < invertTo;
    if (inv) rect(cx - px, y - px, 6 * px, 9 * px, color);
    g.forEach((row, j) => [...row].forEach((v, i) => { if (v === '#') rect(cx + i * px, y + j * px, px, px, inv ? BG : color); }));
  });
}
const width = (str, px) => str.length * 6 * px - px;

const logo = 'SINGULAIRITY'; const lpx = 12;
text(logo, Math.round((W - width(logo, lpx)) / 2), 70, lpx, INK, 6, 8);
const tag = 'HOW FAST DOES PROGRESS ACCELERATE?'; const tpx = 4;
text(tag, Math.round((W - width(tag, tpx)) / 2), 200, tpx, MUTED);

// A strip of four eras drawn by the game itself.
function fakeCanvas() {
  const c = { width: 1, height: 1, buf: new Uint32Array(1), getContext() { return ctx; } };
  const ctx = { fillStyle: '#000000', imageSmoothingEnabled: false,
    fillRect(x, y, w, h) {
      if (c.buf.length !== c.width * c.height) c.buf = new Uint32Array(c.width * c.height);
      const v = parseInt(this.fillStyle.slice(1), 16);
      for (let j = Math.max(0, y); j < Math.min(c.height, y + h); j++) for (let i = Math.max(0, x); i < Math.min(c.width, x + w); i++) c.buf[j * c.width + i] = v;
    } };
  return c;
}
const s = createState();
Object.assign(s, { population: 3e3, progress: 1e25, rival: { active: true, progress: 1e24 }, agiPaths: { emulation: 0.6, evolution: 0.4 },
  owned: Object.fromEntries(UPGRADES.filter((u) => u.era <= 6).map((u) => [u.id, u.max > 1 ? 3 : 1])) });
const eras = [1, 3, 4, 5]; const cw = 270; const ch = Math.round(cw * 9 / 16); const gap = 20;
const x0 = Math.round((W - (eras.length * cw + (eras.length - 1) * gap)) / 2);
eras.forEach((e, k) => {
  const c = fakeCanvas(); const px = createPixelCanvas(c); const sc = sceneFor(e);
  px.resize(sc.w, sc.h); px.setPalette(sc.palette); sc.draw(px, { ...s, era: e }, 3.3);
  const ox = x0 + k * (cw + gap); const oy = 350;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) img[(oy + y) * W + ox + x] = c.buf[Math.floor(y * sc.h / ch) * sc.w + Math.floor(x * sc.w / cw)];
  rect(ox, oy + ch + 12, cw, 6, [0xe9e4d4, 0x2f4f8f, 0xa2381f, 0x00785a][k]);
});

// PNG encode.
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = img[y * W + x]; const o = y * (W * 3 + 1) + 1 + x * 3; raw[o] = v >> 16; raw[o + 1] = (v >> 8) & 255; raw[o + 2] = v & 255; }
const T = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = (b) => { let c = 0xffffffff; for (const x of b) c = T[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const cr = Buffer.alloc(4); cr.writeUInt32BE(crc(td)); return Buffer.concat([l, td, cr]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
writeFileSync(new URL('../og.png', import.meta.url), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('og.png written');
