/* Revisi 31 — logo Gaming Corner: bergetar saat cursor diarahkan (atau disentuh di HP), lalu meletus
   melontarkan logo-logo kecil yang jatuh pelan. Ada jeda ulang supaya tidak berantakan. */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var frames = Array.prototype.slice.call(document.querySelectorAll('.hexframe--lg, .hexframe--sm'));
  if (!frames.length) return;

  var COUNT = 16, SPARKS = 14, SHAKE_MS = 700, COOLDOWN_MS = 4500;
  var SRC = 'assets/img/logo-256.webp';
  var busy = false, timer = 0, layer = null;
  var pre = new Image(); pre.src = SRC;

  function getLayer() {
    if (!layer) { layer = document.createElement('div'); layer.className = 'gc-burst-layer'; layer.setAttribute('aria-hidden', 'true'); document.body.appendChild(layer); }
    return layer;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function burst(frame) {
    var r = frame.getBoundingClientRect();
    if (r.width === 0) return;
    var ox = r.left + r.width / 2, oy = r.top + r.height * 0.32;    // "mulut kawah" di bagian atas logo
    var L = getLayer(), parts = [];
    var big = r.width > 200;

    var flash = document.createElement('div'); flash.className = 'gc-burst-flash';
    flash.style.left = ox + 'px'; flash.style.top = oy + 'px'; L.appendChild(flash);
    setTimeout(function () { if (flash.parentNode) flash.parentNode.removeChild(flash); }, 700);

    function make(el, size, spd, spread, life, spin) {
      var a = (-90 + rnd(-spread, spread)) * Math.PI / 180, v = rnd(spd[0], spd[1]);
      parts.push({ el: el, x: ox - size / 2, y: oy - size / 2, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
                   rot: rnd(0, 360), vr: rnd(-spin, spin), life: life, t: 0, size: size });
      L.appendChild(el);
    }
    for (var i = 0; i < COUNT; i++) {
      var s = rnd(big ? 26 : 20, big ? 48 : 34), im = document.createElement('img');
      im.src = SRC; im.alt = ''; im.className = 'gc-burst-mini'; im.style.width = s + 'px'; im.style.height = 'auto';
      make(im, s, big ? [11, 19] : [8, 14], 52, rnd(1500, 2300), 9);
    }
    for (var k = 0; k < SPARKS; k++) {
      var sp = rnd(3, 7), d = document.createElement('div'); d.className = 'gc-burst-spark'; d.style.width = d.style.height = sp + 'px';
      make(d, sp, big ? [8, 22] : [6, 15], 70, rnd(700, 1300), 0);
    }

    var last = performance.now(), G = 0.42;
    (function tick(now) {
      var dt = Math.min((now - last) / 16.67, 3); last = now;
      var alive = 0;
      parts.forEach(function (p) {
        if (!p.el) return;
        p.t += dt * 16.67;
        if (p.t >= p.life) { if (p.el.parentNode) p.el.parentNode.removeChild(p.el); p.el = null; return; }
        alive++;
        p.vy += G * dt; p.vx *= (1 - 0.006 * dt);
        p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        var left = 1 - p.t / p.life, o = left < 0.35 ? left / 0.35 : 1;
        p.el.style.opacity = o.toFixed(3);
        p.el.style.transform = 'translate3d(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0) rotate(' + p.rot.toFixed(0) + 'deg)';
      });
      if (alive) requestAnimationFrame(tick);
    })(last);

    frame.classList.add('gc-after');
    setTimeout(function () { frame.classList.remove('gc-after'); }, 950);
  }

  function start(frame) {
    if (busy) return;
    busy = true;
    frame.classList.add('gc-shake');
    timer = setTimeout(function () {
      frame.classList.remove('gc-shake');
      burst(frame);
      setTimeout(function () { busy = false; }, COOLDOWN_MS);
    }, SHAKE_MS);
    frame._cancel = function () {   // cursor pergi sebelum meletus: batal, tanpa jeda ulang
      clearTimeout(timer); frame.classList.remove('gc-shake'); busy = false; frame._cancel = null;
    };
    setTimeout(function () { frame._cancel = null; }, SHAKE_MS + 20);
  }

  frames.forEach(function (f) {
    f.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') start(f); });
    f.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && f._cancel) f._cancel(); });
    f.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') start(f); });
  });
})();
