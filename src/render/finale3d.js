// The last 20 seconds: the camera flies out of the pixel world into an accelerating tunnel.
// 3D with three.js (flat MeshBasicMaterial, no lights, no shadows), 2D fallback otherwise.
import { trippyPalette } from './trippy.js';

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const DURATION = 20; // seconds
const PIXEL = 4;     // render at 1/4 resolution, scaled up pixelated

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

function overlay(container) {
  const wrap = document.createElement('div');
  wrap.className = 'finale';
  const canvas = document.createElement('canvas');
  wrap.append(canvas);
  container.append(wrap);
  return { wrap, canvas };
}

async function run3d(canvas) {
  const THREE = await import(THREE_URL);
  const w = Math.max(80, Math.floor(innerWidth / PIXEL));
  const h = Math.max(60, Math.floor(innerHeight / PIXEL));
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
  renderer.setPixelRatio(1);
  renderer.setSize(w, h, false);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#000000');
  const camera = new THREE.PerspectiveCamera(70, w / h, 0.1, 400);

  const RINGS = 48; const PER_RING = 14; const GAP = 6;
  const geom = new THREE.BoxGeometry(1.6, 1.6, 1.6);
  const palette = trippyPalette(0, 1);
  const materials = palette.slice(0, 16).map((c) => new THREE.MeshBasicMaterial({ color: c }));
  const rings = [];
  for (let r = 0; r < RINGS; r++) {
    const ring = new THREE.Group();
    for (let i = 0; i < PER_RING; i++) {
      const a = (i / PER_RING) * Math.PI * 2;
      const m = new THREE.Mesh(geom, materials[(r + i) % materials.length]);
      m.position.set(Math.cos(a) * 7, Math.sin(a) * 7, 0);
      ring.add(m);
    }
    ring.position.z = -r * GAP;
    scene.add(ring);
    rings.push(ring);
  }

  return new Promise((resolve) => {
    const start = performance.now();
    let z = 0;
    let lastNow = start;
    function frame(now) {
      try { draw(now); } catch { try { renderer.dispose(); } catch { /* ignore */ } resolve(); }
    }
    function draw(now) {
      const t = (now - start) / 1000;
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      const speed = 6 * Math.exp(t * 0.28); // accelerating, the whole point
      z -= speed * dt;
      camera.position.z = z;
      camera.rotation.z = t * t * 0.02;
      const pal = trippyPalette(t, 1 + t);
      materials.forEach((m, i) => m.color.set(pal[i]));
      for (const ring of rings) {
        if (ring.position.z > z + GAP) ring.position.z -= RINGS * GAP;
        ring.rotation.z = t * 0.5 + ring.position.z * 0.01;
      }
      renderer.render(scene, camera);
      if (t < DURATION) requestAnimationFrame(frame);
      else { renderer.dispose(); resolve(); }
    }
    requestAnimationFrame(frame);
  });
}

function run2d(canvas) {
  const w = Math.max(80, Math.floor(innerWidth / PIXEL));
  const h = Math.max(60, Math.floor(innerHeight / PIXEL));
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const stars = Array.from({ length: 220 }, () => ({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z: Math.random() }));
  return new Promise((resolve) => {
    const start = performance.now();
    let lastNow = start;
    function frame(now) {
      try { draw(now); } catch { resolve(); }
    }
    function draw(now) {
      const t = (now - start) / 1000;
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      const pal = trippyPalette(t, 1 + t);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      const speed = 0.15 * Math.exp(t * 0.28);
      stars.forEach((s, i) => {
        s.z -= speed * dt;
        if (s.z <= 0.01) { s.z = 1; s.x = Math.random() * 2 - 1; s.y = Math.random() * 2 - 1; }
        const sx = Math.floor(w / 2 + (s.x / s.z) * w * 0.25);
        const sy = Math.floor(h / 2 + (s.y / s.z) * h * 0.25);
        const size = Math.max(1, Math.floor((1 - s.z) * 4));
        ctx.fillStyle = pal[i % 16];
        ctx.fillRect(sx, sy, size, size);
      });
      if (t < DURATION) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

/** Play the finale; resolves when it is over. Never throws: falls back to 2D. */
export async function startFinale(container, { force2d = false } = {}) {
  const { wrap, canvas } = overlay(container);
  try {
    if (force2d || !hasWebGL()) throw new Error('2d');
    await run3d(canvas);
  } catch {
    const fresh = document.createElement('canvas');
    canvas.replaceWith(fresh);
    await run2d(fresh);
  }
  wrap.remove();
}
