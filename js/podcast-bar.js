/* Revisi 42 — Bar podcast Spotify di bawah layar.
   - Muncul setelah layar pembuka selesai (atau langsung kalau layar pembuka tidak tampil).
   - Pemutar Spotify baru dimuat saat bar pertama kali tampil (tidak membebani layar pembuka).
   - Tombol "Podcast" melipat/membuka bar; saat dilipat, iframe tetap ada sehingga podcast tetap jalan.
   - Episode diambil dari atribut data-episodes pada <aside id="gc-pod"> di index.html (ID episode Spotify, dipisah koma, urut dari Episode 1).
   Tombol ◀ ▶ mengganti episode di pemutar yang sama; setelah berganti, pengunjung menekan play. */
(function () {
  'use strict';
  var bar = document.getElementById('gc-pod');
  if (!bar) return;
  var root = document.documentElement;
  var tab = bar.querySelector('.gc-pod__tab');
  var frame = bar.querySelector('.gc-pod__frame');
  var shown = false;

  var episodes = (bar.getAttribute('data-episodes') || '').split(',').map(function (x) { return x.trim(); }).filter(function (x) { return /^[A-Za-z0-9]+$/.test(x); });
  var idx = 0;
  var nav = bar.querySelector('.gc-pod__nav');
  var prevBtn = bar.querySelector('.gc-pod__prev');
  var nextBtn = bar.querySelector('.gc-pod__next');
  var count = bar.querySelector('.gc-pod__count');
  var iframe = null;

  function embedUrl(id) { return 'https://open.spotify.com/embed/episode/' + id + '?utm_source=generator&theme=0'; }

  function render() {
    count.textContent = 'Episode ' + (idx + 1) + ' / ' + episodes.length;
    prevBtn.disabled = idx <= 0;
    nextBtn.disabled = idx >= episodes.length - 1;
    if (iframe) iframe.src = embedUrl(episodes[idx]);
  }
  function go(d) {
    var n = idx + d;
    if (n < 0 || n >= episodes.length) return;
    idx = n; render();
  }
  prevBtn.addEventListener('click', function () { go(-1); });
  nextBtn.addEventListener('click', function () { go(1); });

  function setHeight() {
    var h = bar.getBoundingClientRect().height;
    root.style.setProperty('--gc-pod-h', Math.round(h) + 'px');
  }

  function show() {
    if (shown) return;
    shown = true;
    if (episodes.length) {
      iframe = document.createElement('iframe');
      iframe.loading = 'lazy'; iframe.title = 'Gaming Corner Podcast on Spotify';
      iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      frame.appendChild(iframe);
      if (episodes.length < 2) nav.hidden = true;
      render();
    } else { nav.hidden = true; }
    bar.hidden = false;
    /* bar mulai terlipat (hanya tombol Podcast); pengunjung membuka pemutar dengan menekan tombol itu */
    bar.classList.add('is-collapsed'); tab.setAttribute('aria-expanded', 'false');
    setHeight();
  }

  function toggle() {
    var collapsed = bar.classList.toggle('is-collapsed');
    tab.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    setHeight();
  }
  tab.addEventListener('click', toggle);
  window.addEventListener('resize', setHeight);

  function check() { if (!root.classList.contains('gc-intro-on')) { show(); return true; } return false; }
  if (!check()) {
    var mo = new MutationObserver(function () { if (check()) mo.disconnect(); });
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
  }
})();
