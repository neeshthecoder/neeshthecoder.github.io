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

  // Envelope (half-height of the stream bundle, 1 = full height):
  // full height on the left, a long smooth funnel into a wide dense neck,
  // a quick flare back to full height, then a loose turbulent lobe that settles into calm lines.
  const NECK_W = 0.4;
  const width = (u) => 1 - (1 - NECK_W) * Math.pow(smooth(0.18, 0.46, u), 1.6) * (1 - smooth(0.57, 0.67, u));
  const dWidth = (u) => (width(u + 0.002) - width(u - 0.002)) / 0.004;
  const turbulence = (u) => smooth(0.42, 0.52, u) * (1 - smooth(0.72, 0.88, u));
  const core = (u) => smooth(0.42, 0.47, u) * (1 - smooth(0.56, 0.62, u)); // the dense jammed block in the neck

  const CALM = ['-', '-', '-', '=', '-', '~'];
  const CHAOS = '()/\\|{}<>~^*%#@0o.:;\'`"_'.split('');

  // Vertical position (v, -1..1) of stream `k` of `lines` at horizontal position u (0..1).
  function streamV(k, lines, u, t) {
    const y0 = ((k + 0.5) / lines) * 2 - 1;
    const tb = turbulence(u);
    return y0 * width(u) + tb * 0.22 * noise(u * 6 - t * 0.8, y0 * 3 + k * 0.37, t * 0.3);
  }

  // Glyph for stream `k` at u, given its on-screen slope (dy/dx): [char, brightness 0..1] or null for a gap.
  function glyph(k, u, t, slope) {
    const tb = turbulence(u), cr = core(u);
    const phase = hash(k, 3, 7);
    // near-continuous streams with short gaps that travel along them; gaps widen in the turbulence
    const dash = fract(u * (40 + phase * 30) - t * SPEED * (0.8 + phase * 0.5) * 4 + phase);
    if (dash > 0.95 - tb * 0.35) return null;
    const cellU = Math.floor(u * 500);
    // the lobe after the neck is loose and broken up
    if (hash(cellU, k, Math.floor(t * 5 + phase * 7)) < (tb - cr) * 0.45) return null;

    const pulse = Math.pow(0.5 + 0.5 * Math.sin((u * 6 - t * SPEED * 6) + k * 0.7), 6);
    let b = clamp(0.5 + 0.2 * cr + 0.3 * pulse, 0, 1);
    if (hash(cellU, k + 11, Math.floor(t * 6 + phase * 9)) < cr * 0.7 + tb * 0.35)
      return [CHAOS[Math.floor(hash(cellU, k, Math.floor(t * 3)) * CHAOS.length)], b * 0.9];
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
    let W = 0, H = 0, cw = 0, lines = 0, half = 0, palette = [], raf = 0, last = 0, visible = true;
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
      draw(performance.now());
    }
    // Each stream is traced as a curve: glyphs are spaced about one character apart along its length
    // (not snapped to a row grid), so steep parts stay thin.
    function draw(now) {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      if (!lines || W < cw * 4) return;
      const buckets = palette.map(() => []);
      const yOf = (k, x) => H / 2 + streamV(k, lines, x / W, t) * half;
      const spray = [];
      for (let k = 0; k < lines; k++) {
        let x = cw / 2;
        while (x < W - cw / 2) {
          const y = yOf(k, x), slope = (yOf(k, x + 1) - yOf(k, x - 1)) / 2;
          const g = glyph(k, x / W, t, slope);
          if (g && y > FONT_PX / 2 && y < H - FONT_PX / 2) buckets[Math.min(5, Math.floor(g[1] * 6))].push(g[0], x, y);
          // sparse spray drifting off the turbulent streams
          const tb = turbulence(x / W);
          if (tb > 0.3 && hash(Math.floor(x), k, Math.floor(t * 4)) > 0.995 - tb * 0.006)
            spray.push('.', x, y + (hash(k, Math.floor(x), 9) - 0.5) * half * 0.5);
          x += Math.max(cw / Math.sqrt(1 + slope * slope), cw * 0.3) * 1.15;
        }
      }
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
