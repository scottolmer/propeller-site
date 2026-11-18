// Deep-linked picks (social posts) must show history, a signal teaser and an AI teaser
// even when the public research record is summary-only, for NBA, NFL, NHL and MLB.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const read=p=>readFileSync(new URL(p,import.meta.url),'utf8');
const fixture=JSON.parse(read('fixtures/research-nfl-full.json'));
const clone=v=>JSON.parse(JSON.stringify(v));
const options={now:'2026-11-18T17:00:00Z'};
function loadDesk(){const window={};const ctx={window,Number,String,Array,Math,Intl,Date,Promise,Object};for(const f of ['research-chat.js','analyzer-desk-evidence.js','analyzer-desk.js'])vm.runInNewContext(read('../assets/js/'+f),ctx);return window.ppAnalyzerDesk;}
function loadResearch(){const window={location:{hostname:'propellerpicks.com',search:''}};vm.runInNewContext(read('../assets/js/analyzer-research.js'),{window,Number,String,Array,Math,Intl,Date,Promise,Object,URLSearchParams,AbortController,setTimeout,clearTimeout});return window.ppAnalyzerResearch;}
const embiid={sport:'nba',status:'ok',player:{player_name:'Joel Embiid',team:'PHI'},props:[{stat_type:'pts_rebs',line:31.5,direction:'UNDER',detail:'summary',confidence:62,signal_summary:{agree:5,against:1,neutral:1,total:7}}],game_logs:[],history_status:'summary_only'};

test('X deep link for an NBA summary pick resolves to the exact prop',()=>{
  const api=loadResearch();
  const sel=api.readSelection(new URL('https://propellerpicks.com/analyzer/?sport=nba&q=Joel%20Embiid&prop_stat_type=pts_rebs&prop_line=31.5&prop_direction=UNDER'));
  assert.equal(sel.stat_type,'pts_rebs');assert.equal(api.selectedPropIndex(embiid,sel),0);
});

test('summary NBA pick renders public history vs the line with a hit rate in the pick direction',()=>{
  const desk=loadDesk();
  const values=[42,24,22,28,13,41,23,17,32,39]; // most recent first, as the API returns
  const m=desk.buildModel(embiid,0,{...options,sport:'nba',publicHistory:{stat:'pts_rebs',status:'ok',values}});
  assert.equal(m.publicHistory.games,10);
  assert.equal(m.publicHistory.hits,values.filter(v=>v<31.5).length);
  assert.deepEqual(Array.from(m.publicHistory.values),values.slice().reverse());
  const html=desk.render(m,0,'all','all','');
  assert.match(html,/Last 10 games vs 31.5/);
  assert.match(html,/6 \/ 10<\/strong><span>Less than 31.5 \(60%\)/);
  assert.doesNotMatch(html,/History is restricted in this preview/);
});

test('history for another stat or a failed fetch never mislabels the selected line',()=>{
  const desk=loadDesk();
  assert.equal(desk.buildModel(embiid,0,{...options,publicHistory:{stat:'points',status:'ok',values:[30]}}).publicHistory,null);
  const html=desk.render(desk.buildModel(embiid,0,{...options,publicHistory:{stat:'pts_rebs',status:'unavailable'}}),0,'all','all','');
  assert.match(html,/History is restricted in this preview/);assert.match(html,/data-desk-locked="history"/);
});

test('summary records show a signal split and AI teaser with an upgrade CTA instead of an empty section',()=>{
  const desk=loadDesk();
  const html=desk.render(desk.buildModel(embiid,0,{...options,sport:'nba'}),0,'all','all','');
  assert.match(html,/pp-desk-signal-split/);assert.match(html,/5 lean Less/);
  assert.match(html,/data-desk-locked="signals"/);assert.match(html,/data-desk-locked="brief"/);
  assert.match(html,/href="https:\/\/app.propellerpicks.com\/signup"[^>]*data-cta-id="analyzer-brief-locked"/);
  assert.doesNotMatch(html,/No individual signal scores are available/);
});

test('full records are unchanged: no teasers, real signals and dated logs',()=>{
  const desk=loadDesk(),p=clone(fixture);
  const html=desk.render(desk.buildModel(p,0,options),0,'all','all','');
  assert.doesNotMatch(html,/data-desk-locked/);assert.match(html,/pp-desk-signal"/);
});

test('NFL board stat names map onto game-log fields, including combined yards',()=>{
  const desk=loadDesk(),data=clone(fixture);
  data.props[0].stat_type='player_rush_reception_yds';
  data.game_logs=[{game_date:'2026-10-19',season:2026,rushing_yards:40,receiving_yards:22,rushing_attempts:9,home_away:'home',team:'X',opponent:'Y'}];
  const m=desk.buildModel(data,0,options);assert.equal(m.logs.length,1);assert.equal(m.logs[0].value,62);
  data.props[0].stat_type='player_receptions';data.game_logs[0].receptions=4;
  assert.equal(desk.buildModel(data,0,options).logs[0].value,4);
});

test('NHL/MLB deep links build a summary view from the public picks feed',async()=>{
  const api=loadResearch();
  const feed=[{player_name:'Connor McDavid',team:'EDM',stat_type:'points',line:1.5,final_direction:'over',confidence:64.4},{player_name:'Connor McDavid',team:'EDM',stat_type:'points',line:1.5,final_direction:'OVER',confidence:64},{player_name:'Other',stat_type:'goals',line:0.5,final_direction:'OVER'}];
  const lookup=api.feedLookup('nhl','connor  mcdavid',feed);
  assert.equal(lookup.status,'ok');assert.equal(lookup.props.length,1);assert.equal(lookup.props[0].direction,'OVER');assert.equal(lookup.props[0].detail,'summary');
  const sel=api.readSelection(new URL('https://propellerpicks.com/analyzer/?sport=nhl&q=Connor%20McDavid&prop_stat_type=points&prop_line=1.5&prop_direction=OVER'));
  const mounted=[],fetched=[];
  const ctl=api.createController({delay:0,fetch:async u=>{fetched.push(u);throw new Error('no research api');},feedLookup:(s,p)=>api.feedLookup(s,p,feed),ui:{hide(){},message(m){mounted.push(m);},mount:(d,i)=>mounted.push([d.sport,i])}});
  ctl.update({sport:'nhl',query:'Connor McDavid',picks:[],selection:sel,immediate:true});
  await new Promise(r=>setTimeout(r,10));
  assert.deepEqual(fetched,[]);assert.deepEqual(mounted,[['nhl',0]]);
  assert.equal(api.feedLookup('mlb','Nobody',feed).status,'not_found');
});

test('public history URL only for sports with the public endpoint and safe stat names',()=>{
  const api=loadResearch();
  assert.equal(api.historyUrl('nba','Joel Embiid','pts_rebs'),'https://web-production-3c1c4.up.railway.app/api/nba/props/player-history?player_name=Joel+Embiid&stat_type=pts_rebs&games=10');
  assert.match(api.historyUrl('mlb','Aaron Judge','hits'),/\/api\/mlb\/props\/player-history\?/);
  assert.equal(api.historyUrl('nfl','Josh Allen','pass_yds'),null);
  assert.equal(api.historyUrl('nba','Joel Embiid','pts rebs&x=1'),null);
});
