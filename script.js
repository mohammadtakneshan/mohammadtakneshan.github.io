// Theme toggle — light (09) default, dark uses template 06 tones
const themeBtn = document.getElementById('themeBtn');
const saved = localStorage.getItem('theme');
if (saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.dataset.theme = 'dark';
}
themeBtn.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = dark ? '' : 'dark';
  localStorage.setItem('theme', dark ? 'light' : 'dark');
});

// Footer year. The top-bar date is static — it marks the latest site
// update and is edited by hand in index.html (see AGENTS.md).
document.getElementById('year').textContent = new Date().getFullYear();

// Typing headline — rotates endings, liam.cv style
const words = [' meticulous detail.', ' honest measurement.', ' daily iteration.', ' quiet discipline.'];
const typedEl = document.getElementById('typed');
let w = 0, i = 0, deleting = false;
(function tick() {
  const word = words[w];
  typedEl.textContent = word.slice(0, i);
  if (!deleting && i < word.length) { i++; setTimeout(tick, 55); }
  else if (!deleting) { deleting = true; setTimeout(tick, 2200); }
  else if (i > 0) { i--; setTimeout(tick, 28); }
  else { deleting = false; w = (w + 1) % words.length; setTimeout(tick, 300); }
})();

// Dynamic island: click = expand to player, double-click = iPhone overlay.
// Single-click is delayed slightly so a double-click doesn't also toggle.
const island = document.getElementById('island');
const overlay = document.getElementById('phoneOverlay');
const topbar = document.querySelector('.topbar');
let clickTimer = null;

function setIslandOpen(open) {
  island.classList.toggle('open', open);
  topbar?.classList.toggle('player-open', open);
  island.setAttribute('aria-expanded', String(open));
}

island.addEventListener('click', () => {
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => setIslandOpen(!island.classList.contains('open')), 220);
});
island.addEventListener('dblclick', () => {
  clearTimeout(clickTimer);
  setIslandOpen(false);
  overlay.classList.add('show');
});
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) overlay.classList.remove('show');
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { overlay.classList.remove('show'); setIslandOpen(false); }
});

// ── Real audio playback for the Dynamic Island player ──
// A tiny playlist drives BOTH the island player and the iPhone overlay.
// Titles/subtitles here are the single source of truth — edit them freely.
// Tracks are royalty-free lo-fi from Pixabay (no attribution required).
// Add a `cover:` path to any track to show real album art (falls back to the
// CSS gradient when omitted). Drop the images in assets/covers/ first.
const playlist = [
  { title: 'Lofi Hip-Hop', artist: 'Lo-fi · what I’m building to', src: 'assets/audio/leberch-lofi-hip-hop.mp3', cover: 'assets/covers/lofi-hip-hop-cover.webp' },
  { title: 'Lofi Music',   artist: 'Lo-fi · what I’m reading to',  src: 'assets/audio/prettyjohn1-lofi-music.mp3', cover: 'assets/covers/lofi-music-cover.webp' },
];

const audio = document.getElementById('audio');
let trackIndex = 0;

// Both surfaces (island + phone overlay) share the same control layout, so we
// collect them once and update them together on every state change.
const titleEls = document.querySelectorAll('.pl-title, .track-t');
const artistEls = document.querySelectorAll('.pl-artist, .track-a');
const fillEls = document.querySelectorAll('.pl-scrub .fill, .scrub .fill');
const playEls = document.querySelectorAll('.pl-controls .play, .controls .play');
const scrubEls = document.querySelectorAll('.pl-scrub, .scrub');
// [current, remaining] time labels for island (.pl-scrub-row .t) and phone (.times span).
const islandTimes = document.querySelectorAll('.pl-scrub-row .t');
const phoneTimes = document.querySelectorAll('.times span');
const artEls = document.querySelectorAll('.island .art, .isl-player .art-lg, .ph-art');
const phArt = document.querySelector('.ph-art');

