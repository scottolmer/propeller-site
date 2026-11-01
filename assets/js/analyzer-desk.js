(function (window) {
  'use strict';

  // The website adapter consumes the existing public research contract only.
  // It never calls a model, rescoring endpoint or authenticated MCP tool.
  var FIELDS = { pass_yds:'passing_yards', passing_yards:'passing_yards', pass_tds:'passing_tds', passing_tds:'passing_tds', pass_att:'passing_attempts', pass_comp:'passing_completions', rush_yds:'rushing_yards', rushing_yards:'rushing_yards', rush_attempts:'rushing_attempts', rec_yds:'receiving_yards', receiving_yards:'receiving_yards', receptions:'receptions', targets:'targets', interceptions:'passing_ints', player_interceptions:'passing_ints' };
  var LABELS = { pass_yds:'passing yards', passing_yards:'passing yards', pass_tds:'passing touchdowns', passing_tds:'passing touchdowns', pass_att:'pass attempts', pass_comp:'pass completions', rush_yds:'rushing yards', rushing_yards:'rushing yards', rush_attempts:'rush attempts', rec_yds:'receiving yards', receiving_yards:'receiving yards', receptions:'receptions', targets:'targets', interceptions:'interceptions', player_interceptions:'interceptions' };
  Object.assign(FIELDS,{points:'points',rebounds:'rebounds',assists:'assists',three_pointers_made:'three_pointers_made',threes:'three_pointers_made',pts_rebs_asts:'pts_rebs_asts'});
  Object.assign(LABELS,{points:'points',rebounds:'rebounds',assists:'assists',three_pointers_made:'3-pointers made',threes:'3-pointers made',pts_rebs_asts:'points + rebounds + assists'});
  var TIME_ZONE = 'America/Chicago';
  function sameTime(a,b){var x=Date.parse(a),y=Date.parse(b);return typeof a==='string' && typeof b==='string' && Number.isFinite(x) && Number.isFinite(y) && x===y;}
  function boundAnalysis(p){var a=p&&p.analysis;return p&&p.detail==='full' && p.source_analysis_id!=null && a && a.source==='recorded_agent_outputs' && String(p.source_analysis_id)===String(a.source_analysis_id) && sameTime(p.analyzed_at,a.analyzed_at) ? a : null;}

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
    // A canonical full preview is one complete analysis. Summary records stay sealed.
    var conversations=window.ppResearchChat.buildConversations(lookup,index);
    var active=opts.active||'ou', current=conversations.find(function(c){return c.chip===active;})||conversations[0];
    var visible=[];
    if (full) prop.signals.slice(0,12).forEach(function(s){if(!s || typeof s.name!=='string')return;var score=number(s.score);var direction=score>50?'OVER':score<50?'UNDER':'NEUTRAL';if(score!==null && score>=0 && score<=100 && s.direction===direction)visible.push({name:s.name,score:score,direction:s.direction});});
    var enriched=boundAnalysis(prop);
    if(enriched && Array.isArray(enriched.signals)) visible.forEach(function(v){var matches=enriched.signals.filter(function(x){return x && x.name===v.name && number(x.score)===v.score && x.direction===v.direction;});if(matches.length===1){var match=matches[0];v.reasons=Array.isArray(match.reasons)?match.reasons.filter(function(r){return typeof r==='string';}).slice(0,2):[];v.reasonsStatus=match.reasons_status;v.omitted=number(match.omitted_reason_count);}});
    var now=opts.now ? new Date(opts.now) : new Date();
    var today=now.toISOString().slice(0,10), checked=typeof lookup.checked_at==='string'?lookup.checked_at.slice(0,10):'';
    var cutoff=dateOnly(checked)&&checked<today ? checked : today;
    var season=now.getUTCFullYear()-(now.getUTCMonth()<2?1:0);
    var nba=String(lookup.sport||opts.sport||'').toLowerCase()==='nba';
    var freshness=null, rawFreshness=lookup.history_freshness;
    if (!nba && full && rawFreshness && typeof rawFreshness==='object') {
      var expected=number(rawFreshness.expected_season);
      if (Number.isInteger(expected) && expected>=2000 && expected<=2100
          && ['current_season_present','current_season_not_returned','unavailable','unknown'].indexOf(rawFreshness.status)!==-1) {
        freshness={status:rawFreshness.status,expectedSeason:expected,
          latestDate:dateOnly(rawFreshness.latest_game_date)?rawFreshness.latest_game_date:null};
        season=expected;
      }
    }
    var field=Object.prototype.hasOwnProperty.call(FIELDS,prop.stat_type)?FIELDS[prop.stat_type]:null;
    var workload=nba?{field:'minutes',label:'minutes'}:/^(pass|passing|interceptions|player_interceptions)/.test(prop.stat_type)?{field:'passing_attempts',label:'pass attempts'}:/^(rush|rushing)/.test(prop.stat_type)?{field:'rushing_attempts',label:'rush attempts'}:{field:'targets',label:'targets'};
    var logs=full && field && Array.isArray(lookup.game_logs) ? lookup.game_logs.filter(function(g){return g && dateOnly(g.game_date) && g.game_date<cutoff && number(g[field])!==null && number(g[field])>=0;}).map(function(g){return {date:g.game_date,season:number(g.season),team:String(g.team||''),opponent:String(g.opponent||'Unknown'),venue:g.home_away==='home'?'home':g.home_away==='away'?'away':'unknown',value:number(g[field]),attempts:number(g[workload.field])};}).sort(function(a,b){return a.date.localeCompare(b.date);}) : [];
    var counts=prop.signal_summary||{};
    var summary={};['agree','against','neutral','total'].forEach(function(k){var n=number(counts[k]);summary[k]=n!==null&&n>=0&&Number.isInteger(n)?n:null;});
    var offers=lookup.props.filter(function(p){return validProp(p) && (p===prop || (prop.event_id!=null && String(p.event_id)===String(prop.event_id))) && (p.stat_type===prop.stat_type || (FIELDS[p.stat_type] && FIELDS[p.stat_type]===field));}).slice(0,10).map(function(p){return {stat:p.stat_type,line:number(p.line),direction:p.direction,platform:p.platform,period:p.period,variant:p.variant,quoteObservedAt:p.quote_observed_at,analyzedAt:p.analyzed_at,eventId:p.event_id,eventStart:p.event_start,home:p.home_team,away:p.away_team,selected:p===prop || (prop.source_analysis_id!=null && p.source_analysis_id!=null && String(p.source_analysis_id)===String(prop.source_analysis_id))};});
    var sources=Array.isArray(opts.evidenceSources)?opts.evidenceSources.filter(function(s){return s && typeof s.label==='string' && typeof s.href==='string' && /^\/__analyst-preview\/evidence\/[a-z0-9-]+\.json$/.test(s.href);}):[];
    return {fixture:!!opts.fixture,sport:nba?'NBA':'NFL',enriched:!!enriched,sourceId:prop.source_analysis_id,index:index,player:String(lookup.player.player_name||lookup.player.name||'Player'),team:String(lookup.player.team||'Not supplied'),position:String(lookup.player.position||''),prop:{stat:prop.stat_type,line:number(prop.line),direction:prop.direction,confidence:number(prop.confidence)!==null&&number(prop.confidence)>=50&&number(prop.confidence)<=100?number(prop.confidence):null,analyzedAt:prop.analyzed_at,home:prop.home_team,away:prop.away_team,eventId:prop.event_id,eventStart:prop.event_start,platform:prop.platform,period:prop.period,variant:prop.variant,quoteObservedAt:prop.quote_observed_at},full:full,signals:visible,summary:summary,logs:logs,logsTruncated:!!lookup.game_logs_truncated,historyScope:lookup.history_scope,historyFreshness:freshness,offers:offers,sources:sources,season:season,checkedAt:lookup.checked_at,workloadLabel:workload.label,conversations:conversations,active:active,choices:lookup.props.map(function(p,i){return validProp(p)?{index:i,text:p.direction+' '+p.line+' '+label(p.stat_type)+(p.platform?' · '+p.platform:''),detail:p.detail}:null;}).filter(Boolean)};
  }

  function filteredHistory(model,sample,venue) {
    if(window.ppDeskEvidence)return window.ppDeskEvidence.filterHistory(model,sample,venue);
    var rows=model.logs.filter(function(g){return (sample!=='current'||g.season===model.season) && (venue==='all'||g.venue===venue);});
    if(sample==='recent')rows=rows.slice(-2);
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
    var rows=m.signals.map(function(s){var start=Math.min(50,s.score),width=Math.abs(s.score-50);return '<details class="pp-desk-signal"><summary><span class="pp-desk-signal-name">'+esc(s.name)+'<small>Inspect evidence ↗</small></span><span class="pp-desk-track" aria-hidden="true"><i'+(s.score===50?' class="neutral-marker"':'')+' style="--start:'+start+'%;--width:'+width+'%"></i></span><span class="pp-desk-signal-value"><strong>'+s.score+'</strong> '+esc(s.direction)+'</span></summary><div><p>Recorded directional score: '+s.score+' / 100. Analysis recorded '+esc(when(m.prop.analyzedAt))+'.</p>'+(s.reasons&&s.reasons.length?'<p><strong>Recorded explanation</strong> · '+esc(when(m.prop.analyzedAt))+'</p><ul>'+s.reasons.map(function(r){return '<li>'+esc(r)+'</li>';}).join('')+'</ul>'+(s.omitted>0?'<p>'+esc(s.omitted)+' additional recorded explanation(s) omitted from this response.</p>':''):'<p>The response does not supply this signal’s underlying reasons or supporting measurements.</p>')+'<p>'+(s.direction==='NEUTRAL'?'A neutral score does not confirm health or workload.':'This signal supports a direction; it does not establish a cause or a probability.')+'</p></div></details>';}).join('');
    return '<section class="pp-desk-signals" id="pp-desk-signals" aria-label="Available model signals"><h3>Model signals</h3><div class="pp-desk-signal-scale" aria-hidden="true"><span>0 · UNDER</span><span>50 · NEUTRAL</span><span>100 · OVER</span></div>'+ (rows||'<div class="pp-desk-empty"><p>No individual signal scores are available in this public read.</p></div>')+'<p class="pp-desk-limit">'+(m.full?'':'Individual signals are unavailable for this summary-only record.')+' Scores are not win probabilities.</p></section>';
  }

  function evidenceLink(id) {
    var refs={selection:['pp-desk-source','Selected prop + signals'],signals:['pp-desk-signals','Recorded signals'],history:['pp-desk-history','Dated player logs'],derived_history:['pp-desk-history','History calculations'],availability:['pp-desk-context','Player status'],provenance:['pp-desk-context','Source + timestamps']};
    var ref=refs[id];
    return ref?'<a href="#'+ref[0]+'" data-desk-evidence="'+id+'">'+ref[1]+'</a>':'';
  }

  function pulseHtml(m) {
    var items=[];
    if(m.summary.agree!==null)items.push(m.summary.agree+' signals '+m.prop.direction.toLowerCase());
    if(m.summary.against>0)items.push(m.summary.against+' against');
    if(m.summary.neutral!==null)items.push(m.summary.neutral+' neutral');
    return '<div class="pp-desk-pulse" aria-label="Model support and evidence readiness">'+items.map(function(item){return '<span>'+esc(item)+'</span>';}).join('')+'<span class="pp-desk-pulse-caution">Current context needs verification</span></div>';
  }

  function numberedSection(index,part) {
    part=part||{};
    return '<section class="pp-desk-section pp-desk-numbered"><span class="pp-desk-section-index">0'+index+'</span><div><h4>'+esc(part.title||'')+'</h4><p>'+esc(part.text||'')+'</p><div class="pp-desk-claim-sources">'+(Array.isArray(part.evidence_ids)?part.evidence_ids.map(evidenceLink).filter(Boolean).join(' · '):'')+'</div></div></section>';
  }

  function matchingBrief(result,prop) {
    return !!(prop && boundAnalysis(prop) && result && result.status==='ok' && result.brief && typeof result.brief.headline==='string' && typeof result.brief.takeaway==='string' && result.provenance && String(result.provenance.source_analysis_id)===String(prop.source_analysis_id) && sameTime(result.provenance.analyzed_at,prop.analyzed_at));
  }

  function briefHtml(m,generated,requestState,canRequest) {
    if(generated) {
      var b=generated.brief,p=generated.provenance;
      return '<section class="pp-desk-brief" aria-label="Analyst brief"><div class="pp-desk-brief-byline"><span class="pp-desk-kicker">Analyst brief</span><span>OPENAI GENERATED'+(p.reviewed?' · REVIEWED':'')+'</span></div><h3>'+esc(b.headline)+'</h3><p class="pp-desk-takeaway">'+esc(b.takeaway)+'</p>'+pulseHtml(m)+'<details class="pp-desk-deep"><summary>Read the analysis <span aria-hidden="true">+</span></summary>'+numberedSection(1,b.signal_read)+numberedSection(2,b.statistical_context)+numberedSection(3,b.market_read)+numberedSection(4,b.decision)+(Array.isArray(b.recheck)?'<div class="pp-desk-recheck"><h4>Before revisiting this prop</h4><ol>'+b.recheck.map(function(item){return '<li>'+esc(item)+'</li>';}).join('')+'</ol></div>':'')+'</details><p class="pp-desk-attribution">Generated · '+esc(when(p.generated_at))+(p.replayed?' · Saved example':'')+'</p></section>';
    }
    var count=m.summary,p=m.prop;
    var copy=m.player+'’s stored '+label(p.stat)+' analysis leans '+p.direction+' '+p.line+'. ';
    copy+=(count.agree!==null&&count.total!==null?count.agree+' of '+count.total+' signals support the lean. ':'')+'Verify the current role and exact quote.';
    var history=!m.full?'Detailed game history is restricted in this public preview. This view does not establish whether current-season records exist.':m.logs.length?m.logs.length+' returned appearances span '+m.logs[0].date+' to '+m.logs[m.logs.length-1].date+'. They are descriptive game records, not historical offered lines or a forecast. Inspect the dated workload below.':'No dated game history is available for this stat in this public response. Missing history does not mean the player did not play.';
    var support=m.signals.length?'The returned signals include '+m.signals.map(function(signal){return signal.name+' '+signal.score+' '+signal.direction;}).join(', ')+'. These are components of one model record, not independent votes. Only recorded explanations are shown; missing reasons and weights remain unknown.':'Only summary counts are available for this record. Individual scores and underlying reasons are not supplied.';
    var message='';
    if(requestState==='allowance_exhausted')message='<p role="status">Your free AI preview is complete. <a href="https://app.propellerpicks.com/signup">Create a free account to continue.</a></p>';
    else if(['unavailable','budget_exhausted','budget_unavailable'].indexOf(requestState)!==-1)message='<p role="status">AI briefs are unavailable right now. The saved evidence is still available.</p>';
    else if(requestState && requestState!=='loading')message='<p role="status">The brief could not finish. The saved evidence is still available.</p>';
    return '<section class="pp-desk-brief" aria-label="Analyst brief"><span class="pp-desk-kicker">Analyst brief · Data summary</span><h3>The stored research leans '+esc(p.direction.toLowerCase())+'.'+(count.against>0?' There is evidence on both sides.':'')+'</h3><p class="pp-desk-takeaway">'+esc(copy)+'</p>'+pulseHtml(m)+'<details class="pp-desk-deep"><summary>Read the analysis <span aria-hidden="true">+</span></summary>'+numberedSection(1,{title:'What supports the lean',text:support,evidence_ids:['selection','signals']})+numberedSection(2,{title:'Put the history in context',text:history,evidence_ids:['history']})+numberedSection(3,{title:'Verify the exact offer',text:'Check the platform, line, period and variant together. Reading the stored record does not verify current availability or price. The recorded offers below may have different terms.',evidence_ids:['provenance']})+numberedSection(4,{title:'What still needs checking',text:'Verify current playing status, expected workload, current-season evidence and an exact quote. Missing price or payout and calibrated probability prevent a fair-odds or expected-value conclusion.',evidence_ids:['availability','history']})+'</details><p class="pp-desk-limit">Data summary · not a newly generated LLM answer.</p>'+(canRequest&&(!requestState||requestState==='loading')?'<button type="button" data-desk-generate'+(requestState==='loading'?' disabled':'')+'>'+(requestState==='loading'?'Generating…':'Generate analyst brief')+'</button>':'')+message+'</section>';
  }

  function historyHtml(m,sample,venue,selectedDate) {
    if(window.ppDeskEvidence)return window.ppDeskEvidence.history(m,sample,venue,selectedDate);
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


  function sourcesHtml(m) {
    var signalRows=m.signals.map(function(signal){return '<tr><th scope="row">'+esc(signal.name)+'</th><td class="pp-desk-num">'+signal.score+'</td><td>'+esc(signal.direction)+'</td><td>'+esc(signal.reasons&&signal.reasons.length?'Recorded explanations available':'Not recorded in this response')+'</td></tr>';}).join('');
    var links=m.sources.map(function(source){return '<a href="'+esc(source.href)+'" target="_blank" rel="noopener">'+esc(source.label)+' ↗</a>';}).join(' · ');
    return '<details class="pp-desk-source" id="pp-desk-source" data-desk-source><summary>The evidence behind this brief</summary><p>Selected record: '+esc(m.player+' · '+m.prop.stat+' · '+m.prop.direction+' '+m.prop.line)+'. Platform '+esc(m.prop.platform||'not supplied')+'; period '+esc(m.prop.period||'not supplied')+'; variant '+esc(m.prop.variant||'not supplied')+'.</p><dl class="pp-desk-provenance">'+field('Source analysis ID',m.full?(m.sourceId||'Not supplied'):'Summary-only')+field('Analysis recorded',when(m.prop.analyzedAt))+field('Data read',when(m.checkedAt))+'</dl>'+(signalRows?'<div class="pp-desk-table-scroll"><table><caption>Recorded signals for the selected prop · midpoint 50</caption><thead><tr><th scope="col">Signal</th><th scope="col">Score</th><th scope="col">Direction</th><th scope="col">Reasons</th></tr></thead><tbody>'+signalRows+'</tbody></table></div>':'<p>Individual signal evidence is unavailable for this summary-only record.</p>')+(links?'<p class="pp-desk-source-links">'+links+'</p>':'')+'</details><details class="pp-desk-source" id="pp-desk-context" data-desk-context><summary>Freshness, scope, and missing inputs</summary><p>Analysis recorded '+esc(when(m.prop.analyzedAt))+'. Data read '+esc(when(m.checkedAt))+'. A later read does not refresh scoring or verify a live quote.</p><p>'+esc(m.logs.length?m.logs.length+' dated appearances were returned, from '+m.logs[0].date+' to '+m.logs[m.logs.length-1].date+'.':'No dated appearances were returned.')+(m.logsTruncated?' Additional history may exist beyond this bounded read.':'')+' These records are not historical sportsbook offers.</p><p>Current player status, expected workload, a calibrated outcome probability, model weights, and verified live price or payout are not supplied. Neutral signals do not confirm health or a stable role. Available recorded explanations describe their analysis snapshot.</p><p>The analyst brief and confidence describe this selected record; historical filters and offer comparisons do not rescore it.</p></details>';
  }

  function render(m,index,sample,venue,answer,generated,requestState,canRequest,selectedDate,activeQuestion) {
    var initials=m.player.split(/\s+/).slice(0,2).map(function(name){return name.charAt(0);}).join('');
    var matchup=m.prop.away&&m.prop.home?m.prop.away+' at '+m.prop.home:'Not supplied';
    var options=m.choices.map(function(choice){return '<option value="'+choice.index+'"'+(choice.index===index?' selected':'')+'>'+esc(choice.text)+'</option>';}).join('');
    var followups=[['score','Explain the score ↗'],['missing','What would change the read? ↗'],['evidence','Show supporting evidence ↓']];
    return '<article class="pp-desk" aria-label="Player research desk">'+(m.fixture?'<p class="pp-desk-fixture">Layout test data · example records, not current research</p>':'')+
      '<div class="pp-desk-profile"><div class="pp-desk-avatar" aria-hidden="true">'+esc(initials)+'</div><div><span class="pp-desk-kicker">'+esc(m.sport)+' · Player research</span><h2>'+esc(m.player)+'</h2><p>'+esc(m.team+' · '+m.position)+'</p></div><dl>'+field('Recorded matchup',matchup)+field('Event start',when(m.prop.eventStart))+field('Platform / period',(m.prop.platform||'Not supplied')+' / '+(m.prop.period||'Not supplied'))+'</dl></div>'+
      '<div class="pp-desk-selector"><label for="desk-prop-select">Choose a returned player line</label><select id="desk-prop-select" data-desk-select>'+options+'</select></div>'+
      '<div class="pp-desk-result"><div><span class="pp-desk-kicker">The stored research leans</span><h3>'+esc(m.prop.direction)+' <span class="pp-desk-num">'+m.prop.line+'</span> '+esc(label(m.prop.stat))+'</h3><p>'+ (m.full?'Complete preview':'Summary only') +'</p></div><div class="pp-desk-confidence"><strong>'+(m.prop.confidence===null?'—':m.prop.confidence)+'</strong><small>Confidence Score<br>Not a win probability.</small></div></div>'+
      '<div class="pp-desk-freshness"><dl>'+field('Analysis',when(m.prop.analyzedAt))+field('Data read',when(m.checkedAt))+field('Line check','Not live-verified')+'</dl></div>'+
      '<div class="pp-desk-grid">'+briefHtml(m,generated,requestState,canRequest)+signalsHtml(m)+'</div>'+
      '<div class="pp-desk-evidence-grid">'+historyHtml(m,sample,venue,selectedDate)+'</div>'+
      '<section class="pp-desk-followup"><h3>Explore this prop</h3>'+followups.map(function(item){return '<button type="button" data-desk-question="'+item[0]+'" aria-pressed="'+(activeQuestion===item[0])+'" aria-controls="'+(item[0]==='evidence'?'pp-desk-source':'pp-desk-followup-answer')+'">'+item[1]+'</button>';}).join('')+(answer?'<div id="pp-desk-followup-answer" class="pp-desk-answer" role="status"><span class="pp-desk-kicker">From this research snapshot</span><h4>'+esc(activeQuestion==='score'?'How to read the score':'What could change this read')+'</h4><p>'+esc(answer)+'</p><small>Explanation from the saved evidence. No new model call.</small></div>':'')+'</section>'+
      sourcesHtml(m)+'<div class="pp-desk-cta"><div><h3>Keep researching.</h3><p>Your first complete analysis is free.</p></div><a href="https://app.propellerpicks.com/signup" data-analytics-event="signup_click" data-cta-id="analyzer-desk-signup" data-cta-surface="analyzer_result" data-cta-destination="signup">Create a free account ↗</a><a href="/mcp/" data-analytics-event="research_cta_click" data-cta-id="analyzer-desk-mcp" data-cta-surface="analyzer_result" data-cta-destination="mcp">Connect your AI tool ↗</a></div><p class="pp-desk-footnote">Research only. Confidence is not win probability or betting edge. Stored data may be incomplete or stale. Past performance does not guarantee future results.</p></article>';
  }

  function mountResearchChat(container,opts) {
    opts=opts||{};
    var lookup=opts.lookup,index=Number.isInteger(opts.propIndex)?opts.propIndex:0;
    var sample='all',venue='all',selectedDate='',answer='',activeQuestion='';
    var destroyed=false,generated=null,requestState='',generation=0,resetDisclosures=false;
    function draw(focus) {
      if(destroyed)return;
      var scrollY=typeof window.scrollY==='number'?window.scrollY:null;
      var selectors=['.pp-desk-deep','[data-desk-source]','[data-desk-context]','[data-desk-history-source]'];
      for(var i=1;i<=12;i++)selectors.push('.pp-desk-signal:nth-of-type('+i+')');
      var opened=resetDisclosures?[]:selectors.filter(function(selector){var node=container.querySelector(selector);return node && node.open;});
      resetDisclosures=false;
      var m=buildModel(lookup,index,opts);
      if(m) {
        index=m.index;
        if(!generated && matchingBrief(opts.savedBrief,lookup.props[index]))generated=opts.savedBrief;
      }
      container.innerHTML=m?render(m,index,sample,venue,answer,generated,requestState,!!(m.enriched && typeof opts.requestBrief==='function'),selectedDate,activeQuestion):'';
      opened.forEach(function(selector){var node=container.querySelector(selector);if(node)node.open=true;});
      if(focus){var el=container.querySelector(focus);if(el)el.focus({preventScroll:true});}
      if(focus && scrollY!==null && typeof window.scrollTo==='function')window.scrollTo(0,scrollY);
    }
    function openEvidence(id) {
      var targets={selection:'[data-desk-source]',signals:'#pp-desk-signals',history:'#pp-desk-history',derived_history:'#pp-desk-history',availability:'[data-desk-context]',provenance:'[data-desk-context]'};
      if(id==='history'||id==='derived_history'){sample='all';venue='all';selectedDate='';draw();}
      var el=container.querySelector(targets[id]||'[data-desk-source]');
      if(!el)return;
      if(el.tagName==='DETAILS'||el.matches&&el.matches('details'))el.open=true;
      el.scrollIntoView({behavior:'auto',block:'start'});
      var focus=el.querySelector('summary,h3');
      if(focus){if(focus.tagName!=='SUMMARY')focus.setAttribute('tabindex','-1');focus.focus({preventScroll:true});}
    }
    function click(event) {
      var target=event.target&&event.target.closest?event.target.closest('button,[data-desk-evidence]'):null;
      if(!target||!container.contains(target))return;
      if(target.hasAttribute('data-desk-evidence')){if(event.preventDefault)event.preventDefault();openEvidence(target.getAttribute('data-desk-evidence'));return;}
      if(target.hasAttribute('data-desk-generate')) {
        var selected=lookup.props[index];
        if(requestState==='loading'||!boundAnalysis(selected)||typeof opts.requestBrief!=='function')return;
        var requestId=++generation,selectedIndex=index;
        requestState='loading';draw();
        Promise.resolve().then(function(){return opts.requestBrief(selected);}).then(function(result){
          if(destroyed||requestId!==generation||index!==selectedIndex)return;
          if(result && result.status!=='ok'){requestState=['allowance_exhausted','unavailable','budget_exhausted','budget_unavailable','already_attempted','generation_unavailable'].indexOf(result.status)!==-1?result.status:'error';draw();return;}
          if(!matchingBrief(result,selected))throw new Error('Mismatched provenance');
          generated=result;requestState='';draw();
        }).catch(function(){if(!destroyed&&requestId===generation&&index===selectedIndex){requestState='error';draw();}});
        return;
      }
      if(target.hasAttribute('data-desk-reset')){sample='all';venue='all';selectedDate='';draw('[data-desk-sample="all"]');return;}
      var key=target.getAttribute('data-desk-sample'),where=target.getAttribute('data-desk-venue');
      var game=target.getAttribute('data-desk-game'),question=target.getAttribute('data-desk-question');
      if(key!==null){sample=key;selectedDate='';draw('[data-desk-sample="'+key+'"]');}
      else if(where!==null){venue=where;selectedDate='';draw('[data-desk-venue="'+where+'"]');}
      else if(game!==null && dateOnly(game)){selectedDate=game;draw('[data-desk-game="'+game+'"]');}
      else if(question==='evidence'){activeQuestion=question;draw();openEvidence('selection');}
      else if(question) {
        var m=buildModel(lookup,index,opts);activeQuestion=question;
        answer=question==='score'?'The stored confidence score is '+(m.prop.confidence===null?'not supplied':m.prop.confidence)+'. '+(m.signals.length?'The selected record contains '+m.signals.map(function(signal){return signal.name+' '+signal.score+' '+signal.direction;}).join(', ')+'. ':'Individual signal scores are not supplied. ')+'It measures directional strength, not the probability of the outcome. Signals are components of one model, and their weights are not supplied.':'Verify current playing status, expected role and workload, newer relevant games, and the exact platform quote. '+(m.logs.length?'The dated history spans '+m.logs[0].date+' to '+m.logs[m.logs.length-1].date+'. ':'No dated game history was returned. ')+'Missing current context and price can materially change the evaluation. A later read alone does not update the stored analysis.';
        draw('[data-desk-question="'+question+'"]');
      }
    }
    function change(event) {
      if(!event.target.matches('[data-desk-select]'))return;
      var next=Number(event.target.value);
      if(!Number.isInteger(next)||!validProp((lookup.props||[])[next]))return;
      generation++;generated=null;requestState='';index=next;sample='all';venue='all';selectedDate='';answer='';activeQuestion='';resetDisclosures=true;
      draw('[data-desk-select]');
      if(typeof opts.onPropChange==='function')opts.onPropChange(lookup.props[index],index);
    }
    container.addEventListener('click',click);container.addEventListener('change',change);draw();
    return {getSelectedProp:function(){return (lookup.props||[])[index];},destroy:function(){destroyed=true;generation++;container.removeEventListener('click',click);container.removeEventListener('change',change);container.innerHTML='';}};
  }

  window.ppAnalyzerDesk={lineNotice:lineNotice,buildModel:buildModel,filteredHistory:filteredHistory,render:render,mountResearchChat:mountResearchChat};
})(window);
