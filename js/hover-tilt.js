/* Revisi 7 - Banner & kotak bergerak mengikuti cursor (pasangan dari css/hover-tilt.css). */
(function () {
  'use strict';
  var mm = window.matchMedia;
  if (!mm || !mm('(hover: hover) and (pointer: fine)').matches) return;       // hanya perangkat dengan mouse
  if (mm('(prefers-reduced-motion: reduce)').matches) return;                // hormati "kurangi gerakan"

  var SEL = '.hero__panel, .banner-strip__frame, .card, .clip, .partner__art, .donor, .qr-card, .cta';
  var MARGIN = 8;                 // toleransi (px) di luar tepi sebelum kotak dilepas, mencegah berkedip di tepi
  var cur = null;                 // kotak yang sedang aktif
  var rest = null;                // posisi kotak saat diam (acuan, tidak ikut miring)
  var lastX = 0, lastY = 0, raf = 0;

  function maxTilt(el, w) {
    if (el.classList.contains('banner-strip__frame')) return 3.2;
    if (w > 760) return 1.8;      // kotak sangat lebar: miringnya tipis
    if (w > 420) return 3.6;
    return 6.5;                   // kotak kecil: miringnya lebih terasa
  }

  function engage(el) {
    cur = el;
    var r = el.getBoundingClientRect();
    rest = { left: r.left, top: r.top, width: r.width, height: r.height };
    el.classList.add('gc-tilt');
  }

  function release() {
    if (!cur) return;
    var el = cur;
    cur = null; rest = null;
    el.classList.remove('gc-tilt');
    el.style.removeProperty('--gc-rx');
    el.style.removeProperty('--gc-ry');
    el.style.removeProperty('--gc-px');
    el.style.removeProperty('--gc-py');
  }

  function apply() {
    raf = 0;
    if (!cur) return;
    var px = (lastX - rest.left) / rest.width - 0.5;    // -0.5 .. 0.5
    var py = (lastY - rest.top) / rest.height - 0.5;
    px = Math.max(-0.5, Math.min(0.5, px));
    py = Math.max(-0.5, Math.min(0.5, py));
    var m = maxTilt(cur, rest.width);
    cur.style.setProperty('--gc-rx', (-py * 2 * m).toFixed(2) + 'deg');
    cur.style.setProperty('--gc-ry', (px * 2 * m).toFixed(2) + 'deg');
    cur.style.setProperty('--gc-px', (px * 2).toFixed(3));
    cur.style.setProperty('--gc-py', (py * 2).toFixed(3));
  }

  function onMove(e) {
    lastX = e.clientX; lastY = e.clientY;
    if (cur) {
      // dilepas hanya jika cursor benar-benar keluar dari posisi diam kotak (+ toleransi)
      if (lastX < rest.left - MARGIN || lastX > rest.left + rest.width + MARGIN ||
          lastY < rest.top - MARGIN || lastY > rest.top + rest.height + MARGIN) {
        release();
      }
    }
    if (!cur) {
      var t = e.target && e.target.closest ? e.target.closest(SEL) : null;
      if (t && t.classList.contains('roblox__item')) t = null;   // kotak Roblox diam; yang bergerak hanya karakternya (revisi 11)
      if (t && t.getBoundingClientRect().height > 0 && getComputedStyle(t).opacity > 0.6) engage(t);
    }
    if (cur && !raf) raf = requestAnimationFrame(apply);
  }

  document.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') onMove(e); }, { passive: true });
  document.documentElement.addEventListener('mouseleave', release);
  window.addEventListener('scroll', release, { passive: true });   // posisi acuan jadi tidak valid saat scroll
  window.addEventListener('blur', release);
})();
