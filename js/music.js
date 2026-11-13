/* Tombol musik latar — file terpisah, main.js asli tidak diubah.
   - Musik mati saat halaman dibuka (browser memblokir suara otomatis); pengunjung menekan tombol untuk menyalakan.
   - Musik berhenti sementara saat klip video diputar, lalu lanjut sendiri setelah klip dihentikan.
   - Volume naik/turun halus (fade). */
(function () {
  'use strict';
  var SRC = 'assets/audio/gaming-aura.mp3';
  var VOLUME = 0.4;
  try { var sv = parseFloat(localStorage.getItem('gcMusicVol')); if (sv >= 0 && sv <= 1) VOLUME = sv; } catch (e) {}
  var FADE_MS = 450;

  // Tombol Staff & Music berbagi satu "dock" di tepi kiri layar (lihat css/dock.css)
  function getDock() {
    var d = document.querySelector('.gc-dock');
    if (!d) { d = document.createElement('div'); d.className = 'gc-dock'; document.body.appendChild(d); }
    return d;
  }

  var audio = new Audio();
  audio.src = SRC;
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = 0;

  // pembungkus 'music-btn' berisi: tombol nyala/mati + pengatur volume (volume hanya terlihat saat musik menyala)
  var btn = document.createElement('div');
  btn.className = 'music-btn';
  btn.setAttribute('role', 'group');
  btn.setAttribute('aria-label', 'Background music');
  btn.setAttribute('aria-pressed', 'false');   // dipakai CSS
  var tog = document.createElement('button');
  tog.type = 'button';
  tog.className = 'music-btn__toggle';
  tog.setAttribute('aria-pressed', 'false');
  tog.setAttribute('aria-label', 'Play background music');
  tog.innerHTML =
    '<span class="music-btn__eq" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l11-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg></span>' +
    '<span class="music-btn__off" aria-hidden="true"></span>' +
    '<span class="music-btn__label">Music</span>';
  btn.appendChild(tog);
  var vol = document.createElement('div');
  vol.className = 'music-vol';
  vol.innerHTML =
    '<svg class="music-vol__ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5z"/><path class="w1" d="M15.5 9a4 4 0 0 1 0 6"/><path class="w2" d="M18.3 6.5a8 8 0 0 1 0 11"/></svg>' +
    '<input class="music-vol__range" type="range" min="0" max="100" step="1" aria-label="Music volume">';
  btn.appendChild(vol);
  getDock().appendChild(btn);
  var range = vol.querySelector('input');
  function paintVol() {
    var v = Math.round(VOLUME * 100);
    range.value = v;
    range.style.setProperty('--v', v + '%');
    vol.classList.toggle('is-muted', v === 0);
    vol.classList.toggle('is-low', v > 0 && v < 50);
  }
  paintVol();
  range.addEventListener('input', function () {
    VOLUME = range.value / 100;
    paintVol();
    clearInterval(fadeTimer);
    if (wanted && !audio.paused) audio.volume = VOLUME;
    try { localStorage.setItem('gcMusicVol', String(VOLUME)); } catch (e) {}
  });

  var wanted = false;        // pengunjung ingin musik menyala
  var pausedByVideo = false; // sedang berhenti karena klip diputar
  var fadeTimer = null;

  function fadeTo(target, done) {
    clearInterval(fadeTimer);
    var start = audio.volume, t0 = Date.now();
    fadeTimer = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / FADE_MS);
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * k));
      if (k >= 1) { clearInterval(fadeTimer); if (done) done(); }
    }, 30);
  }

  function render() {
    var on = wanted;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    tog.setAttribute('aria-pressed', on ? 'true' : 'false');
    tog.setAttribute('aria-label', on ? 'Turn background music off' : 'Play background music');
  }

  function start() {
    var p = audio.play();
    if (p && p.then) {
      p.then(function () { fadeTo(VOLUME); }).catch(function () { wanted = false; render(); });
    } else { fadeTo(VOLUME); }
  }
  function stop() {
    fadeTo(0, function () { audio.pause(); });
  }

  btn.addEventListener('click', function (e) {
    if (vol.contains(e.target)) return;   // menggeser volume tidak mematikan musik
    wanted = !wanted;
    pausedByVideo = false;
    render();
    if (wanted) start(); else stop();
  });

  // klip video diputar -> musik berhenti sementara; klip berhenti -> musik lanjut
  document.addEventListener('play', function (e) {
    if (e.target && e.target.tagName === 'VIDEO' && wanted && !audio.paused) {
      pausedByVideo = true;
      stop();
    }
  }, true);
  function videoGone(e) {
    if (e.target && e.target.tagName === 'VIDEO' && pausedByVideo && wanted) {
      pausedByVideo = false;
      start();
    }
  }
  document.addEventListener('pause', videoGone, true);
  document.addEventListener('ended', videoGone, true);

  // tab disembunyikan -> jeda; tab dibuka lagi -> lanjut
  document.addEventListener('visibilitychange', function () {
    if (!wanted || pausedByVideo) return;
    if (document.hidden) { audio.pause(); }
    else { start(); }
  });
})();
