// A 1200×630 result card to save and post. Flat colours, pixel font, no glow.
import { eraTimeline, ENDINGS } from '../endings.js';
import { revealSentence } from './ending.js';
import { formatDuration } from '../format.js';

const W = 1200; const H = 630;
const BG = '#101014'; const INK = '#f1f1f1'; const MUTED = '#a0a0ab'; const ACCENT = '#ffd400';
const ERA_COLORS = ['#e9e4d4', '#b5a67a', '#2f4f8f', '#a2381f', '#00785a', '#2b2bd6', '#ffd400'];

function wrap(ctx, text, maxWidth) {
  const lines = []; let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function bars(ctx, y, values, label) {
  const x0 = 220; const width = W - x0 - 60; const total = values.reduce((a, b) => a + b, 0) || 1;
  ctx.fillStyle = MUTED; ctx.font = '22px "IBM Plex Mono", monospace'; ctx.fillText(label, 60, y + 30);
  let x = x0;
  values.forEach((v, i) => {
    const w = (v / total) * width;
    ctx.fillStyle = ERA_COLORS[i]; ctx.fillRect(Math.round(x), y, Math.max(1, Math.round(w)), 40);
    x += w;
  });
}

export async function renderResultCard(state, url) {
  await document.fonts?.ready;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  // Logo: SINGUL[AI]RITY
  ctx.font = '44px Silkscreen, monospace';
  const parts = ['SINGUL', 'AI', 'RITY'];
  let x = 60;
  parts.forEach((p, i) => {
    const w = ctx.measureText(p).width;
    if (i === 1) { ctx.fillStyle = INK; ctx.fillRect(x - 4, 26, w + 8, 56); ctx.fillStyle = BG; } else ctx.fillStyle = INK;
    ctx.fillText(p, x, 72);
    x += w + (i === 1 ? 8 : 0);
  });

  const timeline = eraTimeline(state);
  const reveal = revealSentence(timeline);
  ctx.fillStyle = INK; ctx.font = '600 34px "IBM Plex Mono", monospace';
  wrap(ctx, reveal.lead, W - 120).forEach((l, i) => ctx.fillText(l, 60, 150 + i * 46));

  bars(ctx, 290, timeline.map((e) => Math.max(0, e.toYear - e.fromYear)), 'Calendar');
  bars(ctx, 360, timeline.map((e) => e.seconds), 'My time');

  ctx.fillStyle = ACCENT; ctx.font = '28px Silkscreen, monospace';
  ctx.fillText(`Ending: ${ENDINGS[state.ending]?.title ?? ''}`, 60, 480);
  ctx.fillStyle = INK; ctx.font = '26px "IBM Plex Mono", monospace';
  ctx.fillText(`Singularity reached in ${formatDuration(state.gameTime)}.`, 60, 525);
  ctx.fillStyle = MUTED; ctx.font = '22px "IBM Plex Mono", monospace';
  ctx.fillText(url.replace(/^https?:\/\//, '').replace(/\?.*$/, ''), 60, 590);
  return c;
}

export async function downloadResultCard(state, url) {
  const canvas = await renderResultCard(state, url);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'singulairity-result.png';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
