// Era 7: the intelligence explosion. Palette cycling, a feedback tunnel, the staircase,
// and pixels coming apart as the singularity approaches. Flat colours only: no glow, no gradients.
import { STAIRCASE, staircaseLevel } from '../content/staircase.js';
import { PERSON } from './sprites.js';
import { seeded } from './pixel.js';

const BANDS = 16;

function hslHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** 16 cycling hues + black (16) + white (17). */
export function trippyPalette(t, speed) {
  const pal = [];
  for (let i = 0; i < BANDS; i++) pal.push(hslHex((i * (360 / BANDS) + t * speed * 40) % 360, 0.85, i % 2 ? 0.55 : 0.4));
  pal.push('#000000', '#ffffff');
  return pal;
}

export function drawTrippy(px, state, t) {
  const W = px.w; const H = px.h;
  const level = staircaseLevel(state);                    // 3 (human) … top of the staircase
  const top = STAIRCASE.length - 1;
  const k = Math.max(0, Math.min(1, (level - 3) / (top - 3))); // 0 → 1 toward the singularity
  const speed = 0.5 + k * 8;
  px.setPalette(trippyPalette(t, speed));

  // Feedback tunnel: the previous frame, zoomed in a little, becomes the background.
  const ctx = px.ctx;
  if (ctx.drawImage && t > 0) {
    const z = 0.02 + k * 0.08;
    ctx.drawImage(ctx.canvas, W * z / 2, H * z / 2, W * (1 - z), H * (1 - z), 0, 0, W, H);
  } else {
    px.clear(16);
  }

  // Concentric diamond bands at the centre feed the tunnel.
  const cx = W / 2; const cy = H / 2 - 10;
  const r = 10 + k * 20;
  for (let y = -r; y <= r; y += 2) for (let x = -r; x <= r; x += 2) {
    const d = Math.abs(x) + Math.abs(y);
    if (d > r) continue;
    px.rect(cx + x, cy + y, 2, 2, Math.floor(d / 3 + t * speed) % BANDS);
  }

  // The staircase: steps rise to the right, our marker climbs them.
  const stepW = Math.floor((W - 20) / STAIRCASE.length);
  const base = H - 8;
  for (let i = 0; i < STAIRCASE.length; i++) {
    const hgt = 6 + i * 9;
    px.rect(10 + i * stepW, base - hgt, stepW - 1, hgt, i <= level ? 17 : (i * 2 + Math.floor(t * speed)) % BANDS);
  }
  const li = Math.min(top, Math.floor(level));
  const frac = level - li;
  const mx = 10 + li * stepW + frac * stepW + stepW / 2 - 1;
  const my = base - (6 + li * 9) - 6 - Math.abs(Math.sin(t * (4 + speed))) * 3;
  px.sprite(PERSON[Math.floor(t * (6 + speed)) % 2], mx, my, { 1: 17 });
  px.rect(mx - 1, my + 4, 5, 1, 17);

  // Pixels come apart as the end approaches.
  const noise = Math.floor(k * k * 900);
  const rnd = seeded(Math.floor(t * 30) + 1);
  for (let i = 0; i < noise; i++) {
    px.rect(Math.floor(rnd() * W), Math.floor(rnd() * H), 2, 2, (i + Math.floor(t * 10)) % 18);
  }
}
