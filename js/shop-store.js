/* Revisi 83 - kartu ala Shopee (gambar inisial, nama, harga, tombol + Add).
   Revisi 79 - daftar item Revinz Store, stok otomatis dari Google Sheet.
   - Daftar langsung tampil dari data cadangan (js/store-data.js), lalu diperbarui dari Google Sheet yang diterbitkan ke web (CSV).
   - Stok 0 di sheet = item "Habis". Sel stok kosong = stok tidak dibatasi. Baris yang dihapus dari sheet = item hilang dari website.
   - Kalau Google tidak bisa dibuka atau isi sheet tidak sesuai, daftar cadangan tetap dipakai (toko tidak kosong).
   Keranjang, IGN, QR, dan WhatsApp ditangani js/revin-cart.js (file ini dimuat SEBELUM revin-cart.js). */
(function () {
  'use strict';
  var SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSSh9eFpSDyEKJBw_OXj8FGwM4Zp84lH63HX3fVr8RuZmD1moeFSb7LzUNPXiMu0PLl5HAm8DfRJBYE/pub?gid=1308764700&single=true&output=csv';
  var root = document.getElementById('st-root');
  if (!root) return;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  /* data cadangan -> bentuk umum: [{title, items:[{n, s, p, r}]}]  (s: null = tanpa batas, 0 = habis) */
  function fromBackup() {
    var d = window.GC_STORE; if (!d) return [];
    return d.map(function (c) { return { title: c.title, items: c.items.map(function (it) { return { n: it[0], s: it[1] > 0 ? it[1] : null, p: it[2], r: it[3] }; }) }; });
  }

  /* pembaca CSV (mendukung tanda kutip dan koma di dalam sel) */
  function parseCSV(text) {
    var rows = [], row = [], f = '', q = false, i, c;
    text = text.replace(/^﻿/, '');
    for (i = 0; i < text.length; i++) {
      c = text.charAt(i);
      if (q) {
        if (c === '"') { if (text.charAt(i + 1) === '"') { f += '"'; i++; } else q = false; } else f += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
      else if (c !== '\r') f += c;
    }
    if (f !== '' || row.length) { row.push(f); rows.push(row); }
    return rows;
  }
  function digits(s) { var d = String(s || '').replace(/[^0-9]/g, ''); return d === '' ? null : parseInt(d, 10); }

  function fromCSV(text) {
    var rows = parseCSV(text); if (rows.length < 2) return null;
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    function col() { for (var a = 0; a < arguments.length; a++) { var x = head.indexOf(arguments[a]); if (x >= 0) return x; } return -1; }
    /* judul kolom sheet boleh bahasa Indonesia atau Inggris */
    var iK = col('kategori', 'category'), iN = col('nama item', 'item name', 'item'), iS = col('stok', 'stock'), iP = col('harga php', 'price php', 'php'), iR = col('harga idr', 'price idr', 'idr');
    if (iK < 0 || iN < 0 || iS < 0 || iR < 0) return null;
    var cats = [], map = {};
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r], name = (row[iN] || '').trim(), idr = digits(row[iR]);
      if (!name || idr === null) continue;            // baris kosong / tanpa harga dilewati
      var title = (row[iK] || '').trim() || 'Lainnya';
      var st = (row[iS] || '').trim().toLowerCase(), s;
      if (st === '') s = null; else if (/^habis|^sold|^kosong/.test(st)) s = 0; else { s = digits(st); if (s === null) s = null; }
      if (!map[title]) { map[title] = { title: title, items: [] }; cats.push(map[title]); }
      map[title].items.push({ n: name, s: s, p: iP >= 0 ? (digits(row[iP]) || 0) : 0, r: idr });
    }
    var total = cats.reduce(function (a, c) { return a + c.items.length; }, 0);
    return total >= 10 ? cats : null;                 // terlalu sedikit = dianggap salah baca, pakai cadangan
  }

  var HUES = [38, 200, 280, 150, 340, 20, 220, 90, 310, 170, 55, 250, 10];
  function ini(n) { var w = String(n).replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean); return (w[0] || '?').slice(0, 1) + (w[1] ? w[1].slice(0, 1) : ''); }
  var cat = 'all', term = '';

  function build(data) {
    var used = {}, html = '<div class="st-tools">' +
      '<input id="st-q" class="rc-input st-search" type="search" placeholder="Search items..." autocomplete="off" aria-label="Search items" value="' + esc(term) + '">' +
      '<div class="st-chips" role="group" aria-label="Category"><button type="button" class="st-chip' + (cat === 'all' ? ' is-on' : '') + '" data-cat="all">All</button>';
    data.forEach(function (c, i) { html += '<button type="button" class="st-chip' + (String(i) === cat ? ' is-on' : '') + '" data-cat="' + i + '">' + esc(c.title) + '</button>'; });
    html += '</div></div><div id="st-list">';
    data.forEach(function (c, ci) {
      html += '<section class="st-cat" data-cat="' + ci + '"><h3 class="info__head st-cat__head">' + esc(c.title) + ' <span>' + c.items.length + (c.items.length === 1 ? ' item' : ' items') + '</span></h3><ul class="info__list rc-list">';
      c.items.forEach(function (it) {
        var id = 's-' + slug(c.title + '-' + it.n), k = 1, base = id; while (used[id]) { k++; id = base + '-' + k; } used[id] = 1;
        var out = it.s === 0, max = out ? 0 : (it.s > 0 ? it.s : 99);
        var low = (!out && it.s > 0 && it.s <= 2) ? '<i class="st-low">Only ' + it.s + ' left</i>' : '';
        html += '<li class="rc-row st-row' + (out ? ' is-out' : '') + '" data-id="' + id + '" data-name="' + esc(it.n) + '" data-price="' + it.r + '" data-php="' + it.p + '" data-max="' + max + '" data-search="' + esc(it.n.toLowerCase()) + '">' +
          '<span class="st-art" style="--h:' + HUES[ci % HUES.length] + '" aria-hidden="true"><b>' + esc(ini(it.n)) + '</b>' + low + '<small>' + esc(c.title.split(' ').slice(0, 3).join(' ')) + '</small></span>' +
          '<span class="rc-row__name">' + esc(it.n) + (out ? '<small class="st-stock st-stock--out">Sold out</small>' : (it.s > 0 ? '<small class="st-stock">Stock ' + it.s + '</small>' : '')) + '</span>' +
          '<span class="rc-row__price"></span>' +
          '<div class="rc-step"><button type="button" class="rc-step__btn" data-act="minus" aria-label="Decrease ' + esc(it.n) + '">&minus;</button><output class="rc-step__qty">0</output><button type="button" class="rc-step__btn" data-act="plus" aria-label="Increase ' + esc(it.n) + '"' + (out ? ' disabled' : '') + '>+</button></div></li>';
      });
      html += '</ul></section>';
    });
    html += '</div><p class="st-empty" id="st-empty" hidden>No items found. Try another word.</p>';
    root.innerHTML = html;
    if (cat !== 'all' && !data[parseInt(cat, 10)]) cat = 'all';
    apply();
  }

  function apply() {
    var qEl = document.getElementById('st-q'), empty = document.getElementById('st-empty'), any = false;
    var t = (qEl ? qEl.value : '').trim().toLowerCase();
    Array.prototype.forEach.call(root.querySelectorAll('.st-cat'), function (s) {
      var inCat = cat === 'all' || s.getAttribute('data-cat') === cat, shown = 0;
      Array.prototype.forEach.call(s.querySelectorAll('.st-row'), function (r) {
        var ok = inCat && (!t || r.getAttribute('data-search').indexOf(t) !== -1);
        r.hidden = !ok; if (ok) shown++;
      });
      s.hidden = shown === 0; if (shown) any = true;
    });
    if (empty) empty.hidden = any;
  }

  root.addEventListener('input', function (e) { if (e.target && e.target.id === 'st-q') { term = e.target.value; apply(); } });
  root.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.st-chip') : null; if (!b) return;
    cat = b.getAttribute('data-cat');
    Array.prototype.forEach.call(root.querySelectorAll('.st-chip'), function (c) { c.classList.toggle('is-on', c === b); });
    apply();
  });

  build(fromBackup());                                  // langsung tampil

  if (window.fetch && SHEET_URL) {                      // lalu perbarui dari Google Sheet
    fetch(SHEET_URL, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (t) {
        var data = fromCSV(t); if (!data) return;
        build(data);
        if (window.gcCartRescan) window.gcCartRescan();
      })
      .catch(function () { /* tetap pakai data cadangan */ });
  }
})();
