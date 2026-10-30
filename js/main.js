(function () {
  'use strict';

  // Mobile menu
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('main-nav');

  function setMenu(open, returnFocus) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    if (!open && returnFocus) menuBtn.focus();
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false, true);
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !e.target.closest('.site-header')) setMenu(false);
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  // Video slots: poster button until clicked, one video playing at a time
  var current = null; // { slot, button, video }

  function reset(entry) {
    entry.video.pause();
    entry.video.removeAttribute('src');
    entry.video.load();
    entry.slot.replaceChild(entry.button, entry.video);
  }

  document.addEventListener('click', function (e) {
    var button = e.target.closest('.vslot__btn');
    if (!button) return;
    var slot = button.parentNode;

    if (current) reset(current);

    var video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-label', slot.getAttribute('data-label'));
    video.src = slot.getAttribute('data-src');

    slot.replaceChild(video, button);
    current = { slot: slot, button: button, video: video };

    var p = video.play();
    if (p && p.catch) p.catch(function () {});
    video.focus();
  });
})();
