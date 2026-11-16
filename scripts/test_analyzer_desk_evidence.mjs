import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const w={};vm.runInNewContext(readFileSync(new URL('../assets/js/analyzer-desk-evidence.js',import.meta.url),'utf8'),{window:w,Intl,Date,Number,String,Array,Math});const api=w.ppDeskEvidence;
const m={season:2026,full:true,prop:{stat:'interceptions',line:.5,direction:'OVER'},workloadLabel:'pass attempts',logs:[['2025-11-16','NYG','away',2],['2025-11-23','MIN','home',1],['2025-12-21','CHI','away',11],['2025-12-28','BAL','home',21]].map(([date,opponent,venue,attempts])=>({date,opponent,venue,attempts,team:'GB',season:2025,value:0}))};
test('four historical games preserve results and workload through filters',()=>{let h=api.filterHistory(m,'all','all');assert.equal(h.rows.length,4);assert.equal(h.attempts,35);assert.equal(h.totalValue,0);assert.equal(h.above,0);h=api.filterHistory(m,'recent','all');assert.equal(h.rows.length,2);assert.equal(h.attempts,32);assert.equal(api.filterHistory(m,'all','home').attempts,22);assert.equal(api.filterHistory(m,'current','all').rows.length,0);});
test('history plots all dates, selected line, selected game and honest missing workload',()=>{let html=api.history(m,'all','all','2025-11-23');assert.match(html,/<svg/);assert.match(html,/Selected line · 0.5/);assert.match(html,/35<\/strong>/);assert.match(html,/<option value="2025-11-23" selected>/);assert.match(html,/2025-11-23 · GB vs MIN/);assert.match(html,/2025-12-28/);html=api.history(m,'current','all');assert.match(html,/data-desk-reset/);const copy={...m,logs:[{...m.logs[0],attempts:null}]};assert.equal(api.filterHistory(copy,'all','all').attempts,null);assert.match(api.history(copy,'all','all'),/Workload not supplied/);});

test('NBA history uses readable labels and keeps minutes in the source records only',()=>{
  const nba={...m,sport:'NBA',prop:{stat:'pts_asts',line:28.5},workloadLabel:'minutes',logs:[
    {...m.logs[0],value:33,attempts:38.366665},
    {...m.logs[1],value:0.1,attempts:34.2},
    {...m.logs[2],value:0.2,attempts:45.083332}
  ]};
  const html=api.history(nba,'all','all',nba.logs[1].date),main=html.split('<details class="pp-desk-source"')[0];
  assert.match(main,/points \+ assists/i);
  assert.doesNotMatch(main,/pts asts|minutes|38\.366665|117\.649997/);
  assert.doesNotMatch(html,/33\.300000000000004|38\.366665|45\.083332/);
  assert.match(html,/>33\.3<\/strong>/);
  assert.match(html,/<select[^>]+data-desk-history-game/);
  assert.match(html,/<option value="2025-11-23" selected>/);
  assert.match(html,/<th scope="col">minutes<\/th>/);
  assert.equal(api.filterHistory(nba,'all','all').rows[0].attempts,38.366665);
  for(const [key,name] of [['pts_rebs','points + rebounds'],['rebs_asts','rebounds + assists'],['pts_rebs_asts','points + rebounds + assists']]){
    const rendered=api.history({...nba,prop:{...nba.prop,stat:key}},'all','all');
    assert.ok(rendered.includes(name));
  }
});
