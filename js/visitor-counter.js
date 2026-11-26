/* Revisi 35 — ambil jumlah pengunjung dari GoatCounter lalu tampilkan di footer.
   Kalau gagal (offline, diblokir adblock, dsb.) badge tetap tersembunyi, website tidak terganggu. */
(function () {
  'use strict';
  var box = document.getElementById('gc-visitors');
  if (!box) return;
  var numEl = box.querySelector('.gc-visitors__num');
  var BASE = 'https://gamingcorner.goatcounter.com/counter/';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fetchCount(path, qs) {
    return fetch(BASE + path + '.json' + (qs || ''), { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        var n = parseInt(String(d.count).replace(/[^0-9]/g, ''), 10);
        if (isNaN(n)) throw new Error('bad');
        return n;
      });
  }

  function show(n) {
    var fmt = function (v) { return v.toLocaleString('id-ID'); };
    box.hidden = false;
    numEl.textContent = fmt(reduce ? n : 0);
    requestAnimationFrame(function () { box.classList.add('is-on'); });
    if (reduce || n < 2) { numEl.textContent = fmt(n); return; }
    var start = performance.now(), dur = 1100;
    (function tick(now) {
      var t = Math.min(1, (now - start) / dur);
      numEl.textContent = fmt(Math.round(n * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  // GoatCounter menyimpan alamat halaman dengan atau tanpa garis miring di akhir, jadi semua kemungkinan
  // ditanyakan sekaligus; angka terbesar yang berhasil didapat yang ditampilkan.
  var p = location.pathname.replace(/\/+$/, '') || '/';
  var paths = ['TOTAL', encodeURIComponent(p), encodeURIComponent(p + '/')];
  if (p !== '/') paths.push(encodeURIComponent('/'));
  Promise.all(paths.map(function (x) { return fetchCount(x).catch(function () { return null; }); }))
    .then(function (list) {
      var best = null;
      list.forEach(function (n) { if (n !== null && (best === null || n > best)) best = n; });
      if (best !== null) show(best);
    })
    .catch(function () { /* diam saja */ });

  /* Revisi 96 - klik badge: pop-up rincian kunjungan (total, hari ini, 7 hari, 30 hari, Home vs Shop).
     Semua angka memakai alamat hitung publik GoatCounter yang sama dengan badge, jadi statistik GoatCounter TIDAK perlu dipublikasikan. */
  var pop = null, loaded = false;
  box.setAttribute('role', 'button');
  box.setAttribute('tabindex', '0');
  box.setAttribute('aria-haspopup', 'dialog');
  box.setAttribute('aria-expanded', 'false');
  box.setAttribute('title', 'Click for visit details');

  function two(n) { return n < 10 ? '0' + n : '' + n; }
  function ymd(d) { return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()); }
  function fmt(v) { return v === null ? '\u2013' : v.toLocaleString('id-ID'); }
  function best(paths, qs) {
    return Promise.all(paths.map(function (x) { return fetchCount(x, qs).catch(function () { return null; }); }))
      .then(function (list) { var b = null; list.forEach(function (n) { if (n !== null && (b === null || n > b)) b = n; }); return b; });
  }

  function build() {
    pop = document.createElement('div');
    pop.className = 'gc-visitors__pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Visit details');
    pop.hidden = true;
    pop.innerHTML =
      '<p class="gcv__eyebrow">Visitors</p>' +
      '<ul class="gcv__list">' +
        '<li><span>Total visits</span><b data-k="total">\u2026</b></li>' +
        '<li><span>Today</span><b data-k="today">\u2026</b></li>' +
        '<li><span>Last 7 days</span><b data-k="week">\u2026</b></li>' +
        '<li><span>Last 30 days</span><b data-k="month">\u2026</b></li>' +
      '</ul>' +
      '<p class="gcv__eyebrow gcv__eyebrow--sub">By page</p>' +
      '<ul class="gcv__list">' +
        '<li><span>Home</span><b data-k="home">\u2026</b></li>' +
        '<li><span>Shop</span><b data-k="shop">\u2026</b></li>' +
      '</ul>';
    box.appendChild(pop);
  }

  function fill() {
    if (loaded) return; loaded = true;
    var set = function (k) { return function (n) { var el = pop.querySelector('[data-k="' + k + '"]'); if (el) el.textContent = fmt(n); }; };
    var today = ymd(new Date());
    var dir = location.pathname.replace(/[^\/]*$/, '');
    var enc = encodeURIComponent;
    best(['TOTAL'], '').then(set('total'));
    best(['TOTAL'], '?start=' + today + '&end=' + today).then(set('today'));
    best(['TOTAL'], '?start=week').then(set('week'));
    best(['TOTAL'], '?start=month').then(set('month'));
    // halaman yang belum pernah dikunjungi tidak ada di GoatCounter (jawabannya error), jadi dianggap 0 selama total berhasil diambil
    var zero = function (k) { return function (n) { set(k)(n === null && total !== null ? 0 : n); }; };
    var total = null;
    best(['TOTAL'], '').then(function (n) { total = n; return Promise.all([
      best([enc(dir), enc(dir.replace(/\/$/, '') || '/'), enc(dir + 'index.html')], '').then(zero('home')),
      best([enc(dir + 'shop.html'), enc(dir + 'shop')], '').then(zero('shop'))]); });
  }

  function openPop() {
    if (!pop) build();
    pop.hidden = false; box.setAttribute('aria-expanded', 'true'); box.classList.add('is-open');
    fill();
  }
  function closePop() {
    if (!pop || pop.hidden) return;
    pop.hidden = true; box.setAttribute('aria-expanded', 'false'); box.classList.remove('is-open');
  }
  box.addEventListener('click', function (e) {
    if (pop && !pop.hidden && pop.contains(e.target)) return;
    if (pop && !pop.hidden) closePop(); else openPop();
  });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (pop && !pop.hidden) closePop(); else openPop(); }
    else if (e.key === 'Escape') { closePop(); }
  });
  document.addEventListener('click', function (e) { if (!box.contains(e.target)) closePop(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(); });
})();
