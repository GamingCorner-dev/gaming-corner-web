/* Revisi 71 - tombol SHOP di opening membuka halaman Shop (shop.html).
   Opening ditandai sudah dilihat, supaya saat pengunjung kembali ke Home dari halaman Shop, opening tidak muncul lagi. */
(function () {
  'use strict';
  var el = document.getElementById('gc-intro');
  if (!el) return;
  var shopBtn = el.querySelector('.gc-intro__shopbtn');
  if (!shopBtn) return;
  shopBtn.addEventListener('click', function () {
    try { sessionStorage.setItem('gcIntroSeen', '1'); } catch (e) {}
    window.location.href = 'shop.html';
  });
})();
