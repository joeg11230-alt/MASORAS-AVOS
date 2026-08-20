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
      parts.push(`${label}${s||e?` ${fmt(s)}${s&&e?'–':''}${fmt(e)}`:''}`);
    });
    return parts.length?parts.join(' • '):'No delivery days selected';
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
    wrap.innerHTML=`<button id="deliveryScheduleHeader" type="button" style="width:100%;border:0;border-radius:0;background:#fbfdff;padding:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;text-align:left"><span><span style="font-weight:800">Allowed Delivery Days & Hours</span><span id="deliveryScheduleSummary" class="muted" style="display:block;margin-top:3px">No delivery days selected</span></span><span id="deliveryScheduleToggle" aria-expanded="false" style="font-size:20px;font-weight:800">▸</span></button><div id="deliveryScheduleBody" style="display:none;padding:0 12px 12px"><div class="muted" style="margin-bottom:8px">Select the days this vendor may deliver and the allowed time window.</div><div id="deliveryScheduleRows" style="display:grid;gap:7px"></div></div>`;
    const actions=form.querySelector('.full.row');form.insertBefore(wrap,actions||null);
    const rows=wrap.querySelector('#deliveryScheduleRows');
    rows.innerHTML=DAYS.map(([key,label])=>`<div style="display:grid;grid-template-columns:120px 1fr 1fr;gap:8px;align-items:center"><label style="display:flex;gap:7px;align-items:center"><input type="checkbox" class="delivery-day-enabled" data-day="${key}" style="width:auto"> ${label}</label><input type="time" class="delivery-start" data-day="${key}" disabled><input type="time" class="delivery-end" data-day="${key}" disabled></div>`).join('');
    wrap.querySelector('#deliveryScheduleHeader').onclick=()=>setCollapsed(wrap.querySelector('#deliveryScheduleBody').style.display!=='none');
    rows.querySelectorAll('.delivery-day-enabled').forEach(c=>c.onchange=()=>{const day=c.dataset.day;rows.querySelector(`.delivery-start[data-day="${day}"]`).disabled=!c.checked;rows.querySelector(`.delivery-end[data-day="${day}"]`).disabled=!c.checked;updateSummary();});
    rows.querySelectorAll('.delivery-start,.delivery-end').forEach(i=>i.onchange=updateSummary);
  }

  async function fillSchedule(){
    ensureScheduleUI();hideLegacyField();
    const id=Number(document.querySelector('#vid')?.value||0);if(!id)return clearSchedule();
    const r=await db.from('vendors').select('delivery_schedule').eq('id',id).maybeSingle();if(r.error)return;
    const schedule=r.data?.delivery_schedule||{};
    DAYS.forEach(([key])=>{const row=schedule[key]||{},enabled=document.querySelector(`.delivery-day-enabled[data-day="${key}"]`),start=document.querySelector(`.delivery-start[data-day="${key}"]`),end=document.querySelector(`.delivery-end[data-day="${key}"]`);if(!enabled||!start||!end)return;enabled.checked=!!row.enabled;start.disabled=!enabled.checked;end.disabled=!enabled.checked;start.value=row.start||'';end.value=row.end||'';});
    updateSummary();setCollapsed(true);
  }

  function clearSchedule(){DAYS.forEach(([key])=>{const enabled=document.querySelector(`.delivery-day-enabled[data-day="${key}"]`),start=document.querySelector(`.delivery-start[data-day="${key}"]`),end=document.querySelector(`.delivery-end[data-day="${key}"]`);if(enabled)enabled.checked=false;if(start){start.value='';start.disabled=true}if(end){end.value='';end.disabled=true}});updateSummary();setCollapsed(true);}
  function collectSchedule(){const out={};DAYS.forEach(([key])=>{const enabled=document.querySelector(`.delivery-day-enabled[data-day="${key}"]`),start=document.querySelector(`.delivery-start[data-day="${key}"]`),end=document.querySelector(`.delivery-end[data-day="${key}"]`);if(enabled?.checked)out[key]={enabled:true,start:start?.value||'',end:end?.value||''};});return out;}

  async function saveSchedule(){
    let id=Number(document.querySelector('#vid')?.value||0);
    if(!id){const name=document.querySelector('#vname')?.value?.trim();if(name){const r=await db.from('vendors').select('id').eq('vendor',name).order('id',{ascending:false}).limit(1).maybeSingle();id=Number(r.data?.id||0)}}
    if(!id)return;
    const r=await db.from('vendors').update({delivery_schedule:collectSchedule(),updated_at:new Date().toISOString()}).eq('id',id);if(r.error)console.error('Delivery schedule save failed',r.error);
  }

  document.addEventListener('click',e=>{if(e.target.closest('#addVendor'))setTimeout(()=>{ensureScheduleUI();hideLegacyField();clearSchedule()},100);if(e.target.closest('.vendor-link'))setTimeout(fillSchedule,120);});
  document.addEventListener('submit',e=>{if(e.target?.id==='vendorForm')setTimeout(saveSchedule,450)},true);
  setTimeout(()=>{ensureScheduleUI();hideLegacyField()},700);setTimeout(()=>{ensureScheduleUI();hideLegacyField()},1600);
})();