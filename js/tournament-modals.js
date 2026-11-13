/* Revisi 45 — membuka / menutup pop-up (VD Rules dan video VD Tournament).
   Tombol pembuka: elemen dengan atribut data-modal="ID pop-up". Penutup: tombol ×, klik area gelap, atau tombol Esc. */
(function () {
  'use strict';
  var active = null, lastFocus = null;

  function open(id, trigger) {
    var m = document.getElementById(id);
    if (!m) return;
    if (active) close();
    active = m; lastFocus = trigger || document.activeElement;
    m.hidden = false;
    document.documentElement.style.overflow = 'hidden';
    var d = m.querySelector('.gc-modal__dialog');
    if (d) { var s = m.querySelector('.gc-modal__scroll'); if (s) s.scrollTop = 0; d.focus({ preventScroll: true }); }
  }

  function close() {
    if (!active) return;
    // hentikan video yang sedang diputar di dalam pop-up
    var vids = active.querySelectorAll('video');
    for (var i = 0; i < vids.length; i++) { try { vids[i].pause(); } catch (e) {} }
    active.hidden = true;
    active = null;
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-modal]');
    if (opener) { e.preventDefault(); open(opener.getAttribute('data-modal'), opener); return; }
    if (active && e.target.closest('[data-close]')) { e.preventDefault(); close(); }
  });

  document.addEventListener('keydown', function (e) {
    if (!active) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {   // fokus tetap di dalam pop-up
      var f = active.querySelectorAll('button, a[href], video, [tabindex]:not([tabindex="-1"])');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === active.querySelector('.gc-modal__dialog'))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
