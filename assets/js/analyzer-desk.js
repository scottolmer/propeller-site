(function (window) {
  'use strict';

  // The website adapter consumes the existing public research contract only.
  // It never calls a model, rescoring endpoint or authenticated MCP tool.
  var FIELDS = { pass_yds:'passing_yards', passing_yards:'passing_yards', pass_tds:'passing_tds', passing_tds:'passing_tds', pass_att:'passing_attempts', pass_comp:'passing_completions', rush_yds:'rushing_yards', rushing_yards:'rushing_yards', rush_attempts:'rushing_attempts', rec_yds:'receiving_yards', receiving_yards:'receiving_yards', receptions:'receptions', targets:'targets', interceptions:'passing_ints', player_interceptions:'passing_ints' };
  var LABELS = { pass_yds:'passing yards', passing_yards:'passing yards', pass_tds:'passing touchdowns', passing_tds:'passing touchdowns', pass_att:'pass attempts', pass_comp:'pass completions', rush_yds:'rushing yards', rushing_yards:'rushing yards', rush_attempts:'rush attempts', rec_yds:'receiving yards', receiving_yards:'receiving yards', receptions:'receptions', targets:'targets', interceptions:'interceptions', player_interceptions:'interceptions' };
  Object.assign(FIELDS,{points:'points',rebounds:'rebounds',assists:'assists',three_pointers_made:'three_pointers_made',threes:'three_pointers_made',pts_rebs_asts:'pts_rebs_asts',pts_asts:'pts_asts',pts_rebs:'pts_rebs',rebs_asts:'rebs_asts'});
  Object.assign(LABELS,{points:'points',rebounds:'rebounds',assists:'assists',three_pointers_made:'3-pointers made',threes:'3-pointers made',pts_rebs_asts:'points + rebounds + assists',pts_asts:'points + assists',pts_rebs:'points + rebounds',rebs_asts:'rebounds + assists'});
  // Social-feed and board stat names (player_*, combos) map onto the same game-log fields.
  Object.assign(FIELDS,{player_receptions:'receptions',player_reception_yds:'receiving_yards',player_rush_yds:'rushing_yards',player_pass_yds:'passing_yards',pass_completions:'passing_completions',player_pass_completions:'passing_completions',player_pass_attempts:'passing_attempts',player_pass_tds:'passing_tds',player_rush_attempts:'rushing_attempts',rush_rec_yds:'rush_rec_yds',player_rush_reception_yds:'rush_rec_yds'});
  Object.assign(LABELS,{player_receptions:'receptions',player_reception_yds:'receiving yards',player_rush_yds:'rushing yards',player_pass_yds:'passing yards',pass_completions:'pass completions',player_pass_completions:'pass completions',player_pass_attempts:'pass attempts',player_pass_tds:'passing touchdowns',player_rush_attempts:'rush attempts',rush_rec_yds:'rushing + receiving yards',player_rush_reception_yds:'rushing + receiving yards'});
  var COMBOS = { rush_rec_yds:['rushing_yards','receiving_yards'] };
  var SIGNUP = 'https://app.propellerpicks.com/signup';
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
  function logValue(g,field){if(!g||!field)return null;if(COMBOS[field]){var parts=COMBOS[field].map(function(k){return number(g[k]);});return parts.every(function(v){return v!==null;})?parts.reduce(function(a,b){return a+b;},0):null;}return number(g[field]);}
  // Public stat history (values only, most recent first) for summary-only records.
  function publicHistoryModel(raw,prop){
    if(!raw||raw.stat!==prop.stat_type)return null;
    if(raw.status!=='ok')return {status:raw.status==='loading'?'loading':'unavailable'};
    var line=number(prop.line),values=(Array.isArray(raw.values)?raw.values:[]).map(number).filter(function(v){return v!==null&&v>=0;}).slice(0,20).reverse();
    if(!values.length||line===null)return {status:'unavailable'};
    var over=values.filter(function(v){return v>line;}).length,under=values.filter(function(v){return v<line;}).length;
    return {status:'ok',values:values,games:values.length,over:over,under:under,push:values.length-over-under,
      hits:prop.direction==='OVER'?over:under,average:Math.round(values.reduce(function(a,b){return a+b;},0)/values.length*10)/10};
  }
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
    if(nba)season=now.getUTCFullYear()-(now.getUTCMonth()<9?1:0);
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
    var workload=nba?{field:'minutes',label:'minutes'}:/^(pass|passing|interceptions|player_interceptions|player_pass)/.test(prop.stat_type)?{field:'passing_attempts',label:'pass attempts'}:/^(rush|rushing|player_rush)/.test(prop.stat_type)?{field:'rushing_attempts',label:'rush attempts'}:{field:'targets',label:'targets'};
    var logs=full && field && Array.isArray(lookup.game_logs) ? lookup.game_logs.filter(function(g){return g && dateOnly(g.game_date) && g.game_date<cutoff && logValue(g,field)!==null && logValue(g,field)>=0;}).map(function(g){return {date:g.game_date,season:number(g.season),team:String(g.team||''),opponent:String(g.opponent||'Unknown'),venue:g.home_away==='home'?'home':g.home_away==='away'?'away':'unknown',value:logValue(g,field),attempts:number(g[workload.field])};}).sort(function(a,b){return a.date.localeCompare(b.date);}) : [];
    var counts=prop.signal_summary||{};
    var summary={};['agree','against','neutral','total'].forEach(function(k){var n=number(counts[k]);summary[k]=n!==null&&n>=0&&Number.isInteger(n)?n:null;});
    var offers=lookup.props.filter(function(p){return validProp(p) && (p===prop || (prop.event_id!=null && String(p.event_id)===String(prop.event_id))) && (p.stat_type===prop.stat_type || (FIELDS[p.stat_type] && FIELDS[p.stat_type]===field));}).slice(0,10).map(function(p){return {stat:p.stat_type,line:number(p.line),direction:p.direction,platform:p.platform,period:p.period,variant:p.variant,quoteObservedAt:p.quote_observed_at,analyzedAt:p.analyzed_at,eventId:p.event_id,eventStart:p.event_start,home:p.home_team,away:p.away_team,selected:p===prop || (prop.source_analysis_id!=null && p.source_analysis_id!=null && String(p.source_analysis_id)===String(prop.source_analysis_id))};});
    var sources=Array.isArray(opts.evidenceSources)?opts.evidenceSources.filter(function(s){return s && typeof s.label==='string' && typeof s.href==='string' && /^\/__analyst-preview\/evidence\/[a-z0-9-]+\.json$/.test(s.href);}):[];
    return {fixture:!!opts.fixture,sport:String(lookup.sport||opts.sport||'nfl').toUpperCase(),publicHistory:full?null:publicHistoryModel(opts.publicHistory,prop),claimable:!!opts.claimable,enriched:!!enriched,sourceId:prop.source_analysis_id,index:index,player:String(lookup.player.player_name||lookup.player.name||'Player'),team:String(lookup.player.team||'Not supplied'),position:String(lookup.player.position||''),prop:{stat:prop.stat_type,line:number(prop.line),direction:prop.direction,confidence:number(prop.confidence)!==null&&number(prop.confidence)>=50&&number(prop.confidence)<=100?number(prop.confidence):null,analyzedAt:prop.analyzed_at,home:prop.home_team,away:prop.away_team,eventId:prop.event_id,eventStart:prop.event_start,platform:prop.platform,period:prop.period,variant:prop.variant,quoteObservedAt:prop.quote_observed_at},full:full,signals:visible,summary:summary,logs:logs,logsTruncated:!!lookup.game_logs_truncated,historyScope:lookup.history_scope,historyFreshness:freshness,offers:offers,sources:sources,season:season,checkedAt:lookup.checked_at,workloadLabel:workload.label,conversations:conversations,active:active,choices:lookup.props.map(function(p,i){return validProp(p)?{index:i,text:moreLess(p.direction)+' '+p.line+' '+label(p.stat_type)+(p.platform?' · '+p.platform:''),detail:p.detail}:null;}).filter(Boolean)};
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
  // Pick'em words on screen; the data keeps OVER/UNDER.
  function moreLess(direction){return direction==='OVER'?'More':direction==='UNDER'?'Less':'Neutral';}
  var SPARK='<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M8 0l1.8 5.2L15 7l-5.2 1.8L8 14l-1.8-5.2L1 7l5.2-1.8z"/></svg>';
  var LOCK='<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4 7V5a4 4 0 118 0v2h1a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1h1zm2 0h4V5a2 2 0 10-4 0v2z"/></svg>';
  // Subscriber-only detail stays locked: show what the public record supports, then a CTA.
  function lockedCta(id,text) {
    return '<div class="pp-desk-locked" data-desk-locked="'+esc(id)+'">'+LOCK+'<div><p>'+esc(text)+'</p><div class="pp-desk-locked-actions">'+
      '<a class="pp-desk-btn pp-desk-btn-primary" href="'+SIGNUP+'" data-analytics-event="signup_click" data-cta-id="analyzer-'+esc(id)+'-locked" data-cta-surface="analyzer_result" data-cta-destination="signup">Start your 7-day free trial</a>'+
      '<a class="pp-desk-btn pp-desk-btn-ghost" href="/pricing/" data-analytics-event="signup_click" data-cta-id="analyzer-'+esc(id)+'-pricing" data-cta-surface="analyzer_result" data-cta-destination="pricing">See plans</a></div></div></div>';
  }
  function signalTeaserHtml(m) {
    var c=m.summary,side=moreLess(m.prop.direction),other=side==='More'?'Less':'More',rows=[];
    if(c.agree)rows.push([c.agree,side,'is-'+(side==='More'?'more':'less')]);
    if(c.against)rows.push([c.against,other,'is-'+(other==='More'?'more':'less')]);
    if(c.neutral)rows.push([c.neutral,null,'is-neutral']);
    var bars=c.total?'<ul class="pp-desk-signal-split" aria-label="How the '+c.total+' signals split">'+rows.map(function(r){return '<li><span>'+r[0]+(r[1]?(r[0]===1?' leans ':' lean ')+esc(r[1]):' neutral')+'</span><span class="pp-desk-track" aria-hidden="true"><i class="'+r[2]+'" style="--start:0%;--width:'+Math.round(r[0]/c.total*100)+'%"></i></span></li>';}).join('')+'</ul>':'';
    var text=m.claimable?'Open the complete analysis above to see each signal’s score and the reasons behind it.':'Each signal’s score and the reasons behind it are part of the full analysis for members.';
    return bars+lockedCta('signals',text);
  }
  function aiLockedHtml(m) {
    return '<div class="pp-desk-ai-locked" aria-label="AI breakdown"><span class="pp-desk-ai-tag">'+SPARK+'AI breakdown · members</span>'+
      '<h4>Get the written breakdown of this '+esc(moreLess(m.prop.direction))+' '+esc(m.prop.line)+' '+esc(label(m.prop.stat))+' pick.</h4>'+
      '<p>The AI write-up explains what supports the lean, how the player’s latest games stack up against the line, and what to recheck before game time.</p>'+
      lockedCta('brief',m.claimable?'Open the complete analysis above to unlock the AI breakdown. Members get more every day.':'Written AI breakdowns are part of the Propeller workspace. Start your 7-day free trial, or see what each plan includes.')+'</div>';
  }
  function lockedHistoryHtml(m) {
    var h=m.publicHistory,stat=label(m.prop.stat),line=m.prop.line,side=moreLess(m.prop.direction);
    var head='<section class="pp-desk-history" id="pp-desk-history" aria-label="Player history"><h3>Player history</h3>';
    if(h&&h.status==='loading')return head+'<p class="pp-desk-limit" role="status">Loading recent games…</p></section>';
    if(!h||h.status!=='ok')return head+'<div class="pp-desk-empty"><h4>History is restricted in this preview.</h4><p>Game records are restricted in this public preview. This does not mean the player has no history.</p></div>'+lockedCta('history','Dated game logs with opponents and venue splits are part of the full analysis.')+'</section>';
    var rate=Math.round(h.hits/h.games*100),top=Math.max(1,line,Math.max.apply(null,h.values))*1.15;
    var bars=h.values.map(function(v,i){var hit=m.prop.direction==='OVER'?v>line:v<line,push=v===line;return '<li class="'+(push?'is-push':hit?'is-hit':'is-miss')+'" style="--h:'+Math.round(v/top*100)+'%"><span class="pp-desk-bar-value">'+esc(v)+'</span><span class="pp-desk-sr">Game '+(i+1)+' of '+h.games+': '+esc(v)+(push?' (at the line)':hit?' (hit)':' (miss)')+'</span></li>';}).join('');
    return head+'<p class="pp-desk-kicker">Last '+h.games+' games vs '+esc(line)+'</p>'+
      '<div class="pp-desk-stats pp-desk-history-stats"><div><strong>'+h.hits+' / '+h.games+'</strong><span>'+esc(side)+' than '+esc(line)+' ('+rate+'%)</span></div><div><strong>'+esc(h.average)+'</strong><span>average '+esc(stat)+'</span></div><div><strong>'+h.over+' · '+h.under+(h.push?' · '+h.push:'')+'</strong><span>over · under'+(h.push?' · at line':'')+'</span></div></div>'+
      '<div class="pp-desk-bars" role="img" aria-label="'+esc(stat+', last '+h.games+' games oldest to newest: '+h.values.join(', ')+'. Line '+line+'.')+'"><div class="pp-desk-bars-plot"><span class="pp-desk-bars-line" style="--h:'+Math.round(line/top*100)+'%"><em>'+esc(line)+'</em></span><ol>'+bars+'</ol></div></div>'+
      '<p class="pp-desk-limit">Oldest to newest. Box-score values from recent games with a recorded '+esc(stat)+'; the line is today’s reference, not the line offered in those games. Past results do not predict future ones.</p>'+
      lockedCta('history','Dates, opponents, minutes and home/away splits are part of the full analysis.')+'</section>';
  }

  function signalsHtml(m) {
    var rows=m.signals.map(function(s){var start=Math.min(50,s.score),width=Math.abs(s.score-50),side=s.direction==='OVER'?' is-more':s.direction==='UNDER'?' is-less':'';return '<details class="pp-desk-signal"><summary><span class="pp-desk-signal-name">'+esc(s.name)+'<small>See why ↗</small></span><span class="pp-desk-track" aria-hidden="true"><i class="'+(s.score===50?'neutral-marker':side.trim())+'" style="--start:'+start+'%;--width:'+width+'%"></i></span><span class="pp-desk-signal-value'+side+'"><strong>'+s.score+'</strong> '+esc(moreLess(s.direction).toUpperCase())+'</span></summary><div><p>Recorded directional score: '+s.score+' / 100. Analysis recorded '+esc(when(m.prop.analyzedAt))+'.</p>'+(s.reasons&&s.reasons.length?'<p><strong>Recorded explanation</strong> · '+esc(when(m.prop.analyzedAt))+'</p><ul>'+s.reasons.map(function(r){return '<li>'+esc(r)+'</li>';}).join('')+'</ul>'+(s.omitted>0?'<p>'+esc(s.omitted)+' additional recorded explanation(s) omitted from this response.</p>':''):'<p>The response does not supply this signal’s underlying reasons or supporting measurements.</p>')+'<p>'+(s.direction==='NEUTRAL'?'A neutral score does not confirm health or workload.':'This signal supports a direction; it does not establish a cause or a probability.')+'</p></div></details>';}).join('');
    return '<section class="pp-desk-signals" id="pp-desk-signals" aria-label="Signals the answer used"><h3>Signals it used</h3>'+(rows?'<div class="pp-desk-signal-scale" aria-hidden="true"><span>0 · LESS</span><span>50</span><span>MORE · 100</span></div>':'')+ (rows||(m.full?'<div class="pp-desk-empty"><p>No individual signal scores are available in this public read.</p></div>':signalTeaserHtml(m)))+'<p class="pp-desk-limit">'+(m.full?'':'Individual signals are unavailable for this summary-only record.')+' Scores are not win probabilities.</p></section>';
  }

  // The visitor's question, as the chat opens with it.
  function askHtml(m) {
    return '<div class="pp-desk-ask"><span class="pp-desk-sr">You asked: </span>Is '+esc(m.player)+' More or Less than <span class="pp-desk-num">'+esc(m.prop.line)+'</span> '+esc(label(m.prop.stat))+'?</div>';
  }

  // Only what this record actually returned; nothing is claimed that was not looked up.
  function lookedUpHtml(m) {
    var items=[];
    if(m.full&&m.logs.length)items.push(m.logs.length+' recent game'+(m.logs.length===1?'':'s'));
    var signalCount=m.signals.length||m.summary.total;
    if(signalCount)items.push(signalCount+' research signal'+(signalCount===1?'':'s'));
    var platforms=[];
    m.offers.forEach(function(o){var name=String(o.platform||'').trim();if(name&&platforms.indexOf(name.toLowerCase())===-1)platforms.push(name.toLowerCase());});
    if(platforms.length)items.push('Lines on '+platforms.length+' app'+(platforms.length===1?'':'s'));
    if(when(m.prop.analyzedAt)!=='Not supplied')items.push('Research from '+when(m.prop.analyzedAt));
    if(!items.length)return '';
    return '<div class="pp-desk-lookedup" aria-label="What Propeller looked up"><span class="pp-desk-kicker">Propeller looked up</span><ul>'+items.map(function(item){return '<li>'+esc(item)+'</li>';}).join('')+'</ul></div>';
  }

  function leanHtml(m) {
    var p=m.prop;
    return '<div class="pp-desk-lean"><div><span class="pp-desk-lean-k">Leans</span><span class="pp-desk-lean-dir"><em>'+esc(moreLess(p.direction))+'</em> than <span class="pp-desk-num">'+esc(p.line)+'</span> '+esc(label(p.stat))+'</span></div><div class="pp-desk-lean-score"><strong class="pp-desk-num">'+(p.confidence===null?'—':p.confidence)+'</strong><span>Confidence,<br>not a win chance</span></div></div>';
  }

  function followupQuestions(m) {
    return ['What could change this read before game time?','How does '+m.player+' do at home versus on the road?',m.choices.length>1?'Is another '+m.player+' line a better look?':'How does this line compare with the rest of the slate?'];
  }

  // Follow-ups are a member feature (asked through the member's own AI app), so the
  // buttons open the signup panel with the chosen question instead of answering here.
  function followupHtml(m,followup) {
    var questions=followupQuestions(m),chosen=Number.isInteger(followup)&&questions[followup]?questions[followup]:followup==='custom'?'custom':'';
    var list=questions.map(function(q,i){return '<button type="button" class="pp-desk-fu" data-desk-followup="'+i+'" aria-pressed="'+(followup===i)+'" aria-controls="pp-desk-composer"><span>'+esc(q)+'</span>'+LOCK+'</button>';}).join('');
    return '<section class="pp-desk-followups" aria-labelledby="pp-desk-followups-title"><h3 id="pp-desk-followups-title">Ask a follow-up</h3><div class="pp-desk-fu-list">'+list+'</div></section>'+
      '<section class="pp-desk-composer" id="pp-desk-composer" aria-label="Keep asking">'+
      '<button type="button" class="pp-desk-fake-input" data-desk-followup="custom" aria-controls="pp-desk-composer"><span>'+esc(chosen&&chosen!=='custom'?chosen:'Ask anything about '+m.player+'…')+'</span><i aria-hidden="true">↑</i></button>'+
      (chosen?'<p class="pp-desk-gate-note" role="status">'+LOCK+'Follow-up questions are for members. Start your 7-day free trial to keep going.</p>':'')+
      '<h3>Keep the conversation going.</h3><p>Members ask follow-ups about any player and any line by connecting Propeller to the AI app they already use.</p>'+
      '<a class="pp-desk-btn pp-desk-btn-primary" href="https://app.propellerpicks.com/signup" data-analytics-event="signup_click" data-cta-id="analyzer-desk-signup" data-cta-surface="analyzer_result" data-cta-destination="signup">Start your 7-day free trial</a>'+
      '<div class="pp-desk-mcp"><p>Already use an AI app? Connect Propeller once and ask right where you chat.</p><a class="pp-desk-btn pp-desk-btn-ghost" href="/mcp/" data-analytics-event="research_cta_click" data-cta-id="analyzer-desk-mcp" data-cta-surface="analyzer_result" data-cta-destination="mcp">Connect your AI app</a></div>'+
      '<p class="pp-desk-price">7 days free, then $15/mo. Card required. Cancel anytime before day 7 and you won\'t be charged. AI app access is included.</p></section>';
  }

  function evidenceLink(id) {
    var refs={selection:['pp-desk-source','Selected prop + signals'],signals:['pp-desk-signals','Recorded signals'],history:['pp-desk-history','Dated player logs'],derived_history:['pp-desk-history','History calculations'],availability:['pp-desk-context','Player status'],provenance:['pp-desk-context','Source + timestamps']};
    var ref=refs[id];
    return ref?'<a href="#'+ref[0]+'" data-desk-evidence="'+id+'">'+ref[1]+'</a>':'';
  }

  function pulseHtml(m) {
    var items=[];
    var side=moreLess(m.prop.direction),other=side==='More'?'Less':side==='Less'?'More':'the other way';
    if(m.summary.agree!==null)items.push(m.summary.agree+(m.summary.agree===1?' leans ':' lean ')+side);
    if(m.summary.against>0)items.push(m.summary.against+(m.summary.against===1?' leans ':' lean ')+other);
    if(m.summary.neutral)items.push(m.summary.neutral+' neutral');
    return '<div class="pp-desk-pulse" aria-label="How the signals split">'+items.map(function(item){return '<span>'+esc(item)+'</span>';}).join('')+'<span class="pp-desk-pulse-caution">Check the lineup before game time</span></div>';
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
      // The whole first answer stays open: it is the free part of the conversation.
      return '<section class="pp-desk-brief pp-desk-bubble" aria-label="AI breakdown"><div class="pp-desk-brief-byline"><span class="pp-desk-ai-tag">'+SPARK+'AI generated'+(p.reviewed?' · reviewed':'')+'</span><span>From Propeller\'s own data</span></div>'+leanHtml(m)+'<h3>'+esc(b.headline)+'</h3><p class="pp-desk-takeaway">'+esc(b.takeaway)+'</p>'+pulseHtml(m)+'<div class="pp-desk-answer-body">'+numberedSection(1,b.signal_read)+numberedSection(2,b.statistical_context)+numberedSection(3,b.market_read)+numberedSection(4,b.decision)+'</div>'+(Array.isArray(b.recheck)&&b.recheck.length?'<div class="pp-desk-recheck"><h4>Before you decide</h4><ol>'+b.recheck.map(function(item){return '<li>'+esc(item)+'</li>';}).join('')+'</ol></div>':'')+'<p class="pp-desk-attribution">Written by AI from this prop\'s data · '+esc(when(p.generated_at))+(p.replayed?' · Saved example':'')+'. Research only. The score is model confidence, not a win chance, and lines are not live-checked.</p></section>';
    }
    if(requestState==='loading')return '<section class="pp-desk-typing pp-desk-bubble" aria-label="AI breakdown" aria-busy="true"><span class="pp-desk-ai-tag">'+SPARK+'AI generated</span><p role="status"><span class="pp-desk-dots" aria-hidden="true"><i></i><i></i><i></i></span>Writing your AI breakdown…</p><p class="pp-desk-limit">Reading this prop\'s signals, recent games and lines. This can take up to a minute.</p></section>';
    var count=m.summary,p=m.prop;
    var copy=m.player+'’s stored '+label(p.stat)+' analysis leans '+moreLess(p.direction)+' than '+p.line+'. ';
    copy+=(count.agree!==null&&count.total!==null?count.agree+' of '+count.total+' signals support the lean. ':'')+'Verify the current role and exact quote.';
    var history=!m.full?'Detailed game history is restricted in this public preview. This view does not establish whether current-season records exist.':m.logs.length?m.logs.length+' returned appearances span '+m.logs[0].date+' to '+m.logs[m.logs.length-1].date+'. They are descriptive game records, not historical offered lines or a forecast. Inspect the dated workload below.':'No dated game history is available for this stat in this public response. Missing history does not mean the player did not play.';
    var support=m.signals.length?'The returned signals include '+m.signals.map(function(signal){return signal.name+' '+signal.score+' '+moreLess(signal.direction);}).join(', ')+'. These are components of one model record, not independent votes. Only recorded explanations are shown; missing reasons and weights remain unknown.':'Only summary counts are available for this record. Individual scores and underlying reasons are not supplied.';
    var message='';
    if(requestState==='allowance_exhausted')message='<p role="status">You\'ve used your free AI breakdown. <a href="https://app.propellerpicks.com/signup">Start your 7-day free trial to get more.</a></p>';
    else if(requestState==='selection_unavailable'||requestState==='selection_changed')message='<p role="status">This research snapshot has changed. Search the player again to choose a current line.</p>';
    else if(requestState==='account_allowance_unavailable')message='<p role="status">AI breakdowns aren\'t included with your account yet. The data summary above is still here.</p>';
    else if(requestState==='session_unavailable')message='<p role="status">We could not verify your account. <a href="https://app.propellerpicks.com/login">Sign in again</a> to continue.</p>';
    else if(['unavailable','budget_exhausted','budget_unavailable'].indexOf(requestState)!==-1)message='<p role="status">The AI breakdown isn\'t available right now. The data summary above is still here.</p>';
    else if(requestState && requestState!=='loading')message='<p role="status">The AI breakdown couldn\'t finish. The data summary above is still here.</p>';
    return '<section class="pp-desk-brief pp-desk-bubble" aria-label="Data summary"><div class="pp-desk-brief-byline"><span class="pp-desk-ai-tag is-data">Data summary</span><span>Straight from our stored data</span></div>'+leanHtml(m)+'<h3>The stored research leans '+esc(moreLess(p.direction))+'.'+(count.against>0?' There is evidence on both sides.':'')+'</h3><p class="pp-desk-takeaway">'+esc(copy)+'</p>'+pulseHtml(m)+'<details class="pp-desk-deep"><summary>Read the analysis <span aria-hidden="true">+</span></summary>'+numberedSection(1,{title:'What supports the lean',text:support,evidence_ids:['selection','signals']})+numberedSection(2,{title:'Put the history in context',text:history,evidence_ids:['history']})+numberedSection(3,{title:'Verify the exact offer',text:'Check the platform, line, period and variant together. Reading the stored record does not verify current availability or price. The recorded offers below may have different terms.',evidence_ids:['provenance']})+numberedSection(4,{title:'What still needs checking',text:'Verify current playing status, expected workload, current-season evidence and an exact quote. Missing price or payout and calibrated probability prevent a fair-odds or expected-value conclusion.',evidence_ids:['availability','history']})+'</details><p class="pp-desk-limit">Straight from our stored data, not written by AI.'+(canRequest?' The AI breakdown is written by AI from this same data, like the answers members get when they connect their AI assistant to Propeller.':'')+'</p>'+(canRequest&&!requestState?'<button type="button" data-desk-generate>Get AI breakdown</button>':'')+message+(m.full?'':aiLockedHtml(m))+'</section>';
  }

  function historyHtml(m,sample,venue,selectedDate) {
    if(!m.full)return lockedHistoryHtml(m);
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
    var signalRows=m.signals.map(function(signal){return '<tr><th scope="row">'+esc(signal.name)+'</th><td class="pp-desk-num">'+signal.score+'</td><td>'+esc(moreLess(signal.direction))+'</td><td>'+esc(signal.reasons&&signal.reasons.length?'Recorded explanations available':'Not recorded in this response')+'</td></tr>';}).join('');
    var links=m.sources.map(function(source){return '<a href="'+esc(source.href)+'" target="_blank" rel="noopener">'+esc(source.label)+' ↗</a>';}).join(' · ');
    return '<details class="pp-desk-source" id="pp-desk-source" data-desk-source><summary>The data behind this answer</summary><p>Selected record: '+esc(m.player+' · '+m.prop.stat+' · '+m.prop.direction+' '+m.prop.line)+'. Platform '+esc(m.prop.platform||'not supplied')+'; period '+esc(m.prop.period||'not supplied')+'; variant '+esc(m.prop.variant||'not supplied')+'.</p><dl class="pp-desk-provenance">'+field('Source analysis ID',m.full?(m.sourceId||'Not supplied'):'Summary-only')+field('Analysis recorded',when(m.prop.analyzedAt))+field('Data read',when(m.checkedAt))+'</dl>'+(signalRows?'<div class="pp-desk-table-scroll"><table><caption>Recorded signals for the selected prop · midpoint 50</caption><thead><tr><th scope="col">Signal</th><th scope="col">Score</th><th scope="col">Direction</th><th scope="col">Reasons</th></tr></thead><tbody>'+signalRows+'</tbody></table></div>':'<p>Individual signal evidence is unavailable for this summary-only record.</p>')+(links?'<p class="pp-desk-source-links">'+links+'</p>':'')+'</details><details class="pp-desk-source" id="pp-desk-context" data-desk-context><summary>Freshness, scope, and missing inputs</summary><p>Analysis recorded '+esc(when(m.prop.analyzedAt))+'. Data read '+esc(when(m.checkedAt))+'. A later read does not refresh scoring or verify a live quote.</p><p>'+esc(m.logs.length?m.logs.length+' dated appearances were returned, from '+m.logs[0].date+' to '+m.logs[m.logs.length-1].date+'.':'No dated appearances were returned.')+(m.logsTruncated?' Additional history may exist beyond this bounded read.':'')+' These records are not historical sportsbook offers.</p><p>Current player status, expected workload, a calibrated outcome probability, model weights, and verified live price or payout are not supplied. Neutral signals do not confirm health or a stable role. Available recorded explanations describe their analysis snapshot.</p><p>The analyst brief and confidence describe this selected record; historical filters and offer comparisons do not rescore it.</p></details>';
  }

  function render(m,index,sample,venue,answer,generated,requestState,canRequest,selectedDate,followup) {
    var initials=m.player.split(/\s+/).slice(0,2).map(function(name){return name.charAt(0);}).join('');
    var matchup=m.prop.away&&m.prop.home?m.prop.away+' at '+m.prop.home:'Not supplied';
    var options=m.choices.map(function(choice){return '<option value="'+choice.index+'"'+(choice.index===index?' selected':'')+'>'+esc(choice.text)+'</option>';}).join('');
    // Ask Propeller: the page reads as one chat. The question, what was looked up,
    // the full first answer, then follow-ups that open the signup panel.
    return '<article class="pp-desk pp-desk-chat" aria-label="Ask Propeller about this player">'+(m.fixture?'<p class="pp-desk-fixture">Layout test data · example records, not current research</p>':'')+
      '<div class="pp-desk-profile"><div class="pp-desk-avatar" aria-hidden="true">'+esc(initials)+'</div><div><span class="pp-desk-kicker">'+esc(m.sport)+' · Ask Propeller</span><h2>'+esc(m.player)+'</h2><p>'+esc([m.team,m.position].filter(Boolean).join(' · '))+'<span class="pp-desk-profile-game">'+esc((m.prop.away&&m.prop.home?matchup+' · ':'')+(when(m.prop.eventStart)!=='Not supplied'?when(m.prop.eventStart):''))+'</span></p></div><dl>'+field('Matchup',matchup)+field('Game time',when(m.prop.eventStart))+field('App / period',(m.prop.platform||'Not supplied')+' / '+(m.prop.period||'Not supplied'))+'</dl></div>'+
      '<div class="pp-desk-selector"><label for="desk-prop-select">Ask about another line</label><select id="desk-prop-select" data-desk-select>'+options+'</select></div>'+
      '<div class="pp-desk-thread">'+askHtml(m)+lookedUpHtml(m)+'<div data-desk-claim-anchor></div></div>'+
      '<div class="pp-desk-grid">'+briefHtml(m,generated,requestState,canRequest)+signalsHtml(m)+'</div>'+
      followupHtml(m,followup)+
      '<div class="pp-desk-evidence-grid">'+historyHtml(m,sample,venue,selectedDate)+'</div>'+
      sourcesHtml(m)+'<p class="pp-desk-footnote">Research only. Confidence is not win probability or betting edge. Stored data may be incomplete or stale. Past performance does not guarantee future results.</p></article>';
  }

  function mountResearchChat(container,opts) {
    opts=opts||{};
    var lookup=opts.lookup,index=Number.isInteger(opts.propIndex)?opts.propIndex:0;
    var sample='all',venue='all',selectedDate='',followup=null;
    var claimState=lookup.claim_status||'';
    var destroyed=false,generated=null,requestState='',generation=0,resetDisclosures=false;
    function draw(focus) {
      if(destroyed)return;
      var scrollY=typeof window.scrollY==='number'?window.scrollY:null;
      var previousChart=container.querySelector('.pp-desk-chart-scroll');
      var chartLeft=previousChart?previousChart.scrollLeft:null;
      var selectors=['.pp-desk-deep','[data-desk-source]','[data-desk-context]','[data-desk-history-source]'];
      for(var i=1;i<=12;i++)selectors.push('.pp-desk-signal:nth-of-type('+i+')');
      var opened=resetDisclosures?[]:selectors.filter(function(selector){var node=container.querySelector(selector);return node && node.open;});
      resetDisclosures=false;
      var m=buildModel(lookup,index,Object.assign({},opts,{claimable:typeof opts.requestClaim==='function'&&['allowance_exhausted','session_unavailable'].indexOf(claimState)===-1}));
      if(m) {
        index=m.index;
        if(!generated && matchingBrief(opts.savedBrief,lookup.props[index]))generated=opts.savedBrief;
      }
      container.innerHTML=m?render(m,index,sample,venue,'',generated,requestState,!!(m.enriched && typeof opts.requestBrief==='function'),selectedDate,followup):'';
      if (m && !m.full && typeof opts.requestClaim==='function') {
        var result=container.querySelector('[data-desk-claim-anchor]');
        var access=window.ppAnalyzerAccess;
        if(result)result.insertAdjacentHTML('afterend','<div class="pp-desk-claim" aria-live="polite">'+(claimState && claimState!=='loading'?'<p>'+esc(access?access.message(claimState):'Complete analysis is unavailable.')+'</p>':'')+(claimState==='allowance_exhausted'||claimState==='session_unavailable'?'<a href="https://app.propellerpicks.com/login">Sign in</a> · <a href="https://app.propellerpicks.com/signup">Start your 7-day free trial</a>':'<button type="button" data-desk-claim'+(claimState==='loading'?' disabled':'')+'>'+(claimState==='loading'?'Opening analysis…':'Open complete analysis')+'</button>')+'</div>');
      }
      opened.forEach(function(selector){var node=container.querySelector(selector);if(node)node.open=true;});
      var chart=container.querySelector('.pp-desk-chart-scroll');
      if(chart){
        var selectedPoint=chart.querySelector('[data-desk-selected-game]');
        if(selectedPoint && (chartLeft===null || focus && /data-desk-(history-game|sample|venue|select)/.test(focus))){
          chart.scrollLeft=selectedPoint.getBoundingClientRect().left-chart.getBoundingClientRect().left-chart.clientWidth/2;
        }else if(chartLeft!==null)chart.scrollLeft=chartLeft;
      }
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
    function requestGeneration() {
        var selected=lookup.props[index];
        if(requestState==='loading'||!boundAnalysis(selected)||typeof opts.requestBrief!=='function')return;
        var requestId=++generation,selectedIndex=index;
        requestState='loading';draw();
        Promise.resolve().then(function(){return opts.requestBrief(selected);}).then(function(result){
          if(destroyed||requestId!==generation||index!==selectedIndex)return;
          if(result && result.status!=='ok'){requestState=['allowance_exhausted','account_allowance_unavailable','unavailable','budget_exhausted','budget_unavailable','already_attempted','generation_unavailable'].indexOf(result.status)!==-1?result.status:'error';draw();return;}
          if(!matchingBrief(result,selected))throw new Error('Mismatched provenance');
          generated=result;requestState='';draw();
        }).catch(function(){if(!destroyed&&requestId===generation&&index===selectedIndex){requestState='error';draw();}});
    }
    // Load the AI breakdown once per selected record without a click. A failed or
    // refused attempt is not retried automatically; the button stays as the fallback.
    var autoTried={};
    function autoGenerate() {
      if(destroyed||!opts.autoBrief||generated||requestState||typeof opts.requestBrief!=='function')return;
      var selected=lookup.props[index];
      if(!boundAnalysis(selected))return;
      var key=index+':'+String(selected.source_analysis_id);
      if(autoTried[key])return;
      autoTried[key]=true;
      requestGeneration();
    }
    function click(event) {
      var target=event.target&&event.target.closest?event.target.closest('button,[data-desk-evidence]'):null;
      if(!target||!container.contains(target))return;
      if(target.hasAttribute('data-desk-evidence')){if(event.preventDefault)event.preventDefault();openEvidence(target.getAttribute('data-desk-evidence'));return;}
      if(target.hasAttribute('data-desk-claim')) {
        if(claimState==='loading'||typeof opts.requestClaim!=='function')return;
        var claimGeneration=++generation,claimIndex=index;
        claimState='loading';draw();
        Promise.resolve().then(function(){return opts.requestClaim(lookup.props[claimIndex]);}).then(function(result){
          if(destroyed||generation!==claimGeneration||index!==claimIndex)return;
          var merged=window.ppAnalyzerAccess && window.ppAnalyzerAccess.mergeClaim(lookup,claimIndex,result);
          if(merged){lookup=merged;claimState='';}else claimState=result&&result.status==='ok'?'selection_unavailable':result&&result.status||'unavailable';
          draw();
          if(merged)autoGenerate();
        }).catch(function(){if(!destroyed&&generation===claimGeneration&&index===claimIndex){claimState='unavailable';draw();}});
        return;
      }
      if(target.hasAttribute('data-desk-generate')) {
        requestGeneration();
        return;
      }      if(target.hasAttribute('data-desk-reset')){sample='all';venue='all';selectedDate='';draw('[data-desk-sample="all"]');return;}
      var key=target.getAttribute('data-desk-sample'),where=target.getAttribute('data-desk-venue');
      var game=target.getAttribute('data-desk-game'),ask=target.getAttribute('data-desk-followup');
      if(key!==null){sample=key;selectedDate='';draw('[data-desk-sample="'+key+'"]');}
      else if(where!==null){venue=where;selectedDate='';draw('[data-desk-venue="'+where+'"]');}
      else if(game!==null && dateOnly(game)){selectedDate=game;draw('[data-desk-game="'+game+'"]');}
      else if(ask!==null){
        followup=ask==='custom'?'custom':Number(ask);
        if(followup!=='custom'&&!Number.isInteger(followup))followup=null;
        draw('#pp-desk-composer .pp-desk-btn-primary');
        var composer=container.querySelector('#pp-desk-composer');
        if(composer&&composer.scrollIntoView)composer.scrollIntoView({behavior:'auto',block:'center'});
      }
    }
    function change(event) {
      if(event.target.matches('[data-desk-history-game]')){
        if(dateOnly(event.target.value)){selectedDate=event.target.value;draw('[data-desk-history-game]');}
        return;
      }
      if(!event.target.matches('[data-desk-select]'))return;
      var next=Number(event.target.value);
      if(!Number.isInteger(next)||!validProp((lookup.props||[])[next]))return;
      generation++;generated=null;requestState='';claimState='';index=next;sample='all';venue='all';selectedDate='';followup=null;resetDisclosures=true;
      draw('[data-desk-select]');
      if(typeof opts.onPropChange==='function')opts.onPropChange(lookup.props[index],index);
      autoGenerate();
    }
    container.addEventListener('click',click);container.addEventListener('change',change);draw();autoGenerate();
    return {setPublicHistory:function(h){if(destroyed)return;opts.publicHistory=h;draw();},getSelectedProp:function(){return (lookup.props||[])[index];},destroy:function(){destroyed=true;generation++;container.removeEventListener('click',click);container.removeEventListener('change',change);container.innerHTML='';}};
  }

  window.ppAnalyzerDesk={lockedHistoryHtml:lockedHistoryHtml,publicHistoryModel:publicHistoryModel,lineNotice:lineNotice,buildModel:buildModel,filteredHistory:filteredHistory,render:render,mountResearchChat:mountResearchChat};
})(window);
