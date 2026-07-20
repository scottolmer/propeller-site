import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/nfl-slate-state.js', import.meta.url), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const helper = context.window.ppNflSlate;

for (const state of ['offseason', 'preseason', 'no_slate', 'building', 'ready', 'degraded']) {
  test(`recognizes ${state} as an NFL slate state`, () => assert.equal(helper.state({ state }), state));
}

test('uses a safe degraded presentation for malformed public payloads', () => {
  const view = helper.presentation({ state: 'unknown' });
  assert.equal(view.state, 'degraded');
  assert.match(view.detail, /not showing older NFL analysis/i);
});

test('ready payloads do not render an empty-state presentation', () => {
  assert.equal(helper.presentation({ state: 'ready' }), null);
});

test('continues to read a nested slate state during the migration window', () => {
  assert.equal(helper.state({ slate: { state: 'offseason' } }), 'offseason');
});
