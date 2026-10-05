// Mission-control portfolio interactions
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ============ Nav: shadow, mobile menu, scrollspy ============ */
  var nav = document.getElementById('nav');
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 12);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  hamburger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  var sections = document.querySelectorAll('section[id]');
  var linkMap = {};
  navLinks.querySelectorAll('a[href^="#"]').forEach(function (a) {
    linkMap[a.getAttribute('href').slice(1)] = a;
  });
  function onScrollSpy() {
    var current = null;
    sections.forEach(function (s) {
      if (window.scrollY >= s.offsetTop - 170) current = s.id;
    });
    Object.keys(linkMap).forEach(function (id) {
      linkMap[id].classList.toggle('active', id === current);
    });
  }
  window.addEventListener('scroll', onScrollSpy, { passive: true });
  onScrollSpy();

  /* ============ Scroll reveal with stagger ============ */
  var revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach(function (el) {
    var siblings = Array.prototype.filter.call(
      el.parentNode.children,
      function (c) { return c.classList && c.classList.contains('reveal'); }
    );
    var idx = siblings.indexOf(el);
    if (idx > 0) el.style.setProperty('--d', (idx * 0.09) + 's');
  });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ============ Animated stat counters ============ */
  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, dur = 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); cObs.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cObs.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ============ Terminal typewriter engine ============ */
  function lineEl(cls, html) {
    var s = document.createElement('span');
    s.className = 'tl ' + cls;
    s.innerHTML = html;
    return s;
  }
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function typeLine(container, text, cls, speed, done) {
    var s = lineEl(cls, '<span class="p">$</span>');
    var cursor = document.createElement('span');
    cursor.className = 't-cursor';
    s.appendChild(cursor);
    container.appendChild(s);
    if (reduceMotion) {
      s.insertBefore(document.createTextNode(escapeHtml(text)), cursor);
      done && done();
      return;
    }
    var i = 0;
    (function tick() {
      if (i <= text.length) {
        var shown = escapeHtml(text.slice(0, i));
        // rebuild: prompt span + text + cursor
        s.innerHTML = '<span class="p">$</span>' + shown;
        s.appendChild(cursor);
        i++;
        setTimeout(tick, speed + Math.random() * 28);
      } else {
        done && done();
      }
    })();
  }
  function printLine(container, html, cls, delay, done) {
    setTimeout(function () {
      var s = lineEl(cls, html);
      s.style.opacity = '0';
      container.appendChild(s);
      requestAnimationFrame(function () {
        s.style.transition = 'opacity 0.35s';
        s.style.opacity = '1';
      });
      done && done();
    }, reduceMotion ? 0 : delay);
  }
  function finalCursor(container) {
    var s = lineEl('tl-cmd', '<span class="p">$</span>');
    var cursor = document.createElement('span');
    cursor.className = 't-cursor';
    s.appendChild(cursor);
    container.appendChild(s);
    container.scrollTop = container.scrollHeight;
  }

  /* ============ Hero terminal boot sequence ============ */
  var termBody = document.getElementById('termBody');
  var SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  function bootTerminal() {
    termBody.innerHTML = '';
    var seq = [
      { k: 'cmd', text: 'whoami' },
      { k: 'out', cls: 'tl-out', html: 'sai-charan-anuganti <span class="tl-dim">—</span> <span class="tl-hi">platform engineer</span>' },
      { k: 'cmd', text: 'kubectl get stack --selector=core' },
      { k: 'pre', cls: 'tl-dim', text: 'NAME          STATUS   ROLE\npython        Ready    backend\nkubernetes    Ready    orchestration\nterraform     Ready    iac\naws           Ready    cloud' },
      { k: 'cmd', text: 'cat mission.txt' },
      { k: 'out', cls: 'tl-out', html: '"Ship reliable platforms. Stay out of the way."' },
      { k: 'cmd', text: 'uptime --career' },
      { k: 'out', cls: 'tl-out', html: '<span class="tl-hi">3 years</span> · open to full-time roles in the USA' }
    ];
    var i = 0;
    (function next() {
      if (i >= seq.length) { finalCursor(termBody); return; }
      var step = seq[i++];
      if (step.k === 'cmd') {
        typeLine(termBody, step.text, 'tl-cmd', 52, function () {
          setTimeout(next, 260);
        });
      } else if (step.k === 'pre') {
        printLine(termBody, escapeHtml(step.text), step.cls, 320, function () { setTimeout(next, 420); });
      } else {
        printLine(termBody, step.html, step.cls, 320, function () { setTimeout(next, 420); });
      }
    })();
  }
  // Start typing when hero is visible (it is, on load)
  if ('IntersectionObserver' in window && !reduceMotion) {
    var tObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { bootTerminal(); tObs.disconnect(); }
      });
    }, { threshold: 0.25 });
    tObs.observe(document.getElementById('terminal'));
  } else {
    bootTerminal();
  }

  /* ============ "Deploy my career" overlay ============ */
  var overlay = document.getElementById('deployOverlay');
  var deployBtn = document.getElementById('deployBtn');
  var deployClose = document.getElementById('deployClose');
  var deployBody = document.getElementById('deployBody');
  var deployRan = false;

  function runDeploy() {
    deployBody.innerHTML = '';
    var seq = [
      { k: 'cmd', text: 'kubectl apply -f career.yaml' },
      { k: 'out', cls: 'tl-out', html: 'deployment.apps/sai-charan <span class="tl-hi">configured</span>' },
      { k: 'cmd', text: 'kubectl rollout status deployment/sai-charan' },
      { k: 'spin', label: 'Waiting for rollout to finish' },
      { k: 'ok', html: 'stack verified — python · kubernetes · terraform · aws' },
      { k: 'ok', html: 'experience synced — 3 years platform engineering' },
      { k: 'ok', html: 'availability confirmed — open to full-time roles (USA)' },
      { k: 'out', cls: 'tl-hi', html: 'deployment "sai-charan" successfully rolled out' },
      { k: 'html', html: '→ ready to ship. <a href="mailto:anugantisaicharan@gmail.com">say hello</a> <span class="t-cursor"></span>' }
    ];
    var i = 0;
    (function next() {
      if (i >= seq.length) return;
      var step = seq[i++];
      if (step.k === 'cmd') {
        typeLine(deployBody, step.text, 'tl-cmd', 46, function () { setTimeout(next, 300); });
      } else if (step.k === 'spin') {
        var s = lineEl('tl-dim', '');
        deployBody.appendChild(s);
        if (reduceMotion) { s.textContent = step.label + '… done'; setTimeout(next, 200); return; }
        var f = 0, rounds = 0;
        var iv = setInterval(function () {
          s.textContent = SPIN[f++ % SPIN.length] + ' ' + step.label + '…';
          if (++rounds > 16) {
            clearInterval(iv);
            s.innerHTML = '<span class="tl-ok">✓</span> rollout complete';
            setTimeout(next, 350);
          }
        }, 90);
      } else if (step.k === 'ok') {
        printLine(deployBody, '<span class="tl-ok">✓</span> ' + escapeHtml(step.html), 'tl-out', 260, function () { setTimeout(next, 300); });
      } else {
        printLine(deployBody, step.html, step.cls || 'tl-out', 300, function () { setTimeout(next, 300); });
      }
    })();
  }

  function openDeploy() {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    deployClose.focus();
    if (!deployRan || reduceMotion) { deployRan = true; runDeploy(); }
    else {
      // re-run for fun on every open
      runDeploy();
    }
  }
  function closeDeploy() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    deployBtn.focus();
  }
  deployBtn.addEventListener('click', openDeploy);
  deployClose.addEventListener('click', closeDeploy);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeDeploy();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeDeploy();
  });

  /* ============ Magnetic buttons ============ */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      var strength = 22;
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (x / r.width * strength) + 'px,' + (y / r.height * strength) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ============ 3D tilt on KubePilot feature card ============ */
  var card = document.getElementById('kubepilotCard');
  if (card && finePointer && !reduceMotion) {
    var raf = null;
    card.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'perspective(1100px) rotateY(' + (px * 5) + 'deg) rotateX(' + (-py * 5) + 'deg)';
        raf = null;
      });
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  }

  /* ============ Hero particle network canvas ============ */
  var canvas = document.getElementById('net');
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, pts = [], running = true, visible = true;
    var COUNT = 70, LINK = 130;

    function resize() {
      var r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = r.width;
      H = canvas.height = r.height;
    }
    function seed() {
      pts = [];
      for (var i = 0; i < COUNT; i++) {
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6
        });
      }
    }
    function frame() {
      if (!running) return;
      requestAnimationFrame(frame);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      ctx.lineWidth = 1;
      for (var a = 0; a < pts.length; a++) {
        for (var b = a + 1; b < pts.length; b++) {
          var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.strokeStyle = 'rgba(45, 212, 191,' + (0.14 * (1 - d / LINK)).toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(pts[a].x, pts[a].y);
            ctx.lineTo(pts[b].x, pts[b].y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
      pts.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    resize();
    seed();
    frame();
    window.addEventListener('resize', function () { resize(); seed(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }).observe(document.querySelector('.hero'));
    }
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (running) frame();
    });
  }
})();
