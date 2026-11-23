/* Revisi 88 - Chat admin: ikon customer service + pop-up chat yang mengirim ke WhatsApp Gaming Corner.
   Mengganti tombol "Chat admin". Untuk mengganti tujuan, ubah WA_LINK / WA_NUMBER di bawah. */
(function () {
  'use strict';
  var WA_NUMBER = '';                                   // contoh: '628123456789' (kosongkan jika pakai WA_LINK)
  var WA_LINK = 'https://wa.me/message/ONZQGN3I5SJ3F1'; // link WhatsApp Business Gaming Corner (dari QR di halaman 1)
  var GREETING = 'Hi! 👋 Welcome to Gaming Corner. How can we help you today?';
  var FORM = 'https://docs.google.com/forms/d/e/1FAIpQLScwtspIp4-EGSRzdDNWn163uytkiciXBWcdVxS6nHu5uU5eJA/viewform';
  var REVINZ_WA = 'https://wa.me/6281255424543?text=';
  var ASK = function (t) { return '#ask:' + t; };
  var FAQ = [
    { cat: 'Top Up', items: [
      { q: 'How do I top up?', a: 'Pick your game on this page (Roblox, Touch 4games or Mobile Legends), then choose one of our recommended stores and pay there. For Touch 4games, Revinz Store sells RC and items right here on the website.' },
      { q: 'Which games can I top up?', a: 'Right now we list Roblox, Touch 4games and Mobile Legends. Tap a game on the Top Up page to see the stores we recommend for it.' },
      { q: 'Which store do you recommend for Roblox?', a: 'For Roblox we recommend Golrox.', links: [['Open Golrox', 'https://golrox.com/']] },
      { q: 'Which stores do you recommend for Mobile Legends?', a: 'For Mobile Legends we recommend Vexagame, Juliesean Rekber and Taka Pedia. Pick the one you prefer and pay inside that store.', links: [['Vexagame', 'https://vexagame.com/'], ['Juliesean Rekber', 'https://julieseanrekber.com/'], ['Taka Pedia', 'https://www.instagram.com/taka_pedia/']] },
      { q: 'Is it safe to top up?', a: 'Only pay through the stores and QR codes shown on this website, and never share your account password with anyone. If you are unsure about something, ask the admin on WhatsApp before you pay.', links: [['Ask the admin', ASK('Hello Gaming Corner, I have a question before I top up: ')]] }
    ] },
    { cat: 'Revinz Store', items: [
      { q: 'How do I buy from Revinz Store?', a: '1) Open Touch 4games > Revinz Store and tap + Add on the items you want. 2) Open your cart (top right) and tap Order. 3) Enter your Touch 4games IGN. 4) Pay with QRIS (Rupiah) or InstaPay (PHP). 5) Chat with Revinz Store on WhatsApp and send your proof of payment.' },
      { q: 'What items does Revinz Store sell?', a: 'Touch 4games items: 1st and 2nd prize primary sets, rare (fashion) sets, mounts and mount packs, accessories, expendable materials and optional sets. Prices start from around Rp 15.000 and go up to around Rp 630.000, and every price is also shown in PHP. Use the search box and category buttons to find an item fast.' },
      { q: 'How do I buy RC?', a: 'RC is handled by Revinz Store. Message Revinz Store on WhatsApp with how much RC you want, and the admin will confirm the current rate and stock with you before you pay.', links: [['Chat Revinz Store', REVINZ_WA + encodeURIComponent('Hello Revinz Store, I want to buy RC. Amount: ')]] },
      { q: 'How do I check the price and stock of an item?', a: 'Every card shows the price in Rupiah and PHP and how many are in stock. Cards with a red "Only 1 left" label are almost gone. Stock updates automatically from our sheet within a few minutes.' },
      { q: 'Why does an item say "Sold out"?', a: 'It means the stock is 0 right now, so it cannot be added to your cart. Check back later, because Revinz Store adds new stock regularly.' },
      { q: 'Can I buy more than one of the same item?', a: 'You can add as many as the stock allows. The + button stops when you reach the stock shown on the card.' },
      { q: 'Which payment methods do you accept?', a: 'In Revinz Store you can pay with QRIS (Rupiah) or InstaPay (PHP) by scanning the QR code. After paying, send your proof of payment to Revinz Store on WhatsApp. Donations go through QRIS or PayPal.' },
      { q: 'What is an IGN and why do you need it?', a: 'IGN means your in-game name in Touch 4games. You enter it on the Order page, and the items are sent to that IGN, so please double-check that it is correct before you pay.' },
      { q: 'I already paid. What now?', a: 'Please send your proof of payment in the WhatsApp chat with Revinz Store (the message with your order, total and IGN is already filled in for you). The admin checks it manually and sends the items to the IGN you entered.' },
      { q: 'How do I check my order status?', a: 'After you send your proof of payment, the admin checks it manually and sends the items to the IGN you entered. For an update on your order, message Revinz Store on WhatsApp with your IGN and what you ordered.', links: [['Chat Revinz Store', REVINZ_WA + encodeURIComponent('Hello Revinz Store, I want to check my order status. My IGN: ')]] },
      { q: 'Can I change or cancel my order?', a: 'Please message Revinz Store on WhatsApp as soon as possible with your order details. Whether it can be changed depends on whether the items have already been sent.', links: [['Chat Revinz Store', REVINZ_WA + encodeURIComponent('Hello Revinz Store, I want to change/cancel my order. My IGN: ')]] }
    ] },
    { cat: 'Services', items: [
      { q: 'Do you offer a game account selling service?', a: 'Yes, we can help with game account selling. Every account is different, so the admin confirms the details, the price and the safest way to do the deal with you directly on WhatsApp.', links: [['Ask about account selling', ASK('Hello Gaming Corner, I am interested in your game account selling service. ')]] },
      { q: 'How do I sell my game account?', a: 'Message the admin on WhatsApp and tell us the game, your account level or highlights, and your asking price. The admin will reply with the next steps. Please never send your password in the chat before the admin confirms the process.', links: [['Start on WhatsApp', ASK('Hello Gaming Corner, I want to sell my game account. Game: ')]] },
      { q: 'Do you offer a currency conversion service?', a: 'Yes, we can help convert money between payment methods or currencies. Tell the admin what you have and what you want to receive, and the admin will confirm the current rate and fee before you send anything.', links: [['Ask about conversion', ASK('Hello Gaming Corner, I want to ask about your currency conversion service. ')]] },
      { q: 'What are the rate and fee for conversion?', a: 'Rates change, so we do not use a fixed price on the website. The admin gives you the exact rate and any fee on WhatsApp before you pay, and you can decide after seeing it.', links: [['Ask for today\'s rate', ASK('Hello Gaming Corner, what is your conversion rate today? ')]] },
      { q: 'Are these services safe?', a: 'Please only deal through the official Gaming Corner and Revinz Store contacts shown on this website, and only pay after the admin has confirmed the details with you. If someone else asks you for money in our name, do not pay and tell us.' }
    ] },
    { cat: 'Events & Donate', items: [
      { q: 'How do I register for the tournament?', a: 'Violence District Batch 2 runs 24-30 April 2027. Each team is 1 Captain + 4 Members, and sign-ups close on 23 April 2027. Please read the VD Rules first, then fill in the registration form.', links: [['Register your team', FORM], ['See Tournaments', 'index.html#tournaments']] },
      { q: 'Where can I read the tournament rules?', a: 'Open the Tournaments section and tap "VD Rules" under the Violence District banner. It lists all the rules and how scoring works.', links: [['Open Tournaments', 'index.html#tournaments']] },
      { q: 'Where can I watch the past tournament?', a: 'In the Tournaments section, tap "Watch VD Tournament" on the completed tournament banner to see the highlight videos.', links: [['Open Tournaments', 'index.html#tournaments']] },
      { q: 'How do I donate?', a: 'Thank you for supporting us! You can donate in two ways: scan the QRIS code in the Support us section (Indonesia), or donate with PayPal.', links: [['Open Support us', 'index.html#support'], ['Donate via PayPal', 'https://paypal.me/gamingcornercom']] },
      { q: 'Where does the donation money go?', a: 'Donations help keep the server running and the events alive. Thank you to everyone who has backed our journey, and you can find our supporters in the Support us section.', links: [['Open Support us', 'index.html#support']] }
    ] },
    { cat: 'Partner & Sponsor', items: [
      { q: 'How do I become a partner?', a: 'Run a community and want to team up? Our partner is Touch Gang Indo, a Discord-based group built around Touch 4games. Message us on WhatsApp and tell us about your community, such as its name, platform and the games you play.', links: [['Message us about partnership', ASK('Hello Gaming Corner, I run a community and I want to become a partner. Community name: ')]] },
      { q: 'How can my brand become a sponsor?', a: 'We are looking for sponsors for our tournaments and events. The brand, product or service must be legal and suitable for a gaming community. Send us a short proposal with your brand profile, the cooperation you want and your goals.', links: [['Send a sponsor proposal', ASK('Hello Gaming Corner, I want to sponsor your tournaments/events. Brand: ')]] },
      { q: 'What kind of sponsorship do you accept?', a: 'Support can be funds, tournament prizes, or products and services agreed by both sides.' },
      { q: 'What are the sponsorship terms?', a: 'Duration, publication rights and each side\'s duties are discussed and agreed before the cooperation starts. Both sides can decline a deal that does not fit their values.' }
    ] },
    { cat: 'General', items: [
      { q: 'How do I join the Discord?', a: 'Just tap the button below and you will be in the server in seconds!', links: [['Join Discord', 'https://discord.gg/dUuStQt33Z']] },
      { q: 'How do I order merch?', a: 'Go to the Official Merch section and tap "Order via WhatsApp" under the item you want. You will chat with us directly to confirm your order.', links: [['Open Official Merch', 'index.html#shop']] },
      { q: 'Who runs Gaming Corner?', a: 'Gaming Corner is run by our owner Ara together with our admins and moderators. You can meet the whole team with the Staff button on the main page.', links: [['Open main page', 'index.html']] },
      { q: 'I have another question', a: 'Sure! Type your question in the box below and send it to us on WhatsApp. Our admin will reply there.', links: [['Write my question', ASK('Hello Gaming Corner, I have a question: ')]] },
      { q: 'How else can I contact you?', a: 'You can type your message below and send it on WhatsApp, or scan the WhatsApp QR code in the Contact section of the main page.', links: [['Open Contact', 'index.html#contact']] }
    ] }
  ];
  var root = document.createElement('div');
  root.className = 'gcw';
  root.innerHTML =
    '<div class="gcw__panel" role="dialog" aria-label="Chat with Gaming Corner admin" hidden>' +
      '<div class="gcw__head"><img src="assets/img/logo.png" alt="" width="36" height="36">' +
        '<div class="gcw__who"><b>Gaming Corner Admin</b><span><i class="gcw__dot"></i>Replies on WhatsApp</span></div>' +
        '<button type="button" class="gcw__x" aria-label="Close chat">&times;</button></div>' +
      '<div class="gcw__body">' +
        '<div class="gcw__log"><div class="gcw__msg">' + GREETING + '</div></div>' +
      '</div>' +
      '<div class="gcw__qlabel">Quick questions</div><div class="gcw__tabs"></div><div class="gcw__chips"></div>' +
      '<form class="gcw__form"><textarea rows="2" maxlength="500" placeholder="Type your message..." aria-label="Your message"></textarea>' +
        '<button type="submit" class="gcw__send">Send on WhatsApp <span aria-hidden="true">&rarr;</span></button>' +
        '<p class="gcw__note" hidden></p></form>' +
    '</div>' +
    '<button type="button" class="gcw__fab" aria-label="Chat with admin" aria-expanded="false">' +
      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13" width="4" height="6" rx="1.6"/><rect x="17.5" y="13" width="4" height="6" rx="1.6"/><path d="M19.5 19c0 1.6-1.8 2.5-4.5 2.5h-2"/></svg>' +
    '</button>';
  document.body.appendChild(root);

  var panel = root.querySelector('.gcw__panel'), fab = root.querySelector('.gcw__fab'), ta = root.querySelector('textarea'),
      chips = root.querySelector('.gcw__chips'), note = root.querySelector('.gcw__note'), form = root.querySelector('form');

  var log = root.querySelector('.gcw__log'), bodyEl = log;
  function add(cls, html) { var d = document.createElement('div'); d.className = cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = d.classList.contains('gcw__typing') || d.classList.contains('gcw__msg--me') ? log.scrollHeight : d.offsetTop - 8; return d; }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  var tabs = root.querySelector('.gcw__tabs');
  function answer(f) {
    add('gcw__msg gcw__msg--me', esc(f.q));
    var typing = add('gcw__msg gcw__typing', '<i></i><i></i><i></i>');
    setTimeout(function () {
      typing.remove();
      var h = esc(f.a);
      if (f.links) h += '<span class="gcw__links">' + f.links.map(function (l) {
        if (l[1].indexOf('#ask:') === 0) return '<a href="#" data-ask="' + esc(l[1].slice(5)).replace(/"/g, '&quot;') + '">' + esc(l[0]) + ' &rarr;</a>';
        return '<a href="' + l[1] + '"' + (/^https?:/.test(l[1]) ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(l[0]) + ' &rarr;</a>';
      }).join('') + '</span>';
      var ans = add('gcw__msg', h);
      add('gcw__msg gcw__msg--hint', 'Still need help? Type your message below and send it to us on WhatsApp.');
      log.scrollTop = ans.offsetTop - 8;
    }, 550);
  }
  function showCat(i) {
    [].forEach.call(tabs.children, function (t, k) { t.classList.toggle('on', k === i); });
    chips.innerHTML = '';
    FAQ[i].items.forEach(function (f) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = f.q; b.onclick = function () { answer(f); }; chips.appendChild(b);
    });
    chips.scrollTop = 0;
  }
  FAQ.forEach(function (c, i) {
    var t = document.createElement('button'); t.type = 'button'; t.textContent = c.cat; t.onclick = function () { showCat(i); }; tabs.appendChild(t);
  });
  showCat(0);
  log.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('[data-ask]') : null;
    if (!a) return; e.preventDefault(); ta.value = a.getAttribute('data-ask'); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length);
  });

  function open(o) {
    panel.hidden = !o; root.classList.toggle('is-open', o); fab.setAttribute('aria-expanded', o ? 'true' : 'false');
    if (o) setTimeout(function () { ta.focus(); }, 60);
  }
  fab.onclick = function () { open(panel.hidden); };
  root.querySelector('.gcw__x').onclick = function () { open(false); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) open(false); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = ta.value.trim();
    if (!msg) { ta.focus(); ta.classList.add('gcw--shake'); setTimeout(function () { ta.classList.remove('gcw--shake'); }, 400); return; }
    var text = 'Hello Gaming Corner, ' + msg;
    var url = WA_NUMBER ? 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text)
                        : WA_LINK + (WA_LINK.indexOf('?') > -1 ? '&' : '?') + 'text=' + encodeURIComponent(text);
    try { if (navigator.clipboard) navigator.clipboard.writeText(text); } catch (x) { }
    note.hidden = false;
    note.textContent = WA_NUMBER ? 'Opening WhatsApp...' : 'Opening WhatsApp... If your message is empty there, just paste it (we copied it for you).';
    window.open(url, '_blank', 'noopener');
    ta.value = '';
  });
})();
