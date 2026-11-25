(function () {
  'use strict';
  var root = document.documentElement;
  var body = document.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- idioma ---------- */
  var langBox = document.querySelector('.lang');
  var langBtns = document.querySelectorAll('.lang button');
  function setLang(l) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l === 'pt' ? 'pt-BR' : 'en');
    if (langBox) langBox.setAttribute('data-on', l);
    langBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.set === l ? 'true' : 'false'); });
    try { localStorage.setItem('lang', l); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  setLang(saved || ((navigator.language || '').toLowerCase().indexOf('pt') === 0 ? 'pt' : 'en'));
  langBtns.forEach(function (b) { b.addEventListener('click', function () { setLang(b.dataset.set); }); });

  /* ---------- título palavra por palavra ---------- */
  document.querySelectorAll('.hero h1').forEach(function (h) {
    var words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="transition-delay:' + (0.08 * i + 0.15).toFixed(2) + 's">' + w + '</span></span>';
    }).join(' ');
  });
  var hero = document.querySelector('.hero');
  function start() { if (hero) hero.classList.add('go'); }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { requestAnimationFrame(start); });
    setTimeout(start, 900);
  } else { start(); }

  /* ---------- esboços: preparar traços ---------- */
  document.querySelectorAll('.sheet svg').forEach(function (svg) {
    svg.querySelectorAll('path, line').forEach(function (el) { el.setAttribute('pathLength', '1'); });
    svg.querySelectorAll('rect, circle').forEach(function (el) {
      if (el.classList.contains('hl')) { el.classList.add('fillin'); return; }
      el.setAttribute('pathLength', '1');
    });
  });

  /* ---------- revelar ao rolar ---------- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); revealIO.unobserve(en.target); }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal], .sheet, .xp li').forEach(function (el) { revealIO.observe(el); });

  /* ---------- cor de fundo por seção ---------- */
  var blobs = { a: document.querySelector('.blob.a'), b: document.querySelector('.blob.b'), c: document.querySelector('.blob.c') };
  var navLinks = document.querySelectorAll('.top nav a[href^="#"]');
  function applyTone(sec) {
    body.style.backgroundColor = sec.dataset.bg;
    body.style.setProperty('--bg', sec.dataset.bg);
    body.setAttribute('data-tone', sec.dataset.tone || 'light');
    var cols = (sec.dataset.blobs || '').split(',');
    if (cols.length === 3) { blobs.a.style.backgroundColor = cols[0]; blobs.b.style.backgroundColor = cols[1]; blobs.c.style.backgroundColor = cols[2]; }
    navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id); });
  }
  var toneIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) applyTone(en.target); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  document.querySelectorAll('[data-bg]').forEach(function (s) { toneIO.observe(s); });

  /* ---------- linha de tinta no fundo ---------- */
  var ink = document.querySelector('.inkline');
  var inkPath, inkLen = 0;
  function drawInk() {
    if (!ink) return;
    var W = window.innerWidth, H = window.innerHeight;
    ink.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var d = 'M' + (W * 0.92) + ',' + (-20) +
      ' C' + (W * 0.70) + ',' + (H * 0.18) + ' ' + (W * 1.02) + ',' + (H * 0.34) + ' ' + (W * 0.80) + ',' + (H * 0.46) +
      ' S' + (W * 0.40) + ',' + (H * 0.52) + ' ' + (W * 0.55) + ',' + (H * 0.70) +
      ' S' + (W * 0.96) + ',' + (H * 0.86) + ' ' + (W * 0.74) + ',' + (H + 30);
    ink.innerHTML = '<path d="' + d + '"/>' +
      '<circle cx="' + (W * 0.80) + '" cy="' + (H * 0.46) + '" r="3.5"/>' +
      '<circle cx="' + (W * 0.55) + '" cy="' + (H * 0.70) + '" r="3.5"/>';
    inkPath = ink.querySelector('path');
    inkLen = inkPath.getTotalLength();
    inkPath.style.strokeDasharray = inkLen;
    onScroll();
  }

  /* ---------- rolagem: topo, linha do tempo e linha de tinta ---------- */
  var header = document.querySelector('header.top');
  var xp = document.querySelector('.xp');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 8);
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, y / max) : 0;
    if (inkPath) inkPath.style.strokeDashoffset = reduce ? 0 : inkLen * (1 - (0.12 + 0.88 * p));
    if (xp) {
      var r = xp.getBoundingClientRect();
      var prog = (window.innerHeight * 0.6 - r.top) / r.height;
      xp.style.setProperty('--p', Math.max(0, Math.min(1, prog)).toFixed(3));
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', drawInk);
  drawInk();

  /* ---------- prévia de imagem nos outros trabalhos ---------- */
  var preview = document.querySelector('.preview');
  if (preview && finePointer && !reduce) {
    var img = preview.querySelector('img');
    var mx = 0, my = 0, px = 0, py = 0, raf = null;
    function loop() {
      px += (mx - px) * 0.16; py += (my - py) * 0.16;
      preview.style.left = px + 'px'; preview.style.top = py + 'px';
      raf = requestAnimationFrame(loop);
    }
    document.querySelectorAll('.more li[data-img]').forEach(function (li) {
      li.addEventListener('mouseenter', function (e) {
        img.src = li.dataset.img; img.alt = '';
        px = mx = e.clientX + 230; py = my = e.clientY - 150;
        preview.classList.add('on');
        if (!raf) loop();
      });
      li.addEventListener("mousemove", function (e) { mx = e.clientX + 230; my = e.clientY - 150; });
      li.addEventListener('mouseleave', function () {
        preview.classList.remove('on');
        cancelAnimationFrame(raf); raf = null;
      });
    });
  }

  /* ---------- botões magnéticos ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.28;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }
})();

/* ---------- WhatsApp: mensagem no idioma da página ---------- */
(function () {
  var wa = document.querySelector('.wa');
  if (!wa) return;
  var phone = '5548984591763';
  var msg = {
    en: 'Hi João, I saw your portfolio and would like to talk.',
    pt: 'Oi, João! Vi seu portfólio e gostaria de conversar.'
  };
  function update() {
    var l = document.documentElement.getAttribute('data-lang') === 'pt' ? 'pt' : 'en';
    wa.href = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(msg[l]);
    wa.setAttribute('aria-label', l === 'pt' ? 'Conversar no WhatsApp' : 'Chat on WhatsApp');
  }
  update();
  new MutationObserver(update).observe(document.documentElement, { attributes: true, attributeFilter: ['data-lang'] });
})();
