/* flow.js — a field of monospace characters streaming left to right,
   squeezing through a bottleneck and breaking into turbulence.
   Usage: <canvas class="flow" aria-hidden="true"></canvas> + <script src="flow.js" defer></script>
   Colors come from styles.css tokens, so it follows light/dark mode. */
(function () {
  // ---------- tunables ----------
  const FONT_PX = 10;        // character size
  const ROW_GAP = 2.2;       // row height as a multiple of FONT_PX: thin streams with air between them
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

  // Envelope (half-height of the stream bundle, 1 = full height). Lines run flat, then bend ever more
  // steeply until they drop into a wide neck; past the ring they burst back out the same way.
  const NECK_W = 0.4;
  const IN0 = 0.26, IN1 = 0.455;   // funnel: starts bending at IN0, steepest at IN1 (the neck's left edge)
  const OUT0 = 0.6, OUT1 = 0.7;    // flare: steepest at OUT0 (the neck's right edge), full height by OUT1
  const arc = (s) => 1 - Math.pow(s, 2.4); // flat at s = 0, steep (not vertical) at s = 1
  function width(u) {
    if (u <= IN0 || u >= OUT1) return 1;
    if (u < IN1) return NECK_W + (1 - NECK_W) * arc((u - IN0) / (IN1 - IN0));
    if (u > OUT0) return NECK_W + (1 - NECK_W) * arc((OUT1 - u) / (OUT1 - OUT0));
    return NECK_W;
  }
  const core = (u) => smooth(IN1 - 0.01, IN1 + 0.01, u) * (1 - smooth(OUT0 - 0.01, OUT0 + 0.02, u)); // jammed neck
  const lobe = (u) => smooth(OUT0 - 0.01, OUT0 + 0.03, u) * (1 - smooth(0.78, 0.9, u));             // the burst past the ring

  // The ring: a fixed round hole at the right end of the neck. Nothing ever enters it; the streams pile up
  // around its rim and shed squiggles behind it that settle into calm lines.
  const RING_U = 0.56;       // centre, as a fraction of the width
  const RING_R = 0.15;       // radius, as a fraction of the half-height (capped by the width in start())

  const CALM = ['-', '-', '-', '=', '-', '~'];
  const TEXT = '0OoIIl1|()UCDB@%/\\'.split('');      // dense jammed glyphs in the neck and lobe
  const CHAOS = '()/\\|{}<>~^*%#@0o.:;\'`"_'.split('');

  // Vertical position (v, -1..1) of stream `k` of `lines` at horizontal position u (0..1).
  function streamV(k, lines, u, t) {
    const y0 = ((k + 0.5) / lines) * 2 - 1;
    return y0 * width(u) + lobe(u) * 0.2 * noise(u * 6 - t * 0.8, y0 * 3 + k * 0.37, t * 0.3);
  }

  // Glyph for stream `k` at u, given its on-screen slope (dy/dx) and whether it sits in a jam
  // (the neck, the lobe or the ring's rim): [char, brightness 0..1] or null for a gap.
  function glyph(k, u, t, slope, jam, rim) {
    const lb = lobe(u), cr = core(u);
    const phase = hash(k, 3, 7);
    const cellU = Math.floor(u * 500);
    const pulse = Math.pow(0.5 + 0.5 * Math.sin((u * 6 - t * SPEED * 6) + k * 0.7), 6);
    const b = clamp(0.5 + 0.2 * cr + 0.3 * pulse, 0, 1);
    if (jam) {
      // packed text that shifts as the jam churns; looser in the lobe than in the neck
      // the ring's rim is packed solid and bright, so the hole always reads as a ring
      if (!rim && hash(cellU, k, Math.floor(t * 3 + phase * 7)) < 0.12 + lb * 0.4) return null;
      const set = hash(cellU, k + 5, 1) < 0.8 ? TEXT : CHAOS;
      return [set[Math.floor(hash(cellU, k, Math.floor(t * 2 + phase * 5)) * set.length)], rim ? 0.95 : b];
    }
    // near-continuous streams with short gaps that travel along them; gaps widen in the turbulence
    const dash = fract(u * (40 + phase * 30) - t * SPEED * (0.8 + phase * 0.5) * 4 + phase);
    if (dash > 0.95 - lb * 0.35) return null;
    if (Math.abs(slope) > 2.5) return ['|', b];
    if (slope > 0.5) return ['\\', b];
    if (slope < -0.5) return ['/', b];
    return [CALM[Math.floor(phase * CALM.length + pulse * 2) % CALM.length], b];
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
    let W = 0, H = 0, cw = 0, lines = 0, half = 0, ringX = 0, ringR = 0, palette = [], raf = 0, last = 0, visible = true;
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
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      cw = ctx.measureText('M').width || FONT_PX * 0.6;
      const rh = FONT_PX * ROW_GAP;
      lines = Math.floor(H / rh);           // one stream per row of spacing where the bundle is full height
      half = (lines * rh) / 2;              // streams span ±half px around the vertical centre
      ringX = W * RING_U;
      ringR = Math.min(half * RING_R, W * 0.07);
      draw(performance.now());
    }
    // Each stream is traced as a curve: glyphs are spaced about one character apart along its length
    // (not snapped to a row grid), so steep parts stay thin.
    function draw(now) {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      if (!lines || W < cw * 4) return;
      const buckets = palette.map(() => []);
      const cy = H / 2, R2 = ringR * ringR;
      // Point of stream k at base position x, pushed out around the ring (r -> sqrt(r^2 + R^2),
      // so nothing ever enters it), plus a swirling wake shed off its back edge.
      const pt = (k, x) => {
        const dx = x - ringX, dy = streamV(k, lines, x / W, t) * half;
        const sc = Math.sqrt(1 + R2 / (dx * dx + dy * dy + 1e-6));
        const X = ringX + dx * sc;
        let Y = cy + dy * sc;
        const behind = X - ringX;
        if (behind > 0) {
          const wake = clamp((behind - ringR * 0.6) / ringR, 0, 1) * Math.exp(-behind / (ringR * 5))
            * Math.exp(-Math.pow((Y - cy) / (ringR * 1.8), 2));
          Y += wake * ringR * 0.75 * Math.sin(behind / ringR * 1.8 - t * 2.2 + (Y > cy ? 0 : Math.PI));
        }
        return [X, Y];
      };
      const inRing = (X, Y) => (X - ringX) * (X - ringX) + (Y - cy) * (Y - cy) < R2;
      // Jammed glyphs snap to a grid of text rows (one row per stream spacing), so the neck, the lobe and
      // the ring's rim read as packed lines of text; free-flowing streams stay smooth curves.
      const rh = (half * 2) / lines, top = cy - half;
      const cols = Math.ceil(W / cw), grid = new Map();
      const spray = [];
      for (let k = 0; k < lines; k++) {
        let x = cw / 2;
        while (x < W - cw / 2) {
          const [X, Y] = pt(k, x), a = pt(k, x - 1), b = pt(k, x + 1);
          const ddx = (b[0] - a[0]) / 2, ddy = (b[1] - a[1]) / 2;
          const slope = ddy / (Math.abs(ddx) < 1e-3 ? 1e-3 : ddx);
          const u = x / W, dR = Math.hypot(X - ringX, Y - cy);
          const wakeZone = X > ringX + ringR * 1.7 && Math.abs(Y - cy) < ringR * 1.6;
          const jam = !wakeZone && (core(u) > 0.5 || lobe(u) > 0.35 || dR < ringR * 1.6);
          const g = glyph(k, u, t, slope, jam, dR < ringR * 1.35);
          if (g && X > cw / 2 && X < W - cw / 2 && Y > FONT_PX / 2 && Y < H - FONT_PX / 2 && !inRing(X, Y)) {
            if (jam) {
              const c = Math.round(X / cw - 0.5), r = Math.round((Y - top) / rh - 0.5);
              const gx = (c + 0.5) * cw, gy = top + (r + 0.5) * rh;
              if (!inRing(gx, gy) && gy > FONT_PX / 2 && gy < H - FONT_PX / 2) grid.set(r * cols + c, [g[0], gx, gy, g[1]]);
            } else buckets[Math.min(5, Math.floor(g[1] * 6))].push(g[0], X, Y);
          }
          // sparse spray drifting off the lobe
          const tb = lobe(u);
          if (tb > 0.3 && hash(Math.floor(x), k, Math.floor(t * 4)) > 0.995 - tb * 0.006) {
            const sy = Y + (hash(k, Math.floor(x), 9) - 0.5) * half * 0.5;
            if (!inRing(X, sy)) spray.push('.', X, sy);
          }
          x += clamp(cw / Math.hypot(ddx, ddy), 0.02, cw * 1.2) * 1.15;
        }
      }
      grid.forEach((g) => buckets[Math.min(5, Math.floor(g[3] * 6))].push(g[0], g[1], g[2]));
      buckets[1].push(...spray);
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
    module.exports = { streamV, glyph }; // lets node render a text preview
  }
})();
