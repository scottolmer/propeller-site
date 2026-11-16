(function(window){
  'use strict';
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function num(v){return (typeof v==='number'||typeof v==='string')&&String(v).trim()!==''&&Number.isFinite(Number(v))?Number(v):null;}
  function label(v){var names={interceptions:'interceptions',player_interceptions:'interceptions',passing_yards:'passing yards',pass_yds:'passing yards',points:'points',rebounds:'rebounds',assists:'assists',three_pointers_made:'3-pointers made',threes:'3-pointers made',pts_asts:'points + assists',pts_rebs:'points + rebounds',rebs_asts:'rebounds + assists',pts_rebs_asts:'points + rebounds + assists',pass_tds:'passing touchdowns',passing_tds:'passing touchdowns',pass_att:'pass attempts',passing_attempts:'pass attempts',pass_comp:'pass completions',passing_completions:'pass completions',rush_yds:'rushing yards',rushing_yards:'rushing yards',rush_attempts:'rush attempts',rushing_attempts:'rush attempts',rec_yds:'receiving yards',receiving_yards:'receiving yards'};return names[v]||String(v||'stat').replace(/_/g,' ');}
  function when(v){if(typeof v!=='string'||!Number.isFinite(Date.parse(v)))return 'Not supplied';return new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(v))+' CT';}
  function filterHistory(m,sample,venue){var rows=(Array.isArray(m.logs)?m.logs:[]).filter(function(g){return g&&num(g.value)!==null&&(sample!=='current'||Number(g.season)===Number(m.season))&&(venue==='all'||g.venue===venue);}).slice().sort(function(a,b){return String(a.date).localeCompare(String(b.date));});if(sample==='recent')rows=rows.slice(-2);var line=num(m.prop.line);return {rows:rows,above:rows.filter(function(g){return num(g.value)>line;}).length,below:rows.filter(function(g){return num(g.value)<line;}).length,push:rows.filter(function(g){return num(g.value)===line;}).length,attempts:rows.length&&rows.every(function(g){return num(g.attempts)!==null;})?rows.reduce(function(a,g){return a+num(g.attempts);},0):null,totalValue:rows.length?rows.reduce(function(a,g){return a+num(g.value);},0):null};}
  function freshnessNote(m) {
    if(m.sport!=='NFL')return '';
    var f=m.historyFreshness;
    if(!f)return '<p class="pp-desk-limit" data-history-freshness>Current-season history coverage was not supplied. Check the dates on each returned appearance.</p>';
    if(f.status==='unavailable')return '<p class="pp-desk-limit" data-history-freshness>Player history could not be loaded. Current-season coverage is unverified.</p>';
    var rows=Array.isArray(m.logs)?m.logs:[], current=rows.filter(function(g){return Number(g.season)===f.expectedSeason;});
    var last=rows.length?rows[rows.length-1].date:null;
    var text=current.length?f.expectedSeason+' season: '+current.length+' returned '+label(m.prop.stat)+' records. Latest returned game: '+last+'.'
      : 'No '+f.expectedSeason+' '+label(m.prop.stat)+' records were returned.'+(last?' Latest returned game: '+last+'. Prior-season history is shown below.':' This does not establish that the player did not play.');
    return '<p class="pp-desk-limit" data-history-freshness>'+esc(text)+'</p>';
  }
  function displayNumber(value) {
    var n=num(value);
    return n===null?'—':new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n);
  }
  function shortDate(value) {
    return new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(value+'T00:00:00Z'));
  }
  function matchup(g) {
    return (g.venue==='home'?'vs ':g.venue==='away'?'at ':'')+(g.opponent||'Unknown');
  }
  function history(m,sample,venue,selectedDate) {
    if(!m.full)return '<section class="pp-desk-history" id="pp-desk-history" aria-label="Player history"><h3>Player history</h3><div class="pp-desk-empty"><h4>History is restricted in this preview.</h4><p>Game records are restricted in this public preview. This does not mean the player has no history.</p></div></section>';
    sample=sample||'all';venue=venue||'all';
    var h=filterHistory(m,sample,venue),rows=h.rows,stat=label(m.prop.stat),line=num(m.prop.line),work=m.workloadLabel||'workload';
    var showWork=work!=='minutes';
    function buttons(key,values,active) {
      return values.map(function(v){return '<button type="button" data-desk-'+key+'="'+v[0]+'" aria-pressed="'+(v[0]===active)+'">'+esc(v[1])+'</button>';}).join('');
    }
    var filters='<div class="pp-desk-filters"><fieldset><legend>Sample</legend>'+buttons('sample',[['all','All returned'],['recent','Most recent 2'],['current','Current season '+m.season]],sample)+'</fieldset><fieldset><legend>Venue</legend>'+buttons('venue',[['all','All venues'],['home','Home'],['away','Away']],venue)+'</fieldset></div>';
    var status='<p class="pp-desk-history-status" role="status">'+esc(sample==='current'?'Current season '+m.season:sample==='recent'?'Most recent 2 returned games':'All returned games')+' · '+esc(venue==='all'?'all venues':venue)+' · '+rows.length+' appearance'+(rows.length===1?'':'s')+'</p>';
    var out='';
    if(rows.length) {
      var selected=rows.find(function(g){return g.date===selectedDate;})||rows[rows.length-1];
      var top=Math.max(1,line||0,...rows.map(function(g){return num(g.value);})) * 1.2;
      function y(v){return Math.round((160-v/top*120)*100)/100;}
      var desc=rows.map(function(g){return g.date+' '+g.opponent+': '+displayNumber(g.value)+' '+stat;}).join('; ');
      out='<div class="pp-desk-stats pp-desk-history-stats"><div><strong>'+h.above+' / '+rows.length+'</strong><span>games above selected '+esc(displayNumber(line))+'</span></div>'+
        (showWork?'<div><strong>'+esc(displayNumber(h.attempts))+'</strong><span>total '+esc(work)+'</span></div>':'')+
        '<div><strong>'+esc(displayNumber(h.totalValue))+'</strong><span>total '+esc(stat)+'</span></div></div>';
      // Keep text in CSS pixels; a fixed viewBox previously shrank and overlapped all labels.
      var minWidth=Math.max(260,rows.length*64),left=rows.length>8?7:18;
      out+='<div class="pp-desk-chart-heading"><span>'+esc(stat)+'</span><span class="pp-desk-reference-label">Selected line · '+esc(displayNumber(line))+'</span></div>'+
        '<div class="pp-desk-chart-scroll" tabindex="0" role="region" aria-label="'+esc(stat+' history chart; scroll horizontally to inspect every appearance')+'">'+
        '<svg class="pp-desk-chart" style="min-width:'+minWidth+'px" height="230" role="img" aria-label="'+esc('Selected line '+displayNumber(line)+'; '+desc)+'">'+
        '<line class="desk-gridline" x1="34" y1="160" x2="98%" y2="160"/>'+
        '<text class="desk-label" x="4" y="164">0</text><text class="desk-label" x="4" y="25">'+esc(displayNumber(top))+'</text>'+
        '<line class="desk-reference" x1="34" y1="'+y(line)+'" x2="98%" y2="'+y(line)+'"/>'+
        rows.map(function(g,i){var x=(rows.length===1?50:left+i*(95-left)/(rows.length-1))+'%';return '<circle class="desk-point'+(g===selected?' is-selected':'')+'"'+(g===selected?' data-desk-selected-game':'')+' cx="'+x+'" cy="'+y(num(g.value))+'" r="6"/>'+
          '<text class="desk-label desk-result" x="'+x+'" y="'+(y(num(g.value))-15)+'" text-anchor="middle">'+esc(displayNumber(g.value))+'</text>'+
          '<text class="desk-label desk-date" x="'+x+'" y="193" text-anchor="middle">'+esc(shortDate(g.date))+'</text>'+
          '<text class="desk-label desk-opponent" x="'+x+'" y="214" text-anchor="middle">'+esc(g.opponent||'Unknown')+'</text>';}).join('')+'</svg></div>'+
        (rows.length>4?'<p class="pp-desk-chart-hint">Scroll the chart to inspect every appearance.</p>':'')+
        '<div class="pp-desk-game-picker"><label for="pp-desk-history-game">Inspect a game</label><select id="pp-desk-history-game" data-desk-history-game aria-controls="pp-desk-game-detail">'+
        rows.map(function(g){return '<option value="'+esc(g.date)+'"'+(g===selected?' selected':'')+'>'+esc(g.date+' · '+matchup(g)+' · '+displayNumber(g.value)+' '+stat)+'</option>';}).join('')+'</select></div>'+
        '<p id="pp-desk-game-detail" class="pp-desk-game-detail" aria-live="polite">'+esc(selected.date+' · '+(selected.team||'Team not supplied')+' '+matchup(selected)+' · '+displayNumber(selected.value)+' '+stat+
          (showWork?' · '+(num(selected.attempts)===null?'Workload not supplied':displayNumber(selected.attempts)+' '+work):''))+'.</p>';
    } else {
      out='<div class="pp-desk-empty"><h4>No stored games returned for this view.</h4><p>This is a gap in the returned data; it does not establish that the player did not play.</p><button type="button" data-desk-reset>Show all returned games ↗</button></div>';
    }
    out+='<p class="pp-desk-limit">Selected line is a reference. Appearances may include limited playing time.</p><details class="pp-desk-source" data-desk-history-source><summary>View the dated game records</summary><div class="pp-desk-table-scroll"><table><caption>'+esc(sample)+' · '+esc(venue)+' · returned player records</caption><thead><tr><th scope="col">Date / team</th><th scope="col">Opponent</th><th scope="col">'+esc(work)+'</th><th scope="col">'+esc(stat)+'</th></tr></thead><tbody>'+rows.map(function(g){return '<tr><th scope="row">'+'<time datetime="'+esc(g.date)+'">'+esc(shortDate(g.date)+', '+g.date.slice(0,4))+'</time><small>'+esc(g.team||'')+'</small>'+'</th><td>'+esc(matchup(g))+'</td><td>'+esc(displayNumber(g.attempts))+'</td><td>'+esc(displayNumber(g.value))+'</td></tr>';}).join('')+'</tbody></table></div></details>';
    return '<section class="pp-desk-history" id="pp-desk-history" aria-label="Player history"><h3>Player history</h3>'+freshnessNote(m)+filters+status+out+'</section>';
  }
  window.ppDeskEvidence={filterHistory:filterHistory,history:history};
})(window);
