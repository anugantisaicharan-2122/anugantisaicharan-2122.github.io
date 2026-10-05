// Portfolio interactions: nav, mobile menu, scroll reveal
(function () {
  'use strict';

  var nav = document.getElementById('nav');
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');

  // Navbar shadow on scroll
  function onScroll() {
    if (window.scrollY > 12) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu toggle
  hamburger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Close mobile menu when a link is tapped
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Scroll-reveal for sections
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // Highlight active nav link
  var sections = document.querySelectorAll('section[id]');
  var linkMap = {};
  navLinks.querySelectorAll('a[href^="#"]').forEach(function (a) {
    linkMap[a.getAttribute('href').slice(1)] = a;
  });
  function onScrollSpy() {
    var current = null;
    sections.forEach(function (s) {
      if (window.scrollY >= s.offsetTop - 160) current = s.id;
    });
    Object.keys(linkMap).forEach(function (id) {
      linkMap[id].classList.toggle('active', id === current);
    });
  }
  window.addEventListener('scroll', onScrollSpy, { passive: true });
})();
