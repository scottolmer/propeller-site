#!/usr/bin/env node
/** Run repeatable, sequential Lighthouse samples and write raw + compact JSON. */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...parts] = arg.replace(/^--/, '').split('=');
  return [key, parts.length ? parts.join('=') : true];
}));

const base = String(args.base || 'https://propellerpicks.com').replace(/\/$/, '');
const lighthouseVersion = '13.4.0';
const runs = Math.max(1, Number(args.runs || 3));
const out = resolve(String(args.out || 'artifacts/lighthouse'));
const pages = [
  ['home', '/'],
  ['analyzer', '/analyzer/'],
  ['calculator', '/tools/prizepicks-payout-calculator/'],
  ['guide', '/guides/how-to-analyze-player-props/'],
  ['picks', '/picks/nba/'],
];
const profiles = ['mobile', 'desktop'];
mkdirSync(out, { recursive: true });

const rows = [];
for (const profile of profiles) {
  for (const [name, path] of pages) {
    for (let run = 1; run <= runs; run += 1) {
      const rawPath = resolve(out, `${profile}-${name}-${run}.json`);
      const cli = [
        '--yes', `lighthouse@${lighthouseVersion}`, `${base}${path}`,
        '--quiet', '--chrome-flags=--headless --no-sandbox',
        '--only-categories=performance,seo,accessibility,best-practices',
        '--output=json', `--output-path=${rawPath}`,
      ];
      if (profile === 'desktop') cli.push('--preset=desktop');
      const result = spawnSync('npx', cli, { encoding: 'utf8', stdio: 'pipe' });
      if (result.status !== 0) {
        process.stderr.write(result.stderr || result.stdout || `Lighthouse failed: ${name}\n`);
        process.exit(result.status || 1);
      }
      const report = JSON.parse(readFileSync(rawPath, 'utf8'));
      const score = (category) => Math.round((report.categories[category]?.score || 0) * 100);
      const audit = (id) => Math.round(report.audits[id]?.numericValue || 0);
      rows.push({
        profile, page: name, path, run, lighthouseVersion: report.lighthouseVersion,
        performance: score('performance'),
        accessibility: score('accessibility'),
        bestPractices: score('best-practices'),
        seo: score('seo'),
        fcpMs: audit('first-contentful-paint'),
        lcpMs: audit('largest-contentful-paint'),
        tbtMs: audit('total-blocking-time'),
        cls: Number((report.audits['cumulative-layout-shift']?.numericValue || 0).toFixed(3)),
        speedIndexMs: audit('speed-index'),
      });
      process.stdout.write(`${profile} ${name} run ${run}: ${rows.at(-1).performance}\n`);
    }
  }
}

const observedVersions = new Set(rows.map((row) => row.lighthouseVersion));
if (observedVersions.size !== 1 || !observedVersions.has(lighthouseVersion)) {
  throw new Error(`Expected Lighthouse ${lighthouseVersion}; observed ${[...observedVersions].join(', ')}`);
}
writeFileSync(resolve(out, 'summary.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), base, runs, lighthouseVersion, rows }, null, 2)}\n`);
