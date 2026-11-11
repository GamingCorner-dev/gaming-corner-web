/* Revisi 35 — ambil jumlah pengunjung dari GoatCounter lalu tampilkan di footer.
   Kalau gagal (offline, diblokir adblock, dsb.) badge tetap tersembunyi, website tidak terganggu. */
(function () {
  'use strict';
  var box = document.getElementById('gc-visitors');
  if (!box) return;
  var numEl = box.querySelector('.gc-visitors__num');
  var BASE = 'https://gamingcorner.goatcounter.com/counter/';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fetchCount(path) {
    return fetch(BASE + path + '.json', { headers: { Accept: 'application/json' } })
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

  // coba total seluruh situs, kalau tidak ada coba halaman utama
  fetchCount('TOTAL')
    .catch(function () { return fetchCount(encodeURIComponent(location.pathname)); })
    .then(show)
    .catch(function () { /* diam saja */ });
})();
