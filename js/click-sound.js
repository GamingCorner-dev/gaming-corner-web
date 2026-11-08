/* Revisi 17 - Suara "klik" saat menekan tombol / link yang bisa diklik.
   Suara dibuat langsung oleh browser (tanpa file audio), pendek dan pelan.
   Hanya berbunyi untuk klik mouse (laptop/komputer), tidak di HP. */
(function () {
  'use strict';
  var SEL = 'a[href], button, [role="button"], summary, .btn, label[for]';
  var ctx = null;

  function getCtx() {
    if (!ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch (e) { return null; }
    }
    if (ctx.state === 'suspended' && ctx.resume) { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  function click() {
    var c = getCtx();
    if (!c) return;
    var t = c.currentTime;
    var osc = c.createOscillator();
    var gain = c.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1500, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.05);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.09, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    var el = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
    click();
  }, true);
})();