function fmt(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function loadTrack(index, autoplay) {
  trackIndex = (index + playlist.length) % playlist.length;
  const t = playlist[trackIndex];
  audio.src = t.src;
  titleEls.forEach(el => el.textContent = t.title);
  artistEls.forEach(el => el.textContent = t.artist);
  fillEls.forEach(el => el.style.width = '0%');
  // Reset time labels until the new track's metadata loads.
  if (islandTimes[0]) islandTimes[0].textContent = '0:00';
  if (islandTimes[1]) islandTimes[1].textContent = '0:00';
  if (phoneTimes[0]) phoneTimes[0].textContent = '0:00';
  if (phoneTimes[1]) phoneTimes[1].textContent = '0:00';
  // Default to the CSS gradient, then swap in real cover art only if the image
  // actually loads — so a missing/not-yet-added file never blanks the artwork.
  artEls.forEach(el => el.style.backgroundImage = '');
  if (phArt) phArt.classList.remove('has-cover');
  if (t.cover) {
    const img = new Image();
    img.onload = () => {
      if (playlist[trackIndex] !== t) return; // user already skipped away
      artEls.forEach(el => el.style.backgroundImage = `url('${t.cover}')`);
      if (phArt) phArt.classList.add('has-cover');
    };
    img.src = t.cover;
  }
  if (autoplay) audio.play().catch(() => {});
}

function togglePlay(e) {
  if (e) e.stopPropagation(); // don't let the click collapse the island
  if (!audio.src) loadTrack(trackIndex, false);
  if (audio.paused) audio.play().catch(() => {}); else audio.pause();
}
function nextTrack(e) { if (e) e.stopPropagation(); loadTrack(trackIndex + 1, true); }
function prevTrack(e) { if (e) e.stopPropagation(); loadTrack(trackIndex - 1, true); }

playEls.forEach(el => el.addEventListener('click', togglePlay));
document.querySelectorAll('.pl-controls .next, .controls .next').forEach(el => el.addEventListener('click', nextTrack));
document.querySelectorAll('.pl-controls .prev, .controls .prev').forEach(el => el.addEventListener('click', prevTrack));

// Click anywhere on a scrub bar to seek to that position.
scrubEls.forEach(bar => bar.addEventListener('click', (e) => {
  e.stopPropagation();
  if (!audio.duration) return;
  const rect = bar.getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
}));

// timeupdate fires ~4x/sec: feed the scrubber fill and both time labels.
audio.addEventListener('timeupdate', () => {
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  fillEls.forEach(el => el.style.width = pct + '%');
  const cur = fmt(audio.currentTime);
  const rem = '-' + fmt((audio.duration || 0) - audio.currentTime);
  if (islandTimes[0]) islandTimes[0].textContent = cur;
  if (islandTimes[1]) islandTimes[1].textContent = rem;
  if (phoneTimes[0]) phoneTimes[0].textContent = cur;
  if (phoneTimes[1]) phoneTimes[1].textContent = rem;
});

// Once metadata loads, show the actual track length before playback starts.
// timeupdate will override the right label with the remaining time once playing.
audio.addEventListener('loadedmetadata', () => {
  const total = fmt(audio.duration || 0);
  if (islandTimes[1]) islandTimes[1].textContent = total;
  if (phoneTimes[1]) phoneTimes[1].textContent = total;
});

// ── Audio-reactive visualiser: drive EQ bars + pill dots from real sound ──
// The bars used to animate on a fixed timer, so they moved even when nothing
// was playing. Now they're fed live frequency data from the Web Audio API, so
// they ONLY move while real audio is coming out — no sound, no movement.
const eqBars = document.querySelectorAll('.eq span');
const compactDots = document.querySelectorAll('.island .bars i');
let audioCtx, analyser, freqData, rafId;

function ensureAnalyser() {
  if (analyser) return true;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return false; // very old browser → keep CSS-animation fallback
  try {
    audioCtx = new Ctx();
    const source = audioCtx.createMediaElementSource(audio); // once per element
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;               // 32 frequency bins — plenty for a few bars
    analyser.smoothingTimeConstant = 0.8; // smooth, non-jittery motion
    source.connect(analyser);
    analyser.connect(audioCtx.destination); // keep audio audible
    freqData = new Uint8Array(analyser.frequencyBinCount);
    document.documentElement.classList.add('audio-reactive'); // CSS hands off to JS
    return true;
  } catch (e) { return false; }
}

function drawViz() {
  analyser.getByteFrequencyData(freqData);
  eqBars.forEach((bar, i) => {
    const v = freqData[2 + i * 3] / 255;          // sample a low-mid bin per bar
    bar.style.transform = `scaleY(${(0.3 + v * 1.1).toFixed(3)})`;
  });
  compactDots.forEach((dot, i) => {
    const v = freqData[1 + i * 2] / 255;          // sample a low-mid bin per bar
    dot.style.transform = `scaleY(${(0.4 + v * 1.1).toFixed(3)})`;
  });
  rafId = requestAnimationFrame(drawViz);
}

function startViz() {
  if (!ensureAnalyser()) return;
  if (audioCtx.state === 'suspended') audioCtx.resume(); // unlock on the play gesture
  cancelAnimationFrame(rafId);
  drawViz();
}

function stopViz() {
  cancelAnimationFrame(rafId);
  eqBars.forEach(bar => bar.style.transform = '');       // rest flat, no movement
  compactDots.forEach(dot => { dot.style.transform = ''; });
}

// Reflect play/pause in the button glyph + drive/stop the visualiser.
// When audio plays, the analyser feeds real frequency data to the bars
// (audio-reactive disables the idle CSS bounce). When paused, we drop
// audio-reactive so the pill's idle bounce animation resumes — the equalizer
// stays visibly "active" even though no sound is coming out.
audio.addEventListener('play', () => {
  document.documentElement.classList.add('playing');
  playEls.forEach(el => el.textContent = '⏸');
  startViz();
  if (analyser) document.documentElement.classList.add('audio-reactive');
});
audio.addEventListener('pause', () => {
  document.documentElement.classList.remove('playing');
  document.documentElement.classList.remove('audio-reactive');
  playEls.forEach(el => el.textContent = '▶');
  stopViz();
});
// Auto-advance to the next track when one ends.
audio.addEventListener('ended', () => loadTrack(trackIndex + 1, true));

loadTrack(0, false); // show first track's metadata without autoplaying

// Gallery: inline preview; click opens fullscreen, then arrows/swipe move slides.
const gallery = document.getElementById('gallery');
const galleryStage = document.getElementById('galleryStage');
const slides = gallery.querySelectorAll('.slide');
const dots = document.getElementById('galleryDots').querySelectorAll('button');
const galleryBack = document.getElementById('galleryBack');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');
let galleryIndex = 0;
let touchStartX = 0;
let mediaTouchStartX = 0;

function setGallery(index) {
  galleryIndex = (index + slides.length) % slides.length;
  slides.forEach((s, i) => {
    s.classList.toggle('active', i === galleryIndex);
    s.classList.toggle('passed', i < galleryIndex);
  });
  dots.forEach((d, i) => d.classList.toggle('on', i === galleryIndex));
}

function openGallery() {
  gallery.classList.add('fullscreen');
  document.body.classList.add('gallery-open');
}

function closeGallery() {
  gallery.classList.remove('fullscreen');
  document.body.classList.remove('gallery-open');
}

galleryStage.addEventListener('click', (e) => {
  if (e.target.closest('a, button')) return;
  if (!gallery.classList.contains('fullscreen')) openGallery();
});
galleryStage.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && !gallery.classList.contains('fullscreen')) {
    e.preventDefault();
    openGallery();
  }
});
galleryBack.addEventListener('click', closeGallery);
galleryPrev.addEventListener('click', () => setGallery(galleryIndex - 1));
galleryNext.addEventListener('click', () => setGallery(galleryIndex + 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => setGallery(i)));

