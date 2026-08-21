(()=>{
  const units=['Case','Lbs','Packs','Piece','Each','Box','Bag','Tray','9 x 13 Pan','8 x 8 Pan','8 x 10 Pan','10 x 12 Pan','10 x 14 Pan','12 x 18 Pan','Half Steam Table Pan','Full Steam Table Pan','Half Sheet Pan','Full Sheet Pan','Round Aluminum Pan','Loaf Pan','Pie Pan','Dozen','Gallon','Quart','Pint','Bottle','Can','Carton','Roll','Bundle','Other'];
  const storage=['Fridge','Freezer','Basement','Kitchen'];
  const priceOptions=['In House','Free','0.00','0.50','1.00','1.50','2.00','2.50','3.00','4.00','5.00','7.50','10.00','15.00','20.00','25.00','30.00','40.00','50.00','75.00','100.00','Other Amount'];
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  function replaceWithSelect(id,options,placeholder){
    const el=document.getElementById(id);if(!el||el.tagName==='SELECT')return el;
    const sel=document.createElement('select');sel.id=id;sel.name=el.name||'';sel.required=el.required;sel.className=el.className||'';
    sel.innerHTML=`<option value="">${placeholder}</option>`+options.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    const current=(el.value||'').trim();
    if(current){const match=options.find(x=>x.toLowerCase()===current.toLowerCase());if(match)sel.value=match;else{const opt=document.createElement('option');opt.value=current;opt.textContent=current;sel.appendChild(opt);sel.value=current;}}
    el.replaceWith(sel);return sel;
  }
  function applyVendor(){
    const el=document.getElementById('vendor');if(!el||el.tagName==='SELECT')return;
    const current=(el.value||'').trim(),sel=document.createElement('select');sel.id='vendor';sel.required=el.required;
    const names=['In House',...[...new Set((Array.isArray(window.vendors)?window.vendors:[]).map(v=>v.name||v.vendor_name).filter(Boolean))].sort((a,b)=>a.localeCompare(b))];
    sel.innerHTML='<option value="">Select vendor…</option>'+names.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    if(current&&!names.some(x=>x.toLowerCase()===current.toLowerCase())){const o=document.createElement('option');o.value=current;o.textContent=current;sel.appendChild(o);}sel.value=current;el.replaceWith(sel);
  }
  function applyPrice(){
    const el=document.getElementById('price');if(!el||el.dataset.preparedPrice==='1')return;el.dataset.preparedPrice='1';el.style.display='none';
    const sel=document.createElement('select');sel.id='priceChoice';sel.innerHTML='<option value="">Select price…</option>'+priceOptions.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    const custom=document.createElement('input');custom.id='priceCustom';custom.type='number';custom.min='0';custom.step='.01';custom.placeholder='Enter amount';custom.style.display='none';
    el.parentElement.append(sel,custom);
    const sync=()=>{if(sel.value==='Other Amount'){custom.style.display='block';el.value=custom.value||'';}else{custom.style.display='none';el.value=(sel.value==='In House'||sel.value==='Free')?'0':sel.value;}};
    sel.onchange=sync;custom.oninput=sync;
    const observer=new MutationObserver(()=>{const v=String(el.value||'');if(!v)return;if(Number(v)===0){if(!['In House','Free'].includes(sel.value))sel.value='In House';}else if(priceOptions.includes(Number(v).toFixed(2)))sel.value=Number(v).toFixed(2);else{sel.value='Other Amount';custom.value=v;custom.style.display='block';}});observer.observe(el,{attributes:true,attributeFilter:['value']});
  }
  function apply(){replaceWithSelect('unit',units,'Select unit / pan size…');replaceWithSelect('manualUnit',units,'Select unit…');replaceWithSelect('storage',storage,'Select storage location…');applyVendor();applyPrice();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});setTimeout(apply,500);setTimeout(apply,1500);
})();