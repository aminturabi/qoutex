/**
 * QUOTEX REFERRAL LANDING PAGE — script.js
 * Handles: navbar, mobile menu, FAQ, counters,
 *          testimonials slider, scroll animations,
 *          back-to-top, dark mode toggle
 */

/* ============================================
   1. UTILITIES
   ============================================ */

/**
 * Run callback once the DOM is ready.
 */
function ready(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

/* ============================================
   2. STICKY NAVBAR
   ============================================ */

function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
}

/* ============================================
   3. MOBILE HAMBURGER MENU
   ============================================ */

function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  function toggleMenu(force) {
    const isOpen = force !== undefined ? force : !hamburger.classList.contains('open');

    hamburger.classList.toggle('open', isOpen);
    navLinks.classList.toggle('mobile-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu());

  // Close on nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleMenu(false);
  });
}

/* ============================================
   4. DARK MODE TOGGLE
   ============================================ */

function initDarkMode() {
  const toggle = document.getElementById('darkToggle');
  if (!toggle) return;

  // Restore saved preference
  const saved = localStorage.getItem('theme');
  if (saved === 'light') document.body.classList.add('light-mode');

  toggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

/* ============================================
   5. SCROLL REVEAL ANIMATIONS
   ============================================ */

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Stagger sibling reveals
  document.querySelectorAll('.cards-grid, .features-grid, .steps-list, .stats-grid').forEach(parent => {
    parent.querySelectorAll('.reveal').forEach((el, i) => {
      el.style.transitionDelay = `${i * 80}ms`;
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ============================================
   6. ANIMATED COUNTERS
   ============================================ */

function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800; // ms
    const start = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quad
      const eased    = 1 - (1 - progress) * (1 - progress);
      const current  = Math.round(eased * target);
      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ============================================
   7. FAQ ACCORDION
   ============================================ */

function initFAQ() {
  const questions = document.querySelectorAll('.faq-question');
  if (!questions.length) return;

  questions.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId   = btn.getAttribute('aria-controls');
      const answer     = document.getElementById(answerId);

      // Close all others
      questions.forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherAnswer = document.getElementById(other.getAttribute('aria-controls'));
          if (otherAnswer) otherAnswer.hidden = true;
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', String(!isExpanded));
      if (answer) answer.hidden = isExpanded;
    });
  });
}

/* ============================================
   8. TESTIMONIALS SLIDER
   ============================================ */

function initSlider() {
  const track     = document.getElementById('sliderTrack');
  const dotsWrap  = document.getElementById('sliderDots');
  const prevBtn   = document.getElementById('sliderPrev');
  const nextBtn   = document.getElementById('sliderNext');

  if (!track || !dotsWrap || !prevBtn || !nextBtn) return;

  const cards  = Array.from(track.querySelectorAll('.testimonial-card'));
  if (!cards.length) return;

  let current      = 0;
  let autoInterval = null;

  // Determine visible cards based on viewport
  function getVisible() {
    return window.innerWidth <= 900 ? 1 : 2;
  }

  const totalSlides = () => Math.ceil(cards.length / getVisible());

  // Build dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const dot = document.createElement('button');
      dot.className = 'slider-dot' + (i === current ? ' active' : '');
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      dot.setAttribute('aria-selected', String(i === current));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-selected', String(i === current));
    });
  }

  function goTo(index) {
    const slides = totalSlides();
    current = ((index % slides) + slides) % slides;

    const cardWidth  = cards[0].offsetWidth;
    const gap        = 24;
    const perView    = getVisible();
    const offset     = current * perView * (cardWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

  function startAuto() {
    autoInterval = setInterval(next, 5000);
  }

  function resetAuto() {
    clearInterval(autoInterval);
    startAuto();
  }

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (current >= totalSlides()) current = 0;
      buildDots();
      goTo(current);
    }, 200);
  });

  // Touch swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      resetAuto();
    }
  });

  buildDots();
  goTo(0);
  startAuto();
}

/* ============================================
   9. BACK TO TOP
   ============================================ */

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function onScroll() {
    const show = window.scrollY > 400;
    btn.hidden = !show;
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  onScroll();
}

/* ============================================
   10. SMOOTH SCROLL FOR ANCHOR LINKS
   ============================================ */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      if (id === '#') return; // Skip pure # links (CTA buttons)

      const target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight || 70;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================
   11. ACTIVE NAV LINK HIGHLIGHT
   ============================================ */

function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active-link', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
}

/* ============================================
   12. INIT ALL
   ============================================ */

ready(() => {
  initNavbar();
  initMobileMenu();
  initDarkMode();
  initScrollReveal();
  initCounters();
  initFAQ();
  initSlider();
  initBackToTop();
  initSmoothScroll();
  initActiveNav();

  // Add active-link style inline (no extra CSS file needed)
  const style = document.createElement('style');
  style.textContent = `.active-link { color: var(--blue-400) !important; }`;
  document.head.appendChild(style);
});
