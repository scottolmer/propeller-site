(function (window) {
  "use strict";

  var ENDPOINT = "https://web-production-3c1c4.up.railway.app/api/social/research/nfl/showcase";
  // The only place the homepage names the chat stylesheet; bump ?v= here.
  var CSS_HREF = "/assets/css/research-chat.css?v=20261027";
  var CSS_WAIT_MS = 3000;

  // Adds the chat stylesheet on demand so it never blocks the first paint. Resolves once
  // it loads, fails, or CSS_WAIT_MS passes, so a slow stylesheet cannot strand the section.
  function ensureStyles(doc) {
    return new Promise(function (resolve) {
      if (!doc || !doc.head || typeof doc.createElement !== "function") { resolve(); return; }
      if (doc.querySelector && doc.querySelector('link[href="' + CSS_HREF + '"]')) { resolve(); return; }
      var settled = false;
      function finish() { if (!settled) { settled = true; resolve(); } }
      var link = doc.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_HREF;
      link.onload = finish;
      link.onerror = finish;
      if (typeof window.setTimeout === "function") window.setTimeout(finish, CSS_WAIT_MS);
      doc.head.appendChild(link);
    });
  }

  // Local-only preview hook: ?researchFixture=showcase|down. Loopback hosts only.
  var LOCAL_HOSTS = { "localhost": 1, "127.0.0.1": 1, "[::1]": 1 };
  function fixtureMode(loc) {
    if (!loc || !Object.prototype.hasOwnProperty.call(LOCAL_HOSTS, loc.hostname)) return null;
    var m = /[?&]researchFixture=([a-z]+)(?:&|$)/.exec(String(loc.search || ""));
    return m && (m[1] === "showcase" || m[1] === "down") ? m[1] : null;
  }

  // Fetches the daily conversation only once the placeholder nears the viewport, so the
  // homepage load path never waits on it. Any failure leaves the section hidden.
  function init(deps) {
    var section = deps.section;
    var mount = deps.mount;
    var sentinel = deps.sentinel;
    var fetchFn = deps.fetchFn;
    var IO = deps.IntersectionObserver;
    var chat = window.ppResearchChat;
    if (!section || !mount || !fetchFn || !chat) return Promise.resolve(false);

    var started = false;
    var resolveDone;
    var done = new Promise(function (resolve) { resolveDone = resolve; });

    function load() {
      if (started) return;
      started = true;
      var styles = ensureStyles(deps.document || window.document);
      Promise.resolve()
        .then(function () {
          var mode = fixtureMode(deps.location || window.location);
          if (mode === "down") throw new Error("fixture down");
          return fetchFn(mode ? "/scripts/fixtures/research-nfl-showcase.json" : ENDPOINT);
        })
        .then(function (res) {
          if (!res || !res.ok) throw new Error("showcase unavailable");
          return res.json();
        })
        .then(function (body) {
          if (!body || body.status !== "ok" || !body.showcase) throw new Error("showcase unavailable");
          return styles.then(function () { return body; });
        })
        .then(function (body) {
          chat.mountResearchChat(mount, { transcript: body.showcase, surface: "home", externalCtas: true });
          if (!mount.innerHTML) throw new Error("showcase empty");
          section.hidden = false;
          resolveDone(true);
        })
        .catch(function () {
          section.hidden = true;
          mount.innerHTML = "";
          resolveDone(false);
        });
    }

    if (!IO) {
      resolveDone(false);
      return done;
    }
    var observer = new IO(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          observer.disconnect();
          load();
          return;
        }
      }
    }, { rootMargin: "400px 0px" });
    observer.observe(sentinel);
    return done;
  }

  window.ppHomeShowcase = { init: init, fixtureMode: fixtureMode, CSS_HREF: CSS_HREF };

  if (window.document && window.document.getElementById && typeof window.fetch === "function") {
    var d = window.document;
    init({
      section: d.getElementById("showcase"),
      mount: d.getElementById("showcase-chat"),
      sentinel: d.getElementById("showcase-sentinel"),
      fetchFn: function (u) { return window.fetch(u, { headers: { Accept: "application/json" } }); },
      IntersectionObserver: window.IntersectionObserver
    });
  }
})(window);
