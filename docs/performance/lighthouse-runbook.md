# Lighthouse measurement runbook

## Purpose

Use this procedure to compare critical templates without mixing devices,
parallel browser contention, warm-cache luck, or single-run noise. Lighthouse
is lab evidence. Search Console or CrUX 75th-percentile field data remains the
source for Core Web Vitals pass/fail claims.

## Representative matrix

- `/` — homepage and live-record enrichment
- `/analyzer/` — primary product/category page
- `/tools/prizepicks-payout-calculator/` — calculator template
- `/guides/how-to-analyze-player-props/` — editorial template
- `/picks/nba/` — sport/picks template

## Local pre-deploy run

From the repository root:

```bash
python3 -m http.server 8765
node scripts/run_lighthouse_matrix.mjs \
  --base=http://127.0.0.1:8765 \
  --runs=3 \
  --out=/tmp/propeller-lighthouse-local
```

Run the matrix sequentially. Compare the median of three runs for each page and
profile. Raw Lighthouse reports and `summary.json` are written to the output
directory. Do not commit the large raw reports.

## Production verification

After the GitHub Pages deployment is complete:

```bash
node scripts/run_lighthouse_matrix.mjs \
  --base=https://propellerpicks.com \
  --runs=3 \
  --out=/tmp/propeller-lighthouse-production
```

Acceptance thresholds are encoded in `.lighthouserc.json`: median performance
at least 90, SEO 100, LCP at most 3,000 ms, TBT at most 200 ms, and CLS at most
0.10 on the representative mobile matrix. A regression must be investigated;
thresholds must not be relaxed merely to make CI green.

## Interpreting results

- Preserve the exact URL, Lighthouse version, device profile, run count, and
  timestamp with every result set.
- Treat a one-run delta smaller than five performance points as noise until it
  repeats.
- Use controlled request blocking to attribute third-party cost; change one
  condition at a time.
- If PageSpeed Insights or CrUX has no usable field data, say so. Never call a
  lab score a Core Web Vitals result.
- Analytics now queues events immediately but loads its remote library on user
  interaction or after load during idle time. Very fast bounces can therefore
  be missed. Reassess this tradeoff if marketing measurement requirements
  change.
- Fonts use `font-display: optional` to avoid late layout shifts. A first-time
  visitor on a slow connection can see the system fallback;
  branding fonts remain available when fetched in the optional window or cache.

## Root-cause triage order

1. Confirm whether the LCP element is text, image, or a late client-rendered node.
2. Inspect blocking scripts and styles before compressing already-small assets.
3. Check font-swap layout shifts and dynamically injected banners/navigation.
4. Check critical-render API calls and third-party work.
5. Only then consider image variants, CSS splitting, or a CDN migration.
