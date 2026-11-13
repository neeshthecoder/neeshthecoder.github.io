// Decode effect for the name: letters cycle through symbols, then lock in left to right.
// Without JavaScript, or with reduced motion preferred, the name simply shows as-is.
(() => {
  const el = document.querySelector('[data-scramble]');
  if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const text = el.textContent.trim();
  const glyphs = '&%$#@!*?/<>{}[]=+§¶';
  const random = () => glyphs[Math.floor(Math.random() * glyphs.length)];
  const FRAME = 45;     // ms between symbol swaps
  const START = 250;    // ms before the first letter locks
  const STAGGER = 85;   // ms between letters locking

  el.style.visibility = 'hidden'; // avoid flashing the plain name before the effect starts

  const fontsReady = Promise.race([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(r => setTimeout(r, 1200)),
  ]);

  fontsReady.then(() => {
    el.setAttribute('aria-label', text);
    el.textContent = '';
    const chars = [...text].map(ch => {
      const s = document.createElement('span');
      s.className = 'scramble-char';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      el.append(s);
      return s;
    });
    // Lock each box to its final letter's width so nothing shifts while symbols cycle.
    chars.forEach(s => { s.style.width = s.getBoundingClientRect().width + 'px'; });
    chars.forEach(s => { s.classList.add('is-scrambling'); s.textContent = random(); });
    el.style.visibility = '';

    const t0 = performance.now();
    const timer = setInterval(() => {
      const elapsed = performance.now() - t0;
      let done = true;
      chars.forEach((s, i) => {
        if (elapsed >= START + i * STAGGER) {
          if (s.classList.contains('is-scrambling')) {
            s.textContent = text[i];
            s.classList.remove('is-scrambling');
          }
        } else {
          s.textContent = random();
          done = false;
        }
      });
      if (done) {
        clearInterval(timer);
        el.textContent = text; // back to plain text for copy/paste and screen readers
        el.removeAttribute('aria-label');
      }
    }, FRAME);
  });
})();
