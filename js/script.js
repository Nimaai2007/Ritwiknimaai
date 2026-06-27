/* ════════════════════════════════════════════════════════════
   DESIGN BY RITWIK NIMAAI — INTERACTIONS
   Original:  Preloader, Hero entrance, Scroll-reveal, Custom
              cursor, Magnetic button, Parallax
   New:       Extended scroll-reveal (Projects/Skills/Contact),
              FAQ accordion, Magnetic CTA
   ════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isFinePointer = window.matchMedia('(pointer: fine)').matches;

  /* ──────────────────────────────────────────
     PRELOADER  +  HERO ENTRANCE
  ────────────────────────────────────────── */
  function revealHero() {
    var nav  = document.querySelector('nav');
    var hero = document.querySelector('.hero');
    if (nav)  nav.classList.add('nav-in');
    if (hero) {
      hero.classList.add('hero-in');
      hero.querySelectorAll('.reveal').forEach(function (el) {
        el.classList.add('visible');
      });
      hero.querySelectorAll('.arc').forEach(function (el) {
        el.classList.add('in-view');
      });
    }
  }

  function initPreloader() {
    var preloader = document.getElementById('preloader');
    if (!preloader) { revealHero(); return; }
    var counterEl = preloader.querySelector('.pre-counter');

    function finish() {
      document.body.classList.add('is-ready');
      preloader.classList.add('preloader-exit');
      revealHero();
      var hideAfter = reducedMotion ? 0 : 950;
      setTimeout(function () { preloader.style.display = 'none'; }, hideAfter);
    }

    if (reducedMotion) { finish(); return; }

    var duration = 1500;
    var start    = null;

    function tick(timestamp) {
      if (start === null) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      if (counterEl) counterEl.textContent = Math.floor(progress * 100) + '%';
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(finish, 220);
      }
    }
    requestAnimationFrame(tick);
  }

  /* ──────────────────────────────────────────
     SCROLL-REVEAL
     Covers all five sections: standard .reveal
     elements, mask-animated headings, project
     cards, rules list, and FAQ items.
  ────────────────────────────────────────── */
  function initScrollReveal() {
    // Combine all targets that need .visible added
    var selectors = [
      '.reveal',
      '.about-arrow-wrap',
      '.proj-heading',
      '.skills-heading',
      '.contact-heading',
      '.proj-item',
      '.rule-item',
      '.faq-item'
    ].join(', ');

    var els = document.querySelectorAll(selectors);

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ──────────────────────────────────────────
     FAQ ACCORDION
     One panel open at a time; animated height
     via scrollHeight → inline style.
  ────────────────────────────────────────── */
  function initFAQ() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var btn    = item.querySelector('.faq-question');
      var answer = item.querySelector('.faq-answer');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');

        // Close every panel
        items.forEach(function (i) {
          i.classList.remove('is-open');
          var a = i.querySelector('.faq-answer');
          var b = i.querySelector('.faq-question');
          if (a) { a.style.height = '0'; a.setAttribute('aria-hidden', 'true'); }
          if (b) b.setAttribute('aria-expanded', 'false');
        });

        // If this one was closed, open it
        if (!isOpen) {
          item.classList.add('is-open');
          answer.style.height = answer.scrollHeight + 'px';
          answer.setAttribute('aria-hidden', 'false');
          btn.setAttribute('aria-expanded', 'true');
        }
      });

      // Re-measure on window resize (e.g. font reflow changes scrollHeight)
      window.addEventListener('resize', function () {
        if (item.classList.contains('is-open')) {
          answer.style.height = answer.scrollHeight + 'px';
        }
      });
    });
  }

  /* ──────────────────────────────────────────
     CUSTOM CURSOR
  ────────────────────────────────────────── */
  function initCustomCursor() {
    if (reducedMotion || !isFinePointer) return;

    var dot  = document.createElement('div');
    var ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true');
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.body.classList.add('has-custom-cursor');

    var mouseX = window.innerWidth  / 2;
    var mouseY = window.innerHeight / 2;
    var ringX  = mouseX;
    var ringY  = mouseY;

    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
    });

    function loop() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Expand ring on any interactive element
    var hoverTargets = document.querySelectorAll('a, button, .hire-btn, .cta-btn');
    hoverTargets.forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('is-hovering'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('is-hovering'); });
    });
  }

  /* ──────────────────────────────────────────
     MAGNETIC BUTTON
     Applies to the nav "Hire Me" and the
     contact section "HERE" CTA.
  ────────────────────────────────────────── */
  function initMagneticButtons() {
    if (reducedMotion || !isFinePointer) return;
    var btns     = document.querySelectorAll('.hire-btn, .cta-btn');
    var strength = 0.35;

    btns.forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var relX = e.clientX - (rect.left + rect.width  / 2);
        var relY = e.clientY - (rect.top  + rect.height / 2);
        btn.style.transform = 'translate(' + relX * strength + 'px,' + relY * strength + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ──────────────────────────────────────────
     HERO PARALLAX
     Arcs and portrait drift subtly with cursor.
  ────────────────────────────────────────── */
  function initParallax() {
    if (reducedMotion || !isFinePointer) return;
    var hero  = document.querySelector('.hero');
    var arc1  = document.querySelector('.arc-1');
    var arc2  = document.querySelector('.arc-2');
    var photo = document.querySelector('.hero-photo-wrap');
    if (!hero) return;

    var targetX = 0, targetY = 0;
    var currentX = 0, currentY = 0;

    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      targetY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    });

    hero.addEventListener('mouseleave', function () {
      targetX = 0; targetY = 0;
    });

    function loop() {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      if (arc1)  arc1.style.transform  = 'translate(' + currentX * 18 + 'px,' + currentY * 14 + 'px)';
      if (arc2)  arc2.style.transform  = 'translate(' + currentX * -22 + 'px,' + currentY * -16 + 'px)';
      if (photo) photo.style.transform = 'translateX(-50%) translate(' + currentX * 10 + 'px,' + currentY * 8 + 'px)';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  /* ──────────────────────────────────────────
     PROJECT ITEM HOVER — letter-spacing nudge
     Gives the proj-name a subtle extra tracking
     on hover for a withhoney-style micro-feel.
  ────────────────────────────────────────── */
  function initProjectHover() {
    if (reducedMotion) return;
    var links = document.querySelectorAll('.proj-link');
    links.forEach(function (link) {
      var name = link.querySelector('.proj-name');
      if (!name) return;
      link.addEventListener('mouseenter', function () {
        name.style.transition = 'letter-spacing 0.35s cubic-bezier(.16,1,.3,1)';
        name.style.letterSpacing = '0.01em';
      });
      link.addEventListener('mouseleave', function () {
        name.style.letterSpacing = '';
      });
    });
  }

  /* ──────────────────────────────────────────
     INIT
  ────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initScrollReveal();
    initCustomCursor();
    initMagneticButtons();
    initParallax();
    initFAQ();
    initProjectHover();
  });

})();
