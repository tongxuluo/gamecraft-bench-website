document.querySelectorAll(".demo-carousel").forEach((carousel) => {
  const track = carousel.querySelector(".demo-track");
  if (!track) {
    return;
  }

  let paused = false;
  let sliding = false;

  const rotate = () => {
    if (paused || sliding || window.matchMedia("(max-width: 820px)").matches) {
      return;
    }

    const firstCard = track.querySelector(".demo-card");
    if (!firstCard) {
      return;
    }

    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || "0");
    const distance = firstCard.getBoundingClientRect().width + gap;
    sliding = true;
    track.style.transform = `translate3d(-${distance}px, 0, 0)`;
    track.classList.add("is-sliding");
  };

  track.addEventListener("transitionend", (event) => {
    if (event.target !== track || event.propertyName !== "transform") {
      return;
    }

    if (track.firstElementChild) {
      track.appendChild(track.firstElementChild);
    }
    track.classList.remove("is-sliding");
    track.style.transform = "translate3d(0, 0, 0)";
    sliding = false;
  });

  carousel.addEventListener("pointerenter", () => {
    paused = true;
  });
  carousel.addEventListener("pointerleave", () => {
    paused = false;
  });
  carousel.addEventListener("focusin", () => {
    paused = true;
  });
  carousel.addEventListener("focusout", () => {
    paused = false;
  });

  window.setInterval(rotate, 3200);
});

document.querySelectorAll("[data-citation-copy]").forEach((btn) => {
  const box = btn.closest(".citation-box");
  const code = box ? box.querySelector("pre code") : null;
  if (!code) return;

  let resetTimer = null;
  btn.addEventListener("click", async () => {
    const text = code.textContent || "";
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      btn.textContent = "Copied";
      btn.classList.add("is-copied");
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        btn.textContent = "Copy";
        btn.classList.remove("is-copied");
      }, 2000);
    } catch (err) {
      btn.textContent = "Copy failed";
      if (resetTimer) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        btn.textContent = "Copy";
      }, 2000);
    }
  });
});

// ---------- Cursor glow (rAF lerp) + pooled ripples ----------
(function() {
  var glow = document.getElementById('cursor-glow');
  if (!glow) return;
  var noFancy = window.matchMedia &&
    (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
     window.matchMedia('(hover: none)').matches);
  if (noFancy) return;

  var tgtX = 0, tgtY = 0, curX = 0, curY = 0;
  var running = false, primed = false;
  var EASE = 0.16;

  function frame() {
    curX += (tgtX - curX) * EASE;
    curY += (tgtY - curY) * EASE;
    glow.style.transform = 'translate3d(' + curX + 'px,' + curY + 'px,0)';
    if (Math.abs(tgtX - curX) > 0.4 || Math.abs(tgtY - curY) > 0.4) {
      requestAnimationFrame(frame);
    } else {
      glow.style.transform = 'translate3d(' + tgtX + 'px,' + tgtY + 'px,0)';
      running = false;
    }
  }
  function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

  var POOL = 8, pool = [], pi = 0;
  for (var i = 0; i < POOL; i++) {
    var el = document.createElement('div');
    el.className = 'cursor-ripple';
    document.body.appendChild(el);
    pool.push(el);
  }
  function ripple(x, y) {
    var el = pool[pi]; pi = (pi + 1) % POOL;
    el.style.setProperty('--x', x + 'px');
    el.style.setProperty('--y', y + 'px');
    el.classList.remove('go');
    void el.offsetWidth;
    el.classList.add('go');
  }

  var lastRX = -9999, lastRY = -9999, lastRT = 0;
  document.addEventListener('mousemove', function(e) {
    tgtX = e.clientX; tgtY = e.clientY;
    if (!primed) { curX = tgtX; curY = tgtY; primed = true; glow.style.opacity = '1'; }
    kick();
    var now = e.timeStamp || performance.now();
    var dx = tgtX - lastRX, dy = tgtY - lastRY;
    if ((dx * dx + dy * dy) > 1100 && (now - lastRT) > 110) {
      ripple(tgtX, tgtY);
      lastRX = tgtX; lastRY = tgtY; lastRT = now;
    }
  }, { passive: true });

  document.addEventListener('mousedown', function(e) { ripple(e.clientX, e.clientY); }, { passive: true });
})();

