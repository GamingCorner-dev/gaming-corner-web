/* Revisi 42 — Bar podcast Spotify di bawah layar.
   - Muncul setelah layar pembuka selesai (atau langsung kalau layar pembuka tidak tampil).
   - Pemutar Spotify baru dimuat saat bar pertama kali tampil (tidak membebani layar pembuka).
   - Tombol "Podcast" melipat/membuka bar; saat dilipat, iframe tetap ada sehingga podcast tetap jalan.
   - Link podcast diambil dari atribut data-show pada <aside id="gc-pod"> di index.html. */
(function () {
  'use strict';
  var bar = document.getElementById('gc-pod');
  if (!bar) return;
  var root = document.documentElement;
  var tab = bar.querySelector('.gc-pod__tab');
  var frame = bar.querySelector('.gc-pod__frame');
  var shown = false;

  function embedUrl(link) {
    // https://open.spotify.com/show/XXXX?si=...  ->  https://open.spotify.com/embed/show/XXXX
    var m = /open\.spotify\.com\/(?:intl-[a-z]+\/)?show\/([A-Za-z0-9]+)/.exec(link || '');
    return m ? 'https://open.spotify.com/embed/show/' + m[1] + '?utm_source=generator&theme=0' : '';
  }

  function setHeight() {
    var h = bar.getBoundingClientRect().height;
    root.style.setProperty('--gc-pod-h', Math.round(h) + 'px');
  }

  function show() {
    if (shown) return;
    shown = true;
    var src = embedUrl(bar.getAttribute('data-show'));
    if (src) {
      var f = document.createElement('iframe');
      f.src = src; f.loading = 'lazy'; f.title = 'Gaming Corner Podcast on Spotify';
      f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      frame.appendChild(f);
    }
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
