const state = {
  data: null,
  period: "28",
  view: "overview",
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const fmt = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-US").format(number);
};

const fmtCompact = (value) => {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: number < 1000 ? 0 : 1,
  }).format(number);
};

const pct = (value) => `${Number(value || 0).toFixed(1)}%`;

const duration = (seconds) => {
  const total = Math.round(Number(seconds || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return mins ? `${mins}m ${secs}s` : `${secs}s`;
};

const AI_REFERRER_PATTERNS = [
  ["chatgpt", "ChatGPT"],
  ["openai", "OpenAI"],
  ["perplexity", "Perplexity"],
  ["copilot", "Copilot"],
  ["claude", "Claude"],
  ["anthropic", "Claude"],
  ["gemini", "Gemini"],
  ["bard", "Gemini"],
  ["poe.com", "Poe"],
  ["you.com", "You.com"],
  ["phind", "Phind"],
  ["ai-assistant", "AI Assistant"],
];

function aiReferrerLabel(sourceMedium) {
  const normalized = String(sourceMedium || "").toLowerCase();
  const match = AI_REFERRER_PATTERNS.find(([pattern]) => normalized.includes(pattern));
  return match?.[1] || null;
}

function deriveAiReferrals(period) {
  const sources = safeRows(period.ga.sourceMedium, 100)
    .map((row) => {
      const assistant = aiReferrerLabel(row.sessionSourceMedium);
      if (!assistant) return null;
      return {
        assistant,
        sourceMedium: row.sessionSourceMedium,
        sessions: row.sessions || 0,
        users: row.totalUsers || 0,
        newUsers: row.newUsers || 0,
        engagedSessions: row.engagedSessions || 0,
        eventCount: row.eventCount || 0,
      };
    })
    .filter(Boolean);
  const channel = safeRows(period.ga.channels, 100).find((row) => row.sessionDefaultChannelGroup === "AI Assistant");
  return {
    sessions: sources.reduce((sum, row) => sum + Number(row.sessions || 0), 0),
    users: sources.reduce((sum, row) => sum + Number(row.users || 0), 0),
    newUsers: sources.reduce((sum, row) => sum + Number(row.newUsers || 0), 0),
    engagedSessions: sources.reduce((sum, row) => sum + Number(row.engagedSessions || 0), 0),
    eventCount: sources.reduce((sum, row) => sum + Number(row.eventCount || 0), 0),
    channelSessions: channel?.sessions || 0,
    channelUsers: channel?.totalUsers || 0,
    sources,
  };
}

function aiReferrals(period) {
  return period.ga.aiReferrals || deriveAiReferrals(period);
}

const shortDate = (value) => {
  if (!value) return "";
  const normalized = value.length === 8
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    : value;
  return new Date(`${normalized}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const deltaPill = (value, inverse = false) => {
  if (value === null || value === undefined) return `<span class="delta">new</span>`;
  const number = Number(value);
  const good = inverse ? number < 0 : number > 0;
  const bad = inverse ? number > 0 : number < 0;
  const className = good ? "good" : bad ? "bad" : "";
  const sign = number > 0 ? "+" : "";
  return `<span class="delta ${className}">${sign}${number.toFixed(1)}%</span>`;
};

const safeRows = (rows, limit = 10) => Array.isArray(rows) ? rows.slice(0, limit) : [];

function currentPeriod() {
  return state.data?.periods?.[state.period] || state.data?.periods?.["28"];
}

function setHtml(id, html) {
  const node = document.getElementById(id);
  if (node) node.innerHTML = html;
}

function renderSourceStrip() {
  const meta = state.data.meta;
  const period = currentPeriod();
  const gaRange = period.ga.dateRange;
  const gscRange = period.gsc.dateRange;
  setHtml("sourceStrip", `
    <div class="source-pill">
      <small>GA4 property</small>
      <strong>${meta.gaProperty}</strong>
      <span>${gaRange.start} to ${gaRange.end}</span>
    </div>
    <div class="source-pill">
      <small>GSC property</small>
      <strong>${meta.gscProperty}</strong>
      <span>${gscRange.start} to ${gscRange.end}</span>
    </div>
  `);
}

function renderMeta() {
  const meta = state.data.meta;
  const generated = new Date(meta.generatedAt);
  $("#snapshotMeta").textContent = `Updated ${generated.toLocaleString()} | ${state.period}D`;
}

function metric(label, value, detail, delta, inverse = false, className = "") {
  return `
    <article class="metric-card ${className}">
      <small>${label}</small>
      <strong>${value}</strong>
      <span>${detail} ${delta !== undefined ? deltaPill(delta, inverse) : ""}</span>
    </article>
  `;
}

function renderMetrics() {
  const period = currentPeriod();
  const ga = period.ga.overview;
  const gsc = period.gsc.totals;
  const ai = aiReferrals(period);
  setHtml("metricGrid", [
    metric("Users", fmt(ga.users), "GA4", ga.delta?.users),
    metric("Sessions", fmt(ga.sessions), "GA4", ga.delta?.sessions),
    metric("Page views", fmt(ga.pageViews), "GA4", ga.delta?.pageViews),
    metric("Engagement", pct(ga.engagementRate), `${fmt(ga.engagedSessions)} engaged`),
    metric("Events", fmt(ga.eventCount), "GA4", ga.delta?.eventCount),
    metric("AI referrals", fmt(ai.sessions), `${fmt(ai.users)} source users`, ai.delta?.sessions, false, "ai-signal"),
    metric("Clicks", fmt(gsc.clicks), "GSC web", gsc.delta?.clicks),
    metric("Impressions", fmt(gsc.impressions), "GSC web", gsc.delta?.impressions),
    metric("Avg position", Number(gsc.position || 0).toFixed(1), `${pct(gsc.ctr)} CTR`, undefined, true),
  ].join(""));
}

function niceMax(values) {
  const max = Math.max(...values.map((value) => Number(value || 0)), 1);
  const magnitude = 10 ** Math.floor(Math.log10(max));
  const normalized = max / magnitude;
  const rounded = normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return rounded * magnitude;
}

function yFor(value, max, plot) {
  return plot.top + (1 - (Number(value || 0) / max)) * plot.height;
}

function pathFor(values, max, plot) {
  if (!values.length) return "";
  const step = values.length > 1 ? plot.width / (values.length - 1) : 0;
  return values.map((value, index) => {
    const x = plot.left + index * step;
    const y = yFor(value, max, plot);
    return `${index === 0 ? "M" : "L"} ${Math.round(x)} ${Math.round(y)}`;
  }).join(" ");
}

function renderTrend() {
  const period = currentPeriod();
  const gaByDate = new Map(period.ga.daily.map((row) => [row.date, row]));
  const gscByDate = new Map(period.gsc.daily.map((row) => [row.date.replaceAll("-", ""), row]));
  const dates = Array.from(new Set([...gaByDate.keys(), ...gscByDate.keys()])).sort();
  const users = dates.map((date) => gaByDate.get(date)?.totalUsers || 0);
  const sessions = dates.map((date) => gaByDate.get(date)?.sessions || 0);
  const impressions = dates.map((date) => gscByDate.get(date)?.impressions || 0);
  const chartNode = document.getElementById("trendChart");
  const compact = Number(chartNode?.clientWidth || 0) < 520;
  const width = compact ? 430 : 980;
  const height = compact ? 270 : 300;
  const plot = compact
    ? { left: 54, right: 64, top: 18, bottom: 42 }
    : { left: 72, right: 88, top: 18, bottom: 40 };
  plot.width = width - plot.left - plot.right;
  plot.height = height - plot.top - plot.bottom;
  const trafficMax = niceMax([...users, ...sessions]);
  const impressionMax = niceMax(impressions);
  const tickRatios = [1, 0.75, 0.5, 0.25, 0];

  setHtml("trendChart", `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Daily users, sessions, and search impressions">
      ${tickRatios.map((ratio) => {
        const y = Math.round(plot.top + (1 - ratio) * plot.height);
        return `
          <line x1="${plot.left}" x2="${plot.left + plot.width}" y1="${y}" y2="${y}" stroke="rgba(15,23,42,.08)" />
          <text x="${plot.left - 12}" y="${y + 4}" text-anchor="end" class="axis-tick">${fmtCompact(trafficMax * ratio)}</text>
          <text x="${plot.left + plot.width + 12}" y="${y + 4}" text-anchor="start" class="axis-tick">${fmtCompact(impressionMax * ratio)}</text>
        `;
      }).join("")}
      <line x1="${plot.left}" x2="${plot.left}" y1="${plot.top}" y2="${plot.top + plot.height}" class="axis-line" />
      <line x1="${plot.left + plot.width}" x2="${plot.left + plot.width}" y1="${plot.top}" y2="${plot.top + plot.height}" class="axis-line" />
      <text x="${plot.left}" y="${height - 8}" class="axis-title">GA users/sessions</text>
      <text x="${plot.left + plot.width}" y="${height - 8}" text-anchor="end" class="axis-title">GSC impressions</text>
      <path d="${pathFor(impressions, impressionMax, plot)}" fill="none" stroke="#16a34a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="${pathFor(sessions, trafficMax, plot)}" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="${pathFor(users, trafficMax, plot)}" fill="none" stroke="#ff6b4a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
    <div class="axis-labels"><span>${shortDate(dates[0])}</span><span>${shortDate(dates[dates.length - 1])}</span></div>
  `);
}

function renderLiveSignals() {
  const period = currentPeriod();
  const realtime = state.data.realtime || {};
  const sitemapErrors = (state.data.sitemaps || []).reduce((sum, item) => sum + Number(item.errors || 0), 0);
  const localUrls = state.data.local?.sitemap?.urlCount || 0;
  const ai = aiReferrals(period);
  setHtml("liveSignals", `
    <div class="signal-stack">
      <div class="signal"><small>Active users</small><strong>${fmt(realtime.activeUsers)}</strong></div>
      <div class="signal"><small>AI referrals</small><strong>${fmt(ai.sessions)}</strong></div>
      <div class="signal"><small>Bounce rate</small><strong>${pct(period.ga.overview.bounceRate)}</strong></div>
      <div class="signal"><small>Avg session</small><strong>${duration(period.ga.overview.avgSessionDuration)}</strong></div>
      <div class="signal"><small>Sitemap URLs</small><strong>${fmt(localUrls)}</strong></div>
      <div class="signal"><small>GSC sitemap errors</small><strong>${fmt(sitemapErrors)}</strong></div>
    </div>
  `);
}

function bars(rows, labelKey, valueKey, detailKeys = [], limit = 10) {
  const list = safeRows(rows, limit);
  const max = Math.max(...list.map((row) => Number(row[valueKey] || 0)), 1);
  if (!list.length) return `<div class="empty-state">No rows in this window.</div>`;
  return `
    <div class="bar-list">
      ${list.map((row) => {
        const value = Number(row[valueKey] || 0);
        const detail = detailKeys.map((key) => `${key.label}: <span class="mono">${key.format ? key.format(row[key.field]) : fmt(row[key.field])}</span>`).join(" ");
        return `
          <div class="row-bar">
            <div>
              <strong title="${row[labelKey] || ""}">${row[labelKey] || "(not set)"}</strong>
              <small>${detail}</small>
            </div>
            <span class="mono">${fmt(value)}</span>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, (value / max) * 100)}%"></div></div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function table(headers, rows, limit = 20) {
  const visible = safeRows(rows, limit);
  if (!visible.length) return `<div class="empty-state">No rows in this window.</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>${headers.map((header) => `<th>${header.label}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${visible.map((row) => `
            <tr>
              ${headers.map((header) => {
                const value = header.format ? header.format(row[header.key], row) : row[header.key];
                return `<td class="${header.className || ""}">${value ?? ""}</td>`;
              }).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderOverview() {
  const period = currentPeriod();
  const ai = aiReferrals(period);
  setHtml("aiReferrers", `
    <div class="ai-summary">
      <div><small>Sessions</small><strong>${fmt(ai.sessions)}</strong></div>
      <div><small>Users</small><strong>${fmt(ai.users)}</strong></div>
      <div><small>Engaged</small><strong>${fmt(ai.engagedSessions)}</strong></div>
      <div><small>Events</small><strong>${fmt(ai.eventCount)}</strong></div>
      <div><small>GA channel</small><strong>${fmt(ai.channelSessions || 0)}</strong></div>
    </div>
    ${table([
      { label: "Assistant", key: "assistant" },
      { label: "Source / medium", key: "sourceMedium", className: "url-cell" },
      { label: "Sessions", key: "sessions", format: fmt },
      { label: "Users", key: "users", format: fmt },
      { label: "Engaged", key: "engagedSessions", format: fmt },
      { label: "Events", key: "eventCount", format: fmt },
    ], ai.sources || [], 12)}
  `);
  setHtml("channelMix", bars(period.ga.channels, "sessionDefaultChannelGroup", "sessions", [
    { label: "Users", field: "totalUsers" },
    { label: "Events", field: "eventCount" },
  ]));
  setHtml("sourceMedium", bars(period.ga.sourceMedium, "sessionSourceMedium", "sessions", [
    { label: "Users", field: "totalUsers" },
    { label: "Engaged", field: "engagedSessions" },
  ], 12));
  setHtml("landingPages", table([
    { label: "Landing page", key: "landingPagePlusQueryString", className: "url-cell" },
    { label: "Sessions", key: "sessions", format: fmt },
    { label: "Users", key: "totalUsers", format: fmt },
    { label: "Views", key: "screenPageViews", format: fmt },
    { label: "Avg session", key: "averageSessionDuration", format: duration },
    { label: "Bounce", key: "bounceRate", format: (value) => pct(Number(value || 0) * 100) },
    { label: "Events", key: "eventCount", format: fmt },
  ], period.ga.landingPages, 24));
}

function renderSearch() {
  const period = currentPeriod();
  const searchHeaders = [
    { label: "Query", key: "query", className: "query-cell" },
    { label: "Clicks", key: "clicks", format: fmt },
    { label: "Impr.", key: "impressions", format: fmt },
    { label: "CTR", key: "ctr", format: pct },
    { label: "Pos.", key: "position", format: (value) => Number(value || 0).toFixed(1) },
  ];
  const queryPageHeaders = [
    ...searchHeaders,
    { label: "Page", key: "page", className: "url-cell", format: (value) => pageLabel(value) },
  ];
  setHtml("topQueries", table(searchHeaders, period.gsc.queries, 24));
  setHtml("quickWins", table(queryPageHeaders, period.gsc.quickWins, 24));
  setHtml("lowCtr", table(queryPageHeaders, period.gsc.lowCtr, 24));
  setHtml("questionQueries", table(searchHeaders, period.gsc.questions, 24));
  setHtml("gscCountries", bars(period.gsc.countries, "country", "impressions", [
    { label: "Clicks", field: "clicks" },
    { label: "CTR", field: "ctr", format: pct },
  ], 10));
  setHtml("gscDevices", bars(period.gsc.devices, "device", "impressions", [
    { label: "Clicks", field: "clicks" },
    { label: "CTR", field: "ctr", format: pct },
  ], 8));
  setHtml("searchAppearance", table([
    { label: "Appearance", key: "searchAppearance" },
    { label: "Clicks", key: "clicks", format: fmt },
    { label: "Impr.", key: "impressions", format: fmt },
    { label: "CTR", key: "ctr", format: pct },
    { label: "Pos.", key: "position", format: (value) => Number(value || 0).toFixed(1) },
  ], period.gsc.appearances, 10));
}

function pageLabel(value) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.pathname || "/";
  } catch {
    return value;
  }
}

function renderContent() {
  const period = currentPeriod();
  setHtml("contentMatrix", table([
    { label: "Path", key: "path", className: "url-cell" },
    { label: "Views", key: "pageViews", format: fmt },
    { label: "Users", key: "users", format: fmt },
    { label: "Clicks", key: "clicks", format: fmt },
    { label: "Impr.", key: "impressions", format: fmt },
    { label: "CTR", key: "ctr", format: pct },
    { label: "Pos.", key: "position", format: (value) => Number(value || 0).toFixed(1) },
    { label: "Avg session", key: "avgSessionDuration", format: duration },
    { label: "Events", key: "eventCount", format: fmt },
  ], period.contentMatrix, 40));
  setHtml("contentDecay", table([
    { label: "Path", key: "path", className: "url-cell" },
    { label: "Clicks", key: "clicks", format: fmt },
    { label: "Prev clicks", key: "previousClicks", format: fmt },
    { label: "Click delta", key: "clickDelta", format: (value) => `<span class="mono">${Number(value || 0)}</span>` },
    { label: "Impr.", key: "impressions", format: fmt },
    { label: "Prev impr.", key: "previousImpressions", format: fmt },
    { label: "Impr. delta", key: "impressionDelta", format: (value) => `<span class="mono">${Number(value || 0)}</span>` },
  ], period.gsc.decay, 24));
}

function renderAudience() {
  const period = currentPeriod();
  setHtml("devices", bars(period.ga.devices, "deviceCategory", "totalUsers", [
    { label: "Sessions", field: "sessions" },
    { label: "Bounce", field: "bounceRate", format: (value) => pct(Number(value || 0) * 100) },
  ]));
  setHtml("countries", bars(period.ga.countries, "country", "totalUsers", [
    { label: "Sessions", field: "sessions" },
  ]));
  setHtml("cities", bars(period.ga.cities, "city", "totalUsers", [
    { label: "Sessions", field: "sessions" },
  ]));
  setHtml("browsers", bars(period.ga.browsers, "browser", "totalUsers", [
    { label: "Sessions", field: "sessions" },
  ]));
  setHtml("operatingSystems", bars(period.ga.operatingSystems, "operatingSystem", "totalUsers", [
    { label: "Sessions", field: "sessions" },
  ]));
  setHtml("newReturning", bars(period.ga.newReturning, "newVsReturning", "totalUsers", [
    { label: "Sessions", field: "sessions" },
  ]));
}

function renderEvents() {
  const period = currentPeriod();
  setHtml("eventsTable", table([
    { label: "Event", key: "eventName" },
    { label: "Count", key: "eventCount", format: fmt },
    { label: "Users", key: "totalUsers", format: fmt },
    { label: "Key events", key: "keyEvents", format: fmt },
  ], period.ga.events, 30));
  setHtml("realtimePages", table([
    { label: "Page", key: "page", className: "url-cell" },
    { label: "Active users", key: "activeUsers", format: fmt },
  ], state.data.realtime?.pages || [], 20));
}

function renderIndexing() {
  const period = currentPeriod();
  setHtml("sitemaps", table([
    { label: "Path", key: "path", className: "url-cell" },
    { label: "Type", key: "type" },
    { label: "Submitted", key: "lastSubmitted", format: (value) => value ? new Date(value).toLocaleDateString() : "" },
    { label: "Errors", key: "errors", format: fmt },
    { label: "Warnings", key: "warnings", format: fmt },
  ], state.data.sitemaps || [], 20));
  setHtml("searchTypes", table([
    { label: "Type", key: "type" },
    { label: "Clicks", key: "clicks", format: fmt },
    { label: "Impressions", key: "impressions", format: fmt },
    { label: "CTR", key: "ctr", format: pct },
    { label: "Position", key: "position", format: (value) => value ? Number(value).toFixed(1) : "" },
  ], period.gsc.searchTypes, 10));
}

function renderAll() {
  renderMeta();
  renderSourceStrip();
  renderMetrics();
  renderTrend();
  renderLiveSignals();
  renderOverview();
  renderSearch();
  renderContent();
  renderAudience();
  renderEvents();
  renderIndexing();
}

function bindControls() {
  $$(".period-toggle button").forEach((button) => {
    button.addEventListener("click", () => {
      state.period = button.dataset.period;
      $$(".period-toggle button").forEach((item) => item.classList.toggle("active", item === button));
      renderAll();
    });
  });

  $$(".view-tabs button").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      $$(".view-tabs button").forEach((item) => item.classList.toggle("active", item === button));
      $$(".view-panel").forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === state.view));
    });
  });
}

function renderMissingSnapshot() {
  document.querySelector("main").innerHTML = `
    <section class="empty-state">
      Local analytics snapshot not found.
      <code>/Users/scottolmer/Projects/nfl-betting-system/.venv/bin/python scripts/generate_analytics_dashboard.py</code>
    </section>
  `;
}

async function init() {
  bindControls();
  try {
    const response = await fetch("./data/analytics-dashboard.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Snapshot request failed: ${response.status}`);
    state.data = await response.json();
    state.period = String(state.data.meta?.defaultPeriod || "28");
    $$(".period-toggle button").forEach((button) => {
      button.classList.toggle("active", button.dataset.period === state.period);
    });
    renderAll();
  } catch (error) {
    console.error(error);
    renderMissingSnapshot();
  }
}

init();
