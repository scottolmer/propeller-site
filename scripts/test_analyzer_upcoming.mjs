import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
const html = readFileSync(new URL('../analyzer/index.html', import.meta.url), 'utf8');
const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('const API_BASE ='));
const future = {player_name:'Future Player',stat_type:'rushing_yards',line:55.5,final_direction:'OVER',event_start:'2099-11-01T18:00:00Z',event_id:'next-game',platform:'underdog',period:'full_game',variant:'standard',confidence:70};
const payload = (props=[future]) => ({status:props.length?'ok':'empty',coverage:{stored_read_complete:true,truncated:false},props,total:props.length,game_date_end:'2099-11-07'});
function harness(fetch) {
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id,{value:'',hidden:false,innerHTML:'',style:{},classList:{toggle(){},remove(){}},querySelectorAll:()=>[],querySelector:()=>null});
    return nodes.get(id);
  };
  const w={location:{href:'https://propellerpicks.com/analyzer/?sport=nfl',search:'?sport=nfl'},history:{replaceState(){}}};
  const context={window:w,document:{addEventListener(){},getElementById:node,querySelectorAll:()=>[]},fetch,AbortSignal,URL,URLSearchParams,Date,Intl,console,setTimeout,clearTimeout,requestAnimationFrame:fn=>fn()};
  vm.runInNewContext(readFileSync(new URL('../assets/js/analyzer-research.js',import.meta.url),'utf8'),context);
  vm.runInNewContext(script+`\nwindow.test = {
    fetchSportFeed, requestSportFeed, runPlayerSearch, loadSport, buildPickCard,
    setSport(s){selectionVersion++;activeSport=s;},
    input(q){document.getElementById('searchInput').value=q;clearResearchSelection();},
    state(){return {picks:filteredPicks,query:searchQuery,failed:nflSearchFailed};},
    stubUI(){applySportTheme=()=>{};updateSearchScope=()=>{};researchLookup=()=>{};renderPicks=()=>{};showSkeleton=()=>{};hideSkeleton=()=>{};}
  };`,context);
  return {api:w.test,node,w};
}
test('NFL discovery and partial-name search use upcoming inventory; other sports retain their daily date',async()=>{
  const urls=[]; const {api}=harness(async url=>{urls.push(new URL(url));return {ok:true,json:async()=>payload()};});
  await api.requestSportFeed('nfl'); await api.fetchSportFeed('nfl','Future Player'); await api.fetchSportFeed('nba');
  assert.equal(urls[0].pathname,'/api/social/picks/nfl/upcoming');
  assert.equal(urls[0].searchParams.has('game_date'),false);
  assert.equal(urls[1].searchParams.get('player'),'Future Player');
  assert.equal(urls[2].pathname,'/api/social/picks/nba');
  assert.match(urls[2].searchParams.get('game_date'),/^\d{4}-\d{2}-\d{2}$/);
});
test('upcoming feed excludes started or undated rows and distinguishes empty from unavailable',async()=>{
  let data=payload([future,{...future,event_start:'2000-01-01T18:00:00Z'},{...future,event_start:null}]);
  const {api}=harness(async()=>({ok:true,json:async()=>data}));
  assert.equal((await api.fetchSportFeed('nfl')).props.length,1);
  data=payload([]); assert.equal((await api.fetchSportFeed('nfl')).props.length,0);
  data={...payload([]),coverage:{stored_read_complete:false,truncated:true}};await assert.rejects(api.fetchSportFeed('nfl'),/unavailable/);
  data={status:'unavailable',props:[]}; await assert.rejects(api.fetchSportFeed('nfl'),/unavailable/);
});
test('server-filtered player outside the initial cap is searchable and links exact upcoming offer',async()=>{
  const {api,w}=harness(async()=>({ok:true,json:async()=>payload()}));api.stubUI();api.setSport('nfl');api.input('Future');
  await api.runPlayerSearch();assert.equal(api.state().picks[0].player_name,'Future Player');
  const card=api.buildPickCard(future,false);assert.match(card,/Kickoff:/);assert.match(card,/ET/);
  const href=card.match(/class="pick-analysis-link" href="([^"]+)"/)[1].replaceAll('&amp;','&');
  const sel=w.ppAnalyzerResearch.readSelection(new URL(href,'https://propellerpicks.com'));
  assert.equal(sel.event_id,'next-game');assert.equal(sel.platform,'underdog');assert.equal(sel.line,55.5);
  assert.equal(w.ppAnalyzerResearch.selectedPropIndex({status:'ok',player:{player_name:future.player_name},props:[{...future,direction:'OVER'}]},sel),0);
});
test('late player search cannot replace newer input, clear, or sport selection',async()=>{
  for (const action of ['input','clear','sport']) {
    let resolve;const {api}=harness(()=>new Promise(r=>resolve=r));api.stubUI();api.setSport('nfl');api.input('Future');
    const pending=api.runPlayerSearch();
    if(action==='sport')api.setSport('nba');else api.input(action==='clear'?'':'Other');
    resolve({ok:true,json:async()=>payload()});await pending;
    assert.equal(api.state().picks.length,0);
  }
});
test('slow initial unfiltered NFL feed cannot overwrite a completed player search',async()=>{
  let initial;const {api}=harness(url=>new URL(url).searchParams.has('player')
    ? Promise.resolve({ok:true,json:async()=>payload()}) : new Promise(r=>initial=r));
  api.stubUI();const loading=api.loadSport('nfl');api.input('Future');await api.runPlayerSearch();
  initial({ok:true,json:async()=>payload([{...future,player_name:'Unrelated Player'}])});await loading;
  assert.equal(api.state().picks[0].player_name,'Future Player');
});

test('NFL selections distinguish the same market and line in different upcoming events',()=>{
  const {w}=harness(); const api=w.ppAnalyzerResearch;
  const selection=api.readSelection(new URL(api.resultHref('nfl',future),'https://propellerpicks.com'));
  const props=[{...future,direction:'OVER',event_id:'other-game'},{...future,direction:'OVER'}];
  assert.equal(api.selectedPropIndex({status:'ok',player:{player_name:future.player_name},props},selection),1);
});

test('an empty or failed follow-up search clears previous matching metadata',async()=>{
  let data=payload();
  const {api,node}=harness(async()=>({ok:true,json:async()=>data}));
  api.setSport('nfl');api.input('Future');await api.runPlayerSearch();
  assert.match(node('resultsMeta').innerHTML,/Future|future/);
  data=payload([]);api.input('Nobody');await api.runPlayerSearch();
  assert.equal(node('resultsMeta').textContent,'');
  assert.match(node('picksGrid').innerHTML,/No Results/);
  data={status:'unavailable',props:[]};api.input('Future');await api.runPlayerSearch();
  assert.match(node('picksGrid').innerHTML,/Search unavailable/);
  assert.equal(node('resultsMeta').textContent,'');
});
