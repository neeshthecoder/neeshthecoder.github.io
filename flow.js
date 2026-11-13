/* flow.js — a field of monospace characters streaming left to right,
   squeezing through a bottleneck and breaking into turbulence.
   Usage: <canvas class="flow" aria-hidden="true"></canvas> + <script src="flow.js" defer></script>
   Colors come from styles.css tokens, so it follows light/dark mode. */
(function () {
  // ---------- tunables ----------
  const FONT_PX = 11;        // character size
  const LINES = 26;          // number of streams
  const SPEED = 0.22;        // flow speed
  const FPS = 30;

  // ---------- math helpers ----------
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const fract = (x) => x - Math.floor(x);
  const hash = (x, y, z) => fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453);
  function noise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    const l = (a, b, t) => a + (b - a) * t;
    const h = (i, j, k) => hash(xi + i, yi + j, zi + k);
    return l(
      l(l(h(0, 0, 0), h(1, 0, 0), u), l(h(0, 1, 0), h(1, 1, 0), u), v),
      l(l(h(0, 0, 1), h(1, 0, 1), u), l(h(0, 1, 1), h(1, 1, 1), u), v), w) * 2 - 1;
  }

  // Envelope: full height on the left, pinched neck, wide messy bloom on the right.
  const NECK = 0.4;
  function width(u) {
    const sigma = u < NECK ? 0.13 : 0.06;
    const pinch = Math.exp(-Math.pow((u - NECK) / sigma, 2));
    const bloom = 0.06 * Math.exp(-Math.pow((u - 0.58) / 0.1, 2)); // slight swell after the neck
    return 0.8 - 0.74 * pinch + bloom;
  }
  const dWidth = (u) => (width(u + 0.002) - width(u - 0.002)) / 0.004;
  const turbulence = (u) => smooth(0.4, 0.48, u) * (1 - smooth(0.58, 0.86, u));

  const CALM = ['-', '-', '=', '~'];
  const CHAOS = '()/\\|{}<>~^*%#@0o.:;\'`"_'.split('');

  // Returns [char, brightness 0..1] or null for one cell.
  function cell(u, v, t, rowV, aspect) {
    const w = width(u);
    const tb = turbulence(u);
    let y0 = v / w;
    y0 += tb * 0.3 * noise(u * 7 - t * 0.9, y0 * 2.5, t * 0.35);
    if (Math.abs(y0) > 1.02) {
      // sparse spray around the turbulent region
      if (tb > 0.2 && hash(Math.floor(u * 400), Math.floor(v * 200), Math.floor(t * 4)) > 0.985 - tb * 0.02)
        return ['.', 0.25];
      return null;
    }
    const s = (y0 + 1) / 2 * LINES;
    const line = Math.floor(s);
    const distV = Math.abs(fract(s) - 0.5) * 2 * w / LINES; // distance to stream centre, in v units
    if (distV > rowV * 0.55 + tb * rowV * 0.6) return null;

    // dashes travelling along each stream
    const phase = hash(line, 3, 7);
    const dash = fract(u * (10 + phase * 6) - t * SPEED * (0.8 + phase * 0.5) + phase);
    if (dash > 0.82 + (1 - tb) * 0.1) return null;

    // a brighter pulse that rides the flow
    const pulse = Math.pow(0.5 + 0.5 * Math.sin((u * 6 - t * SPEED * 6) + line * 0.7), 6);
    const neck = Math.exp(-Math.pow((u - NECK) / 0.08, 2));
    const edge = 1 - Math.abs(y0) * 0.45;
    let b = clamp(0.28 + 0.35 * edge + 0.3 * neck + 0.35 * pulse, 0, 1);

    let ch;
    if (tb > 0.35 && hash(Math.floor(u * 300), line, Math.floor(t * 6 + phase * 9)) < tb * 0.45) {
      ch = CHAOS[Math.floor(hash(Math.floor(u * 300), line, Math.floor(t * 3)) * CHAOS.length)];
      b *= 0.85;
    } else {
      const slope = (y0 * dWidth(u)) * aspect; // screen dy/dx
      if (Math.abs(slope) > 2.2) ch = '|';
      else if (slope > 0.35) ch = '\\';
      else if (slope < -0.35) ch = '/';
      else ch = CALM[Math.floor(phase * CALM.length + pulse * 2) % CALM.length];
    }
    return [ch, b];
  }

  // ---------- rendering ----------
  function mix(a, b, t) {
    return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
  }
  function parseColor(str) {
    const probe = document.createElement('span');
    probe.style.color = str; document.body.appendChild(probe);
    const m = getComputedStyle(probe).color.match(/\d+/g).map(Number);
    probe.remove(); return m;
  }

  function start(canvas) {
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let W = 0, H = 0, cw = 0, rh = 0, cols = 0, rows = 0, palette = [], raf = 0, last = 0, visible = true;
    const t0 = performance.now();

    function readTheme() {
      const css = getComputedStyle(document.documentElement);
      const lo = parseColor(css.getPropertyValue('--rule').trim() || '#555');
      const hi = parseColor(css.getPropertyValue('--ink').trim() || '#eee');
      palette = Array.from({ length: 6 }, (_, i) => mix(lo, hi, i / 5));
      const mono = css.getPropertyValue('--font-mono').trim() || 'monospace';
      ctx.font = `${FONT_PX}px ${mono}`;
    }
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      readTheme();
      ctx.textBaseline = 'top';
      cw = ctx.measureText('M').width || FONT_PX * 0.6;
      rh = FONT_PX * 1.25;
      cols = Math.floor(W / cw); rows = Math.floor(H / rh);
      draw(performance.now());
    }
    function draw(now) {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      if (!cols || !rows) return;
      const rowV = 2 / rows, aspect = (H / 2) / W;
      const buckets = palette.map(() => []);
      for (let r = 0; r < rows; r++) {
        const v = (r + 0.5) / rows * 2 - 1;
        for (let c = 0; c < cols; c++) {
          const res = cell((c + 0.5) / cols, v, t, rowV, aspect);
          if (res) buckets[Math.min(5, Math.floor(res[1] * 6))].push(res[0], c * cw, r * rh);
        }
      }
      buckets.forEach((list, i) => {
        ctx.fillStyle = palette[i];
        for (let k = 0; k < list.length; k += 3) ctx.fillText(list[k], list[k + 1], list[k + 2]);
      });
    }
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < 1000 / FPS) return;
      last = now; draw(now);
    }
    function run() {
      cancelAnimationFrame(raf);
      if (!reduce.matches && visible && !document.hidden) raf = requestAnimationFrame(loop);
      else draw(performance.now());
    }

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; run(); }).observe(canvas);
    document.addEventListener('visibilitychange', run);
    reduce.addEventListener('change', run);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readTheme(); draw(performance.now()); });
    if (document.fonts) document.fonts.ready.then(resize);
    resize(); run();
  }

  if (typeof window !== 'undefined') {
    const go = () => document.querySelectorAll('canvas.flow').forEach(start);
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', go) : go();
  } else {
    module.exports = { cell }; // lets node render a text preview
  }
})();
