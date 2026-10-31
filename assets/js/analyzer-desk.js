(function (window) {
  'use strict';

  // The website adapter consumes the existing public research contract only.
  // It never calls a model, rescoring endpoint or authenticated MCP tool.
  var FIELDS = { pass_yds:'passing_yards', passing_yards:'passing_yards', pass_tds:'passing_tds', passing_tds:'passing_tds', pass_att:'passing_attempts', pass_comp:'passing_completions', rush_yds:'rushing_yards', rushing_yards:'rushing_yards', rush_attempts:'rushing_attempts', rec_yds:'receiving_yards', receiving_yards:'receiving_yards', receptions:'receptions', targets:'targets', interceptions:'passing_ints', player_interceptions:'passing_ints' };
  var LABELS = { pass_yds:'passing yards', passing_yards:'passing yards', pass_tds:'passing touchdowns', passing_tds:'passing touchdowns', pass_att:'pass attempts', pass_comp:'pass completions', rush_yds:'rushing yards', rushing_yards:'rushing yards', rush_attempts:'rush attempts', rec_yds:'receiving yards', receiving_yards:'receiving yards', receptions:'receptions', targets:'targets', interceptions:'interceptions', player_interceptions:'interceptions' };
  var TIME_ZONE = 'America/Chicago';

  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function number(v) { return (typeof v==='number'||typeof v==='string') && String(v).trim()!=='' && Number.isFinite(Number(v)) ? Number(v) : null; }
  function label(stat) { return Object.prototype.hasOwnProperty.call(LABELS,stat)?LABELS[stat]:String(stat||'stat').replace(/_/g,' '); }
  function when(v) {
    if (typeof v!=='string' || !/^\d{4}-\d{2}-\d{2}T/.test(v)) return 'Not supplied';
    var d=new Date(v); if (!Number.isFinite(d.getTime())) return 'Not supplied';
    return new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(d)+' CT';
  }
  function dateOnly(v) { return typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v+'T00:00:00Z')) && new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v; }
  function validProp(p) { return p && typeof p.stat_type==='string' && number(p.line)!==null && number(p.line)>=0 && ['OVER','UNDER'].indexOf(p.direction)!==-1; }

  function buildModel(lookup, index, opts) {
    opts=opts||{};
    if (!lookup || lookup.status!=='ok' || !lookup.player || !Array.isArray(lookup.props) || !lookup.props.length) return null;
    index=Number.isInteger(index)&&validProp(lookup.props[index])?index:lookup.props.findIndex(validProp);
    var prop=lookup.props[index];
    if (!validProp(prop)) return null;
    var full=prop.detail==='full' && Array.isArray(prop.signals);
    // Reuse the current public/free blocks: redesigning the UI must not reveal
    // the old conversation's locked blocks or summary-only signal payloads.
    var conversations=window.ppResearchChat.buildConversations(lookup,index);
    var active=opts.active||'ou', current=conversations.find(function(c){return c.chip===active;})||conversations[0];
    var visible=[];
    if (full && current) (current.free||[]).forEach(function(b){if(b.type==='list') (b.items||[]).forEach(function(s){var score=number(s.score);if(score!==null && score>=0 && score<=100 && ['OVER','UNDER','NEUTRAL'].indexOf(s.direction)!==-1)visible.push({name:String(s.name),score:score,direction:s.direction});});});
    var now=opts.now ? new Date(opts.now) : new Date();
    var today=now.toISOString().slice(0,10), checked=typeof lookup.checked_at==='string'?lookup.checked_at.slice(0,10):'';
    var cutoff=dateOnly(checked)&&checked<today ? checked : today;
    var season=now.getUTCFullYear()-(now.getUTCMonth()<7?1:0);
    var field=Object.prototype.hasOwnProperty.call(FIELDS,prop.stat_type)?FIELDS[prop.stat_type]:null;
    var workload=/^(pass|passing|interceptions|player_interceptions)/.test(prop.stat_type)?{field:'passing_attempts',label:'pass attempts'}:/^(rush|rushing)/.test(prop.stat_type)?{field:'rushing_attempts',label:'rush attempts'}:{field:'targets',label:'targets'};
    var logs=full && field && Array.isArray(lookup.game_logs) ? lookup.game_logs.filter(function(g){return g && dateOnly(g.game_date) && g.game_date<cutoff && number(g[field])!==null && number(g[field])>=0;}).map(function(g){return {date:g.game_date,season:number(g.season),team:String(g.team||''),opponent:String(g.opponent||'Unknown'),venue:g.home_away==='home'?'home':g.home_away==='away'?'away':'unknown',value:number(g[field]),attempts:number(g[workload.field])};}).sort(function(a,b){return a.date.localeCompare(b.date);}) : [];
    var counts=prop.signal_summary||{};
    var summary={};['agree','against','neutral','total'].forEach(function(k){var n=number(counts[k]);summary[k]=n!==null&&n>=0&&Number.isInteger(n)?n:null;});
    return {fixture:!!opts.fixture,index:index,player:String(lookup.player.player_name||lookup.player.name||'Player'),team:String(lookup.player.team||'Not supplied'),position:String(lookup.player.position||''),prop:{stat:prop.stat_type,line:number(prop.line),direction:prop.direction,confidence:number(prop.confidence)!==null&&number(prop.confidence)>=50&&number(prop.confidence)<=100?number(prop.confidence):null,analyzedAt:prop.analyzed_at,home:prop.home_team,away:prop.away_team,eventStart:prop.event_start},full:full,signals:visible,summary:summary,logs:logs,season:season,checkedAt:lookup.checked_at,workloadLabel:workload.label,conversations:conversations,active:active,choices:lookup.props.map(function(p,i){return validProp(p)?{index:i,text:p.direction+' '+p.line+' '+label(p.stat_type),detail:p.detail}:null;}).filter(Boolean)};
  }

  function filteredHistory(model,sample,venue) {
    var rows=model.logs.filter(function(g){return (sample!=='current'||g.season===model.season) && (venue==='all'||g.venue===venue);});
    if(sample==='recent')rows=rows.slice(-5);
    return {rows:rows,above:rows.filter(function(g){return g.value>model.prop.line;}).length,below:rows.filter(function(g){return g.value<model.prop.line;}).length,push:rows.filter(function(g){return g.value===model.prop.line;}).length,attempts:rows.length && rows.every(function(g){return g.attempts!==null;})?rows.reduce(function(n,g){return n+g.attempts;},0):null};
  }

  function lineNotice(playerName,prop,picks){
    function norm(n){return String(n||'').toLowerCase().replace(/\s+/g,' ').trim();}
    if(!prop||!norm(playerName)||number(prop.line)===null||!Array.isArray(picks))return null;
    var different=picks.some(function(p){return p&&norm(p.player_name)===norm(playerName)&&p.stat_type===prop.stat_type&&number(p.line)!==null&&number(p.line)!==number(prop.line);});
    return different?'The public board also contains a different line for this player and stat. Platform and period are not verified as the same offer.':null;
  }
  function field(name,value){return '<div><dt>'+esc(name)+'</dt><dd>'+esc(value)+'</dd></div>';}
  function section(title,copy){return '<div class="pp-desk-section"><h4>'+esc(title)+'</h4><p>'+esc(copy)+'</p></div>';}
  function signalsHtml(m) {
    var rows=m.signals.map(function(s){var start=Math.min(50,s.score),width=Math.abs(s.score-50);return '<details class="pp-desk-signal"><summary><span class="pp-desk-signal-name">'+esc(s.name)+'<small>Inspect evidence ↗</small></span><span class="pp-desk-track" aria-hidden="true"><i'+(s.score===50?' class="neutral-marker"':'')+' style="--start:'+start+'%;--width:'+width+'%"></i></span><span class="pp-desk-signal-value"><strong>'+s.score+'</strong> '+esc(s.direction)+'</span></summary><div><p>Recorded directional score: '+s.score+' / 100. Analysis recorded '+esc(when(m.prop.analyzedAt))+'.</p><p>The response does not supply this signal’s underlying reasons or supporting measurements. '+(s.direction==='NEUTRAL'?'A neutral score does not confirm health or workload.':'This signal supports a direction; it does not establish a cause or a probability.')+'</p></div></details>';}).join('');
    return '<section class="pp-desk-signals" aria-label="Available model signals"><span class="pp-desk-kicker">The model signals</span><h3>What shaped the lean.</h3><p>Recorded directional scores. Midpoint 50 is neutral.</p>'+ (rows||'<div class="pp-desk-empty"><p>No individual signal scores are available in this public read.</p></div>')+'<p class="pp-desk-limit">'+(m.full?'This public view shows selected available signal scores. More signal detail may require full access.':'This prop has summary detail only. Individual scores and game evidence are unavailable in this response.')+' Scores are not probabilities or independent votes.</p></section>';
  }

  function briefHtml(m) {
    var s=m.summary,p=m.prop,side=p.direction.toLowerCase();
    var title='The stored research leans '+side+'.';
    if(s.against>0)title+=' There is evidence on both sides.';
    var copy=m.player+'’s stored '+label(p.stat)+' analysis leans '+p.direction+' '+p.line+'. ';
    copy+=p.confidence!==null?'Its confidence score of '+p.confidence+' measures directional strength, not the chance of the outcome. ':'No confidence score was supplied. ';
    if(s.total>0)copy+=s.agree!==null?s.agree+' of '+s.total+' recorded signals agree with the lean. ':'';
    copy+='Verify the player’s current role and the exact offer before relying on this read.';
    var history=m.logs.length?m.logs.length+' returned appearances span '+m.logs[0].date+' to '+m.logs[m.logs.length-1].date+'. They are descriptive game records, not historical sportsbook lines or a forecast. Use the filters to inspect the sample.':'No dated game history is available for this stat in this public response. Missing history is not evidence that the player did not play.';
    return '<section class="pp-desk-brief" aria-label="Analyst brief"><span class="pp-desk-kicker">Analyst brief · Data summary</span><h3>'+esc(title)+'</h3><p class="pp-desk-takeaway">'+esc(copy)+'</p>'+section('What supports the lean',m.signals.length?'The available signal chart shows the exact recorded scores exposed in this public read. Their reasons and weights are not returned, so this summary does not reconstruct the model calculation or infer a defensive cause.':'The response provides a direction and summary count, without individual supporting scores. Open full access for additional available research; no missing score is filled in.')+section('Put the history in context',history)+section('What still needs checking','Current playing status, expected workload, the exact platform and period, quote observation time, and price or payout are not supplied here. No fair-odds or expected-value conclusion can be drawn.')+'<p class="pp-desk-limit">Built from the returned records. This is a data summary, not a newly generated LLM answer.</p></section>';
  }

  function historyHtml(m,sample,venue) {
    var h=filteredHistory(m,sample,venue), rows=h.rows,fieldLabel=label(m.prop.stat);
    function buttons(key,values,active){return values.map(function(v){return '<button type="button" data-desk-'+key+'="'+v[0]+'" aria-pressed="'+(active===v[0])+'">'+esc(v[1])+'</button>';}).join('');}
    var filters='<div class="pp-desk-filters"><fieldset><legend>Sample</legend>'+buttons('sample',[['all','All returned'],['recent','Most recent 5'],['current','Season '+m.season]],sample)+'</fieldset><fieldset><legend>Venue</legend>'+buttons('venue',[['all','All venues'],['home','Home'],['away','Away']],venue)+'</fieldset></div>';
    var result='';
    if(rows.length){
      result='<div class="pp-desk-stats"><div><strong>'+h.above+' / '+rows.length+'</strong><span>above selected line</span></div><div><strong>'+h.below+' / '+rows.length+'</strong><span>below selected line</span></div><div><strong>'+ (h.attempts===null?'—':h.attempts)+'</strong><span>'+esc(m.workloadLabel)+(h.push?' · '+h.push+' at the line':'')+'</span></div></div>';
      var max=Math.max(1,m.prop.line,...rows.map(function(g){return g.value;}))*1.2;
      function y(v){return 165-v/max*125;}
      var description=rows.map(function(g){return g.date+' '+g.opponent+': '+g.value;}).join('; ');
      result+='<svg class="pp-desk-chart" viewBox="0 0 660 230" role="img" aria-label="'+esc(fieldLabel+' against selected '+m.prop.line+' reference. '+description)+'"><line class="desk-gridline" x1="35" y1="165" x2="640" y2="165"/><line class="desk-reference" x1="35" y1="'+y(m.prop.line)+'" x2="640" y2="'+y(m.prop.line)+'"/><text class="desk-label" x="640" y="'+(y(m.prop.line)-10)+'" text-anchor="end">SELECTED LINE '+m.prop.line+'</text>'+rows.map(function(g,i){var x=rows.length===1?337:70+(i*535/(rows.length-1));return '<circle class="desk-point" cx="'+x+'" cy="'+y(g.value)+'" r="7"/><text class="desk-label" text-anchor="middle" x="'+x+'" y="'+(y(g.value)-14)+'">'+g.value+'</text><text class="desk-label" text-anchor="middle" x="'+x+'" y="195">'+esc(g.date.slice(5))+'</text><text class="desk-label" text-anchor="middle" x="'+x+'" y="217">'+esc(g.opponent)+'</text>';}).join('')+'</svg>';
    }else result='<div class="pp-desk-empty"><h4>No stored games returned for this view.</h4><p>'+(m.full?'The returned data does not contain matching dated records. This does not establish that the player did not play.':'This prop is summary-only; game history is not exposed for it.')+'</p></div>';
    result+='<p class="pp-desk-limit" role="status">'+rows.length+' returned appearances · '+esc(venue==='all'?'all venues':venue)+(sample==='recent'?' · most recent five in this venue':'')+'. Filters change this evidence view; the summary above keeps its original full-sample scope.</p><details class="pp-desk-source" data-desk-history-source><summary>View the dated game records</summary><div class="pp-desk-table-scroll"><table><caption>Returned '+esc(fieldLabel)+' records · selected line '+m.prop.line+'</caption><thead><tr><th scope="col">Date / team</th><th scope="col">Opponent</th><th scope="col">Result</th><th scope="col">'+esc(m.workloadLabel)+'</th></tr></thead><tbody>'+rows.map(function(g){return '<tr><th scope="row">'+esc(g.date+' '+g.team)+'</th><td>'+esc((g.venue==='home'?'vs ':g.venue==='away'?'at ':'')+g.opponent)+'</td><td class="pp-desk-num">'+g.value+'</td><td class="pp-desk-num">'+(g.attempts===null?'—':g.attempts)+'</td></tr>';}).join('')+'</tbody></table></div></details>';
    return '<section class="pp-desk-history" aria-label="Player history"><span class="pp-desk-kicker">The player history</span><h3>Put the sample in context.</h3><p>Dated appearances with the available workload. The selected line is a reference, not the line offered for those games.</p>'+filters+result+'</section>';
  }

  function marketHtml(m){return '<section class="pp-desk-market" aria-label="Market verification"><span class="pp-desk-kicker">The market check</span><h3>Verify the exact offer.</h3><p>Selected reference: <strong class="pp-desk-num">'+esc(m.prop.direction+' '+m.prop.line)+'</strong> '+esc(label(m.prop.stat))+'.</p><div class="pp-desk-empty"><h4>Quote not verified.</h4><p>Platform, period, variant, quote observation time, and price or payout are not supplied by this response.</p></div><p>Other player lines are available in the selector. They are separate research records, not verified equivalent offers across books. This response cannot establish a best price or betting edge.</p></section>';}

  function render(m,index,sample,venue,answer){
    var initials=m.player.split(/\s+/).slice(0,2).map(function(n){return n.charAt(0);}).join('');
    var matchup=m.prop.away&&m.prop.home?m.prop.away+' at '+m.prop.home:'Not supplied';
    var options=m.choices.map(function(c){return '<option value="'+c.index+'"'+(c.index===index?' selected':'')+'>'+esc(c.text)+'</option>';}).join('');
    return '<article class="pp-desk" aria-label="Player research desk">'+(m.fixture?'<p class="pp-desk-fixture">Layout test data · example records, not current research</p>':'')+'<div class="pp-desk-profile"><div class="pp-desk-avatar" aria-hidden="true">'+esc(initials)+'</div><div><span class="pp-desk-kicker">NFL · Player research</span><h2>'+esc(m.player)+'</h2><p>'+esc(m.team+' · '+m.position)+'</p></div><dl>'+field('Recorded matchup',matchup)+field('Event start',when(m.prop.eventStart))+field('Analysis recorded',when(m.prop.analyzedAt))+field('Data read',when(m.checkedAt))+field('Platform / period','Not supplied')+field('Quote status','Not verified')+'</dl></div><div class="pp-desk-selector"><label for="desk-prop-select">Choose a returned player line</label><select id="desk-prop-select" data-desk-select>'+options+'</select></div><div class="pp-desk-result"><div><span class="pp-desk-kicker">The stored research leans</span><h3>'+esc(m.prop.direction)+' <span class="pp-desk-num">'+m.prop.line+'</span> '+esc(label(m.prop.stat))+'</h3><p>Stored directional research. '+(m.full?'Detailed public preview available.':'Summary-only record.')+'</p></div><div class="pp-desk-confidence"><strong>'+ (m.prop.confidence===null?'—':esc(m.prop.confidence))+'</strong><small>Confidence Score<br>Not a win probability.</small></div></div><div class="pp-desk-freshness"><dl>'+field('Analysis',when(m.prop.analyzedAt))+field('Data read',when(m.checkedAt))+field('Line check','Not live-verified')+'</dl></div><div class="pp-desk-grid">'+briefHtml(m)+signalsHtml(m)+'</div><div class="pp-desk-evidence-grid">'+historyHtml(m,sample,venue)+marketHtml(m)+'</div><section class="pp-desk-followup"><h3>Explore this prop</h3><button type="button" data-desk-question="score">Explain the score ↗</button><button type="button" data-desk-question="missing">What would change the read? ↗</button><button type="button" data-desk-question="evidence">Show supporting evidence ↓</button>'+(answer?'<div class="pp-desk-answer" role="status"><p>'+esc(answer)+'</p></div>':'')+'</section><details class="pp-desk-source" data-desk-source><summary>The evidence behind this brief</summary><p>Selected record: '+esc(m.player+' · '+m.prop.stat+' · '+m.prop.direction+' '+m.prop.line)+'. Analysis '+esc(when(m.prop.analyzedAt))+'. Read '+esc(when(m.checkedAt))+'. A later read does not refresh scoring or verify a quote.</p><p>Individual signals are shown only within the existing public preview. Underlying signal reasons, weights, injuries, current role and quote terms are not provided. Missing data stays unknown. No new model call runs on this page.</p></details><div class="pp-desk-cta"><div><h3>Keep your research in one place.</h3><p>Save players and explore available research in the full workspace or your connected AI tool.</p></div><a href="https://app.propellerpicks.com/signup" data-analytics-event="signup_click" data-cta-id="analyzer-desk-signup" data-cta-surface="analyzer_result" data-cta-destination="signup">Create a free account ↗</a><a href="/mcp/" data-analytics-event="research_cta_click" data-cta-id="analyzer-desk-mcp" data-cta-surface="analyzer_result" data-cta-destination="mcp">Connect your AI tool ↗</a></div><p class="pp-desk-footnote">Research only. Confidence is not win probability or betting edge. Stored data may be incomplete or stale. Past performance does not guarantee future results.</p></article>';
  }

  function mountResearchChat(container,opts){
    opts=opts||{};var lookup=opts.lookup,index=Number.isInteger(opts.propIndex)?opts.propIndex:0,sample='all',venue='all',answer='',destroyed=false;
    function draw(focus){if(destroyed)return;var m=buildModel(lookup,index,opts);if(m)index=m.index;container.innerHTML=m?render(m,index,sample,venue,answer):'';if(focus){var el=container.querySelector(focus);if(el)el.focus({preventScroll:true});}}
    function click(e){var target=e.target&&e.target.closest?e.target.closest('button'):null;if(!target||!container.contains(target))return;var key=target.getAttribute('data-desk-sample'),where=target.getAttribute('data-desk-venue'),q=target.getAttribute('data-desk-question');if(key!==null){sample=key;draw('[data-desk-sample="'+key+'"]');}else if(where!==null){venue=where;draw('[data-desk-venue="'+where+'"]');}else if(q==='evidence'){var source=container.querySelector('[data-desk-source]');source.open=true;source.scrollIntoView({behavior:'auto',block:'start'});source.querySelector('summary').focus({preventScroll:true});}else if(q){var m=buildModel(lookup,index,opts);answer=q==='score'?'The stored confidence score is '+(m.prop.confidence===null?'not supplied':m.prop.confidence)+'. It is directional strength, not an outcome probability. The response does not provide component weights or enough supporting measurements to reconstruct it.':'A verified playing role and workload, current status, newer relevant game records and the exact platform quote could materially change the evaluation. A later data read alone does not update the stored analysis.';draw('[data-desk-question="'+q+'"]');}}
    function change(e){if(!e.target.matches('[data-desk-select]'))return;var next=Number(e.target.value);if(!Number.isInteger(next)||!validProp((lookup.props||[])[next]))return;index=next;sample='all';venue='all';answer='';draw('[data-desk-select]');if(typeof opts.onPropChange==='function')opts.onPropChange(lookup.props[index],index);}
    container.addEventListener('click',click);container.addEventListener('change',change);draw();
    return {getSelectedProp:function(){return (lookup.props||[])[index];},destroy:function(){destroyed=true;container.removeEventListener('click',click);container.removeEventListener('change',change);container.innerHTML='';}};
  }
  window.ppAnalyzerDesk={lineNotice:lineNotice,buildModel:buildModel,filteredHistory:filteredHistory,render:render,mountResearchChat:mountResearchChat};
})(window);
