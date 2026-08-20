(()=>{
  const DAYS=[['mon','Monday'],['tue','Tuesday'],['wed','Wednesday'],['thu','Thursday'],['fri','Friday'],['sat','Saturday'],['sun','Sunday']];

  function hideLegacyField(){
    const old=document.querySelector('#vdays');
    const label=old?.closest('label');
    if(label)label.style.display='none';
  }

  function fmt(t){
    if(!t)return '';
    const [h,m]=t.split(':').map(Number);if(Number.isNaN(h))return t;
    const d=new Date();d.setHours(h,m||0,0,0);
    return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  }

  function summaryText(){
    const parts=[];
    DAYS.forEach(([key,label])=>{
      const on=document.querySelector(`.delivery-day-enabled[data-day="${key}"]`);
      if(!on?.checked)return;
      const s=document.querySelector(`.delivery-start[data-day="${key}"]`)?.value||'';
      const e=document.querySelector(`.delivery-end[data-day="${key}"]`)?.value||'';
      parts.push(`${label}: ${s||e?`${fmt(s)}${s&&e?' – ':''}${fmt(e)}`:'Allowed'}`);
    });
    return parts.length?parts.join(' | '):'No delivery days selected';
  }

  function updateSummary(){const s=document.querySelector('#deliveryScheduleSummary');if(s)s.textContent=summaryText();}
  function setCollapsed(collapsed){
    const body=document.querySelector('#deliveryScheduleBody'),btn=document.querySelector('#deliveryScheduleToggle');
    if(!body||!btn)return;
    body.style.display=collapsed?'none':'';btn.textContent=collapsed?'▸':'▾';btn.setAttribute('aria-expanded',collapsed?'false':'true');
  }

  function ensureScheduleUI(){
    hideLegacyField();
    const form=document.querySelector('#vendorForm');if(!form)return;
    let wrap=document.querySelector('#vendorDeliverySchedule');if(wrap)return;
    wrap=document.createElement('div');wrap.id='vendorDeliverySchedule';wrap.className='full';
    wrap.style.cssText='border:1px solid #d9dee7;border-radius:10px;background:#fbfdff;overflow:hidden';
    wrap.innerHTML=`<button id="deliveryScheduleHeader" type="button" style="width:100%;border:0;border-radius:0;background:#fbfdff;padding:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;text-align:left"><span><span style="font-weight:800">Allowed Delivery Days & Hours</span><span id="deliveryScheduleSummary" class="muted" style="display:block;margin-top:3px">No delivery days selected</span></span><span id="deliveryScheduleToggle" aria-expanded="false" style="font-size:20px;font-weight:800">▸</span></button><div id="deliveryScheduleBody" style="display:none;padding:0 12px 12px"><div class="muted" style="margin-bottom:8px">Select each day and the allowed delivery hours for that day.</div><div id="deliveryScheduleRows" style="display:grid;gap:7px"></div></div>`;
    const actions=form.querySelector('.full.row');form.insertBefore(wrap,actions||null);
    const rows=wrap.querySelector('#deliveryScheduleRows');
    rows.innerHTML=DAYS.map(([key,label])=>`<div style="display:grid;grid-template-columns:120px 1fr 1fr;gap:8px;align-items:center"><label style="display:flex;gap:7px;align-items:center"><input type="checkbox" class="delivery-day-enabled" data-day="${key}" style="width:auto"> ${label}</label><input type="time" class="delivery-start" data-day="${key}" disabled><input type="time" class="delivery-end" data-day="${key}" disabled></div>`).join('');
    wrap.querySelector('#deliveryScheduleHeader').onclick=()=>setCollapsed(wrap.querySelector('#deliveryScheduleBody').style.display!=='none');
    rows.querySelectorAll('.delivery-day-enabled').forEach(c=>c.onchange=()=>{const day=c.dataset.day;rows.querySelector(`.delivery-start[data-day="${day}"]`).disabled=!c.checked;rows.querySelector(`.delivery-end[data-day="${day}"]`).disabled=!c.checked;updateSummary();});
    rows.querySelectorAll('.delivery-start,.delivery-end').forEach(i=>i.onchange=updateSummary);
  }

  function applySchedule(schedule){
    ensureScheduleUI();
    schedule=schedule&&typeof schedule==='object'?schedule:{};
    DAYS.forEach(([key])=>{
      const row=schedule[key]||{};
      const enabled=document.querySelector(`.delivery-day-enabled[data-day="${key}"]`);
      const start=document.querySelector(`.delivery-start[data-day="${key}"]`);
      const end=document.querySelector(`.delivery-end[data-day="${key}"]`);
      if(!enabled||!start||!end)return;
      enabled.checked=!!row.enabled;
      start.disabled=!enabled.checked;end.disabled=!enabled.checked;
      start.value=row.start||'';end.value=row.end||'';
    });
    updateSummary();setCollapsed(true);
  }

  async function fillScheduleForId(id){
    ensureScheduleUI();hideLegacyField();
    id=Number(id||document.querySelector('#vid')?.value||0);
    if(!id){applySchedule({});return;}
    try{
      const r=await db.from('vendors').select('delivery_schedule').eq('id',id).maybeSingle();
      if(r.error)throw r.error;
      applySchedule(r.data?.delivery_schedule||{});
    }catch(e){console.error('Could not load delivery schedule',e);}
  }

  function clearSchedule(){applySchedule({});}

  function deliverySummaryFromObject(schedule){
    const s=schedule&&typeof schedule==='object'?schedule:{};
    return DAYS.filter(([key])=>s[key]?.enabled).map(([key,label])=>`${label}: ${s[key]?.start||s[key]?.end?`${fmt(s[key]?.start||'')}${s[key]?.start&&s[key]?.end?' – ':''}${fmt(s[key]?.end||'')}`:'Allowed'}`).join('<br>');
  }

  function removeLegacyDeliveryText(card,v){
    const legacy=String(v?.delivery_days||'').trim();
    if(!legacy)return;
    [...card.children].forEach(el=>{
      if(el.matches('h3,.actions,.vendor-delivery-summary,.vendor-status-badge'))return;
      if((el.textContent||'').trim()===legacy)el.remove();
    });
    [...card.childNodes].forEach(node=>{
      if(node.nodeType===Node.TEXT_NODE && (node.textContent||'').trim()===legacy)node.remove();
    });
  }

  const oldRender=window.renderVendors;
  if(typeof oldRender==='function'){
    window.renderVendors=function(){
      oldRender();
      document.querySelectorAll('#vgrid .card[data-vid]').forEach(card=>{
        const v=typeof vendorById==='function'?vendorById(Number(card.dataset.vid)):null;
        if(!v)return;
        removeLegacyDeliveryText(card,v);
        let box=card.querySelector('.vendor-delivery-summary');
        const html=deliverySummaryFromObject(v.delivery_schedule);
        if(!html){box?.remove();return;}
        if(!box){box=document.createElement('div');box.className='vendor-delivery-summary muted';box.style.cssText='margin-top:8px;font-size:12px;line-height:1.45';card.appendChild(box);}
        box.innerHTML='<b>Delivery:</b><br>'+html;
      });
    };
  }

  // Always reload the saved schedule whenever a vendor is opened, regardless of which button/link opened it.
  const originalOpenVendor=window.openVendor;
  if(typeof originalOpenVendor==='function'){
    window.openVendor=function(id){
      const result=originalOpenVendor.apply(this,arguments);
      setTimeout(()=>fillScheduleForId(id),80);
      return result;
    };
  }

  function cleanVisibleCards(){
    document.querySelectorAll('#vgrid .card[data-vid]').forEach(card=>{
      const v=typeof vendorById==='function'?vendorById(Number(card.dataset.vid)):null;
      if(v)removeLegacyDeliveryText(card,v);
    });
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('#addVendor'))setTimeout(()=>{ensureScheduleUI();hideLegacyField();clearSchedule()},80);
    if(e.target.closest('.vendor-link,.open-vendor')){
      const card=e.target.closest('[data-vid]');
      const id=Number(card?.dataset.vid||0);
      if(id)setTimeout(()=>fillScheduleForId(id),100);
    }
    if(e.target.closest('[data-tab="vendors"]'))setTimeout(cleanVisibleCards,120);
  });
  setTimeout(()=>{ensureScheduleUI();hideLegacyField();cleanVisibleCards()},700);
  setTimeout(()=>{ensureScheduleUI();hideLegacyField();cleanVisibleCards()},1600);
})();