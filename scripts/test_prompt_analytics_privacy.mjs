import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../assets/js/analytics-loader.js',import.meta.url),'utf8');
function run(pathname){const window={location:{pathname,origin:'https://propellerpicks.com',href:'https://propellerpicks.com'+pathname+'?subject=Private+Question&line=49.5#note'},addEventListener(){}};vm.runInNewContext(source,{window,document:{},Date});return window.dataLayer.map(x=>Array.from(x)).filter(x=>x[0]==='config');}
test('prompt initial page view omits research query and hash, configures only once',()=>{const configs=run('/tools/ai-betting-prompt-builder/');assert.equal(configs.length,1);assert.equal(configs[0][2].page_location,'https://propellerpicks.com/tools/ai-betting-prompt-builder/');});
test('ordinary page keeps default attribution URL handling',()=>{const configs=run('/guides/player-prop-research-log/');assert.equal(configs.length,1);assert.equal(Object.hasOwn(configs[0][2],'page_location'),false);});
