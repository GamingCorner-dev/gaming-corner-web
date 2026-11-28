/* Price Negotiation: formulir kecil, lalu pesan WhatsApp terisi otomatis ke Revinz Store */
(function () {
  'use strict';
  var WA_NUMBER = '6281255424543';   /* nomor WhatsApp Revinz Store, format 62..., tanpa + dan spasi */
  var IGN_KEY = 'gcRevinIGN';
  var root = document.getElementById('v-negotiate');
  if (!root) return;
  var cat = root.querySelector('[data-neg-cat]'), item = root.querySelector('[data-neg-item]'),
      offer = root.querySelector('[data-neg-offer]'), ign = root.querySelector('[data-neg-ign]'),
      note = root.querySelector('[data-neg-note]'), send = root.querySelector('[data-neg-send]'),
      sel = root.querySelector('[data-neg-sel]');
  var SOURCES = { 'Sell Items': '#st-root', 'Sell RC': '#v-svc-rc', 'Push VIP Service': '#v-svc-vip', 'Direct Top Up Service': '#v-svc-topup' };
  function money(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }
  function el(tag, text, attrs) { var e = document.createElement(tag); if (text) e.textContent = text; Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); return e; }
  function rowOpt(r) {
    var name = r.getAttribute('data-name') || '', price = r.getAttribute('data-price');
    return el('option', name + (price && +price ? '  \u2014  ' + money(price) : '') + (r.classList.contains('is-out') ? '  (out of stock)' : ''), { value: name, 'data-price': price || '' });
  }
  /* isi pilihan item dari daftar yang sudah ada di halaman (selalu ikut data terbaru) */
  function fillItems() {
    sel.innerHTML = '';
    var c = v(cat), src = SOURCES[c] && document.querySelector(SOURCES[c]);
    if (!c || !src) { sel.appendChild(el('option', 'Choose a category first', { value: '' })); sel.disabled = true; item.hidden = true; return; }
    sel.appendChild(el('option', 'Choose one', { value: '' }));
    var cats = src.querySelectorAll('.st-cat');
    if (cats.length) {
      Array.prototype.forEach.call(cats, function (s) {
        var h = s.querySelector('.st-cat__head'), title = h ? (h.firstChild ? h.firstChild.textContent : h.textContent).trim() : 'Items';
        var g = el('optgroup', '', { label: title });
        Array.prototype.forEach.call(s.querySelectorAll('.rc-row'), function (r) { g.appendChild(rowOpt(r)); });
        if (g.children.length) sel.appendChild(g);
      });
    } else {
      Array.prototype.forEach.call(src.querySelectorAll('.rc-row'), function (r) { sel.appendChild(rowOpt(r)); });
    }
    sel.appendChild(el('option', 'Other (type it)', { value: '__other' }));
    sel.disabled = false; item.hidden = true; item.value = '';
  }
  function itemText() {
    if (sel.value === '__other') return v(item);
    if (!sel.value) return '';
    var o = sel.options[sel.selectedIndex], p = o && o.getAttribute('data-price');
    return sel.value + (p && +p ? ' (listed price: ' + money(p) + ')' : '');
  }
  try { var saved = localStorage.getItem(IGN_KEY); if (saved && !ign.value) ign.value = saved.slice(0, 40); } catch (e) {}
  function v(el) { return (el.value || '').replace(/\s+/g, ' ').trim(); }
  function update() {
    var ok = v(cat) && itemText() && v(offer) && v(ign);
    send.classList.toggle('is-disabled', !ok);
    send.setAttribute('aria-disabled', ok ? 'false' : 'true');
    if (!ok) { send.setAttribute('href', '#'); return; }
    var msg = 'Hello Revinz Store, I would like to negotiate a price.\n\nCategory: ' + v(cat) +
      '\nItem / package: ' + itemText() + '\nMy offer: ' + v(offer) + '\nTouch 4games IGN: ' + v(ign) +
      (v(note) ? '\nNote: ' + v(note) : '') + '\n\nPlease let me know if this works. Thank you!';
    send.setAttribute('href', 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg));
  }
  cat.addEventListener('change', function () { fillItems(); update(); });
  sel.addEventListener('change', function () { item.hidden = sel.value !== '__other'; if (!item.hidden) item.focus(); update(); });
  [cat, item, offer, ign, note].forEach(function (el) { el.addEventListener('input', update); el.addEventListener('change', update); });
  send.addEventListener('click', function (e) { if (send.classList.contains('is-disabled')) e.preventDefault(); });
  root.querySelector('[data-neg]').addEventListener('submit', function (e) { e.preventDefault(); });
  fillItems(); update();
})();
