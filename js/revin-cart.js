/* Revisi 58 - keranjang belanja Revinz Store (Sell RC dan Sell Item memakai SATU keranjang).
   Alur: pilih jumlah (+/-) -> Keranjang -> Order (ringkasan) -> Bayar (QR) -> tombol WhatsApp Revinz Store.
   Tanpa server: keranjang hanya disimpan di browser pembeli. Website TIDAK tahu pembeli sudah bayar atau belum;
   Revinz Store mengecek bukti bayar lewat WhatsApp. */
(function () {
  'use strict';
  /* ===== Pengaturan (ganti saat isi asli sudah ada) ===== */
  var WA_NUMBER = '6281255424543';   /* nomor WhatsApp Revinz Store, format 62..., tanpa + dan spasi */
  var STORE_KEY = 'gcRevinCart';
  var IGN_KEY = 'gcRevinIGN';

  var cartModal = document.getElementById('revin-cart');
  if (!cartModal) return;
  var rows = [], catalog = {}, qty = {};
  /* baca ulang daftar item di halaman (dipanggil juga saat daftar diperbarui dari Google Sheet) */
  function scan() {
    rows = document.querySelectorAll('.rc-list .rc-row');
    catalog = {};
    Array.prototype.forEach.call(rows, function (r) {
      var mx = parseInt(r.getAttribute('data-max'), 10);
      catalog[r.getAttribute('data-id')] = { name: r.getAttribute('data-name'), price: parseInt(r.getAttribute('data-price'), 10) || 0, php: parseInt(r.getAttribute('data-php'), 10) || 0, max: isNaN(mx) ? 99 : mx };
    });
  }
  /* buang dari keranjang item yang sudah tidak ada / habis, dan batasi jumlah sesuai stok */
  function prune() {
    Object.keys(qty).forEach(function (k) {
      if (!catalog[k] || !(qty[k] > 0) || catalog[k].max <= 0) delete qty[k];
      else qty[k] = Math.min(qty[k], catalog[k].max);
    });
  }
  try { qty = JSON.parse(localStorage.getItem(STORE_KEY) || '{}') || {}; } catch (e) { qty = {}; }
  scan(); prune();
  window.gcCartRescan = function () { scan(); prune(); save(); render(); };

  var method = 'idr';   /* 'idr' = QRIS (Rupiah), 'php' = InstaPay (PHP) */
  var ign = '';
  try { ign = (localStorage.getItem(IGN_KEY) || '').slice(0, 40); } catch (e) {}
  var ignInput = cartModal.querySelector('#rc-ign');
  if (ignInput) ignInput.value = ign;

  function rp(n) { return 'Rp ' + n.toLocaleString('id-ID'); }
  function php(n) { return 'PHP ' + n.toLocaleString('en-US'); }
  function ids() { return Object.keys(qty).filter(function (k) { return qty[k] > 0; }); }
  function totals() { var c = 0, t = 0, p = 0; ids().forEach(function (k) { c += qty[k]; t += qty[k] * catalog[k].price; p += qty[k] * catalog[k].php; }); return { count: c, total: t, php: p }; }
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
    var isPhp = method === 'php', t = totals();
    var lines = ids().map(function (k) {
      var it = catalog[k];
      return '- ' + it.name + ' x' + qty[k] + ' = ' + (isPhp ? php(it.php * qty[k]) : rp(it.price * qty[k]));
    });
    var msg = 'Halo Revinz Store, saya sudah melakukan pembayaran.\n\nPesanan:\n' + lines.join('\n') +
      '\n\nMetode pembayaran: ' + (isPhp ? 'InstaPay (PHP)' : 'QRIS (Rupiah)') +
      '\nTotal: ' + (isPhp ? php(t.php) : rp(t.total)) +
      '\nIGN Touch 4games: ' + ign + '\n\nBukti pembayaran saya kirim di chat ini.';
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  function render() {
    var t = totals();
    // baris produk di pop-up Sell RC / Sell Item
    Array.prototype.forEach.call(rows, function (r) {
      var id = r.getAttribute('data-id'), q = qty[id] || 0;
      var o = r.querySelector('.rc-step__qty'); if (o) o.textContent = q;
      var m = r.querySelector('[data-act=minus]'); if (m) m.disabled = q === 0;
      var pl = r.querySelector('[data-act=plus]'); if (pl) pl.disabled = q >= catalog[id].max;
      var pr = r.querySelector('.rc-row__price');
      if (pr && !r.closest('[data-lines]')) pr.innerHTML = rp(catalog[id].price) + (catalog[id].php ? '<small class="st-php">PHP ' + catalog[id].php.toLocaleString('en-US') + '</small>' : '');
    });
    // bar keranjang
    Array.prototype.forEach.call(document.querySelectorAll('.rc-bar'), function (b) { b.hidden = t.count === 0; });
    Array.prototype.forEach.call(document.querySelectorAll('.rc-count'), function (e) { e.textContent = t.count; });
    Array.prototype.forEach.call(document.querySelectorAll('.rc-total'), function (e) { e.textContent = rp(t.total); });
    Array.prototype.forEach.call(document.querySelectorAll('.rc-total-php'), function (e) { e.textContent = php(t.php); });
    Array.prototype.forEach.call(cartModal.querySelectorAll('.rc-method'), function (b) { var on = b.getAttribute('data-method') === method; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-mpane]'), function (p) { p.hidden = p.getAttribute('data-mpane') !== method; });
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
      if (q <= 0) delete qty[id]; else qty[id] = Math.min(q, catalog[id].max);
      save(); render(); return;
    }
    if (e.target.closest && e.target.closest('[data-clear]')) { qty = {}; save(); render(); return; }
    var mb = e.target.closest ? e.target.closest('.rc-method') : null;
    if (mb && cartModal.contains(mb)) { method = mb.getAttribute('data-method') === 'php' ? 'php' : 'idr'; render(); return; }
    var st = e.target.closest ? e.target.closest('[data-step]') : null;
    if (st && cartModal.contains(st) && !st.disabled) { e.preventDefault(); show(st.getAttribute('data-step')); return; }
    if (e.target.closest && e.target.closest('[data-modal="revin-cart"]')) { render(); show('cart'); }
  });

  render();
})();
