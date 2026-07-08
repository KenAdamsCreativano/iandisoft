// Scroll-reveal for elements marked [data-reveal]
(function () {
  var items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );
  items.forEach(function (item) {
    observer.observe(item);
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
