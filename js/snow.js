/* Revisi 8 - Salju emas turun di seluruh halaman.
   - Digambar di satu canvas (ringan), tidak menghalangi klik (pointer-events: none).
   - Berada di BELAKANG semua isi halaman (kotak, tulisan, tombol), di depan latar belakang saja.
   - Tidak berjalan jika pengunjung memilih "kurangi gerakan"; berhenti saat tab disembunyikan.
   Pengaturan yang mudah diubah ada di bagian CONFIG. */
(function () {
  'use strict';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ===== CONFIG ===== */
  var CONFIG = {
    density: 10500,     // makin KECIL = makin banyak salju (luas layar per butir)
    minFlakes: 48,      // jumlah minimum (layar kecil / HP)
    maxFlakes: 170,     // jumlah maksimum (layar besar)
    sizeMin: 0.8,       // ukuran inti butir terkecil (px)
    sizeMax: 2.4,       // ukuran inti butir terbesar (px)
    speedMin: 26,       // kecepatan jatuh butir jauh (px per detik)
    speedMax: 92,       // kecepatan jatuh butir dekat (px per detik)
    sway: 26,           // seberapa jauh butir bergoyang ke samping (px)
    wind: 9,            // dorongan angin ke samping (px per detik)
    opacity: 1,      // kepekatan butir terbesar (0 - 1)
    zIndex: 0           // 0 = di BELAKANG isi halaman (kotak & tulisan ada di lapisan 1)
  };

  var cv = document.createElement('canvas');
  cv.className = 'gc-snow';
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:' + CONFIG.zIndex + ';';
  var ctx = cv.getContext('2d');
  if (!ctx) return;

  // butir emas: titik terang di tengah + pendar lembut (digambar sekali, dipakai ulang)
  var sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  (function () {
    var g = sprite.getContext('2d');
    var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0.00, 'rgba(255, 246, 214, 1)');
    grd.addColorStop(0.16, 'rgba(250, 226, 150, 0.98)');
    grd.addColorStop(0.34, 'rgba(236, 196, 112, 0.55)');
    grd.addColorStop(0.62, 'rgba(232, 190, 110, 0.14)');
    grd.addColorStop(1.00, 'rgba(232, 190, 110, 0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
  })();

  var W = 0, H = 0, DPR = 1;
  var flakes = [];
  var raf = 0, last = 0, clock = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeFlake(randomY) {
    var z = Math.pow(Math.random(), 1.6);                 // 0 = jauh, 1 = dekat (lebih banyak butir jauh)
    var r = CONFIG.sizeMin + z * (CONFIG.sizeMax - CONFIG.sizeMin);
    return {
      z: z,
      d: r * 5.5,                                         // diameter pendar
      x: Math.random() * W,
      y: randomY ? Math.random() * H : -r * 6,
      vy: CONFIG.speedMin + z * (CONFIG.speedMax - CONFIG.speedMin) + rand(-6, 6),
      amp: rand(CONFIG.sway * 0.35, CONFIG.sway),
      freq: rand(0.35, 1.0),
      ph: rand(0, Math.PI * 2),
      a: 0.30 + z * (CONFIG.opacity - 0.30)
    };
  }

  function resize() {
    var oldW = W, oldH = H;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR);
    cv.height = Math.round(H * DPR);
    var want = Math.round(Math.max(CONFIG.minFlakes, Math.min(CONFIG.maxFlakes, (W * H) / CONFIG.density)));
    if (oldW && oldH) {                                   // sesuaikan posisi butir yang sudah ada
      flakes.forEach(function (f) { f.x = f.x / oldW * W; f.y = f.y / oldH * H; });
    }
    while (flakes.length < want) flakes.push(makeFlake(true));
    if (flakes.length > want) flakes.length = want;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    clock += dt;
    var wind = Math.sin(clock * 0.21) * CONFIG.wind + CONFIG.wind * 0.6;

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < flakes.length; i++) {
      var f = flakes[i];
      f.y += f.vy * dt;
      f.x += wind * (0.4 + f.z) * dt;
      if (f.y - f.d > H) { f.y = -f.d; f.x = Math.random() * W; }
      if (f.x - f.d > W) f.x = -f.d;
      else if (f.x + f.d < 0) f.x = W + f.d;
      var sx = f.x + Math.sin(clock * f.freq + f.ph) * f.amp;
      ctx.globalAlpha = f.a;
      ctx.drawImage(sprite, sx - f.d / 2, f.y - f.d / 2, f.d, f.d);
    }
    ctx.globalAlpha = 1;
  }

  function start() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  var rt = 0;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  document.body.appendChild(cv);
  resize();
  start();
})();
