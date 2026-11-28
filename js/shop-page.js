/* Halaman Shop: berpindah antar tampilan (game -> store -> daftar -> keranjang) di halaman yang sama, tanpa pop-up. */
(function () {
  'use strict';
  var views = document.querySelectorAll('.sv');
  function go(id) {
    Array.prototype.forEach.call(views, function (v) { v.hidden = v.id !== id; });
    document.documentElement.style.overflow = ''; document.body.classList.remove('cart-open');   /* pindah tampilan selalu membebaskan scroll */
    var t = document.getElementById(id); if (t) { var y = t.getBoundingClientRect().top + window.pageYOffset - 100; window.scrollTo({ top: Math.max(0, Math.min(y, window.pageYOffset)), behavior: 'smooth' }); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-go]') : null;
    if (!b) return;
    e.preventDefault(); go(b.getAttribute('data-go'));
  });
})();
