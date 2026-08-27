(function registerAnalyzerWebMcp(root) {
  'use strict';

  const PUBLIC_API_BASE = 'https://web-production-3c1c4.up.railway.app/api/social/picks';
  const PUBLIC_SITE = 'https://propellerpicks.com';
  const SUPPORTED_SPORTS = ['nba', 'nfl', 'nhl', 'mlb', 'soccer'];
  const DEFAULT_LIMIT = 25;
  const MAX_LIMIT = 25;
  const MAX_TEXT_LENGTH = 80;
  const registry = {
    version: '2026-08-27',
    publicOnly: true,
    toolNames: [
      'search-public-props',
      'get-public-prop-context',
      'get-methodology-and-limits',
    ],
    status: 'unsupported',
  };

  root.ppAnalyzerWebMcp = registry;

  function requireText(value, field) {
    if (value == null || value === '') return '';
    if (typeof value !== 'string') {
      throw new TypeError(`${field} must be a string.`);
    }
    const normalized = value.trim();
    if (normalized.length > MAX_TEXT_LENGTH) {
      throw new TypeError(`${field} must be ${MAX_TEXT_LENGTH} characters or fewer.`);
    }
    return normalized;
  }

  function validateSport(value) {
    const sport = requireText(value, 'sport').toLowerCase();
    if (!SUPPORTED_SPORTS.includes(sport)) {
      throw new TypeError(`sport must be one of: ${SUPPORTED_SPORTS.join(', ')}.`);
    }
    return sport;
  }

  function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day;
  }

  function currentEasternDate() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }

  function validateDate(value) {
    const date = value == null || value === '' ? currentEasternDate() : requireText(value, 'date');
    if (!isValidDate(date)) throw new TypeError('date must be a valid YYYY-MM-DD date.');
    return date;
  }

  function validateLimit(value) {
    if (value == null) return DEFAULT_LIMIT;
    if (!Number.isInteger(value) || value < 1 || value > MAX_LIMIT) {
      throw new TypeError(`limit must be an integer from 1 to ${MAX_LIMIT}.`);
    }
    return value;
  }

  function normalize(value) {
    return String(value || '').trim().toLocaleLowerCase();
  }

  function scalar(value) {
    if (typeof value === 'string') return value.slice(0, MAX_TEXT_LENGTH);
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    return null;
  }

  function sanitizeProp(row) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
    const player = scalar(row.player_name);
    const statType = scalar(row.stat_type);
    if (typeof player !== 'string' || typeof statType !== 'string') return null;

    const direction = typeof row.final_direction === 'string'
      ? row.final_direction.trim().toUpperCase()
      : null;
    const confidence = typeof row.confidence === 'number' && Number.isFinite(row.confidence)
      ? Math.round(row.confidence)
      : null;
    const tier = typeof row.confidence_tier === 'string'
      ? row.confidence_tier.slice(0, MAX_TEXT_LENGTH)
      : null;

    return {
      player: player,
      team: scalar(row.team),
      statType: statType,
      line: scalar(row.line),
      direction: direction === 'OVER' || direction === 'UNDER' ? direction : null,
      confidence,
      confidenceTier: tier,
    };
  }

  function requestSignal(executionSignal, milliseconds) {
    if (!root.AbortController || typeof root.setTimeout !== 'function') {
      if (root.AbortSignal && typeof root.AbortSignal.timeout === 'function') {
        return { signal: root.AbortSignal.timeout(milliseconds), cleanup() {} };
      }
      return { signal: executionSignal, cleanup() {} };
    }

    const controller = new root.AbortController();
    const abort = () => controller.abort();
    let timeoutId = root.setTimeout(abort, milliseconds);
    if (executionSignal) {
      if (executionSignal.aborted) abort();
      else executionSignal.addEventListener('abort', abort, { once: true });
    }

    return {
      signal: controller.signal,
      cleanup() {
        if (typeof root.clearTimeout === 'function') root.clearTimeout(timeoutId);
        timeoutId = null;
        if (executionSignal) executionSignal.removeEventListener('abort', abort);
      },
    };
  }

  function timestamp(payload, keys) {
    for (const key of keys) {
      if (typeof payload[key] === 'string' && payload[key].trim()) return payload[key].trim();
    }
    return null;
  }

  function freshness(payload, date) {
    const analysisAt = timestamp(payload, ['analysis_at', 'analyzed_at']);
    const marketObservedAt = timestamp(payload, ['market_observed_at', 'observed_at', 'collected_at', 'as_of']);
    const known = Boolean(analysisAt || marketObservedAt);
    return {
      known,
      status: known
        ? 'provided-by-public-feed'
        : date === currentEasternDate() ? 'unknown-for-current-date' : 'unknown-for-requested-date',
      analysisAt,
      marketObservedAt,
      responseGeneratedAt: timestamp(payload, ['generated_at']),
      note: known
        ? 'The public feed supplied an explicit analysis or market-observation timestamp.'
        : 'The public feed supplied no line or analysis timestamp. responseGeneratedAt is only the response-generation time and must not be treated as line freshness.',
    };
  }

  async function fetchPublicPreview({ sport, date, limit, executionSignal }) {
    const params = new root.URLSearchParams({
      game_date: date,
      limit: String(limit),
    });
    const url = `${PUBLIC_API_BASE}/${sport}?${params.toString()}`;
    let response;
    const request = requestSignal(executionSignal, 10000);
    try {
      if (request.signal && request.signal.aborted) throw new Error('request cancelled');
      response = await root.fetch(url, {
        method: 'GET',
        credentials: 'omit',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: request.signal,
      });
      if (!response || !response.ok) throw new Error('request failed');
      const payload = await response.json();
      const rawProps = Array.isArray(payload.props) ? payload.props : [];
      return {
        source: url,
        gameDate: date,
        freshness: freshness(payload, date),
        total: Number.isInteger(payload.total) ? payload.total : rawProps.length,
        props: rawProps.map(sanitizeProp).filter(Boolean),
      };
    } catch (_error) {
      throw new Error('Propeller public preview is unavailable right now.');
    } finally {
      request.cleanup();
    }
  }

  function baseQuery(input) {
    const args = input && typeof input === 'object' ? input : {};
    return {
      sport: validateSport(args.sport),
      date: validateDate(args.date),
      limit: validateLimit(args.limit),
    };
  }

  async function searchPublicProps(input, options = {}) {
    const args = input && typeof input === 'object' ? input : {};
    const query = baseQuery(args);
    const player = normalize(requireText(args.player, 'player'));
    const statType = normalize(requireText(args.statType, 'statType'));
    const direction = requireText(args.direction, 'direction').toUpperCase();
    if (direction && !['OVER', 'UNDER'].includes(direction)) {
      throw new TypeError('direction must be OVER or UNDER.');
    }

    const feed = await fetchPublicPreview({ ...query, executionSignal: options.signal });
    const props = feed.props.filter(prop => {
      if (player && !normalize(prop.player).includes(player)) return false;
      if (statType && !normalize(prop.statType).includes(statType)) return false;
      if (direction && prop.direction !== direction) return false;
      return true;
    });

    return {
      ...feed,
      props,
      returned: props.length,
      researchOnly: true,
      notice: 'Limited public preview data. Verify the current player, line, event status, and platform rules yourself. This tool does not recommend, rank, build, or submit entries and does not accept wagers.',
    };
  }

  async function getPublicPropContext(input, options = {}) {
    const args = input && typeof input === 'object' ? input : {};
    const query = baseQuery(args);
    const player = requireText(args.player, 'player');
    if (!player) throw new TypeError('player is required.');
    const statType = normalize(requireText(args.statType, 'statType'));
    const direction = requireText(args.direction, 'direction').toUpperCase();
    if (direction && !['OVER', 'UNDER'].includes(direction)) {
      throw new TypeError('direction must be OVER or UNDER.');
    }
    if (args.line != null && (typeof args.line !== 'number' || !Number.isFinite(args.line))) {
      throw new TypeError('line must be a finite number when provided.');
    }

    const feed = await fetchPublicPreview({ ...query, limit: 100, executionSignal: options.signal });
    const matches = feed.props.filter(prop => {
      if (normalize(prop.player) !== normalize(player)) return false;
      if (statType && normalize(prop.statType) !== statType) return false;
      if (direction && prop.direction !== direction) return false;
      if (args.line != null && Number(prop.line) !== args.line) return false;
      return true;
    });

    return {
      source: feed.source,
      gameDate: feed.gameDate,
      freshness: feed.freshness,
      player,
      matches,
      found: matches.length > 0,
      researchOnly: true,
      notice: 'This is public research context for the displayed line, not a recommendation, calibrated probability, guarantee, or wager/entry action. Verify live details before making your own decision.',
    };
  }

  function getMethodologyAndLimits() {
    return {
      researchOnly: true,
      confidence: {
        range: '50-100',
        meaning: 'Directional model confidence from available signals.',
        not: ['calibrated win probability', 'guarantee', 'promise of profit'],
      },
      currentData: {
        feed: `${PUBLIC_API_BASE}/{sport}`,
        supportedSports: SUPPORTED_SPORTS,
        note: 'The public analyzer exposes a limited daily preview. Availability varies by slate and data freshness.',
      },
      limitations: [
        'Player availability, injuries, roles, weather, line movement, and source data can change after analysis.',
        'Missing or unavailable inputs are limitations and should not be treated as neutral evidence.',
        'Always verify the current player, stat, line, platform rules, and event status.',
      ],
      evidenceLinks: {
        analyzer: `${PUBLIC_SITE}/analyzer/`,
        methodology: `${PUBLIC_SITE}/guides/how-ai-sports-betting-works/`,
        results: `${PUBLIC_SITE}/results/`,
        productFacts: `${PUBLIC_SITE}/data/product-facts.json`,
        publicAgentIndex: `${PUBLIC_SITE}/llms.txt`,
      },
      boundary: 'Propeller is an independent research and analysis tool. It does not accept wagers, place bets, build or submit entries, or operate as a sportsbook.',
    };
  }

  const tools = [
    {
      name: 'search-public-props',
      description: 'Returns filtered rows from Propeller\'s limited public daily player-prop preview for research only. It does not recommend, rank, build, or submit entries, and it does not accept wagers. Current lines and availability may change; verify the player, line, event status, and platform rules yourself.',
      inputSchema: {
        type: 'object',
        properties: {
          sport: { type: 'string', enum: SUPPORTED_SPORTS, description: 'Sport to query.' },
          date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', maxLength: 10, description: 'Optional Eastern Time game date; defaults to today.' },
          player: { type: 'string', maxLength: MAX_TEXT_LENGTH, description: 'Optional player-name substring.' },
          statType: { type: 'string', maxLength: MAX_TEXT_LENGTH, description: 'Optional stat-type substring such as points or rebounds.' },
          direction: { type: 'string', enum: ['OVER', 'UNDER'], description: 'Optional displayed direction.' },
          limit: { type: 'integer', minimum: 1, maximum: MAX_LIMIT, default: DEFAULT_LIMIT, description: 'Maximum rows returned.' },
        },
        required: ['sport'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: searchPublicProps,
    },
    {
      name: 'get-public-prop-context',
      description: 'Finds an exact player and stat match in Propeller\'s limited public daily preview and returns the displayed line, direction, confidence context, freshness, and public-source URL. This is research context only—not a recommendation, calibrated probability, guarantee, wager, or entry action.',
      inputSchema: {
        type: 'object',
        properties: {
          sport: { type: 'string', enum: SUPPORTED_SPORTS, description: 'Sport to query.' },
          date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', maxLength: 10, description: 'Optional Eastern Time game date; defaults to today.' },
          player: { type: 'string', maxLength: MAX_TEXT_LENGTH, description: 'Exact player name, case-insensitive.' },
          statType: { type: 'string', maxLength: MAX_TEXT_LENGTH, description: 'Optional exact stat type such as points or rebounds.' },
          line: { type: 'number', description: 'Optional exact numeric line.' },
          direction: { type: 'string', enum: ['OVER', 'UNDER'], description: 'Optional displayed direction.' },
        },
        required: ['sport', 'player'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: getPublicPropContext,
    },
    {
      name: 'get-methodology-and-limits',
      description: 'Returns Propeller\'s public confidence meaning, data-freshness caveats, evidence links, and research-only limits. It does not provide a betting recommendation or place any action.',
      inputSchema: {
        type: 'object',
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute: getMethodologyAndLimits,
    },
  ];

  async function registerTools() {
    const modelContext = root.document && root.document.modelContext;
    if (!modelContext || typeof modelContext.registerTool !== 'function') return false;
    const controller = root.AbortController ? new root.AbortController() : null;
    const registrationOptions = controller ? { signal: controller.signal } : undefined;
    const onPageHide = () => controller?.abort();
    if (controller && typeof root.addEventListener === 'function') {
      root.addEventListener('pagehide', onPageHide, { once: true });
    }
    try {
      for (const tool of tools) await modelContext.registerTool(tool, registrationOptions);
      registry.status = 'registered';
      return true;
    } catch (_error) {
      controller?.abort();
      registry.status = 'registration-failed';
      return false;
    }
  }

  root.ppAnalyzerWebMcpReady = registerTools();
})(typeof window === 'object' ? window : globalThis);
