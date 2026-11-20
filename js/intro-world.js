/* Revisi 74 - tombol SHOP di opening langsung membuka halaman Shop (shop.html): tanpa efek pintu, tanpa suara, tanpa layar hitam.
   File Shop diambil lebih dulu di latar belakang supaya terbuka cepat. Opening ditandai sudah dilihat. */
(function () {
  'use strict';
  var el = document.getElementById('gc-intro');
  if (!el) return;
  var shopBtn = el.querySelector('.gc-intro__shopbtn');
  if (!shopBtn) return;
  ['shop.html', 'css/shop-inline.css', 'css/shop-page.css', 'js/shop-page.js', 'js/revin-cart.js'].forEach(function (u) {
    var l = document.createElement('link'); l.rel = 'prefetch'; l.href = u; document.head.appendChild(l);
  });
  shopBtn.addEventListener('click', function () {
    try { sessionStorage.setItem('gcIntroSeen', '1'); } catch (e) {}
    window.location.href = 'shop.html';
  });
})();
