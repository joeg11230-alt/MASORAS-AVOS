(()=>{
  const escV=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  async function refreshVendors(){
    const grid=document.querySelector('#vgrid');
    if(!grid||typeof db==='undefined')return;
    grid.innerHTML='<div class="card"><div class="muted">Loading vendors…</div></div>';
    const r=await db.from('vendors').select('*').order('vendor');
    if(r.error){grid.innerHTML='<div class="card short">'+escV(r.error.message)+'</div>';return;}
    window.vendors=r.data||[];
    if(!vendors.length){grid.innerHTML='<div class="card">No vendors found.</div>';return;}
    grid.innerHTML=vendors.map(v=>{
      const active=v.is_active!==false;
      const contact=[v.contact_person,v.phone,v.cell,v.email].filter(Boolean);
      return `<div class="card${active?'':' vendor-inactive-card'}" data-vid="${v.id}" style="cursor:pointer">
        <div class="queue-title"><h3 style="margin:0">${escV(v.vendor)}</h3><span class="vendor-status-badge ${active?'active':'inactive'}">${active?'Active':'Inactive'}</span></div>
        ${v.contact_person?`<div style="margin-top:8px"><b>${escV(v.contact_person)}</b></div>`:''}
        ${v.phone?`<div class="muted">Phone: ${escV(v.phone)}</div>`:''}
        ${v.cell?`<div class="muted">Cell: ${escV(v.cell)}</div>`:''}
        ${v.email?`<div class="muted">${escV(v.email)}</div>`:''}
        ${v.delivery_days?`<div style="margin-top:8px">${escV(v.delivery_days)}</div>`:''}
      </div>`;
    }).join('');
    grid.querySelectorAll('[data-vid]').forEach(card=>card.onclick=()=>{
      const id=Number(card.dataset.vid);
      if(typeof window.openVendor==='function')window.openVendor(id);
    });
  }
  window.refreshVendors=refreshVendors;
  const boot=()=>{
    const tab=document.querySelector('nav .tab[data-tab="vendors"]');
    if(tab&&!tab.dataset.vendorFix){tab.dataset.vendorFix='1';tab.addEventListener('click',()=>setTimeout(refreshVendors,0));}
    const app=document.querySelector('#app');
    if(app)new MutationObserver(()=>{if(!app.hidden)setTimeout(refreshVendors,300)}).observe(app,{attributes:true,attributeFilter:['hidden']});
    setTimeout(()=>{if(app&&!app.hidden)refreshVendors()},900);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();