// ---------- Back to top ----------
(function() {
  var btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', function() {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ---------- Author / affiliation highlight ----------
(function() {
  var authors = Array.from(document.querySelectorAll('.author'));
  var affs = Array.from(document.querySelectorAll('.aff'));
  var all = authors.concat(affs);

  function getAffs(el) {
    return (el.dataset.aff || '').split(',').map(function(s){ return s.trim(); });
  }

  function highlight(activeAffs) {
    all.forEach(function(el) {
      var elAffs = getAffs(el);
      var match = activeAffs.some(function(a){ return elAffs.indexOf(a) !== -1; });
      el.classList.toggle('aff-highlight', match);
      el.classList.toggle('aff-dim', !match);
    });
  }

  function reset() {
    all.forEach(function(el) {
      el.classList.remove('aff-highlight', 'aff-dim');
    });
  }

  all.forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      var activeAffs = getAffs(el);
      var isAuthor = el.classList.contains('author');
      all.forEach(function(other) {
        var otherAffs = getAffs(other);
        var match;
        if (isAuthor && other.classList.contains('author')) {
          // hovering an author: only highlight that exact author, not co-affiliates
          match = other === el;
        } else {
          match = activeAffs.some(function(a){ return otherAffs.indexOf(a) !== -1; });
        }
        other.classList.toggle('aff-highlight', match);
        other.classList.toggle('aff-dim', !match);
      });
    });
    el.addEventListener('mouseleave', reset);
  });
})();

// ---------- Play modal ----------
(function() {
  var modal  = document.getElementById('play-modal');
  if (!modal) return;
  var iframe = modal.querySelector('.play-modal-iframe');
  var closers = modal.querySelectorAll('[data-close]');
  var lastFocus = null;

  function open(url) {
    lastFocus = document.activeElement;
    iframe.src = url;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('play-modal-open');
    var btn = modal.querySelector('.play-modal-close');
    if (btn) btn.focus();
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('play-modal-open');
    iframe.src = 'about:blank';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function(e) {
    var a = e.target.closest && e.target.closest('a.play-link');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    // Mobile / narrow-viewport: show "best on PC" banner instead of opening
    if (window.matchMedia && window.matchMedia('(max-width: 820px)').matches) {
      showPcOnlyBanner();
      return;
    }
    open(href);
  });

  function showPcOnlyBanner() {
    var b = document.getElementById('pc-only-banner');
    if (!b) return;
    b.classList.add('is-visible');
    b.setAttribute('aria-hidden', 'false');
    if (showPcOnlyBanner._t) clearTimeout(showPcOnlyBanner._t);
    showPcOnlyBanner._t = setTimeout(function() {
      b.classList.remove('is-visible');
      b.setAttribute('aria-hidden', 'true');
    }, 6000);
  }
  var bannerClose = document.getElementById('pc-only-banner-close');
  if (bannerClose) bannerClose.addEventListener('click', function() {
    var b = document.getElementById('pc-only-banner');
    if (b) {
      b.classList.remove('is-visible');
      b.setAttribute('aria-hidden', 'true');
    }
  });

  closers.forEach(function(el) {
    el.addEventListener('click', close);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();

// ---------- Family grid: See more / Show less (mobile) ----------
(function() {
  var btn = document.getElementById('family-toggle');
  var grid = document.getElementById('family-grid');
  if (!btn || !grid) return;
  btn.addEventListener('click', function() {
    var expanded = grid.classList.toggle('is-expanded');
    btn.textContent = expanded ? 'Show less' : 'See more';
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });
})();
