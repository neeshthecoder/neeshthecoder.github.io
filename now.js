// "Listening to" player: the play button and the record both toggle the track.
// The record spins while playing and freezes at its current angle when paused (CSS animation-play-state).
(() => {
  const item = document.querySelector('[data-player]');
  if (!item) return;

  const audio = item.querySelector('audio');
  const toggles = item.querySelectorAll('.now__disc, .now__play');
  const time = item.querySelector('.now__time');
  const idleText = time.textContent;

  const fmt = s => {
    s = Math.floor(s || 0);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  const render = () => {
    const playing = !audio.paused && !audio.ended;
    item.classList.toggle('is-playing', playing);
    toggles.forEach(btn => {
      btn.setAttribute('aria-pressed', String(playing));
      btn.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} “Last Call”`);
    });
    const started = audio.currentTime > 0 && !audio.ended;
    time.textContent = started
      ? `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`
      : idleText;
  };

  toggles.forEach(btn => btn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(render);
    else audio.pause();
  }));

  ['play', 'pause', 'ended', 'timeupdate', 'loadedmetadata', 'error'].forEach(e =>
    audio.addEventListener(e, render));
})();
