(()=>{
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  let me=null;

  async function loadMe(){
    try{
      const {data:{session}}=await db.auth.getSession();
      if(!session)return;
      const email=(session.user.email||'').toLowerCase();
      const r=await db.from('app_users').select('*').ilike('email',email).maybeSingle();
      if(!r.error)me=r.data;
      enhancePermissionUI();
      ensureStockButton();
      if(me?.role==='owner')loadOwnerAlerts();
    }catch(e){console.error('stock check user load',e)}
  }

  function enhancePermissionUI(){
    const invite=document.querySelector('#inviteRole');
    if(invite&&!invite.querySelector('option[value="counter"]')){
      const o=document.createElement('option');o.value='counter';o.textContent='View & Update Qty';invite.insertBefore(o,invite.querySelector('option[value="editor"]'));
    }
    const perm=document.querySelector('#permRole');
    if(perm&&!perm.querySelector('option[value="counter"]')){
      const o=document.createElement('option');o.value='counter';o.textContent='View & Update Qty';perm.insertBefore(o,perm.querySelector('option[value="editor"]'));
    }
    const form=document.querySelector('#permissionUserForm');
    if(form&&!form.dataset.counterSave){
      form.dataset.counterSave='1';
      form.addEventListener('submit',async e=>{
        e.preventDefault();e.stopImmediatePropagation();
        const modal=document.querySelector('#permissionUserModal');
        const id=Number(modal.querySelector('#permUserId').value||0),email=modal.querySelector('#permEmail').value.trim().toLowerCase(),mode=modal.querySelector('#permRole').value,active=modal.querySelector('#permActive').checked,sections=[...modal.querySelectorAll('[name="permSection"]:checked')].map(c=>c.value),msg=modal.querySelector('#permMsg');
        if(!email||!sections.length){msg.textContent=!sections.length?'Choose at least one section.':'Email is required.';return;}
        msg.textContent='Saving…';
        const payload={email,role:mode==='editor'?'editor':'viewer',can_update_qty:mode==='counter',active,sections,updated_at:new Date().toISOString()};
        const r=id?await db.from('app_users').update(payload).eq('id',id):await db.from('app_users').insert(payload);
        if(r.error){msg.textContent=r.error.message;return;}
        modal.classList.remove('show');setTimeout(()=>location.reload(),250);
      },true);
    }
  }

  async function syncPermModal(){
    const m=document.querySelector('#permissionUserModal');if(!m?.classList.contains('show'))return;
    const email=m.querySelector('#permEmail')?.value?.trim();if(!email)return;
    const r=await db.from('app_users').select('role,can_update_qty').ilike('email',email).maybeSingle();
    if(r.data?.can_update_qty)m.querySelector('#permRole').value='counter';
  }

  function ensureStockButton(){
    if(!me?.active||!(me.role==='owner'||me.role==='editor'||me.can_update_qty))return;
    const toolbar=document.querySelector('#inventory .toolbar');if(!toolbar||document.querySelector('#stockCheckBtn'))return;
    const b=document.createElement('button');b.id='stockCheckBtn';b.type='button';b.className='success';b.innerHTML='<i class="bi bi-clipboard-check"></i> Stock Check / Count';
    b.onclick=openStockCheck;toolbar.appendChild(b);
  }

  function currentType(){return document.querySelector('nav .tab[data-tab="maintenanceInventory"]')?.classList.contains('active')?'Maintenance':'Kitchen'}

  async function openStockCheck(){
    const type=currentType();
    if(me?.role!=='owner'&&!(me?.sections||[]).includes(type==='Kitchen'?'kitchen':'maintenance'))return alert('You do not have access to this inventory section.');
    const r=await db.from('inventory_items').select('id,item,vendor,storage_location,qty_on_hand,target_stock,inventory_type').eq('inventory_type',type).order('item');
    if(r.error)return alert(r.error.message);
    let m=document.querySelector('#stockCheckModal');
    if(!m){m=document.createElement('div');m.id='stockCheckModal';m.className='modal';document.body.appendChild(m)}
    const rows=r.data||[];
    m.innerHTML=`<div class="box" style="max-width:1000px"><div class="queue-title"><div><h2 style="margin:0">${type} Stock Check</h2><div class="muted">Check each item you counted and enter the actual quantity.</div></div><button id="stockCheckClose" type="button">Close</button></div><div style="margin-top:12px;overflow:auto"><table><tr><th>Checked</th><th>Item</th><th>Vendor</th><th>Location</th><th>Current Qty</th><th>Target</th><th>Counted Qty</th></tr>${rows.map(x=>`<tr data-item-id="${x.id}" data-prev="${Number(x.qty_on_hand)||0}"><td><input class="stockChecked" type="checkbox" style="width:auto"></td><td><b>${esc(x.item)}</b></td><td>${esc(x.vendor||'')}</td><td>${esc(x.storage_location||'')}</td><td>${Number(x.qty_on_hand)||0}</td><td>${Number(x.target_stock)||0}</td><td><input class="stockQty" type="number" min="0" step="1" value="${Number(x.qty_on_hand)||0}" style="width:100px"></td></tr>`).join('')}</table></div><label style="display:block;margin-top:12px"><b>Report Notes</b><textarea id="stockCheckNote" rows="3" placeholder="Anything Yossi should know about this stock check..."></textarea></label><div class="row" style="margin-top:14px"><button id="stockCheckCancel" type="button">Cancel</button><button id="stockCheckSubmit" class="primary" type="button"><i class="bi bi-send-fill"></i> Submit Report & Alert Owner</button></div><p id="stockCheckMsg" class="muted"></p></div>`;
    m.querySelector('#stockCheckClose').onclick=m.querySelector('#stockCheckCancel').onclick=()=>m.classList.remove('show');
    m.querySelectorAll('.stockQty').forEach(inp=>inp.addEventListener('input',()=>inp.closest('tr').querySelector('.stockChecked').checked=true));
    m.querySelector('#stockCheckSubmit').onclick=submitStockCheck;
    m.classList.add('show');
  }

  async function submitStockCheck(){
    const m=document.querySelector('#stockCheckModal'),msg=m.querySelector('#stockCheckMsg');
    const counted=[...m.querySelectorAll('tr[data-item-id]')].filter(tr=>tr.querySelector('.stockChecked').checked).map(tr=>({item_id:Number(tr.dataset.itemId),counted_qty:Number(tr.querySelector('.stockQty').value||0)}));
    if(!counted.length){msg.textContent='Check at least one item before submitting.';return;}
    msg.textContent='Submitting stock report…';
    const note=m.querySelector('#stockCheckNote').value.trim()||null;
    const r=await db.rpc('submit_stock_check',{p_items:counted,p_note:note});
    if(r.error){msg.textContent=r.error.message;return;}
    msg.innerHTML='<span class="match">Report submitted. Owner has been alerted.</span>';
    setTimeout(async()=>{m.classList.remove('show');try{await loadAll()}catch{}},900);
  }

  async function loadOwnerAlerts(){
    if(me?.role!=='owner')return;
    const r=await db.from('stock_check_reports').select('*').eq('status','submitted').order('submitted_at',{ascending:false});
    if(r.error)return console.error(r.error);
    let area=document.querySelector('#stockOwnerAlerts');
    const profile=document.querySelector('#profile');if(!profile)return;
    if(!area){area=document.createElement('div');area.id='stockOwnerAlerts';area.className='card';area.style.cssText='max-width:980px;margin:16px auto;border-top:4px solid #d97706';profile.prepend(area)}
    const reports=r.data||[];
    area.innerHTML=`<div class="queue-title"><div><h2 style="margin:0">Stock Check Alerts</h2><div class="muted">Reports submitted by your stock team.</div></div>${reports.length?`<span class="badge" style="background:#fff1c7;color:#7c5700">${reports.length} NEW</span>`:''}</div><div style="margin-top:10px">${reports.length?reports.map(x=>`<div class="subcard" style="margin-top:8px"><div class="queue-title"><div><b>${esc(x.submitted_by_name||x.submitted_by_email)}</b><div class="muted">${new Date(x.submitted_at).toLocaleString()}</div>${x.note?`<div style="margin-top:5px">${esc(x.note)}</div>`:''}</div><button class="viewStockReport" data-id="${x.id}">View Report</button></div></div>`).join(''):'<div class="muted">No new stock check reports.</div>'}</div>`;
    area.querySelectorAll('.viewStockReport').forEach(b=>b.onclick=()=>openOwnerReport(Number(b.dataset.id)));
  }

  async function openOwnerReport(id){
    const [rr,ir]=await Promise.all([db.from('stock_check_reports').select('*').eq('id',id).single(),db.from('stock_check_report_items').select('*').eq('report_id',id).order('item_name')]);
    if(rr.error||ir.error)return alert(rr.error?.message||ir.error?.message);
    const rep=rr.data,rows=ir.data||[];
    let m=document.querySelector('#ownerStockReportModal');if(!m){m=document.createElement('div');m.id='ownerStockReportModal';m.className='modal';document.body.appendChild(m)}
    m.innerHTML=`<div class="box" style="max-width:900px"><div class="queue-title"><div><h2 style="margin:0">Stock Check Report</h2><div class="muted">${esc(rep.submitted_by_name||rep.submitted_by_email)} · ${new Date(rep.submitted_at).toLocaleString()}</div></div><button id="ownerReportClose">Close</button></div>${rep.note?`<div class="subcard" style="margin-top:12px"><b>Notes:</b> ${esc(rep.note)}</div>`:''}<div style="overflow:auto;margin-top:12px"><table><tr><th>Item</th><th>Inventory</th><th>Previous Qty</th><th>Counted Qty</th><th>Change</th></tr>${rows.map(x=>{const d=Number(x.counted_qty)-Number(x.previous_qty);return `<tr><td><b>${esc(x.item_name)}</b></td><td>${esc(x.inventory_type||'')}</td><td>${Number(x.previous_qty)}</td><td>${Number(x.counted_qty)}</td><td>${d>0?'+':''}${d}</td></tr>`}).join('')}</table></div><div class="row" style="margin-top:14px"><button id="ownerReportAck" class="primary">Mark Reviewed</button></div></div>`;
    m.querySelector('#ownerReportClose').onclick=()=>m.classList.remove('show');
    m.querySelector('#ownerReportAck').onclick=async()=>{const u=await db.from('stock_check_reports').update({status:'reviewed',acknowledged_at:new Date().toISOString()}).eq('id',id);if(u.error)return alert(u.error.message);m.classList.remove('show');loadOwnerAlerts()};
    m.classList.add('show');
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('.edit-perm'))setTimeout(syncPermModal,180);
    if(e.target.closest('#addPermissionUser'))setTimeout(enhancePermissionUI,120);
    if(e.target.closest('.tab'))setTimeout(ensureStockButton,80);
  },true);

  function boot(){loadMe();enhancePermissionUI();setTimeout(enhancePermissionUI,700);setTimeout(loadMe,1400)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();