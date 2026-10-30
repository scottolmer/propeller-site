(function () {
  function usableRow(row) {
    return row && typeof row.player_name === "string" && row.player_name.trim() &&
      typeof row.stat_type === "string" && row.stat_type.trim() &&
      row.line !== null && row.line !== "" && Number.isFinite(Number(row.line)) &&
      row.final_score !== null && row.final_score !== "" &&
      Number.isFinite(Number(row.final_score)) && Number(row.final_score) >= 0 && Number(row.final_score) <= 100 &&
      (row.final_direction === "OVER" || row.final_direction === "UNDER");
  }

  // Keep the strongest row for each player so a short board is not filled by
  // one player's correlated stats (the feed is sorted strongest first).
  function onePerPlayer(rows) {
    var seen = {};
    return rows.filter(function (row) {
      var key = row.player_name.trim().toLowerCase();
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  // The public preview provides a slate date and response generation time,
  // not an analysis timestamp or a verified PrizePicks market identity.
  function inspect(data, requestedDate, options) {
    if (!data || data.game_date !== requestedDate || !Array.isArray(data.props)) {
      return { valid: false, props: [], generatedAt: null };
    }
    var props = data.props.filter(function (row) {
      return usableRow(row) && (!row.game_date || row.game_date === requestedDate);
    });
    if (options && options.onePerPlayer) props = onePerPlayer(props);
    props = props.slice(0, 5);
    var generatedAt = typeof data.generated_at === "string" &&
      Number.isFinite(Date.parse(data.generated_at)) ? data.generated_at : null;
    return { valid: true, props: props, generatedAt: generatedAt };
  }

  // The NFL board is a game-week slate, not a single date. Only a "ready"
  // slate counts, and only games that have not started yet are shown, so a
  // finished Sunday never reads as current research.
  function inspectNflWeek(data, nowMs) {
    if (!data || data.state !== "ready" || !Array.isArray(data.props)) {
      return { valid: false, props: [], week: null };
    }
    var now = Number.isFinite(nowMs) ? nowMs : Date.now();
    var props = data.props.filter(function (row) {
      if (!usableRow(row)) return false;
      var kickoff = Date.parse(row.commence_time);
      return Number.isFinite(kickoff) && kickoff > now;
    });
    props = onePerPlayer(props).slice(0, 5);
    var week = Number.isInteger(data.week) && data.week > 0 ? data.week : null;
    return { valid: true, props: props, week: week };
  }

  window.ppPrizePicksSlate = { inspect: inspect, inspectNflWeek: inspectNflWeek };
})();
