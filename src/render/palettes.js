// Colour palettes per era. The world gains colour as humanity progresses.
const hex = (r, g, b) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

function vga256() {
  const out = [];
  const steps = [0, 51, 102, 153, 204, 255];
  for (const r of steps) for (const g of steps) for (const b of steps) out.push(hex(r, g, b));
  for (let i = 0; i < 40; i++) { const v = 8 + i * 6; out.push(hex(v, v, v)); }
  return out;
}

export const PALETTES = {
  1: ['#14130f', '#e9e4d4'],
  2: ['#14130f', '#e9e4d4'],
  3: ['#1d1c17', '#5b5340', '#b5a67a', '#f0e8cc'],
  4: ['#000000', '#0000aa', '#00aa00', '#00aaaa', '#aa0000', '#aa00aa', '#aa5500', '#aaaaaa',
    '#555555', '#5555ff', '#55ff55', '#55ffff', '#ff5555', '#ff55ff', '#ffff55', '#ffffff'],
  5: vga256(),
  6: ['#f4f4f0', '#16161d', '#2b2bd6', '#00785a', '#d02a2a', '#ffd400', '#8a8f98', '#cfd3da',
    '#ff7a1a', '#6b4bd6', '#1fa3c4', '#e8e8ec'],
};

/** Index helper for the 256-colour palette: r, g, b in 0..5. */
export const rgb6 = (r, g, b) => r * 36 + g * 6 + b;
