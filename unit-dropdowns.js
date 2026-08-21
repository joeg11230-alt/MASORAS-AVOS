(()=>{
  const options=['Case','Lbs','Packs','Piece','Each','Box','Bag','Tray','Dozen','Gallon','Quart','Pint','Bottle','Can','Carton','Roll','Bundle','Other'];
  function replaceWithSelect(id){
    const el=document.getElementById(id);if(!el||el.tagName==='SELECT')return;
    const sel=document.createElement('select');sel.id=id;sel.name=el.name||'';sel.required=el.required;sel.className=el.className||'';
    sel.innerHTML='<option value="">Select unit…</option>'+options.map(x=>`<option value="${x}">${x}</option>`).join('');
    const current=(el.value||'').trim();
    if(current){const match=options.find(x=>x.toLowerCase()===current.toLowerCase());if(match)sel.value=match;else{const opt=document.createElement('option');opt.value=current;opt.textContent=current;sel.appendChild(opt);sel.value=current;}}
    el.replaceWith(sel);
  }
  function apply(){replaceWithSelect('unit');replaceWithSelect('manualUnit');}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(apply,500);setTimeout(apply,1500);
})();