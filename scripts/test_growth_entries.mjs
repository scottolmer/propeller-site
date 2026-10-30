import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const helperContext = {window: {}};
vm.runInNewContext(readFileSync(new URL('../assets/js/prizepicks-slate.js', import.meta.url), 'utf8'), helperContext);
const inspect = helperContext.window.ppPrizePicksSlate.inspect;
const today = '2026-10-14';
const row = {player_name: 'Example Player', stat_type: 'points', line: 20.5, final_direction: 'OVER', final_score: 70};

test('an old, undated, or malformed feed never becomes today’s research', () => {
  for (const payload of [null, {}, {game_date: '2026-10-13', props: [row]}, {game_date: today, props: 'bad'}]) {
    const state = inspect(payload, today);
    assert.equal(state.valid, false);
    assert.equal(state.props.length, 0);
  }
});

test('a confirmed empty slate is distinguished from an unavailable feed', () => {
  assert.equal(inspect({game_date: today, props: []}, today).valid, true);
  assert.equal(inspect({props: []}, today).valid, false);
});

test('only valid same-slate rows render, without filling missing rows with duplicates', () => {
  const state = inspect({game_date: today, props: [row, {...row, line: 'bad'}, {...row, game_date: '2026-10-13'}]}, today);
  assert.equal(state.props.length, 1);
  assert.equal(state.generatedAt, null);
  assert.equal(inspect({game_date: today, props: Array(8).fill(row)}, today).props.length, 5);
});

test('a response generation time is preserved without becoming an analysis time', () => {
  const state = inspect({game_date: today, generated_at: '2026-10-14T12:00:00Z', props: [row]}, today);
  assert.equal(state.generatedAt, '2026-10-14T12:00:00Z');
  assert.equal(state.analysisTime, undefined);
});

test('one row per player keeps a short board from repeating one player', () => {
  const rows = [row, {...row, stat_type: 'assists'}, {...row, player_name: 'Second Player'}];
  assert.equal(inspect({game_date: today, props: rows}, today).props.length, 3);
  const state = inspect({game_date: today, props: rows}, today, {onePerPlayer: true});
  assert.deepEqual(state.props.map(p => p.player_name), ['Example Player', 'Second Player']);
});

const inspectNflWeek = helperContext.window.ppPrizePicksSlate.inspectNflWeek;
const now = Date.parse('2026-10-30T15:00:00Z');
const nflRow = {...row, stat_type: 'rush_yds', commence_time: '2026-11-01T12:00:00-05:00'};

test('the NFL week board only counts a ready slate', () => {
  for (const payload of [null, {}, {state: 'building', props: [nflRow]}, {state: 'ready', props: 'bad'}]) {
    assert.equal(inspectNflWeek(payload, now).valid, false);
  }
  const state = inspectNflWeek({state: 'ready', week: 8, props: [nflRow]}, now);
  assert.equal(state.valid, true);
  assert.equal(state.week, 8);
  assert.equal(state.props.length, 1);
});

test('NFL games that already kicked off, or have no kickoff time, never show as current', () => {
  const started = {...nflRow, player_name: 'Started Player', commence_time: '2026-10-29T20:15:00-04:00'};
  const undated = {...nflRow, player_name: 'Undated Player', commence_time: null};
  const state = inspectNflWeek({state: 'ready', props: [started, undated, nflRow]}, now);
  assert.deepEqual(state.props.map(p => p.player_name), ['Example Player']);
});

test('the NFL board shows one row per player, up to five', () => {
  const rows = [nflRow, {...nflRow, line: 60.5}, ...Array.from({length: 8}, (_, i) => ({...nflRow, player_name: `Player ${i}`}))];
  const state = inspectNflWeek({state: 'ready', props: rows}, now);
  assert.equal(state.props.length, 5);
  assert.equal(state.props[0].line, 20.5);
  assert.equal(new Set(state.props.map(p => p.player_name)).size, 5);
});

const underdog = readFileSync(new URL('../tools/underdog-payout-calculator/index.html', import.meta.url), 'utf8');
const calculatorScript = [...underdog.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('const STD='));
function loadCalculator() {
  const completions = [];
  const elements = Object.fromEntries(['entryType','numPicks','customAmt','hitRate','results','resultGrid','flexBreakdown','scenarioNote','exampleNote'].map(id => [id, {
    value: '', hidden: true, innerHTML: '', classList: {add(){}, remove(){}, contains(){return false;}}, focus(){}, scrollIntoView(){},
  }]));
  elements.entryType.value = 'standard';
  elements.numPicks.value = '4';
  elements.hitRate.value = '55';
  elements.numPicks.options = [{value: '2'}, {value: '3'}, {value: '4'}, {value: '5'}];
  const pills = [5,10,20].map(n => ({textContent: `$${n}`, classList: {add(){}, remove(){}, toggle(){}}}));
  const context = {window: {ppPaidSearchEvents: {trackCalculatorCompletion: v => completions.push(v)}}, document: {getElementById: id => elements[id], querySelectorAll: () => pills}};
  vm.runInNewContext(calculatorScript, context);
  return {context, elements, completions};
}

test('the worked example shows the real base payout and does not count as a user completion', () => {
  const {context,elements,completions} = loadCalculator();
  context.showExample();
  assert.equal(elements.numPicks.value, '5');
  assert.match(elements.resultGrid.innerHTML, /\$200\.00/);
  assert.equal(elements.exampleNote.hidden, false);
  assert.equal(completions.length, 0);
  context.calculate();
  assert.equal(elements.exampleNote.hidden, true);
  assert.equal(completions.length, 1);
});

test('optional probability inputs do not block the payout calculation', () => {
  assert.match(underdog, /<details class="scenario-details"><summary>Optional:/);
  const {context,elements} = loadCalculator();
  context.calculate();
  assert.match(elements.resultGrid.innerHTML, /\$240\.00/);
});
