import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../analyzer/index.html', import.meta.url), 'utf8');
const analyzerScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1])
  .find(script => script.includes("const API_BASE ="));

function loadAnalyzer(fetchImpl) {
  const window = {
    location: { href: 'https://propellerpicks.com/analyzer/' },
    history: { replaceState() {} },
  };
  const document = { addEventListener() {} };
  const context = {
    window,
    document,
    fetch: fetchImpl,
    AbortSignal,
    URL,
    URLSearchParams,
    Date,
    Intl,
    console,
    setTimeout,
    clearTimeout,
  };
  vm.runInNewContext(`${analyzerScript}\n;globalThis.__availabilityTest = { findFirstSportWithCurrentProps };`, context);
  return context.__availabilityTest;
}

function sportFromUrl(url) {
  return new URL(url).pathname.split('/').at(-1);
}

test('availability search selects only a verified nonempty current feed', async () => {
  const calls = [];
  const helper = loadAnalyzer(async url => {
    const sport = sportFromUrl(url);
    calls.push(sport);
    return {
      ok: true,
      json: async () => ({ props: sport === 'mlb'
        ? [{ player_name: 'Verified Player', stat_type: 'hits', line: '1.5', final_direction: 'OVER' }]
        : [{ player_name: 'Invalid Line', stat_type: 'saves', line: 'not-a-number', final_direction: 'UNDER' }] }),
    };
  });

  const result = await helper.findFirstSportWithCurrentProps('nba', () => true);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { status: 'found', sport: 'mlb', label: 'MLB' });
  assert.deepEqual(calls, ['nhl', 'mlb']);
});

test('a new user-triggered search refreshes feeds that were previously empty', async () => {
  let nhlHasProps = false;
  const calls = [];
  const helper = loadAnalyzer(async url => {
    const sport = sportFromUrl(url);
    calls.push(sport);
    const props = sport === 'nhl' && nhlHasProps
      ? [{ player_name: 'New Player', stat_type: 'shots', line: 2.5, final_direction: 'OVER' }]
      : [];
    return { ok: true, json: async () => ({ props }) };
  });

  const first = await helper.findFirstSportWithCurrentProps('nba', () => true);
  assert.equal(first.status, 'none');
  nhlHasProps = true;
  const second = await helper.findFirstSportWithCurrentProps('nba', () => true);

  assert.deepEqual(JSON.parse(JSON.stringify(second)), { status: 'found', sport: 'nhl', label: 'NHL' });
  assert.equal(calls.filter(sport => sport === 'nhl').length, 2);
});

test('availability search reports empty and unreachable feeds without inventing availability', async () => {
  const helper = loadAnalyzer(async url => {
    const sport = sportFromUrl(url);
    if (sport === 'mlb' || sport === 'soccer') throw new Error('unreachable');
    return { ok: true, json: async () => ({ props: [] }) };
  });

  const result = await helper.findFirstSportWithCurrentProps('nba', () => true);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), {
    status: 'none',
    empty: ['NHL', 'NFL'],
    unreachable: ['MLB', 'Soccer'],
  });
});

test('availability search abandons a late response after the user changes sports', async () => {
  let resolveFetch;
  let current = true;
  let calls = 0;
  const helper = loadAnalyzer(() => {
    calls += 1;
    return new Promise(resolve => { resolveFetch = resolve; });
  });

  const pending = helper.findFirstSportWithCurrentProps('nba', () => current);
  current = false;
  resolveFetch({
    ok: true,
    json: async () => ({
      props: [{ player_name: 'Late Player', stat_type: 'points', line: 20.5, final_direction: 'OVER' }],
    }),
  });

  assert.deepEqual(JSON.parse(JSON.stringify(await pending)), { status: 'stale' });
  assert.equal(calls, 1);
});
