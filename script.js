// Widow control: stop a heading or paragraph ending with a single word alone on
// its last line. `text-wrap: balance/pretty` in the stylesheet handles most of
// it, but it can't force the final two words to travel together, so here we
// join them with a non-breaking space whenever that pair still fits the column.
// Re-runs on resize because the right answer changes with the layout.
(function () {
  var SEL = 'h1,h2,h3,h4,p,.lead,.hero-copy,li';
  var NBSP = ' ';

  // Number of words sitting on the element's last rendered line.
  function wordsOnLastLine(el, node) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var rects;
    try {
      rects = Array.prototype.filter.call(range.getClientRects(), function (r) {
        return r.width > 0;
      });
    } catch (e) {
      return 0;
    }
    var tops = rects.map(function (r) { return Math.round(r.top); });
    if (!tops.length) return 0;
    var last = Math.max.apply(null, tops);
    var text = node.nodeValue;
    var probe = document.createRange();
    var idx = 0;
    var count = 0;
    text.trim().split(/\s+/).forEach(function (word) {
      var start = text.indexOf(word, idx);
      if (start < 0) return;
      idx = start + word.length;
      try {
        probe.setStart(node, start);
        probe.setEnd(node, idx);
      } catch (e) {
        return;
      }
      if (Math.round(probe.getBoundingClientRect().top) === last) count++;
    });
    return count;
  }

  function apply() {
    document.querySelectorAll(SEL).forEach(function (el) {
      // The last text node is the one holding the final word.
      var node = null;
      for (var i = el.childNodes.length - 1; i >= 0; i--) {
        var n = el.childNodes[i];
        if (n.nodeType === 3 && n.nodeValue.trim()) { node = n; break; }
      }
      if (!node) return;

      // Restore the original so resizing can re-decide from a clean slate.
      if (node.__widowOriginal == null) node.__widowOriginal = node.nodeValue;
      node.nodeValue = node.__widowOriginal;

      var words = node.nodeValue.trim().split(/\s+/);
      // Two-word text has no pair to join: breaking it is unavoidable.
      if (words.length < 3) return;
      if (wordsOnLastLine(el, node) !== 1) return;

      var joined = node.nodeValue.replace(/\s+(\S+)\s*$/, NBSP + '$1');
      var before = el.getBoundingClientRect().height;
      node.nodeValue = joined;

      // Joining must not push the pair wider than its column or add a line.
      if (el.scrollWidth > el.clientWidth + 1 ||
          el.getBoundingClientRect().height > before + 1) {
        node.nodeValue = node.__widowOriginal;
      }
    });
  }

  function schedule() {
    if (schedule.raf) cancelAnimationFrame(schedule.raf);
    schedule.raf = requestAnimationFrame(apply);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  } else {
    schedule();
  }
  // Web fonts land after first paint and change every measurement.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
  window.addEventListener('resize', schedule);
})();

// Scroll-reveal for elements marked [data-reveal]. Groups of sibling cards get
// a small incremental delay so a row arrives as a sweep rather than all at once.
(function () {
  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  var GROUPS = '.cards,.stats,.pipeline,.three,.four,.credential-strip,.form-grid,.bullets';
  var STEP = 70;   // ms between siblings
  var CAP = 6;     // stop compounding, or long rows lag badly

  function stagger(target) {
    var group = target.matches(GROUPS) ? target : target.querySelector(GROUPS);
    if (!group) return;
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.style.transitionDelay = Math.min(i, CAP) * STEP + 'ms';
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          stagger(entry.target);
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    // Hold off until a sliver is past the bottom edge, so the rise reads as a
    // response to scrolling rather than something already finished on arrival.
    { threshold: 0, rootMargin: '0px 0px -12% 0px' }
  );
  items.forEach(function (item) {
    observer.observe(item);
  });
})();

// Stacked-scroll pair: keep the Verity spotlight exactly as tall as the I&I
// Federal band. The band is the taller of the two and its height moves with the
// viewport — its copy wraps onto extra lines as the column narrows — so the
// shared height cannot be a constant. The two cards also sit in different
// sections, which puts sizing one from the other beyond CSS. Measuring the band
// and publishing its height as --stack-card-h keeps them matched at every width,
// which is what makes the band land squarely over the spotlight's content.
(function () {
  var scope = document.querySelector('.stack-scroll');
  if (!scope) return;
  var band = scope.querySelector('.stack-over .band');
  if (!band) return;

  function sync() {
    // Collapse the floor first so the band reports its own content height
    // rather than the value published on the previous pass.
    scope.style.setProperty('--stack-card-h', '0px');
    var natural = Math.ceil(band.getBoundingClientRect().height);
    scope.style.setProperty('--stack-card-h', natural + 'px');
  }

  sync();
  window.addEventListener('resize', sync);
  // Web fonts land after first paint and re-wrap the band's copy.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
})();

