/* Tombol musik latar — file terpisah, main.js asli tidak diubah.
   - Musik mati saat halaman dibuka (browser memblokir suara otomatis); pengunjung menekan tombol untuk menyalakan.
   - Musik berhenti sementara saat klip video diputar, lalu lanjut sendiri setelah klip dihentikan.
   - Volume naik/turun halus (fade). */
(function () {
  'use strict';
  var SRC = 'assets/audio/gaming-aura.mp3';
  var VOLUME = 0.4;
  var FADE_MS = 450;

  var audio = new Audio();
  audio.src = SRC;
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = 0;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'music-btn';
  btn.setAttribute('aria-pressed', 'false');
  btn.setAttribute('aria-label', 'Play background music');
  btn.innerHTML =
    '<span class="music-btn__eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
    '<span class="music-btn__off" aria-hidden="true"></span>' +
    '<span class="music-btn__label">Music</span>';
  document.body.appendChild(btn);

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
    btn.setAttribute('aria-label', on ? 'Turn background music off' : 'Play background music');
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

  btn.addEventListener('click', function () {
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
