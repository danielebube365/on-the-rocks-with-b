(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduced = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* nav solid on scroll + hide scroll cue */
  const nav = $('#nav');
  const heroScroll = $('#heroScroll');
  const onScroll = () => {
    nav.classList.toggle('is-solid', window.scrollY > 40);
    if (heroScroll) heroScroll.style.opacity = window.scrollY > 120 ? '0' : '1';
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* mobile menu */
  const toggle = $('#navToggle'), mobile = $('#navMobile');
  if (toggle && mobile) {
    const set = (open) => {
      mobile.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => set(!mobile.classList.contains('open')));
    $$('a', mobile).forEach((a) => a.addEventListener('click', () => set(false)));
  }

  /* faq accordion */
  $$('.faq__item').forEach((item) => {
    const q = $('.faq__q', item), a = $('.faq__a', item);
    q.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      a.style.maxHeight = open ? a.scrollHeight + 'px' : '0';
    });
  });

  /* faq show-more */
  const faqToggle = $('#faqToggle');
  if (faqToggle) {
    const extras = $$('.faq__item--more');
    faqToggle.addEventListener('click', () => {
      const open = faqToggle.getAttribute('aria-expanded') === 'true';
      extras.forEach((el) => el.classList.toggle('show', !open));
      faqToggle.setAttribute('aria-expanded', String(!open));
      faqToggle.textContent = open ? 'View all questions' : 'Show fewer questions';
    });
  }

  /* reveals: translateY + clip-path image reveals */
  const reveals = new Set($$('.reveal, .reveal-img'));
  const show = (el) => { el.classList.add('in'); reveals.delete(el); };
  if (reduced) { reveals.forEach(show); }
  else {
    const check = () => { const vh = innerHeight; reveals.forEach((el) => { if (el.getBoundingClientRect().top < vh * 0.9) show(el); }); };
    requestAnimationFrame(check);
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { threshold: 0.08 });
      reveals.forEach((el) => io.observe(el));
    }
  }

  /* subtle parallax (hero media, and any [data-par]) */
  const parEls = $$('[data-par]').map((el) => ({ el, k: parseFloat(el.dataset.par) || 0.2 }));
  if (!reduced && parEls.length) {
    let ticking = false;
    const frame = () => {
      const sy = window.scrollY;
      parEls.forEach(({ el, k }) => { el.style.transform = `translate3d(0, ${sy * k}px, 0)`; });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* videos: play only what's on screen (hero + events), saves CPU */
  const vids = $$('video');
  vids.forEach((v) => { v.muted = true; v.setAttribute('muted', ''); });
  const kick = (v) => { v.play().catch(() => {}); };
  if (reduced) {
    vids.forEach((v) => v.removeAttribute('autoplay'));
  } else if ('IntersectionObserver' in window) {
    const vio = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) kick(e.target); else e.target.pause();
    }), { rootMargin: '120px' });
    vids.forEach((v) => vio.observe(v));
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) vids.forEach((v) => { const r = v.getBoundingClientRect(); if (v.paused && r.top < innerHeight && r.bottom > 0) kick(v); });
    });
  } else {
    vids.forEach(kick);
  }
})();
