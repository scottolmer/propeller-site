import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('../analyzer/index.html', import.meta.url), 'utf8');

test('analyzer honors a supported sport query parameter before loading a slate', () => {
  assert.match(source, /function requestedSport\(\)/);
  assert.match(source, /new URLSearchParams\(window\.location\.search\)\.get\('sport'\)/);
  assert.match(source, /const initialSport = requestedSport\(\)/);
  assert.match(source, /loadSport\(initialSport\)/);
  assert.equal((source.match(/loadSport\('nba'\)/g) || []).length, 0);
});

test('NFL research links can target the NFL analyzer tab', () => {
  const nflPage = readFileSync(new URL('../picks/nfl/index.html', import.meta.url), 'utf8');
  assert.match(nflPage, /href="\/analyzer\/\?sport=nfl"/);
  assert.match(source, /url\.searchParams\.set\('sport', sport\)/);
});

test('late Analyzer responses cannot render into a newer sport selection', () => {
  assert.match(source, /const loadVersion = \+\+selectionVersion/);
  assert.match(source, /if \(loadVersion !== selectionVersion \|\| sport !== activeSport\) return/);
});

test('empty feeds describe prop availability without inferring the game schedule', () => {
  assert.match(source, /No current \$\{sportCfg\.label\} props available/);
  assert.match(source, /This does not tell us whether games are scheduled/);
  assert.match(source, /No current \$\{sportCfg\.label\} props in the public feed/);
  assert.doesNotMatch(source, /No \$\{sportCfg\.label\} games scheduled today/);
});

test('empty feeds offer an explicit user-triggered availability check', () => {
  assert.match(source, /Find a sport with current props/);
  assert.match(source, /data-find-current-sport/);
  assert.doesNotMatch(source, /props available<\/a>/);
});

test('pick cards present confidence as a directional score rather than a percentage', () => {
  assert.match(source, /\$\{confidence\}\/100/);
  assert.match(source, /\$\{isOver \? 'OVER' : 'UNDER'\} directional score · not a win probability/);
  assert.doesNotMatch(source, /class="confidence-value">\$\{confidence\}%/);
});
