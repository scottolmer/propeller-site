(function () {
  // Companion to scripts/render_picks_snapshot.py.
  // The static snapshot exists so the rows are in the HTML before JavaScript
  // runs. In a browser it must never pass for live data: hide it when its
  // slate date is not today (Eastern time), and as soon as the page's own
  // loader shows live rows or its empty state.
  function todayET() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(new Date());
    var out = {};
    parts.forEach(function (part) { out[part.type] = part.value; });
    return out.year + "-" + out.month + "-" + out.day;
  }

  // Empty-state copy lives in a <template> so it is not in the page text
  // until the loader actually needs to show it.
  var template = document.getElementById("picksEmptyTemplate");
  var empty = document.getElementById("picksEmpty");
  if (template && empty && !empty.firstElementChild && template.content) {
    empty.appendChild(template.content.cloneNode(true));
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  var snapshot = document.getElementById("picksSnapshot");
  if (!snapshot) return;

  function hide() { snapshot.hidden = true; snapshot.style.display = "none"; }

  if (snapshot.getAttribute("data-slate-date") !== todayET()) { hide(); return; }

  var skeleton = document.getElementById("picksSkeletonGrid");
  if (skeleton && Number(snapshot.getAttribute("data-row-count")) > 0) {
    skeleton.style.display = "none";
  }

  function shown(element) {
    return element && element.style.display !== "none";
  }

  var output = document.getElementById("picksOutput");
  var container = document.getElementById("picks-container");
  if (typeof MutationObserver !== "function") return;

  if (output || empty) {
    var check = function () { if (shown(output) || shown(empty)) { hide(); observer.disconnect(); } };
    var observer = new MutationObserver(check);
    if (output) observer.observe(output, { attributes: true, attributeFilter: ["style"] });
    if (empty) observer.observe(empty, { attributes: true, attributeFilter: ["style"] });
    check();
  } else if (container) {
    var nflObserver = new MutationObserver(function () {
      if (!document.getElementById("picks-loading")) { hide(); nflObserver.disconnect(); }
    });
    nflObserver.observe(container, { childList: true });
  }
})();
