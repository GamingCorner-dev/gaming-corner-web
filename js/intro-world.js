/* Revisi 72 - tombol SHOP di opening: transisi sama persis seperti HOME (suara boom + efek pintu),
   lalu membuka halaman Shop (shop.html). Opening ditandai sudah dilihat, supaya saat kembali ke Home opening tidak muncul lagi. */
(function () {
  'use strict';
  var el = document.getElementById('gc-intro');
  if (!el) return;
  var shopBtn = el.querySelector('.gc-intro__shopbtn');
  if (!shopBtn) return;
  var homeBtn = el.querySelector('.gc-intro__enter:not(.gc-intro__shopbtn)');
  var going = false;
  shopBtn.addEventListener('click', function () {
    if (going) return; going = true;
    try { sessionStorage.setItem('gcIntroSeen', '1'); } catch (e) {}
    document.documentElement.classList.add('gc-to-shop'); // sembunyikan landing page di balik pintu
    if (homeBtn) homeBtn.click(); // jalankan efek yang sama dengan HOME
    setTimeout(function () { window.location.href = 'shop.html'; }, homeBtn ? 1050 : 0);
  });
})();
