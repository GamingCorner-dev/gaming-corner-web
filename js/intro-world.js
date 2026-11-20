/* Revisi 66 - opening: layar Shop sementara. */
(function () {
  'use strict';
  var el = document.getElementById('gc-intro');
  if (!el) return;
  /* ===== layar Shop (sementara: dalam proses pembuatan) ===== */
  var shopBtn = el.querySelector('.gc-intro__shopbtn'), back = el.querySelector('.gc-shop__back'), shopScr = el.querySelector('.gc-intro__shop');
  function showShop(on) {
    el.classList.toggle('is-shop', on);
    shopScr.setAttribute('aria-hidden', on ? 'false' : 'true');
    try { (on ? back : el.querySelector('.gc-intro__enter')).focus({ preventScroll: true }); } catch (e) {}
  }
  if (shopBtn) shopBtn.addEventListener('click', function () { showShop(true); });
  if (back) back.addEventListener('click', function () { showShop(false); });

})();
