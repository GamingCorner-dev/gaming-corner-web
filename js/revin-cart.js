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
      var art = r.querySelector('.st-art'), ab = art && art.querySelector('b');
      catalog[r.getAttribute('data-id')] = { hue: art ? (parseInt(art.style.getPropertyValue('--h'), 10) || 38) : 38, ini: ab ? ab.textContent : '', name: r.getAttribute('data-name'), price: parseInt(r.getAttribute('data-price'), 10) || 0, php: parseInt(r.getAttribute('data-php'), 10) || 0, max: isNaN(mx) ? 99 : mx, kind: r.getAttribute('data-kind') || '' };
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
  function totals() { var c = 0, t = 0, p = 0, ok = true; ids().forEach(function (k) { c += qty[k]; t += qty[k] * catalog[k].price; p += qty[k] * catalog[k].php; if (!(catalog[k].php > 0)) ok = false; }); return { count: c, total: t, php: p, phpOk: ok }; }
  /* Currency Exchange: kind 'xbuy' (bayar Rupiah, terima PHP) atau 'xsell' (kirim PHP, terima Rupiah). Jumlah = PHP. */
  var xacct = '';   /* tujuan transfer: hanya di memori, tidak disimpan di browser */
  function xmode() { var m = ''; ids().forEach(function (k) { if (catalog[k].kind) m = catalog[k].kind; }); return m; }
  function xid() { var r = ''; ids().forEach(function (k) { if (catalog[k].kind) r = k; }); return r; }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(qty)); } catch (e) {} }

  function stepper(id, ro) {
    return ro ? '<span class="rc-ro-qty">x' + qty[id] + '</span>' :
      '<div class="rc-step"><button type="button" class="rc-step__btn" data-act="minus" aria-label="Decrease">&minus;</button><output class="rc-step__qty">' + qty[id] + '</output><button type="button" class="rc-step__btn" data-act="plus" aria-label="Increase">+</button></div>';
  }
  function lineHtml(id, ro) {
    var c = catalog[id], q = qty[id];
    if (c.kind) return '<li class="rc-row" data-id="' + id + '"><span class="rc-thumb" style="--h:38" aria-hidden="true"><b>FX</b></span><span class="rc-row__name">' + c.name + ' (PHP ' + q.toLocaleString('en-US') + ')<small class="rc-line__warn">' + (c.kind === 'xbuy' ? 'Rp ' + c.price + ' per PHP 1 (you pay)' : 'Rp ' + c.price + ' per PHP 1 (you receive)') + '</small></span><span class="rc-row__price">' + rp(c.price * q) + '<small class="rc-line__php">' + (c.kind === 'xbuy' ? 'you pay' : 'you receive') + '</small></span><span class="rc-line__ctl">' + (ro ? '' : '<button type="button" class="rc-remove" data-remove aria-label="Remove ' + c.name + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7l1 12.5h9l1-12.5"/><path d="M10 11v5M14 11v5"/></svg></button>') + '</span></li>';
    var pl = c.php ? '<small class="rc-line__php">PHP ' + (c.php * q).toLocaleString('en-US') + '</small>' : '';
    var ctl = ro ? '<span class="rc-ro-qty">x' + q + '</span>' :
      stepper(id, false) + '<button type="button" class="rc-remove" data-remove aria-label="Remove ' + c.name + '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7l1 12.5h9l1-12.5"/><path d="M10 11v5M14 11v5"/></svg></button>';
    var warn = (c.max < 99) ? '<small class="rc-line__warn' + (q >= c.max && c.max > 1 ? ' is-max' : '') + '">' + (q >= c.max && c.max > 1 ? 'Max stock reached' : 'Stock ' + c.max) + '</small>' : '';
    return '<li class="rc-row" data-id="' + id + '"><span class="rc-thumb" style="--h:' + c.hue + '" aria-hidden="true"><b>' + c.ini + '</b></span>' +
      '<span class="rc-row__name">' + c.name + warn + '</span><span class="rc-row__price">' + rp(c.price * q) + pl + '</span><span class="rc-line__ctl">' + ctl + '</span></li>';
  }

  function waLink() {
    var xm = xmode();
    if (xm) {
      var xt = totals(), xk = xid(), amt = qty[xk] || 0;
      var xmsg = xm === 'xbuy'
        ? 'Hello Revinz Store, I have made my payment.\n\nCurrency Exchange: IDR to PHP\nAmount: ' + php(amt) + '\nI paid: ' + rp(xt.total) + ' (QRIS)\nPlease send the PHP to: ' + xacct + '\n\nI will send my proof of payment in this chat.'
        : 'Hello Revinz Store, I have made my payment.\n\nCurrency Exchange: PHP to IDR\nI sent: ' + php(amt) + ' (InstaPay)\nI will receive: ' + rp(xt.total) + '\nPlease send the Rupiah to: ' + xacct + '\n\nI will send my proof of payment in this chat.';
      return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(xmsg);
    }
    var isPhp = method === 'php', t = totals();
    var lines = ids().map(function (k) {
      var it = catalog[k];
      return '- ' + it.name + ' x' + qty[k] + ' = ' + (isPhp ? php(it.php * qty[k]) : rp(it.price * qty[k]));
    });
    var msg = 'Hello Revinz Store, I have made my payment.\n\nOrder:\n' + lines.join('\n') +
      '\n\nPayment method: ' + (isPhp ? 'InstaPay (PHP)' : 'QRIS (Rupiah)') +
      '\nTotal: ' + (isPhp ? php(t.php) : rp(t.total)) +
      '\nTouch 4games IGN: ' + ign + '\n\nI will send my proof of payment in this chat.';
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
  }

  function render() {
    var t = totals();
    var xm = xmode();
    if (xm === 'xbuy') method = 'idr'; else if (xm === 'xsell') method = 'php';
    cartModal.setAttribute('data-xmode', xm);
    if (!t.phpOk && method === 'php') method = 'idr';   /* paket tanpa harga PHP (mis. Sell RC): hanya bisa bayar Rupiah */
    // baris produk di pop-up Sell RC / Sell Item
    Array.prototype.forEach.call(rows, function (r) {
      var id = r.getAttribute('data-id'), q = qty[id] || 0;
      var o = r.querySelector('.rc-step__qty'); if (o) o.textContent = q;
      var m = r.querySelector('[data-act=minus]'); if (m) m.disabled = q === 0;
      r.classList.toggle('has-q', q > 0);
      var pl = r.querySelector('[data-act=plus]'); if (pl) pl.disabled = q >= catalog[id].max;
      var pr = r.querySelector('.rc-row__price');
      if (pr && !r.closest('[data-lines]')) pr.innerHTML = rp(catalog[id].price) + (catalog[id].php ? '<small class="st-php">PHP ' + catalog[id].php.toLocaleString('en-US') + '</small>' : '');
    });
    // bar keranjang
    Array.prototype.forEach.call(document.querySelectorAll('.rc-bar'), function (b) { b.hidden = false; });
    Array.prototype.forEach.call(document.querySelectorAll('.rc-badge'), function (e) { e.textContent = t.count > 99 ? '99+' : t.count; e.hidden = t.count === 0; });
    Array.prototype.forEach.call(document.querySelectorAll('.rc-bar__total'), function (e) { e.textContent = rp(t.total); e.hidden = t.count === 0; });
    Array.prototype.forEach.call(document.querySelectorAll('.rc-count'), function (e) { e.textContent = t.count; });
    Array.prototype.forEach.call(document.querySelectorAll('.rc-total'), function (e) { e.textContent = rp(t.total); });
    Array.prototype.forEach.call(document.querySelectorAll('.rc-total-php'), function (e) { e.textContent = php(t.php); });
    Array.prototype.forEach.call(cartModal.querySelectorAll('.rc-method'), function (b) { var on = b.getAttribute('data-method') === method; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-mpane]'), function (p) { p.hidden = p.getAttribute('data-mpane') !== method; });
    // pembayaran PHP hanya bila semua isi keranjang punya harga PHP
    var phpBtn = cartModal.querySelector('.rc-method[data-method="php"]'); if (phpBtn) phpBtn.disabled = !t.phpOk && t.count > 0;
    var phpNote = cartModal.querySelector('[data-php-note]'); if (phpNote) phpNote.hidden = t.phpOk || t.count === 0;
    Array.prototype.forEach.call(cartModal.querySelectorAll('.rc-php-line, .rc-summary__row--php'), function (e) { e.hidden = !t.phpOk && t.count > 0; });
    // isi keranjang & ringkasan
    var list = ids();
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-lines]'), function (ul) {
      var ro = ul.classList.contains('rc-lines--ro');
      ul.innerHTML = list.map(function (k) { return lineHtml(k, ro); }).join('');
    });
    cartModal.classList.toggle('is-empty', list.length === 0);
    var empty = cartModal.querySelector('[data-empty]'); if (empty) empty.hidden = list.length > 0;
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-needs-items]'), function (b) { b.disabled = list.length === 0; });
    var wa = cartModal.querySelector('[data-wa]'); if (wa) wa.href = waLink();
    // Currency Exchange: ringkasan, kolom tujuan transfer
    var xk = xid(), xa = xk ? qty[xk] : 0;
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-xinfo]'), function (e) {
      e.hidden = !xm;
      if (xm) e.innerHTML = xm === 'xbuy'
        ? '<div class="rc-summary__row"><span>You pay</span><b>' + rp(t.total) + '</b></div><div class="rc-summary__row"><span>You receive</span><b>' + php(xa) + '</b></div>'
        : '<div class="rc-summary__row"><span>You send</span><b>' + php(xa) + '</b></div><div class="rc-summary__row"><span>You receive</span><b>' + rp(t.total) + '</b></div>';
    });
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-ignfield]'), function (e) { e.hidden = !!xm; });
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-xfield]'), function (e) { e.hidden = !xm; });
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-xlabel]'), function (e) { e.textContent = xm === 'xbuy' ? 'Where should we send your PHP? (e-wallet or bank name + account number)' : 'Where should we send your Rupiah? (bank or e-wallet name + account number)'; });
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-xlabel-short]'), function (e) { e.textContent = xm === 'xbuy' ? 'Send PHP to' : 'Send Rupiah to'; });
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-xacct-show]'), function (e) { e.textContent = xacct; });
    Array.prototype.forEach.call(cartModal.querySelectorAll('.rc-xline'), function (e) { e.hidden = !xm; });
    Array.prototype.forEach.call(cartModal.querySelectorAll('.rc-ignline'), function (e) { e.hidden = !!xm; });
    Array.prototype.forEach.call(cartModal.querySelectorAll('.rc-methods'), function (e) { e.hidden = !!xm; });
    Array.prototype.forEach.call(cartModal.querySelectorAll('.rc-sum'), function (e) { e.hidden = !!xm; });
    if (xm) { Array.prototype.forEach.call(cartModal.querySelectorAll('.rc-sum, .rc-php-line, .rc-summary__row--php, [data-php-note]'), function (e) { e.hidden = true; }); }
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-paylead]'), function (e) { e.textContent = xm === 'xbuy' ? 'Pay with Rupiah (QRIS).' : xm === 'xsell' ? 'Pay with PHP (InstaPay).' : 'Choose how you want to pay.'; });
    var xin = cartModal.querySelector('#rc-xacct'); if (xin && xin.value !== xacct) xin.value = xacct;
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-ign-show]'), function (e) { e.textContent = ign; });
    Array.prototype.forEach.call(cartModal.querySelectorAll('[data-needs-ign]'), function (b) { b.disabled = (xm ? xacct.length < 4 : ign.length === 0) || list.length === 0; });
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

  var xin0 = cartModal.querySelector('#rc-xacct');
  if (xin0) {
    xin0.addEventListener('input', function () { xacct = xin0.value.replace(/\s+/g, ' ').trim().slice(0, 80); render(); });
    xin0.addEventListener('keydown', function (e) { if (e.key === 'Enter' && xacct.length >= 4) { e.preventDefault(); show('pay'); } });
  }

  /* ----- halaman Currency Exchange: pilih arah, ketik jumlah PHP ----- */
  var xv = document.getElementById('v-svc-exchange'), xdir = 'xbuy';
  var xamt = xv && xv.querySelector('#xch-amt'), xadd = xv && xv.querySelector('[data-xadd]'), xcalc = xv && xv.querySelector('[data-xcalc]');
  function xval() { var n = parseInt((xamt.value || '').replace(/\D/g, ''), 10); return (n > 0 && n <= 100000) ? n : 0; }
  function xrefresh() {
    var n = xval(), c = catalog[xdir === 'xbuy' ? 'xch-buy' : 'xch-sell'];
    if (xadd) xadd.disabled = !n;
    if (!xcalc || !c) return;
    xcalc.textContent = !n ? 'Type the amount of PHP you want to exchange (1 - 100,000).'
      : (xdir === 'xbuy' ? 'You get ' + php(n) + ' and pay ' + rp(n * c.price) + ' (Rp ' + c.price + ' per PHP 1).'
                         : 'You send ' + php(n) + ' and receive ' + rp(n * c.price) + ' (Rp ' + c.price + ' per PHP 1).');
  }
  if (xv && xamt && xadd) {
    xamt.addEventListener('input', function () { xamt.value = xamt.value.replace(/\D/g, '').slice(0, 6); xrefresh(); });
    xv.addEventListener('click', function (e) {
      var d = e.target.closest ? e.target.closest('[data-xdir]') : null;
      if (d) { xdir = d.getAttribute('data-xdir'); Array.prototype.forEach.call(xv.querySelectorAll('[data-xdir]'), function (b) { var on = b === d; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); xrefresh(); }
    });
    xadd.addEventListener('click', function () {
      var n = xval(); if (!n) return;
      var others = ids().filter(function (k) { return !catalog[k].kind; });
      if (others.length && !window.confirm('Your cart has other items. Starting an exchange will replace them. Continue?')) return;
      qty = {}; qty[xdir === 'xbuy' ? 'xch-buy' : 'xch-sell'] = n; save(); render();
      var bar = xv.querySelector('.rc-bar'); if (bar) bar.click();
    });
    xrefresh();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.rc-step__btn') : null;
    if (btn) {
      var li = btn.closest('.rc-row'); if (!li) return;
      var id = li.getAttribute('data-id'), q = qty[id] || 0;
      if (btn.getAttribute('data-act') === 'plus' && xmode() && !catalog[id].kind) {
        if (!window.confirm('Your cart has a Currency Exchange order. Adding an item will replace it. Continue?')) return;
        qty = {}; q = 0;
      }
      q += btn.getAttribute('data-act') === 'plus' ? 1 : -1;
      if (q <= 0) delete qty[id]; else qty[id] = Math.min(q, catalog[id].max);
      save(); render(); return;
    }
    var rm = e.target.closest ? e.target.closest('[data-remove]') : null;
    if (rm) { var rl = rm.closest('.rc-row'); if (rl) { delete qty[rl.getAttribute('data-id')]; save(); render(); } return; }
    if (e.target.closest && e.target.closest('[data-clear]')) { qty = {}; save(); render(); return; }
    var mb = e.target.closest ? e.target.closest('.rc-method') : null;
    if (mb && cartModal.contains(mb)) { method = mb.getAttribute('data-method') === 'php' ? 'php' : 'idr'; render(); return; }
    var st = e.target.closest ? e.target.closest('[data-step]') : null;
    if (st && cartModal.contains(st) && !st.disabled) { e.preventDefault(); show(st.getAttribute('data-step')); return; }
    if (e.target.closest && e.target.closest('[data-modal="revin-cart"]')) { render(); show('cart'); }
  });

  render();
})();
