/* Revisi 25 — animasi tulisan "GAMING CORNER": huruf muncul satu-satu, kilau emas berkala, hover per huruf */
(function () {
  'use strict';
  var h = document.querySelector('.hero__title');
  if (!h) return;
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var label = h.textContent.replace(/\s+/g, ' ').trim();
  h.setAttribute('aria-label', label);
  var n = 0;

  function split(node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (c) {
      if (c.nodeType === 3) {
        var frag = document.createDocumentFragment();
        c.nodeValue.split('').forEach(function (ch) {
          if (/\s/.test(ch)) { frag.appendChild(document.createTextNode(ch)); return; }
          var s = document.createElement('span');
          s.className = 'gc-ch';
          s.setAttribute('aria-hidden', 'true');
          s.style.setProperty('--i', n++);
          s.textContent = ch;
          frag.appendChild(s);
        });
        node.replaceChild(frag, c);
      } else if (c.nodeType === 1 && c.tagName !== 'BR') {
        split(c);
      }
    });
  }
  split(h);
  h.classList.add('gc-title-fx');

  var inView = false, done = false;
  function go() {
    if (done || !inView || root.classList.contains('gc-intro-on')) return;
    done = true;
    h.classList.add('is-in');
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { inView = true; go(); } });
    }, { threshold: 0.4 });
    io.observe(h);
  } else { inView = true; }
  if ('MutationObserver' in window) {
    new MutationObserver(go).observe(root, { attributes: true, attributeFilter: ['class'] });
  }
  go();
  setTimeout(function () { inView = true; go(); }, 9000); /* jaga-jaga supaya tulisan tidak pernah tersembunyi */
})();
