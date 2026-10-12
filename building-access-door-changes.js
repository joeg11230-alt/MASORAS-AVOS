(()=>{
  const TABLE='building_access_door_changes';
  const PROTECTOR_URL='https://ac.idtechsolutions.com/#/';
  let rows=[];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=d=>d?new Date(d).toLocaleString([], {month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}):'—';
  const modeLabel=m=>({unlocked:'Keep Unlocked',locked:'Keep Locked',special_schedule:'Special Schedule',other:'Other'})[m]||m;
  const inputTime=d=>{const x=d?new Date(d):new Date();const p=n=>String(n).padStart(2,'0');return `${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}`;};
  const openProtector=()=>window.open(PROTECTOR_URL,'_blank','noopener,noreferrer');

  function statusInfo(r){
    const now=Date.now(),start=new Date(r.starts_at).getTime(),end=new Date(r.ends_at).getTime();
    if(r.status==='restored')return{label:'RESTORED',kind:'restored'};
    if(r.status==='changed'&&end<=now)return{label:'RESTORE NOW',kind:'danger'};
    if(r.status==='changed')return{label:'CHANGED',kind:'changed'};
    if(start<=now)return{label:'MAKE CHANGE NOW',kind:'warning'};
    return{label:'PLANNED',kind:'planned'};
  }

  async function loadRows(){
    const mount=document.querySelector('#buildingAccessTrackerMount');if(!mount)return;
    mount.innerHTML='<div class="door-empty">Loading door changes…</div>';
    const r=await db.from(TABLE).select('*').order('starts_at',{ascending:true});
    if(r.error){mount.innerHTML=`<div class="door-error"><b>Could not load Door Schedule Changes.</b><div>${esc(r.error.message)}</div><button type="button" id="retryDoorChanges">Retry</button></div>`;mount.querySelector('#retryDoorChanges')?.addEventListener('click',loadRows);return;}
    rows=r.data||[];render();
  }

  function render(){
    const mount=document.querySelector('#buildingAccessTrackerMount');if(!mount)return;
    const active=rows.filter(r=>r.status!=='restored');
    const history=rows.filter(r=>r.status==='restored').sort((a,b)=>new Date(b.restored_at||b.updated_at)-new Date(a.restored_at||a.updated_at));
    const due=active.filter(r=>statusInfo(r).kind==='danger').length;
    const changed=active.filter(r=>r.status==='changed').length;
    const planned=active.filter(r=>r.status==='planned').length;
    mount.innerHTML=`
      <div class="door-toolbar">
        <div>
          <button type="button" id="doorBackOverview"><i class="bi bi-arrow-left"></i> Building Access Overview</button>
          <h3>Door Schedule Changes</h3>
          <div class="muted">Track every temporary door change until the normal schedule is restored.</div>
        </div>
        <div class="door-toolbar-actions">
          <button type="button" id="doorOpenProtector"><i class="bi bi-box-arrow-up-right"></i> Open PROTECTOR.Net</button>
          <button type="button" id="doorAddChange" class="primary"><i class="bi bi-plus-circle"></i> Plan Door Change</button>
        </div>
      </div>
      <div class="door-summary">
        <div><b>${planned}</b><span>Planned</span></div>
        <div><b>${changed}</b><span>Changed</span></div>
        <div class="${due?'urgent':''}"><b>${due}</b><span>Restore Now</span></div>
        <div><b>${history.length}</b><span>History</span></div>
      </div>
      <div class="door-board">
        <section><div class="door-list-head"><h4>Active & Upcoming</h4><span>${active.length}</span></div><div class="door-change-list">${active.length?active.map(card).join(''):'<div class="door-empty">No active door changes. Click “Plan Door Change” when a schedule exception comes up.</div>'}</div></section>
        <section><div class="door-list-head"><h4>Restored History</h4><span>${history.length}</span></div><div class="door-change-list history">${history.length?history.map(card).join(''):'<div class="door-empty">Completed changes will be saved here.</div>'}</div></section>
      </div>`;
    bind();
  }

  function card(r){
    const s=statusInfo(r);
    const primary=r.status==='planned'
      ?`<button type="button" class="door-mark-changed success" data-id="${r.id}">Mark Changed</button>`
      :r.status==='changed'
        ?`<button type="button" class="door-mark-restored ${s.kind==='danger'?'door-restore-now':'success'}" data-id="${r.id}">Mark Restored</button>`
        :'';
    return `<article class="door-change-card ${s.kind}">
      <div class="door-card-top"><div><h4>${esc(r.door_name)}</h4><div class="door-occasion">${esc(r.occasion||'Temporary schedule change')}</div></div><span class="door-status ${s.kind}">${s.label}</span></div>
      <div class="door-details">
        <div><span>Temporary mode</span><b>${esc(modeLabel(r.temporary_mode))}</b></div>
        <div><span>Normal schedule</span><b>${esc(r.normal_schedule||'Not entered')}</b></div>
        <div><span>Change begins</span><b>${fmt(r.starts_at)}</b></div>
        <div><span>Restore by</span><b>${fmt(r.ends_at)}</b></div>
      </div>
      ${r.notes?`<div class="door-notes"><b>Notes:</b> ${esc(r.notes)}</div>`:''}
      <div class="door-actions">
        <button type="button" class="door-protector" data-id="${r.id}"><i class="bi bi-box-arrow-up-right"></i> PROTECTOR.Net</button>
        ${primary}
        <button type="button" class="door-edit" data-id="${r.id}">Edit</button>
        <button type="button" class="door-delete danger" data-id="${r.id}">Delete</button>
      </div>
    </article>`;
  }

  function bind(){
    document.querySelector('#doorBackOverview')?.addEventListener('click',()=>window.showBuildingAccessOverview?.());
    document.querySelector('#doorOpenProtector')?.addEventListener('click',openProtector);
    document.querySelector('#doorAddChange')?.addEventListener('click',()=>openEditor());
    document.querySelectorAll('.door-protector').forEach(b=>b.onclick=openProtector);
    document.querySelectorAll('.door-edit').forEach(b=>b.onclick=()=>openEditor(Number(b.dataset.id)));
    document.querySelectorAll('.door-delete').forEach(b=>b.onclick=()=>removeRow(Number(b.dataset.id)));
    document.querySelectorAll('.door-mark-changed').forEach(b=>b.onclick=()=>setStatus(Number(b.dataset.id),'changed'));
    document.querySelectorAll('.door-mark-restored').forEach(b=>b.onclick=()=>setStatus(Number(b.dataset.id),'restored'));
  }

  function ensureModal(){
    let modal=document.querySelector('#doorChangeModal');if(modal)return modal;
    modal=document.createElement('div');modal.id='doorChangeModal';modal.className='modal';
    modal.innerHTML=`<div class="box door-change-box">
      <div class="queue-title"><div><h3 id="doorModalTitle">Plan Door Change</h3><div class="muted">This is your reminder record. Make the actual change separately in PROTECTOR.Net.</div></div><button type="button" id="doorModalClose">Close</button></div>
      <form id="doorChangeForm" style="margin-top:14px">
        <input type="hidden" id="doorChangeId">
        <div class="form">
          <label>Door name or location<input id="doorName" required placeholder="Example: Main Entrance"></label>
          <label>Temporary mode<select id="doorMode" required><option value="unlocked">Keep Unlocked</option><option value="locked">Keep Locked</option><option value="special_schedule">Special Schedule</option><option value="other">Other</option></select></label>
          <label class="full">Normal schedule<input id="doorNormal" placeholder="Example: Unlock 7:15 AM — Lock 6:00 PM"></label>
          <label>Change begins<input id="doorStarts" type="datetime-local" required></label>
          <label>Restore normal schedule by<input id="doorEnds" type="datetime-local" required></label>
          <label class="full">Holiday, weekend or occasion<input id="doorOccasion" placeholder="Example: Simchas Torah, Sunday event"></label>
          <label class="full">Notes<textarea id="doorNotes" rows="3" placeholder="Anything you need to remember"></textarea></label>
        </div>
        <div class="row" style="margin-top:14px"><button type="button" id="doorCancel">Cancel</button><button type="submit" class="primary">Save Door Change</button></div>
        <p id="doorFormMsg" class="muted"></p>
      </form>
    </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#doorModalClose').onclick=modal.querySelector('#doorCancel').onclick=()=>modal.classList.remove('show');
    modal.querySelector('#doorChangeForm').onsubmit=saveRow;
    return modal;
  }

  function openEditor(id){
    const modal=ensureModal(),r=id?rows.find(x=>Number(x.id)===id):null;
    const start=new Date();start.setMinutes(Math.ceil(start.getMinutes()/15)*15,0,0);
    const end=new Date(start.getTime()+2*60*60*1000);
    modal.querySelector('#doorChangeId').value=r?.id||'';
    modal.querySelector('#doorName').value=r?.door_name||'';
    modal.querySelector('#doorMode').value=r?.temporary_mode||'unlocked';
    modal.querySelector('#doorNormal').value=r?.normal_schedule||'';
    modal.querySelector('#doorStarts').value=inputTime(r?.starts_at||start);
    modal.querySelector('#doorEnds').value=inputTime(r?.ends_at||end);
    modal.querySelector('#doorOccasion').value=r?.occasion||'';
    modal.querySelector('#doorNotes').value=r?.notes||'';
    modal.querySelector('#doorModalTitle').textContent=r?'Edit Door Change':'Plan Door Change';
    modal.querySelector('#doorFormMsg').textContent='';
    modal.classList.add('show');
  }

  async function saveRow(e){
    e.preventDefault();const modal=ensureModal(),id=Number(modal.querySelector('#doorChangeId').value||0),msg=modal.querySelector('#doorFormMsg');
    const starts=new Date(modal.querySelector('#doorStarts').value),ends=new Date(modal.querySelector('#doorEnds').value);
    if(!(ends>starts)){msg.textContent='The restore time must be after the change begins.';return;}
    const payload={
      door_name:modal.querySelector('#doorName').value.trim(),
      temporary_mode:modal.querySelector('#doorMode').value,
      normal_schedule:modal.querySelector('#doorNormal').value.trim()||null,
      starts_at:starts.toISOString(),ends_at:ends.toISOString(),
      occasion:modal.querySelector('#doorOccasion').value.trim()||null,
      notes:modal.querySelector('#doorNotes').value.trim()||null,
      updated_at:new Date().toISOString()
    };
    msg.textContent='Saving…';
    const r=id?await db.from(TABLE).update(payload).eq('id',id):await db.from(TABLE).insert(payload);
    if(r.error){msg.textContent=r.error.message;return;}
    modal.classList.remove('show');await loadRows();
  }

  async function setStatus(id,status){
    const patch={status,updated_at:new Date().toISOString()};
    if(status==='changed')patch.changed_at=patch.updated_at;
    if(status==='restored')patch.restored_at=patch.updated_at;
    const r=await db.from(TABLE).update(patch).eq('id',id);
    if(r.error)return alert(r.error.message);
    await loadRows();
  }

  async function removeRow(id){
    if(!confirm('Delete this door-change record?'))return;
    const r=await db.from(TABLE).delete().eq('id',id);
    if(r.error)return alert(r.error.message);
    await loadRows();
  }

  function addStyles(){
    if(document.querySelector('#doorChangeStyles'))return;
    const s=document.createElement('style');s.id='doorChangeStyles';s.textContent=`
      .door-toolbar{display:flex;justify-content:space-between;gap:14px;align-items:flex-end;flex-wrap:wrap}.door-toolbar h3{font-size:24px;margin:14px 0 4px}.door-toolbar-actions{display:flex;gap:8px;flex-wrap:wrap}
      .door-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:18px 0}.door-summary>div{padding:14px;border:1px solid #cbd5e1;border-radius:12px;background:#fff;display:flex;flex-direction:column}.door-summary b{font-size:28px;color:#1e3a5f}.door-summary span{font-size:12px;color:#687386;font-weight:700}.door-summary .urgent{border-color:#dc2626;background:#fef2f2}.door-summary .urgent b{color:#b91c1c}
      .door-board{display:grid;grid-template-columns:1.2fr .8fr;gap:16px}.door-list-head{display:flex;justify-content:space-between;align-items:center}.door-list-head h4{font-size:17px}.door-list-head span{background:#e2e8f0;border-radius:999px;padding:4px 9px;font-weight:800}.door-change-list{display:grid;gap:10px}
      .door-change-card{background:#fff;border:2px solid #cbd5e1;border-left-width:6px;border-radius:12px;padding:14px;box-shadow:0 4px 12px rgba(15,23,42,.07)}.door-change-card.planned{border-left-color:#2563eb}.door-change-card.warning{border-left-color:#d97706;background:#fffbeb}.door-change-card.changed{border-left-color:#16a34a}.door-change-card.danger{border-color:#dc2626;background:#fef2f2;box-shadow:0 0 0 3px #fecaca}.door-change-card.restored{border-left-color:#64748b;opacity:.88}
      .door-card-top{display:flex;justify-content:space-between;gap:10px}.door-card-top h4{margin:0;font-size:19px}.door-occasion{font-size:13px;color:#687386;margin-top:3px}.door-status{height:max-content;padding:5px 8px;border-radius:999px;font-size:11px;font-weight:900}.door-status.planned{background:#dbeafe;color:#1d4ed8}.door-status.warning{background:#fef3c7;color:#92400e}.door-status.changed{background:#dcfce7;color:#166534}.door-status.danger{background:#dc2626;color:#fff}.door-status.restored{background:#e2e8f0;color:#475569}
      .door-details{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.door-details>div{padding:8px;background:#f8fafc;border-radius:8px}.door-details span{display:block;font-size:11px;text-transform:uppercase;color:#64748b;font-weight:800}.door-details b{display:block;margin-top:3px;font-size:13px}.door-notes{margin-top:10px;padding:9px;background:#f8fafc;border-radius:8px;font-size:13px}.door-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.door-restore-now{background:#dc2626!important;border-color:#dc2626!important;color:#fff!important;font-weight:900}.door-empty,.door-error{padding:20px;border:1px dashed #cbd5e1;border-radius:12px;color:#64748b;background:#fff}.door-error{border-color:#fca5a5;background:#fef2f2;color:#991b1b}.door-change-box{max-width:760px}
      @media(max-width:800px){.door-board{grid-template-columns:1fr}.door-summary{grid-template-columns:repeat(2,1fr)}.door-details{grid-template-columns:1fr}} `;
    document.head.appendChild(s);
  }

  window.loadDoorScheduleChanges=()=>{addStyles();const landing=document.querySelector('#buildingAccessLanding'),mount=document.querySelector('#buildingAccessTrackerMount');if(!mount)return;if(landing)landing.style.display='none';mount.style.display='block';loadRows();};
})();