gallery.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });
gallery.addEventListener('touchend', (e) => {
  if (!gallery.classList.contains('fullscreen')) return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 48) setGallery(galleryIndex + (dx < 0 ? 1 : -1));
}, { passive: true });

document.addEventListener('keydown', (e) => {
  if (!gallery.classList.contains('fullscreen')) return;
  if (e.key === 'Escape') closeGallery();
  if (e.key === 'ArrowLeft') setGallery(galleryIndex - 1);
  if (e.key === 'ArrowRight') setGallery(galleryIndex + 1);
});
setGallery(0);

// Recognition media viewer: click a thumbnail, then arrow/swipe through images.
const mediaViewer = document.getElementById('mediaViewer');
const mediaImage = document.getElementById('mediaImage');
const mediaCaption = document.getElementById('mediaCaption');
const mediaBack = document.getElementById('mediaBack');
const mediaPrev = document.getElementById('mediaPrev');
const mediaNext = document.getElementById('mediaNext');
const mediaThumbs = Array.from(document.querySelectorAll('.media-thumb'));
let mediaIndex = 0;

function setMedia(index) {
  mediaIndex = (index + mediaThumbs.length) % mediaThumbs.length;
  const thumb = mediaThumbs[mediaIndex];
  mediaImage.src = thumb.dataset.full;
  mediaImage.alt = thumb.querySelector('img')?.alt.replace(' thumbnail', '') || thumb.dataset.title || '';
  mediaCaption.textContent = thumb.dataset.title || mediaImage.alt;
}

