/* Revisi 6 - Kotak bergerak saat scroll (pasangan dari css/scroll-reveal.css). */
(function () {
  'use strict';
  if (!('IntersectionObserver' in window) || !window.matchMedia) return;

  var SEL = '.hero__panel, .banner-strip__frame, .card, .clip, .partner__art, .donor, .qr-card, .cta';
  var mq = window.matchMedia('(max-width: 720px)');
  var io = null;
  var targets = [];

  function collect() {
    var list = Array.prototype.slice.call(document.querySelectorAll(SEL));
    if (!mq.matches) return list;
    // HP: item di dalam deretan yang bisa digeser tidak dianimasikan satu-satu; deretannya yang bergerak
    var out = list.filter(function (el) {
      return !(el.parentElement && el.parentElement.classList.contains('rail'));
    });
    Array.prototype.forEach.call(document.querySelectorAll('.rail'), function (r) { out.push(r); });
    return out;
  }

  function onIntersect(entries) {
    var entering = entries.filter(function (e) { return e.isIntersecting; });
    entering.sort(function (a, b) {
      var ra = a.boundingClientRect, rb = b.boundingClientRect;
      return (Math.round(ra.top / 40) - Math.round(rb.top / 40)) || (ra.left - rb.left);
    });
    entering.forEach(function (e, i) {
      e.target.style.setProperty('--gc-d', Math.min(i * 90, 360) + 'ms');
      e.target.classList.add('is-in');
    });
    entries.forEach(function (e) {
      if (e.isIntersecting) return;
      var el = e.target;
      el.style.removeProperty('--gc-d');
      el.classList.remove('is-in');
      el.setAttribute('data-gc-side', e.boundingClientRect.top < 0 ? 'up' : 'down');
    });
  }

  function setup() {
    if (io) io.disconnect();
    targets.forEach(function (el) {
      el.classList.remove('is-in');
      el.removeAttribute('data-gc-side');
      el.style.removeProperty('--gc-d');
    });
    targets = collect();
    io = new IntersectionObserver(onIntersect, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  window.__gcReveal = true;   // memberi tahu skrip di <head> bahwa efek ini aktif
  setup();
  if (mq.addEventListener) mq.addEventListener('change', setup);
  else if (mq.addListener) mq.addListener(setup);
})();
