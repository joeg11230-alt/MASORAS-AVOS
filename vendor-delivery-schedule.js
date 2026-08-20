(()=>{
  const DAYS=[['mon','Monday'],['tue','Tuesday'],['wed','Wednesday'],['thu','Thursday'],['fri','Friday'],['sat','Saturday'],['sun','Sunday']];
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

  function ensureScheduleUI(){
    const form=document.querySelector('#vendorForm');
    if(!form||document.querySelector('#vendorDeliverySchedule'))return;
    const wrap=document.createElement('div');
    wrap.id='vendorDeliverySchedule';wrap.className='full';
    wrap.style.cssText='border:1px solid #d9dee7;border-radius:10px;padding:12px;background:#fbfdff';
    wrap.innerHTML=`<div style="font-weight:800;margin-bottom:8px">Allowed Delivery Days & Hours</div><div class="muted" style="margin-bottom:8px">Select the days this vendor may deliver and the allowed time window.</div><div id="deliveryScheduleRows" style="display:grid;gap:7px"></div>`;
    const actions=form.querySelector('.full.row');
    form.insertBefore(wrap,actions||null);
    const rows=wrap.querySelector('#deliveryScheduleRows');
    rows.innerHTML=DAYS.map(([key,label])=>`<div style="display:grid;grid-template-columns:120px 1fr 1fr;gap:8px;align-items:center"><label style="display:flex;gap:7px;align-items:center"><input type="checkbox" class="delivery-day-enabled" data-day="${key}" style="width:auto"> ${label}</label><input type="time" class="delivery-start" data-day="${key}" disabled><input type="time" class="delivery-end" data-day="${key}" disabled></div>`).join('');
    rows.querySelectorAll('.delivery-day-enabled').forEach(c=>c.addEventListener('change',()=>{
      const day=c.dataset.day;rows.querySelector(`.delivery-start[data-day="${day}"]`).disabled=!c.checked;rows.querySelector(`.delivery-end[data-day="${day}"]`).disabled=!c.checked;
    }));
  }

  async function fillSchedule(){
    ensureScheduleUI();
    const id=Number(document.querySelector('#vid')?.value||0);if(!id)return clearSchedule();
    const r=await db.from('vendors').select('delivery_schedule').eq('id',id).maybeSingle();
    if(r.error)return;
    const schedule=r.data?.delivery_schedule||{};
    DAYS.forEach(([key])=>{
      const row=schedule[key]||{};
      const enabled=document.querySelector(`.delivery-day-enabled[data-day="${key}"]`);
      const start=document.querySelector(`.delivery-start[data-day="${key}"]`);
      const end=document.querySelector(`.delivery-end[data-day="${key}"]`);
      if(!enabled||!start||!end)return;
      enabled.checked=!!row.enabled;start.disabled=!enabled.checked;end.disabled=!enabled.checked;start.value=row.start||'';end.value=row.end||'';
    });
  }

  function clearSchedule(){
    DAYS.forEach(([key])=>{
      const enabled=document.querySelector(`.delivery-day-enabled[data-day="${key}"]`),start=document.querySelector(`.delivery-start[data-day="${key}"]`),end=document.querySelector(`.delivery-end[data-day="${key}"]`);
      if(enabled)enabled.checked=false;if(start){start.value='';start.disabled=true}if(end){end.value='';end.disabled=true}
    });
  }

  function collectSchedule(){
    const out={};
    DAYS.forEach(([key])=>{
      const enabled=document.querySelector(`.delivery-day-enabled[data-day="${key}"]`),start=document.querySelector(`.delivery-start[data-day="${key}"]`),end=document.querySelector(`.delivery-end[data-day="${key}"]`);
      if(enabled?.checked)out[key]={enabled:true,start:start?.value||'',end:end?.value||''};
    });
    return out;
  }

  async function saveSchedule(){
    let id=Number(document.querySelector('#vid')?.value||0);
    if(!id){const name=document.querySelector('#vname')?.value?.trim();if(name){const r=await db.from('vendors').select('id').eq('vendor',name).order('id',{ascending:false}).limit(1).maybeSingle();id=Number(r.data?.id||0)}}
    if(!id)return;
    const r=await db.from('vendors').update({delivery_schedule:collectSchedule(),updated_at:new Date().toISOString()}).eq('id',id);
    if(r.error)console.error('Delivery schedule save failed',r.error);
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('#addVendor'))setTimeout(()=>{ensureScheduleUI();clearSchedule()},100);
    if(e.target.closest('.vendor-link'))setTimeout(fillSchedule,120);
  });
  document.addEventListener('submit',e=>{if(e.target?.id==='vendorForm')setTimeout(saveSchedule,450)},true);
  setTimeout(ensureScheduleUI,700);setTimeout(ensureScheduleUI,1600);
})();