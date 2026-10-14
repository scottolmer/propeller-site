import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const underdog = read('picks/underdog/index.html');
const renderer = underdog.slice(underdog.indexOf('function buildPickCard('), underdog.indexOf('// ---- Fetch and render picks'));

test('Underdog OVER and UNDER cards display directional scores without a probability label', () => {
  const context = {
    calcConfidence: score => Math.round(Math.abs(score - 50) + 50),
    formatStatType: value => value,
    escHtml: value => String(value),
  };
  vm.runInNewContext(renderer, context);
  for (const [direction, score, label] of [['OVER', 80, 'HIGHER'], ['UNDER', 20, 'LOWER']]) {
    const card = context.buildPickCard({player_name: 'Example', team: 'EX', stat_type: 'points', line: 20.5, final_direction: direction, final_score: score}, false);
    assert.match(card, /Directional confidence/);
    assert.match(card, /80\/100/);
    assert.match(card, /not a win probability/);
    assert.match(card, new RegExp(label));
    assert.doesNotMatch(card, />80%/);
    assert.match(card, /aria-valuenow="80" aria-valuemin="50" aria-valuemax="100"/);
  }
});

test('comparison distinguishes raw scoring from displayed confidence and qualifies unverified claims', () => {
  const page = read('compare/propeller-vs-bettingpros/index.html');
  assert.match(page, /50–100; not a win probability/);
  assert.match(page, /how the raw score becomes directional confidence/);
  assert.match(page, /Unverified does not mean unavailable/);
  assert.doesNotMatch(page, /Yes \(0–100\)|has no equivalent|without explaining the reasoning|does not publish a comparable|\$9\.99–\$35\.99|wins more|real edge/);
  for (const path of ['/how-it-works/', '/guides/how-ai-sports-betting-works/', '/results/']) {
    assert.ok(read(path.slice(1) + 'index.html').length > 0);
  }
});

test('shared tracker and research handoff emit one sanitized event regardless of load order', () => {
  for (const order of [['analytics-events', 'research-handoff'], ['research-handoff', 'analytics-events']]) {
    for (const blocked of [false, true]) {
      const events = [], navigations = [], timers = [], capture = [];
      const attrs = new Map([['href', 'https://app.propellerpicks.com/research/my-pick?sport=nfl']]);
      let onClick;
      const link = {
        href: attrs.get('href'), textContent: 'Research a prop',
        getAttribute: key => key === 'href' ? link.href : attrs.get(key) ?? null,
        setAttribute: (key, value) => attrs.set(key, value),
        addEventListener: (_, handler) => { onClick = handler; },
        closest: selector => selector === 'a[href]' ? link : {tagName: 'MAIN'},
      };
      const window = {
        location: {search: '?research_source=underdog_calculator&email=private@example.test', origin: 'https://propellerpicks.com', href: 'https://propellerpicks.com/tools/research-my-pick/?email=private@example.test', assign: url => navigations.push(url)},
        gtag: (...args) => { if (blocked) throw Error('blocked'); events.push(args); },
        ppLoadAnalytics() {}, setTimeout: fn => {timers.push(fn); return timers.length - 1;}, clearTimeout() {},
      };
      const document = {title: 'Research', querySelectorAll: () => [link], addEventListener: (_, handler) => capture.push(handler)};
      const context = {window, document, URL, URLSearchParams};
      for (const name of order) vm.runInNewContext(read(`assets/js/${name}.js`), context);
      const event = {target: link, button: 0, preventDefault() {this.defaultPrevented = true;}};
      capture.forEach(handler => handler(event));
      if (blocked) assert.throws(() => onClick(event), /blocked/);
      else {
        onClick(event);
        assert.equal(events.length, 1);
        assert.equal(events[0][1], 'research_cta_click');
        assert.equal(events[0][2].research_source, 'underdog_calculator');
        assert.doesNotMatch(JSON.stringify(events), /private@|email=|link_url/);
        events[0][2].event_callback();
      }
      timers.forEach(timer => timer());
      assert.deepEqual(navigations, [link.href]);
    }
  }
});
