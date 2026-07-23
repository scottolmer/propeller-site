(function () {
  "use strict";

  var form = document.getElementById("promptBuilder");
  var output = document.getElementById("promptOutput");
  var status = document.getElementById("promptStatus");
  var copy = document.getElementById("copyPrompt");
  if (!form || !output || !status || !copy) return;

  function track(name) {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, {
        transport_type: "beacon",
        page_location: window.location.href.split("?")[0],
        page_title: document.title
      });
    }
  }

  function value(id) {
    return document.getElementById(id).value.trim();
  }

  function setValue(id, nextValue) {
    var field = document.getElementById(id);
    if (field && nextValue) field.value = nextValue;
  }

  function safeParam(params, name, maxLength) {
    return (params.get(name) || "").trim().slice(0, maxLength);
  }

  function prefillFromQuery() {
    var params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;
    var sportMap = { mlb: "MLB", nba: "NBA", nfl: "NFL", nhl: "NHL", soccer: "Soccer", other: "Other" };
    var sport = sportMap[safeParam(params, "sport", 12).toLowerCase()];
    if (sport) setValue("sport", sport);
    setValue("market", safeParam(params, "market", 80));
    setValue("subject", safeParam(params, "subject", 100));
    setValue("line", safeParam(params, "line", 40));

    if (safeParam(params, "source", 80) === "Propeller public analyzer snapshot") {
      setValue("source", "Propeller public analyzer snapshot");
      var snapshot = safeParam(params, "snapshot", 40);
      if (/^\d{4}-\d{2}-\d{2}T/.test(snapshot)) {
        setValue("context", "Public Analyzer snapshot reported at " + snapshot + ". Re-verify this data and the live line now.");
      } else {
        setValue("context", "This is a limited public Analyzer snapshot. Re-verify this data and the live line now.");
      }
      status.textContent = "A limited public Analyzer snapshot was added. Verify it before generating.";
    }
  }

  function selectTemplate(goal) {
    setValue("goal", goal);
    document.getElementById("sport").focus();
    status.textContent = "Research posture selected. Add the exact sport, market, player or event, and line.";
  }

  var started = false;
  form.addEventListener("input", function () {
    if (!started) {
      started = true;
      track("prompt_builder_started");
    }
  });
  form.addEventListener("change", function () {
    if (!started) {
      started = true;
      track("prompt_builder_started");
    }
  });

  document.querySelectorAll(".air-template[data-goal]").forEach(function (button) {
    button.addEventListener("click", function () {
      selectTemplate(button.getAttribute("data-goal"));
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var required = ["sport", "market", "subject", "line"];
    var missing = required.filter(function (id) { return !value(id); });
    if (missing.length) {
      status.textContent = "Complete sport, market, player/event, and line.";
      document.getElementById(missing[0]).focus();
      copy.disabled = true;
      return;
    }

    var source = value("source") || "the source I provide";
    var context = value("context") || "No additional context provided.";
    var prompt = [
      "Act as a skeptical sports research assistant, not a betting tipster.",
      "",
      "Research question",
      "- Sport: " + value("sport"),
      "- Player or event: " + value("subject"),
      "- Market and line: " + value("market") + " — " + value("line"),
      "- Source/platform: " + source,
      "- Goal: " + value("goal"),
      "- Context: " + context,
      "",
      "Requirements",
      "1. State the current date/time and the timestamp of every time-sensitive source.",
      "2. Verify the exact market line. If you cannot verify it, stop and say so.",
      "3. Check official injury, lineup, roster, and availability sources first.",
      "4. Separate recent form from a relevant longer sample; explain why each sample applies.",
      "5. Evaluate usage/role, matchup, game environment, and market context.",
      "6. Give the strongest case for each side and identify what would invalidate each case.",
      "7. Cite primary sources with direct links. Label inference separately from sourced fact.",
      "8. List missing or conflicting data. Do not invent a statistic, injury, price, or citation.",
      "9. Do not recommend a stake, guarantee an outcome, or claim a probability without calibration evidence.",
      "10. End with one of: evidence leans over, evidence leans under, or no action. Use no action when the line or current evidence is incomplete.",
      "",
      "Return a compact evidence table followed by counterarguments, missing information, and the conclusion."
    ].join("\n");

    output.textContent = prompt;
    status.textContent = "Prompt generated. Review the line and source before copying.";
    copy.disabled = false;
    output.focus();
    track("prompt_generated");
  });

  copy.addEventListener("click", async function () {
    if (copy.disabled) return;
    try {
      await navigator.clipboard.writeText(output.textContent);
      status.textContent = "Prompt copied.";
      track("prompt_copied");
    } catch (error) {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(output);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "Select Copy from your browser to copy the highlighted prompt.";
      track("prompt_copy_fallback");
    }
  });

  document.querySelectorAll(".air-watch__link").forEach(function (link) {
    link.addEventListener("click", function () { track("walkthrough_video_click"); });
  });

  prefillFromQuery();
  track("prompt_builder_view");
})();
