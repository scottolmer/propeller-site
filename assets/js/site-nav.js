(function () {
  var links = [
    { label: "Picks", href: "/picks/", match: /^\/picks\// },
    { label: "Results", href: "/results/", match: /^\/results\// },
    { label: "Track Record", href: "/track-record/", match: /^\/track-record\// },
    { label: "Method", href: "/how-it-works/", match: /^\/how-it-works\// },
    { label: "Guides", href: "/guides/", match: /^\/guides\// },
    { label: "Tools", href: "/tools/", match: /^\/tools\// },
    { label: "Analyzer", href: "/analyzer/", match: /^\/analyzer\// },
    { label: "Web App", href: "https://app.propellerpicks.com/app", external: true },
    { label: "Get Free Lifetime Access", href: "https://app.propellerpicks.com/signup", external: true, cta: true }
  ];

  function isCurrent(item, path) {
    if (!item.match) return false;
    if (item.href === "/picks/" && path === "/picks") return true;
    return item.match.test(path);
  }

  function linkMarkup(item, path) {
    var rel = item.external ? ' rel="noopener"' : "";
    var current = isCurrent(item, path) ? ' aria-current="page"' : "";
    var className = item.cta ? ' class="cta"' : "";
    return '<a href="' + item.href + '"' + rel + current + className + ">" + item.label + "</a>";
  }

  function navMarkup(path) {
    return [
      '<div class="nav-inner">',
      '<a href="/" class="brand propeller-logo" aria-label="Propeller Picks">',
      '<span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>',
      "<span>Propeller<small>Picks</small></span>",
      "</a>",
      '<button class="nav-menu-button" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="siteNavLinks">',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',
      "</button>",
      '<div class="nav-links" id="siteNavLinks">',
      links.map(function (item) { return linkMarkup(item, path); }).join(""),
      "</div>",
      "</div>"
    ].join("");
  }

  function injectStyles() {
    if (document.getElementById("pp-site-nav-style")) return;
    var style = document.createElement("style");
    style.id = "pp-site-nav-style";
    style.textContent = [
      ".pp-site-nav{position:sticky!important;top:0!important;left:0!important;right:0!important;z-index:1000!important;width:100%!important;height:auto!important;padding:0!important;border:0!important;border-bottom:1px solid rgba(15,23,42,.08)!important;background:rgba(247,249,252,.92)!important;backdrop-filter:blur(20px)!important;color:#111827!important;font-family:Archivo,Inter,system-ui,sans-serif!important;letter-spacing:0!important}",
      ".pp-site-nav .nav-inner{width:min(1440px,calc(100vw - 40px))!important;height:68px!important;margin:0 auto!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:20px!important}",
      ".pp-site-nav .brand{display:flex!important;align-items:center!important;gap:10px!important;color:#111827!important;text-decoration:none!important;font-weight:900!important;font-size:18px!important;line-height:.9!important;text-transform:none!important;letter-spacing:0!important;white-space:nowrap!important}",
      ".pp-site-nav .brand small{display:block!important;margin-top:2px!important;color:#ff6b4a!important;font-size:10px!important;line-height:1!important;letter-spacing:.18em!important;text-transform:uppercase!important}",
      ".pp-site-nav .brand-mark{position:relative!important;width:28px!important;height:28px!important;display:inline-block!important;flex:0 0 28px!important;filter:none!important}",
      ".pp-site-nav .brand-mark span{position:absolute!important;left:12px!important;top:2px!important;width:6px!important;height:18px!important;border-radius:999px!important;background:#ff6b4a!important;transform-origin:50% 12px!important}",
      ".pp-site-nav .brand-mark span:nth-child(2){transform:rotate(120deg)!important}",
      ".pp-site-nav .brand-mark span:nth-child(3){transform:rotate(240deg)!important}",
      ".pp-site-nav .nav-links{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:22px!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;color:#475467!important;font-size:14px!important;font-weight:800!important;text-transform:none!important;letter-spacing:0!important}",
      ".pp-site-nav .nav-links a{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:40px!important;padding:0!important;color:#475467!important;text-decoration:none!important;white-space:nowrap!important;border:0!important;background:transparent!important;box-shadow:none!important}",
      ".pp-site-nav .nav-links a:hover,.pp-site-nav .nav-links a[aria-current=page]{color:#111827!important}",
      ".pp-site-nav .nav-links .cta{min-height:44px!important;padding:0 18px!important;border-radius:12px!important;background:#ff6b4a!important;color:#fff!important;box-shadow:0 12px 28px rgba(255,107,74,.22)!important}",
      ".pp-site-nav .nav-links .cta:hover{color:#fff!important;background:#ff5f3c!important}",
      ".pp-site-nav .nav-menu-button{display:none!important;width:42px!important;height:42px!important;align-items:center!important;justify-content:center!important;border:1px solid rgba(15,23,42,.1)!important;border-radius:12px!important;background:#fff!important;color:#111827!important;padding:0!important}",
      ".pp-site-nav .nav-menu-button svg{width:20px!important;height:20px!important}",
      "@media(max-width:980px){.pp-site-nav .nav-inner{width:min(100% - 24px,1440px)!important;height:62px!important}.pp-site-nav .nav-menu-button{display:inline-flex!important}.pp-site-nav .nav-links{display:none!important;position:absolute!important;top:calc(100% + 8px)!important;left:12px!important;right:12px!important;flex-direction:column!important;align-items:stretch!important;gap:2px!important;padding:10px!important;border:1px solid rgba(15,23,42,.1)!important;border-radius:16px!important;background:rgba(255,255,255,.98)!important;box-shadow:0 18px 42px rgba(15,23,42,.12)!important}.pp-site-nav .nav-links.is-open,.pp-site-nav .nav-links.open{display:flex!important}.pp-site-nav .nav-links a{justify-content:flex-start!important;width:100%!important;min-height:44px!important;padding:0 12px!important;border-radius:10px!important}.pp-site-nav .nav-links .cta{justify-content:center!important;margin-top:4px!important}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function findPrimaryNav() {
    var navs = Array.prototype.slice.call(document.querySelectorAll("nav"));
    return navs.find(function (nav) {
      return !nav.classList.contains("breadcrumb") && nav.getAttribute("aria-label") !== "Breadcrumb";
    });
  }

  function initToggle(nav) {
    var button = nav.querySelector(".nav-menu-button");
    var menu = nav.querySelector(".nav-links");
    if (!button || !menu) return;

    function setOpen(open) {
      menu.classList.toggle("is-open", open);
      menu.classList.toggle("open", open);
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
    injectStyles();
    var nav = findPrimaryNav();
    if (!nav) {
      nav = document.createElement("nav");
      document.body.insertBefore(nav, document.body.firstChild);
    }
    nav.className = "nav pp-site-nav";
    nav.removeAttribute("id");
    nav.removeAttribute("aria-label");
    nav.innerHTML = navMarkup(window.location.pathname);
    initToggle(nav);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSiteNav);
  } else {
    initSiteNav();
  }
})();