function openMedia(index) {
  setMedia(index);
  mediaViewer.classList.add('show');
  mediaViewer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('media-open');
}

function closeMedia() {
  mediaViewer.classList.remove('show');
  mediaViewer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('media-open');
}

mediaThumbs.forEach((thumb, index) => thumb.addEventListener('click', () => openMedia(index)));
mediaBack.addEventListener('click', closeMedia);
mediaPrev.addEventListener('click', () => setMedia(mediaIndex - 1));
mediaNext.addEventListener('click', () => setMedia(mediaIndex + 1));
mediaViewer.addEventListener('click', (e) => {
  if (e.target === mediaViewer) closeMedia();
});
mediaViewer.addEventListener('touchstart', (e) => {
  mediaTouchStartX = e.changedTouches[0].clientX;
}, { passive: true });
mediaViewer.addEventListener('touchend', (e) => {
  if (!mediaViewer.classList.contains('show')) return;
  const dx = e.changedTouches[0].clientX - mediaTouchStartX;
  if (Math.abs(dx) > 48) setMedia(mediaIndex + (dx < 0 ? 1 : -1));
}, { passive: true });

document.addEventListener('keydown', (e) => {
  if (!mediaViewer.classList.contains('show')) return;
  if (e.key === 'Escape') closeMedia();
  if (e.key === 'ArrowLeft') setMedia(mediaIndex - 1);
  if (e.key === 'ArrowRight') setMedia(mediaIndex + 1);
});

// Avatar viewer: click profile photo to enlarge.
const avatarMark = document.getElementById('avatarMark');
const avatarViewer = document.getElementById('avatarViewer');
const avatarViewerClose = document.getElementById('avatarViewerClose');
function openAvatar() {
  avatarViewer.classList.add('show');
  avatarViewer.setAttribute('aria-hidden', 'false');
  document.body.classList.add('avatar-open');
}
function closeAvatar() {
  avatarViewer.classList.remove('show');
  avatarViewer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('avatar-open');
}
avatarMark.addEventListener('click', openAvatar);
avatarViewerClose.addEventListener('click', closeAvatar);
avatarViewer.addEventListener('click', (e) => { if (e.target === avatarViewer) closeAvatar(); });
document.addEventListener('keydown', (e) => {
  if (avatarViewer.classList.contains('show') && e.key === 'Escape') closeAvatar();
});

// Expandable descriptions: clamp Work / Projects / Research notes to 4 lines,
// revealing a Read more / Show less toggle only when the text actually overflows.
const clampTargets = document.querySelectorAll('#work .wrow .body p, #projects .wrow .body p, #research .pub .note');
clampTargets.forEach((el) => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'desc-toggle';
  btn.hidden = true;
  btn.setAttribute('aria-expanded', 'false');
  el.after(btn);

  const setExpanded = (expanded) => {
    el.classList.toggle('desc-clamped', !expanded);
    btn.textContent = expanded ? 'Show less' : 'Read more';
    btn.setAttribute('aria-expanded', String(expanded));
  };

  btn.addEventListener('click', () => setExpanded(btn.getAttribute('aria-expanded') !== 'true'));

  // Decide whether a toggle is needed for the current viewport width.
  const evaluate = () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    el.classList.remove('desc-clamped');
    const fullHeight = el.scrollHeight;
    el.classList.add('desc-clamped');
    const clampedHeight = el.clientHeight;
    const overflows = fullHeight > clampedHeight + 2;
    btn.hidden = !overflows;
    if (!overflows) {
      el.classList.remove('desc-clamped');
    } else {
      setExpanded(expanded);
    }
  };

  evaluate();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(evaluate, 150);
  });
});