// Rotating "larger questions" card: flips through its items one at a time.
(function () {
  var stacks = document.querySelectorAll('[data-flip-stack]');
  if (!stacks.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var HOLD = 3600;

  stacks.forEach(function (stack) {
    var items = stack.querySelectorAll('.flip-item');
    if (items.length < 2) return;
    var dotWrap = stack.querySelector('.flip-dots');
    var index = 0;
    var timer = null;
    var dots = [];

    if (dotWrap) {
      items.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'flip-dot' + (i === 0 ? ' is-on' : '');
        dot.setAttribute('aria-label', 'Show question ' + (i + 1));
        dot.addEventListener('click', function () { show(i); restart(); });
        dotWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function show(next) {
      if (next === index) return;
      var current = items[index];
      current.classList.remove('is-active');
      current.classList.add('is-leaving');
      // Clear the leaving state once it has tipped away, so it is ready to
      // drop back in on the next cycle.
      setTimeout(function () { current.classList.remove('is-leaving'); }, 620);
      items[next].classList.add('is-active');
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === next); });
      index = next;
    }

    function advance() { show((index + 1) % items.length); }
    function start() { if (!timer) timer = setInterval(advance, HOLD); }
    function stop() { clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    // Only run while the card is actually on screen.
    new IntersectionObserver(function (entries) {
      entries[0].isIntersecting ? start() : stop();
    }, { threshold: 0.3 }).observe(stack);

    stack.addEventListener('mouseenter', stop);
    stack.addEventListener('mouseleave', start);
    stack.addEventListener('focusin', stop);
    stack.addEventListener('focusout', start);
  });
})();

// Mobile navigation: hamburger toggle + link-click/escape/resize to close
(function () {
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('primary-menu');
  if (!toggle || !menu) return;

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-locked');
  }

  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-locked');
  }

  toggle.addEventListener('click', function () {
    if (menu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  menu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1080) closeMenu();
  });
})();

// On mobile/tablet, relocate the nav action buttons (Talk to Us + I&I
// Federal) from the top bar into the hamburger menu; restore on desktop.
(function () {
  var menu = document.getElementById('primary-menu');
  var actions = document.querySelector('.nav-actions');
  if (!menu || !actions) return;

  var toggle = actions.querySelector('.menu-toggle');
  var federalBtn = actions.querySelector('.federal-btn');
  var talkBtn = actions.querySelector('.btn-primary');
  if (!federalBtn && !talkBtn) return;

  var holder = document.createElement('div');
  holder.className = 'nav-menu-actions';

  var inMenu = false;
  function place() {
    var mobile = window.innerWidth <= 1080;
    if (mobile && !inMenu) {
      // Talk to Us first (primary), then I&I Federal
      if (talkBtn) holder.appendChild(talkBtn);
      if (federalBtn) holder.appendChild(federalBtn);
      menu.appendChild(holder);
      inMenu = true;
    } else if (!mobile && inMenu) {
      // Restore original order in the top bar: federal, talk, toggle
      if (federalBtn) actions.insertBefore(federalBtn, toggle);
      if (talkBtn) actions.insertBefore(talkBtn, toggle);
      if (holder.parentNode) holder.parentNode.removeChild(holder);
      inMenu = false;
    }
  }

  place();
  window.addEventListener('resize', place);
})();

// Subtle shadow on the sticky header once the page has scrolled.
(function () {
  var topbar = document.querySelector('.topbar');
  if (!topbar) return;
  var onScroll = function () {
    topbar.classList.toggle('scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// Contact form: client-side validation + friendly success state.
// NOTE FOR HANDOFF: this does not send email on its own. Point the
// form at your backend of choice (Formspree, Netlify Forms, a
// serverless function) or replace this handler with your own fetch()
// call — the validation/status UI will keep working around it.
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var statusEl = form.querySelector('.form-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var required = form.querySelectorAll('[required]');
    var valid = true;
    required.forEach(function (field) {
      if (!field.value.trim()) valid = false;
    });
    var email = form.querySelector('#field-email');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      valid = false;
    }

    if (!valid) {
      if (statusEl) {
        statusEl.textContent = 'Please fill in your name, a valid email, and a short message.';
        statusEl.classList.add('is-error');
        statusEl.classList.remove('is-success');
      }
      return;
    }

    if (statusEl) {
      statusEl.textContent = "Thanks — that's sent. We'll be in touch shortly.";
      statusEl.classList.add('is-success');
      statusEl.classList.remove('is-error');
    }
    form.reset();
  });
})();
