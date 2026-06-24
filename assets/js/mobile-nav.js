(function () {
  function initMobileNav() {
    var nav = document.querySelector('.nav');
    var button = document.querySelector('.nav-menu-button');
    var links = document.querySelector('.nav-links');

    if (!nav || !button || !links) return;

    function setOpen(isOpen) {
      links.classList.toggle('is-open', isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
      button.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    }

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      setOpen(!links.classList.contains('is-open'));
    });

    links.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 761px)').matches) setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
