(function (window) {
  'use strict';
  var APP = 'https://app.propellerpicks.com/api/analyzer';
  var PUBLIC = 'https://web-production-3c1c4.up.railway.app/api/social/research';
  var FIELDS = ['event_id','stat_type','line','direction','platform','period','variant'];
  function selection(prop) {
    var result = {};
    FIELDS.forEach(function (key) { result[key] = prop[key] == null ? null : prop[key]; });
    if (result.event_id != null) result.event_id = String(result.event_id);
    return result;
  }
  async function post(sport, operation, body, opts) {
    opts = opts || {};
    if (!((sport === 'nfl' && operation === 'claim') || ((sport === 'nfl' || sport === 'nba') && operation === 'brief'))) return {status:'unavailable'};
    var fetcher = opts.fetch || window.fetch.bind(window);
    var ctl = new AbortController();
    var timer = setTimeout(function () { ctl.abort(); }, operation === 'brief' ? 85000 : 15000);
    var init = {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body), cache:'no-store', redirect:'error', signal:ctl.signal};
    try {
      // Only a definitive no-session response may use the anonymous API. Auth or
      // transport failures must never silently consume the visitor allowance.
      var result = await fetcher(APP + '/' + sport + '/' + operation, Object.assign({},init,{credentials:'include'}));
      var data = await result.json();
      if (result.status === 401 && data && data.status === 'not_authenticated') {
        result = await fetcher(PUBLIC + '/' + sport + '/' + operation, Object.assign({},init,{credentials:'omit'}));
        data = await result.json();
      }
      if (!data || typeof data.status !== 'string') return {status:'unavailable'};
      if (!result.ok && data.status === 'ok') return {status:'unavailable'};
      return data;
    } catch (_) { return {status:'unavailable'}; }
    finally { clearTimeout(timer); }
  }
  function mergeClaim(lookup, index, claim) {
    if (!claim || claim.status !== 'ok' || !/^[a-f0-9]{64}$/.test(claim.claim_id || '') || !Array.isArray(claim.props) || claim.props.length !== 1) return null;
    var original = lookup.props[index], full = claim.props[0];
    var name = function (p) { return String(p.player_name || p.name || '').toLowerCase().replace(/\s+/g,' ').trim(); };
    if (!original || name(lookup.player || {}) !== name(claim.player || {}) || full.detail !== 'full' || !Array.isArray(full.signals)) return null;
    if (FIELDS.some(function (key) { return String(original[key] == null ? '' : original[key]) !== String(full[key] == null ? '' : full[key]); })) return null;
    var props = lookup.props.slice();
    props[index] = Object.assign({},full,{claim_id:claim.claim_id});
    return Object.assign({},lookup,claim,{props:props});
  }
  function message(status) {
    if (status === 'allowance_exhausted') return 'Your analysis allowance is used. Sign in or create a free account to continue.';
    if (status === 'session_unavailable') return 'We could not verify your account. Please sign in again to open the complete analysis.';
    if (status === 'selection_unavailable' || status === 'selection_changed') return 'This research snapshot has changed. Search the player again to choose a current line.';
    return 'Complete analysis is temporarily unavailable. You can still review the public summary.';
  }
  window.ppAnalyzerAccess = {post:post,selection:selection,mergeClaim:mergeClaim,message:message};
})(window);
