/* flow.js — rows of monospace characters streaming left to right. They funnel
   into a bottleneck, scramble into a bloom of glyphs, then settle back into rows.
   Usage: <canvas class="flow" aria-hidden="true"></canvas> + <script src="flow.js" defer></script>
   Colors come from styles.css tokens (--rule, --ink, --font-mono), so it follows light/dark mode. */
(function () {
  // ---------- tunables ----------
  const FONT_PX = 11;   // character size
  const SPEED = 7;      // flow speed, in characters per second
  const FPS = 30;

  // Where things happen, as a fraction of the canvas width.
  const FUNNEL = 0.2;     // rows start bending inward
  const NECK_IN = 0.4;    // the neck begins: everything is squeezed into one band
  const NECK_OUT = 0.53;  // the neck ends and the scramble fans out
  const BLOOM = 0.66;     // scramble has fanned back out to full height
  const RESUME = 0.79;    // rows re-form
  const NECK_H = 0.2;     // thickness of the neck, as a fraction of full height
  const NECK_SPEED = 2;   // how much faster text moves inside the neck

  const ROWS_IN = 'oooooooo0-';   // glyphs for the incoming rows (picked per run)
  const ROWS_OUT = '-------o=';   // glyphs for the re-formed rows
  const CHAOS = '00001111OOIIBCDUGERSL()()//\\\\||{}<>;:.,\'%#@'.split('');

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

  // Envelope (1 = full height): a rounded shoulder in, a straight
  // channel of constant thickness (the neck), then a straight cone out.
  function envelope(u) {
    if (u <= FUNNEL || u >= BLOOM) return 1;
    if (u < NECK_IN) {
      const s = (u - FUNNEL) / (NECK_IN - FUNNEL);
      return NECK_H + (1 - NECK_H) * Math.pow(Math.cos(s * Math.PI / 2), 0.75);
    }
    if (u <= NECK_OUT) return NECK_H;
    return NECK_H + (1 - NECK_H) * Math.pow((u - NECK_OUT) / (BLOOM - NECK_OUT), 0.85);
  }
  const dEnvelope = (u) => (envelope(u + 0.002) - envelope(u - 0.002)) / 0.004;

  // One character of an orderly row. `line` is which stream this cell belongs to.
  function stream(c, line, u, y0, t, glyphs, aspect) {
    const ph = hash(line, 3, 7);
    const x = c - t * SPEED * (0.7 + 0.6 * ph) + ph * 97;
    const len = 6 + Math.floor(ph * 7);
    const run = Math.floor(x / len);
    const hr = hash(run, line, 1);
    if (hr > 0.93) return null;                                  // a gap in the row
    if (hr > 0.55 && Math.floor(x) - run * len === 0) return null; // one-cell break between runs
    const pulse = Math.pow(0.5 + 0.5 * Math.sin(u * 7 - t * 1.3 + line * 0.6), 6);
    const slope = y0 * dEnvelope(u) * aspect;                    // on-screen dy/dx
    let ch, b = 0.3 + 0.3 * pulse;
    if (Math.abs(slope) > 2.2) { ch = '|'; b += 0.25; }
    else if (slope > 0.38) { ch = '\\'; b += 0.2; }
    else if (slope < -0.38) { ch = '/'; b += 0.2; }
    else ch = glyphs[Math.floor(hash(run, line, 2) * glyphs.length)];
    return [ch, clamp(b, 0, 1)];
  }

  // Returns [char, brightness 0..1] or null for the cell at column c, row r.
  function cell(c, r, cols, rows, t, aspect) {
    const u = (c + 0.5) / cols, v = (r + 0.5) / rows * 2 - 1;

    // the cone's edge breathes a little so the bloom never looks ruled
    const cone = smooth(NECK_OUT, NECK_OUT + 0.04, u) * (1 - smooth(BLOOM - 0.02, BLOOM + 0.05, u));
    const w = envelope(u) * (1 + cone * 0.16 * noise(u * 11 - t * 0.35, v * 2.5, t * 0.3));
    const y0 = v / w;
    if (Math.abs(y0) > 1) return null;

    const resumeAt = RESUME + (hash(r, 11, 5) - 0.5) * 0.08;     // each row re-forms at its own spot
    if (u >= resumeAt) return stream(c, r, u, 0, t, ROWS_OUT, aspect);

    // scramble: clumps of glyphs that drift downstream and flicker
    const mixIn = smooth(NECK_IN - 0.045, NECK_IN + 0.01, u);
    if (mixIn > 0) {
      // the neck itself: a packed, brighter, faster band that carries a little way into the bloom
      const band = Math.abs(v) < NECK_H * 1.05
        ? smooth(NECK_IN - 0.02, NECK_IN + 0.01, u) * (1 - smooth(NECK_OUT, NECK_OUT + 0.07, u)) : 0;
      const ph = hash(r, 9, 2);
      const xs = c - Math.floor(t * SPEED * (0.35 + 0.75 * ph) * (band > 0.5 ? NECK_SPEED : 1));
      const n = noise(xs * 0.42, r * 1.37, t * 0.12) * 0.5 + 0.5;
      const fadeOut = 1 - smooth(resumeAt - 0.03, resumeAt, u);
      let density = mixIn * fadeOut * (0.68 - 0.12 * y0 * y0);
      density += band * (0.84 - density);
      if (n < density) {
        const flick = Math.floor(t * 1.6 + hash(xs, r, 3) * 9);
        const ch = CHAOS[Math.floor(hash(xs, r, flick) * CHAOS.length)];
        return [ch, clamp(0.38 + 0.4 * hash(xs, r, 4) + 0.35 * band, 0, 1)];
      }
      if (u > NECK_IN + 0.02 || hash(c, r, 6) < mixIn) return null;
    }

    const line = Math.min(rows - 1, Math.floor((y0 + 1) / 2 * rows));
    return stream(c, line, u, y0, t, ROWS_IN, aspect);
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
      const aspect = (rows * rh / 2) / (cols * cw);
      const buckets = palette.map(() => []);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const res = cell(c, r, cols, rows, t, aspect);
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
