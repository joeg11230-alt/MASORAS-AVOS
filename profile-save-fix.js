(()=>{
  const $q=s=>document.querySelector(s);
  const val=id=>$q(id)?.value?.trim()||'';
  async function reloadProfileView(){
    const r=await db.from('organization_profile').select('*').eq('profile_key','masoras_avos').maybeSingle();
    if(r.error) throw r.error;
    const p=r.data||{};
    const view=$q('#orgProfileView');
    if(!view)return;
    const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
    const digits=s=>String(s||'').replace(/\D/g,'');
    const addr=[p.address_line1,p.address_line2,[p.city,p.state,p.zip].filter(Boolean).join(', ')].filter(Boolean).join('<br>');
    const wa=digits(p.whatsapp||p.cell||p.phone);
    view.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px"><div class="subcard"><h2 style="margin:0 0 4px">${esc(p.organization_name||'MASORAS AVOS')}</h2>${p.department_name?`<div style="font-size:18px;font-weight:700;color:#1f4e78">${esc(p.department_name)}</div>`:''}${p.contact_name?`<div style="margin-top:14px"><b>${esc(p.contact_name)}</b>${p.title?`<div class="muted">${esc(p.title)}</div>`:''}</div>`:''}${addr?`<div style="margin-top:12px">${addr}</div>`:''}</div><div class="subcard"><h3 style="margin-top:0">Contact Information</h3>${p.phone?`<div class="contact-line"><b>Phone:</b> <a href="tel:${esc(p.phone)}">${esc(p.phone)}</a></div>`:''}${p.cell?`<div class="contact-line"><b>Cell:</b> <a href="tel:${esc(p.cell)}">${esc(p.cell)}</a></div>`:''}${p.whatsapp?`<div class="contact-line"><b>WhatsApp:</b> <a class="iconlink" target="_blank" rel="noopener" href="https://wa.me/${wa}"><i class="bi bi-whatsapp"></i>${esc(p.whatsapp)}</a></div>`:''}${p.email?`<div class="contact-line"><b>Email:</b> <a class="iconlink" href="mailto:${encodeURIComponent(p.email)}"><i class="bi bi-envelope-fill"></i>${esc(p.email)}</a></div>`:''}${p.website?`<div class="contact-line"><b>Website:</b> ${esc(p.website)}</div>`:''}</div></div>${p.notes?`<div class="subcard" style="margin-top:12px;white-space:pre-wrap">${esc(p.notes)}</div>`:''}`;
    const edit=$q('#editOrgProfile');
    if(edit && typeof window.openEdit==='function') edit.onclick=window.openEdit;
  }

  function patchForm(){
    const form=$q('#orgProfileForm');
    if(!form||form.dataset.saveFixed==='1')return;
    form.dataset.saveFixed='1';
    form.onsubmit=async e=>{
      e.preventDefault();
      const msg=$q('#orgProfileMsg');
      if(msg)msg.textContent='Saving…';
      const p={profile_key:'masoras_avos',organization_name:val('#orgName')||'MASORAS AVOS',department_name:val('#orgDepartment')||null,contact_name:val('#orgContact')||null,title:val('#orgTitle')||null,phone:val('#orgPhone')||null,cell:val('#orgCell')||null,whatsapp:val('#orgWhatsapp')||null,email:val('#orgEmail')||null,website:val('#orgWebsite')||null,address_line1:val('#orgAddress1')||null,address_line2:val('#orgAddress2')||null,city:val('#orgCity')||null,state:val('#orgState')||null,zip:val('#orgZip')||null,notes:val('#orgNotes')||null,updated_at:new Date().toISOString()};
      const r=await db.from('organization_profile').upsert(p,{onConflict:'profile_key'}).select().single();
      if(r.error){if(msg)msg.textContent=r.error.message;return;}
      if(msg)msg.textContent='Saved';
      $q('#orgProfileModal')?.classList.remove('show');
      try{await reloadProfileView()}catch(err){alert(err.message)}
    };
  }

  patchForm();
  new MutationObserver(patchForm).observe(document.body,{childList:true,subtree:true});
})();