var RPG_STORE=(function(){
  var PREFIX='RPG_DEMO_STATE_V1:';
  // The direct hub demo starts with an isolated, temporary save. An ongoing
  // expedition in the normal demo must never be replaced by preview actions.
  var hubPreview=new URLSearchParams(location.search).get('demo')==='hub';
  var explorationDemo=new URLSearchParams(location.search).get('demo')==='exploration';
  var demoPrefix='rpg.exploration.demo:';
  if(explorationDemo&&new URLSearchParams(location.search).get('fresh')==='1'){
    try{['rpg.exploration.save1','rpg.exploreBattle'].forEach(function(k){localStorage.removeItem(demoPrefix+k)})}catch(e){}
  }
  var previewStore=hubPreview?new Map():null;
  function named(){
    try{
      if(!window.name||window.name.indexOf(PREFIX)!==0)return {};
      var v=JSON.parse(window.name.slice(PREFIX.length));
      return v&&typeof v==='object'?v:{};
    }catch(e){return {}}
  }
  function saveNamed(v){try{window.name=PREFIX+JSON.stringify(v)}catch(e){}}
  function storageKey(k){return explorationDemo?demoPrefix+k:k}
  function localGet(k){try{return window.localStorage.getItem(storageKey(k))}catch(e){return null}}
  function localSet(k,v){try{window.localStorage.setItem(storageKey(k),v)}catch(e){}}
  function localRemove(k){try{window.localStorage.removeItem(storageKey(k))}catch(e){}}
  return {
    isHubPreview:hubPreview,
    isExplorationDemo:explorationDemo,
    getItem:function(k){
      if(hubPreview)return previewStore.has(k)?previewStore.get(k):null;
      if(location.protocol==='file:'){
        var n=named();
        if(Object.prototype.hasOwnProperty.call(n,k))return n[k];
        var v=localGet(k);
        if(v!==null){n[k]=v;saveNamed(n)}
        return v;
      }
      return localGet(k);
    },
    setItem:function(k,v){
      if(hubPreview){previewStore.set(k,String(v));return}
      v=String(v);localSet(k,v);
      if(location.protocol==='file:'){var n=named();n[k]=v;saveNamed(n)}
    },
    removeItem:function(k){
      if(hubPreview){previewStore.delete(k);return}
      localRemove(k);
      if(location.protocol==='file:'){var n=named();delete n[k];saveNamed(n)}
    }
  };
})();
var RPG_NAV=(function(){
  function importHash(){
    var m=location.hash.match(/(?:^#|&)rpg=([^&]+)/);
    if(!m)return;
    try{
      var d=JSON.parse(decodeURIComponent(m[1]));
      ['rpg.exploration.save1','rpg.exploreBattle'].forEach(function(k){
        if(typeof d[k]!=='string')return;
        if(k==='rpg.exploration.save1'){
          var local=JSON.parse(RPG_STORE.getItem(k)||'null'),incoming=JSON.parse(d[k]);
          if(local&&local.hub&&incoming.hub&&local.hub.revision>incoming.hub.revision)return;
        }
        RPG_STORE.setItem(k,d[k]);
      });
      if(window.history&&history.replaceState)history.replaceState(null,'',location.pathname+location.search);
    }catch(e){}
  }
  function href(path,keys){
    if(RPG_STORE.isHubPreview)return path;
    var d={};
    (keys||['rpg.exploreBattle','rpg.exploration.save1']).forEach(function(k){
      var v=RPG_STORE.getItem(k);
      if(v!==null)d[k]=v;
    });
    if(RPG_STORE.isExplorationDemo)path+=(path.includes('?')?'&':'?')+'demo=exploration';
    return path+(Object.keys(d).length?'#rpg='+encodeURIComponent(JSON.stringify(d)):'');
  }
  importHash();
  return {href:href};
})();
