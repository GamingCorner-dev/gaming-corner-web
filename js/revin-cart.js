/* Revisi 58 - keranjang belanja Revinz Store (Sell RC dan Sell Item memakai SATU keranjang).
   Alur: pilih jumlah (+/-) -> Keranjang -> Order (ringkasan) -> Bayar (QR) -> tombol WhatsApp Revinz Store.
   Tanpa server: keranjang hanya disimpan di browser pembeli. Website TIDAK tahu pembeli sudah bayar atau belum;
   Revinz Store mengecek bukti bayar lewat WhatsApp. */
(function () {
  'use strict';
  /* ===== Pengaturan (ganti saat isi asli sudah ada) ===== */
  var WA_NUMBER = '620000000000';   /* CONTOH - ganti dengan nomor WhatsApp Revinz Store, format 62..., tanpa + dan spasi */
  var STORE_KEY = 'gcRevinCart';
  var IGN_KEY = 'gcRevinIGN';

  var cartModal = document.getElementById('revin-cart');
  if (!cartModal) return;
  var rows = document.querySelectorAll('.rc-row');
  var catalog = {};
  Array.prototype.forEach.call(rows, function (r) {
    catalog[r.getAttribute('data-id')] = { name: r.getAttribute('data-name'), price: parseInt(r.getAttribute('data-price'), 10) || 0 };
  });
  var qty = {};
  try { var saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); Object.keys(saved).forEach(function (k) { if (catalog[k] && saved[k] > 0) qty[k] = saved[k]; }); } catch (e) {}

  var ign = '';
  try { ign = (localStorage.getItem(IGN_KEY) || '').slice(0, 40); } catch (e) {}
  var ignInput = cartModal.querySelector('#rc-ign');
  if (ignInput) ignInput.value = ign;

  function rp(n) { return 'Rp ' + n.toLocaleString('id-ID'); }
  function ids() { return Object.keys(qty).filter(function (k) { return qty[k] > 0; }); }
  function totals() { var c = 0, t = 0; ids().forEach(function (k) { c += qty[k]; t += qty[k] * catalog[k].price; }); return { count: c, total: t }; }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(qty)); } catch (e) {} }

  function stepper(id, ro) {
    return ro ? '<span class="rc-ro-qty">x' + qty[id] + '</span>' :
      '<div class="rc-step"><button type="button" class="rc-step__btn" data-act="minus" aria-label="Kurangi">&minus;</button><output class="rc-step__qty">' + qty[id] + '</output><button type="button" class="rc-step__btn" data-act="plus" aria-label="Tambah">+</button></div>';
  }
  function lineHtml(id, ro) {
    var c = catalog[id];
    return '<li class="rc-row" data-id="' + id + '"><span class="rc-row__name">' + c.name + '</span><span class="rc-row__price">' + rp(c.price * qty[id]) + '</span>' + stepper(id, ro) + '</li>';
  }

  function waLink() {
    var lines = ids().map(function (k) { return '- ' + catalog[k].name + ' x' + qty[k] + ' = ' + rp(catalog[k].price * qty[k]); });
    var msg = 'Halo Revinz Store, saya sudah melakukan pembayaran.\n\nPesanan:\n' + lines.join('\n') + '\n\nTotal: ' + rp(totals().total) + '\nIGN Touch 4games: ' + ign + '\n\nBukti pembayaran saya kirim di chat ini.';
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  function render() {
    var t = totals();
    // baris produk di pop-up Sell RC / Sell Item
    Array.prototype.forEach.call(rows, function (r) {
      var id = r.getAttribute('data-id'), q = qty[id] || 0;
      var o = r.querySelector('.rc-step__qty'); if (o) o.textContent = q;
      var m = r.querySelector('[data-act=minus]'); if (m) m.disabled = q === 0;
      var pr = r.querySelector('.rc-row__price'); if (pr && !r.closest('[data-lines]')) pr.textContent = rp(catalog[id].price);
    });
    // bar keranjang
    Array.prototype.forEach.call(document.querySelectorAll('.rc-bar'), function (b) { b.hidden = t.count === 0; });
    Array.prototype.forEach.call(document.querySelectorAll('.rc-count'), function (e) { e.textContent = t.count; });
    Array.prototype.forEach.call(document.querySelectorAll('.rc-total'), function (e) { e.textContent = rp(t.total); });
    // isi keranjang & ringkasan
    var list = ids();
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-lines]'), function (ul) {
      var ro = ul.classList.contains('rc-lines--ro');
      ul.innerHTML = list.map(function (k) { return lineHtml(k, ro); }).join('');
    });
    var empty = cartModal.querySelector('[data-empty]'); if (empty) empty.hidden = list.length > 0;
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-needs-items]'), function (b) { b.disabled = list.length === 0; });
    var wa = cartModal.querySelector('[data-wa]'); if (wa) wa.href = waLink();
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-ign-show]'), function (e) { e.textContent = ign; });
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-needs-ign]'), function (b) { b.disabled = ign.length === 0 || list.length === 0; });
    var clr = cartModal.querySelector('[data-clear]'); if (clr) clr.hidden = list.length === 0;
  }

  function show(step) {
    Array.prototype.forEach.call(cartModal.querySelectorAll('.rc-pane'), function (p) { p.hidden = p.getAttribute('data-pane') !== step; });
    var sc = cartModal.querySelector('.gc-modal__scroll'); if (sc) sc.scrollTop = 0;
  }

  if (ignInput) {
    ignInput.addEventListener('input', function () {
      ign = ignInput.value.replace(/\s+/g, ' ').trim().slice(0, 40);
      try { localStorage.setItem(IGN_KEY, ign); } catch (e) {}
      render();
    });
    ignInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && ign) { e.preventDefault(); show('pay'); }
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.rc-step__btn') : null;
    if (btn) {
      var li = btn.closest('.rc-row'); if (!li) return;
      var id = li.getAttribute('data-id'), q = qty[id] || 0;
      q += btn.getAttribute('data-act') === 'plus' ? 1 : -1;
      if (q <= 0) delete qty[id]; else qty[id] = Math.min(q, 99);
      save(); render(); return;
    }
    if (e.target.closest && e.target.closest('[data-clear]')) { qty = {}; save(); render(); return; }
    var st = e.target.closest ? e.target.closest('[data-step]') : null;
    if (st && cartModal.contains(st) && !st.disabled) { e.preventDefault(); show(st.getAttribute('data-step')); return; }
    if (e.target.closest && e.target.closest('[data-modal="revin-cart"]')) { render(); show('cart'); }
  });

  render();
})();
