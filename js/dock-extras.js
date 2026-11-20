/* Revisi 52 - tombol baru di tepi kiri: "Sponsorship" (Top up sekarang ada di halaman Shop) (di atas Staff dan Music).
   Memakai gaya & perilaku dock yang sama dengan Staff (menyelip, keluar saat hover/sentuh) dan
   membuka pop-up lewat js/tournament-modals.js (atribut data-modal). */
(function () {
  'use strict';
  var dock = document.querySelector('.gc-dock');
  if (!dock) return;
  var first = dock.firstChild;   // Staff

  function make(cls, modal, label, aria, svg) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'team-fab ' + cls;
    b.setAttribute('data-modal', modal);
    b.setAttribute('aria-haspopup', 'dialog');
    b.setAttribute('aria-label', aria);
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + svg + '</svg>' +
      '<span class="team-fab__label">' + label + '</span>';
    dock.insertBefore(b, first);
  }
  // urutan dari atas: Sponsorship, Staff, Music
  make('team-fab--sponsor', 'sponsor-modal', 'Sponsorship', 'Open sponsorship info',
    '<path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>');

  // tombol di dalam pop-up yang mengarah ke bagian halaman (mis. "Hubungi kami" -> QR WhatsApp di Contact):
  // pop-up ditutup, lalu halaman bergulir halus ke bagian tersebut
  document.addEventListener('click', function (e) {
    var g = e.target.closest ? e.target.closest('[data-goto]') : null;
    if (!g) return;
    var target = document.querySelector(g.getAttribute('data-goto'));
    if (!target) return;
    e.preventDefault();
    var m = g.closest('.gc-modal');
    var x = m && m.querySelector('.gc-modal__close');
    if (x) x.click();
    setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
  });
})();
