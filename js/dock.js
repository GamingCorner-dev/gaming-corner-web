/* Revisi 13 - Perilaku tombol Staff & Music di layar sentuh (HP/tablet).
   Di HP tidak ada "kursor", jadi: sentuhan pertama pada ikon yang menyelip hanya MEMBUKA ikon itu
   (yang satunya tetap menyelip); sentuhan berikutnya baru menjalankan tombolnya. Ikon menyelip lagi
   setelah beberapa detik atau saat menyentuh bagian lain layar. Di komputer (mouse) cukup hover, tanpa skrip ini. */
(function () {
  'use strict';
  if (!window.matchMedia || !matchMedia('(hover: none)').matches) return;
  var SEL = '.gc-dock .music-btn, .gc-dock .team-fab';
  var timer = 0, HOLD = 3500;

  function closeAll() {
    clearTimeout(timer);
    Array.prototype.forEach.call(document.querySelectorAll(SEL), function (b) { b.classList.remove('is-open'); });
  }
  function hold() { clearTimeout(timer); timer = setTimeout(closeAll, HOLD); }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest(SEL) : null;
    if (!btn) { closeAll(); return; }
    if (!btn.classList.contains('is-open')) {      // sentuhan pertama: buka ikon ini saja
      e.preventDefault();
      e.stopPropagation();
      closeAll();
      btn.classList.add('is-open');
      hold();
    } else {                                        // sentuhan berikutnya: tombol berjalan
      hold();
    }
  }, true);
  document.addEventListener('scroll', closeAll, { passive: true });
})();
