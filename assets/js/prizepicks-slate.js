(function () {
  // The public preview provides a slate date and response generation time,
  // not an analysis timestamp or a verified PrizePicks market identity.
  function inspect(data, requestedDate) {
    if (!data || data.game_date !== requestedDate || !Array.isArray(data.props)) {
      return { valid: false, props: [], generatedAt: null };
    }
    var props = data.props.filter(function (row) {
      return row && typeof row.player_name === "string" && row.player_name.trim() &&
        typeof row.stat_type === "string" && row.stat_type.trim() &&
        row.line !== null && row.line !== "" && Number.isFinite(Number(row.line)) &&
        row.final_score !== null && row.final_score !== "" &&
        Number.isFinite(Number(row.final_score)) && Number(row.final_score) >= 0 && Number(row.final_score) <= 100 &&
        (row.final_direction === "OVER" || row.final_direction === "UNDER") &&
        (!row.game_date || row.game_date === requestedDate);
    }).slice(0, 5);
    var generatedAt = typeof data.generated_at === "string" &&
      Number.isFinite(Date.parse(data.generated_at)) ? data.generated_at : null;
    return { valid: true, props: props, generatedAt: generatedAt };
  }
  window.ppPrizePicksSlate = { inspect: inspect };
})();
