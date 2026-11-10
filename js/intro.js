/* Revisi 22 — Layar pembuka. File terpisah; main.js asli tidak diubah.
   - Tampil sekali per kunjungan (sessionStorage). Ada tombol Skip.
   - Tombol "Enter" sekaligus menyalakan musik (klik pengunjung = browser mengizinkan suara).
   - Skip masuk tanpa musik. */
(function () {
  'use strict';
  window.__gcIntro = true;
  var root = document.documentElement;
  var el = document.getElementById('gc-intro');
  if (!el) return;
  var KEY = 'gcIntroSeen';

  function closeNow() { root.classList.remove('gc-intro-on'); if (el.parentNode) el.parentNode.removeChild(el); }
  function seen() { try { sessionStorage.setItem(KEY, '1'); } catch (e) {} }

  if (!root.classList.contains('gc-intro-on')) { closeNow(); return; }

  // huruf judul
  var title = el.querySelector('.gc-intro__title');
  var words = [['GAMING', ''], ['CORNER', 'gold']];
  var n = 0;
  words.forEach(function (w, wi) {
    for (var i = 0; i < w[0].length; i++) {
      var s = document.createElement('span');
      var b = document.createElement('b'); b.textContent = w[0][i]; b.style.setProperty('--i', n); s.appendChild(b); if (w[1]) s.className = w[1];
      s.style.animationDelay = (3.2 + n * 0.07) + 's'; n++;
      title.appendChild(s);
    }
    if (wi === 0) { var sp = document.createElement('span'); sp.className = 'sp'; sp.style.animationDelay = '0s'; title.appendChild(sp); }
  });
  // titik cahaya
  var dust = el.querySelector('.gc-intro__dust');
  for (var d = 0; d < 22; d++) {
    var i = document.createElement('i');
    i.style.left = (Math.random() * 100) + '%';
    i.style.animationDelay = (Math.random() * 6) + 's';
    i.style.animationDuration = (4 + Math.random() * 4) + 's';
    dust.appendChild(i);
  }

  var enterBtn = el.querySelector('.gc-intro__enter');
  var skipBtn = el.querySelector('.gc-intro__skip');
  var leaving = false;

  // suara dentuman + desiran buatan (sintetis), hanya saat pengunjung menekan Enter
  function boom() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      var ctx = new AC(), t = ctx.currentTime;
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(36, t + 0.7);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.55, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.85);
      var len = Math.floor(ctx.sampleRate * 0.9), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      var src = ctx.createBufferSource(); src.buffer = buf;
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9;
      f.frequency.setValueAtTime(300, t + 0.25); f.frequency.exponentialRampToValueAtTime(3200, t + 1.0);
      var g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001, t + 0.2); g2.gain.exponentialRampToValueAtTime(0.28, t + 0.55); g2.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      src.connect(f); f.connect(g2); g2.connect(ctx.destination); src.start(t + 0.2);
      setTimeout(function () { ctx.close(); }, 1800);
    } catch (e) {}
  }

  function leave(withMusic) {
    if (leaving) return; leaving = true;
    seen();
    if (withMusic) {
      boom();
      var m = document.querySelector('.music-btn');
      if (m && m.getAttribute('aria-pressed') !== 'true') m.click();
    }
    el.classList.add('is-leaving');
    setTimeout(closeNow, 1500);
  }
  enterBtn.addEventListener('click', function () { leave(true); });
  skipBtn.addEventListener('click', function () { leave(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') leave(false); });

  setTimeout(function () { el.classList.add('is-ready'); try { enterBtn.focus({ preventScroll: true }); } catch (e) {} }, 4500);
})();
