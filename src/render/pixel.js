// Minimal pixel-art renderer on a low-resolution canvas (scaled up with image-rendering: pixelated).
export const TRANSPARENT = 255;

/** Rows of characters → {w, h, px}. '.' is transparent, 0-9a-f are palette indices. */
export function parseSprite(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const px = new Uint8Array(w * h);
  rows.forEach((row, y) => {
    if (row.length !== w) throw new Error(`ragged sprite row ${y}`);
    for (let x = 0; x < w; x++) px[y * w + x] = row[x] === '.' ? TRANSPARENT : parseInt(row[x], 16);
  });
  return { w, h, px };
}

export function createPixelCanvas(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  let palette = ['#000000', '#ffffff'];
  const api = {
    get w() { return canvas.width; },
    get h() { return canvas.height; },
    ctx,
    resize(w, h) {
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      ctx.imageSmoothingEnabled = false;
    },
    setPalette(p) { palette = p; },
    /** null, 'swap' (mirror the palette) or a palette index: used to make a fresh discovery blink. */
    override: null,
    flash: null,
    color(i) {
      const n = palette.length;
      let idx = ((i % n) + n) % n;
      if (api.override === 'swap') idx = n - 1 - idx;
      else if (api.override != null) idx = api.override;
      return palette[idx];
    },
    clear(i) { ctx.fillStyle = api.color(i); ctx.fillRect(0, 0, canvas.width, canvas.height); },
    rect(x, y, w, h, i) { ctx.fillStyle = api.color(i); ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); },
    dot(x, y, i) { api.rect(x, y, 1, 1, i); },
    /** Draw a sprite; `map` optionally remaps sprite indices to palette indices. */
    sprite(s, x, y, map = null) {
      x = Math.round(x); y = Math.round(y);
      for (let j = 0; j < s.h; j++) {
        for (let i = 0; i < s.w; i++) {
          const v = s.px[j * s.w + i];
          if (v === TRANSPARENT) continue;
          ctx.fillStyle = api.color(map ? map[v] ?? v : v);
          ctx.fillRect(x + i, y + j, 1, 1);
        }
      }
    },
  };
  return api;
}

/** Deterministic pseudo-random numbers so scenery stays put between frames. */
export function seeded(seed) {
  let x = seed >>> 0 || 1;
  return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296);
}
