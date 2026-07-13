(function () {
  function loadSignupAttribution() {
    if (window.ppSignupAttribution) {
      window.ppSignupAttribution.init();
      return;
    }
    if (document.getElementById("pp-signup-attribution-script")) return;
    var script = document.createElement("script");
    script.id = "pp-signup-attribution-script";
    script.src = "/assets/js/signup-attribution.js?v=20260712";
    script.defer = true;
    document.head.appendChild(script);
  }

  function setCurrentLink(nav) {
    var path = window.location.pathname.replace(/\/+$/, "") || "/";
    nav.querySelectorAll("[data-section]").forEach(function (link) {
      var section = link.getAttribute("data-section");
      var current = path === "/" + section || path.indexOf("/" + section + "/") === 0;
      if (current) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function initToggle(nav) {
    var button = nav.querySelector(".pp-site-nav__menu");
    var menu = nav.querySelector(".pp-site-nav__links");
    if (!button || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      setOpen(!menu.classList.contains("is-open"));
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });
  }

  function initSiteNav() {
    var nav = document.querySelector(".pp-site-nav");
    if (nav) {
      setCurrentLink(nav);
      initToggle(nav);
    }
    loadSignupAttribution();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteNav);
  } else {
    initSiteNav();
  }
})();
