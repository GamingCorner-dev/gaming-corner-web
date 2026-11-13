/* Revisi 52 - dua tombol baru di tepi kiri: "Top up" dan "Sponsorship" (di atas Staff dan Music).
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
  // urutan dari atas: Top up, Sponsorship, Staff, Music
  make('team-fab--topup', 'topup-modal', 'Top up', 'Open top up info',
    '<circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.3c-.5-.8-1.4-1.3-2.6-1.3-1.5 0-2.6.8-2.6 1.9 0 2.8 5.2 1.3 5.2 4 0 1.2-1.1 2-2.7 2-1.3 0-2.3-.5-2.8-1.5"/><path d="M12 6.3V8m0 8v1.7"/>');
  make('team-fab--sponsor', 'sponsor-modal', 'Sponsorship', 'Open sponsorship info',
    '<path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>');
})();
