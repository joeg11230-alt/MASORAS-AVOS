(() => {
  const style = document.createElement('style');
  style.textContent = `.vendor-status-btn{font-weight:800;color:#fff;border:0}.vendor-status-btn.active{background:#17733d}.vendor-status-btn.inactive{background:#a61b1b}.vendor-inactive-card{opacity:.78;border-color:#e2a8a8}.vendor-status-badge{display:inline-block;padding:4px 8px;border-radius:999px;color:#fff;font-size:12px;font-weight:800}.vendor-status-badge.active{background:#17733d}.vendor-status-badge.inactive{background:#a61b1b}`;
  document.head.appendChild(style);

  const isActive = v => v?.is_active !== false;

  function ensureStatusControl(v){
    const form = document.querySelector('#vendorForm');
    if(!form) return;
    let wrap = document.querySelector('#vendorStatusWrap');
    if(!wrap){
      wrap = document.createElement('div');
      wrap.id = 'vendorStatusWrap';
      wrap.className = 'full row';
      const actions = form.querySelector('.full.row');
      form.insertBefore(wrap, actions || null);
    }
    const active = isActive(v);
    wrap.innerHTML = `<b>Status:</b><button type="button" id="vendorStatusBtn" class="vendor-status-btn ${active?'active':'inactive'}">${active?'Active':'Inactive'}</button>`;
    const btn = document.querySelector('#vendorStatusBtn');
    btn.disabled = !v?.id;
    btn.onclick = async () => {
      if(!v?.id) return;
      const next = !isActive(v);
      const r = await db.from('vendors').update({is_active:next,updated_at:new Date().toISOString()}).eq('id',v.id);
      if(r.error) return alert(r.error.message);
      v.is_active = next;
      btn.textContent = next ? 'Active' : 'Inactive';
      btn.className = `vendor-status-btn ${next?'active':'inactive'}`;
      await loadAll();
    };
  }

  const originalOpenVendor = window.openVendor;
  window.openVendor = async function(id){
    await originalOpenVendor(id);
    const v = id ? vendorById(id) : {id:null,is_active:true};
    ensureStatusControl(v);
  };

  const originalRenderVendors = window.renderVendors;
  window.renderVendors = function(){
    originalRenderVendors();
    document.querySelectorAll('#vgrid .card[data-vid]').forEach(card => {
      const v = vendorById(Number(card.dataset.vid));
      if(!v) return;
      const active = isActive(v);
      card.classList.toggle('vendor-inactive-card', !active);
      let badge = card.querySelector('.vendor-status-badge');
      if(!badge){
        badge = document.createElement('span');
        const h = card.querySelector('h3');
        if(h) h.insertAdjacentElement('afterend', badge); else card.prepend(badge);
      }
      badge.className = `vendor-status-badge ${active?'active':'inactive'}`;
      badge.textContent = active ? 'Active' : 'Inactive';
    });
  };
})();