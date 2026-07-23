import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../analyzer/index.html', import.meta.url), 'utf8');

test('analyzer honors a supported sport query parameter before loading a slate', () => {
  assert.match(source, /function requestedSport\(\)/);
  assert.match(source, /new URLSearchParams\(window\.location\.search\)\.get\('sport'\)/);
  assert.match(source, /const initialSport = requestedSport\(\)/);
  assert.match(source, /loadSport\(initialSport\)/);
});

test('NFL research links can target the NFL analyzer tab', () => {
  const nflPage = readFileSync(new URL('../picks/nfl/index.html', import.meta.url), 'utf8');
  assert.match(nflPage, /href="\/analyzer\/\?sport=nfl"/);
  assert.match(source, /url\.searchParams\.set\('sport', sport\)/);
});

test('late Analyzer responses cannot render into a newer sport selection', () => {
  assert.match(source, /generatedAtBySport\[sport\] = typeof data\.generated_at === 'string' \? data\.generated_at : '';/);
  assert.match(source, /generatedAtBySport\[sport\] = typeof data\.generated_at === 'string' \? data\.generated_at : '';\s+if \(sport !== activeSport\) return;\s+activeGeneratedAt = generatedAtBySport\[sport\];/);
  assert.match(source, /generatedAtBySport\[sport\] = '';\s+if \(sport !== activeSport\) return;\s+activeGeneratedAt = '';/);
});
