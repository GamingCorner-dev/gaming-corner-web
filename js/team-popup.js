/* Revisi 12 - Tombol "Staff" di atas tombol Music; membuka pop-up berisi susunan tim.
   Tutup dengan tombol X, klik di luar jendela, atau tombol Esc. */
(function () {
  'use strict';
  var modal = document.getElementById('team-modal');
  if (!modal) return;
  var panel = modal.querySelector('.team-modal__panel');
  var closeBtn = modal.querySelector('.team-modal__close');

  var fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'team-fab';
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.setAttribute('aria-label', 'Open staff list');
  fab.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14.6c2.6.1 4.5 1.9 4.5 4.4"/></svg>' +
    '<span class="team-fab__label">Staff</span>';
  document.body.appendChild(fab);

  var opener = null;
  function open() {
    opener = document.activeElement;
    modal.hidden = false;
    document.documentElement.classList.add('team-open');
    panel.scrollTop = 0;
    closeBtn.focus();
  }
  function close() {
    modal.hidden = true;
    document.documentElement.classList.remove('team-open');
    if (opener && opener.focus) opener.focus();
  }
  fab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {                          // fokus tetap di dalam jendela
      var f = panel.querySelectorAll('button, a[href]');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
