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
