/* Price Negotiation: formulir kecil, lalu pesan WhatsApp terisi otomatis ke Revinz Store */
(function () {
  'use strict';
  var WA_NUMBER = '6281255424543';   /* nomor WhatsApp Revinz Store, format 62..., tanpa + dan spasi */
  var IGN_KEY = 'gcRevinIGN';
  var root = document.getElementById('v-negotiate');
  if (!root) return;
  var cat = root.querySelector('[data-neg-cat]'), item = root.querySelector('[data-neg-item]'),
      offer = root.querySelector('[data-neg-offer]'), ign = root.querySelector('[data-neg-ign]'),
      note = root.querySelector('[data-neg-note]'), send = root.querySelector('[data-neg-send]');
  try { var saved = localStorage.getItem(IGN_KEY); if (saved && !ign.value) ign.value = saved.slice(0, 40); } catch (e) {}
  function v(el) { return (el.value || '').replace(/\s+/g, ' ').trim(); }
  function update() {
    var ok = v(cat) && v(item) && v(offer) && v(ign);
    send.classList.toggle('is-disabled', !ok);
    send.setAttribute('aria-disabled', ok ? 'false' : 'true');
    if (!ok) { send.setAttribute('href', '#'); return; }
    var msg = 'Hello Revinz Store, I would like to negotiate a price.\n\nCategory: ' + v(cat) +
      '\nItem / package: ' + v(item) + '\nMy offer: ' + v(offer) + '\nTouch 4games IGN: ' + v(ign) +
      (v(note) ? '\nNote: ' + v(note) : '') + '\n\nPlease let me know if this works. Thank you!';
    send.setAttribute('href', 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg));
  }
  [cat, item, offer, ign, note].forEach(function (el) { el.addEventListener('input', update); el.addEventListener('change', update); });
  send.addEventListener('click', function (e) { if (send.classList.contains('is-disabled')) e.preventDefault(); });
  root.querySelector('[data-neg]').addEventListener('submit', function (e) { e.preventDefault(); });
  update();
})();
