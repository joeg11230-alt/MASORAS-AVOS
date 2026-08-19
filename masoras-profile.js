(()=>{
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const digits=s=>String(s||'').replace(/\D/g,'');
  let profile=null;

  function ensureUI(){
    if(document.querySelector('[data-tab="profile"]')) return;
    const nav=document.querySelector('nav');
    const main=document.querySelector('main.wrap');
    if(!nav||!main) return;
    const tab=document.createElement('button');
    tab.className='tab';tab.dataset.tab='profile';tab.textContent='MASORAS AVOS';
    nav.appendChild(tab);
    const section=document.createElement('section');
    section.id='profile';section.className='section';
    section.innerHTML=`
      <div class="card" style="max-width:980px;margin:auto">
        <div class="queue-title">
          <div><h2 style="margin:0">MASORAS AVOS</h2><div class="muted">Organization Profile</div></div>
          <button id="editOrgProfile" class="primary" type="button"><i class="bi bi-pencil-square"></i> Edit Profile</button>
        </div>
        <div id="orgProfileView" style="margin-top:16px"></div>
      </div>`;
    main.appendChild(section);
    tab.onclick=()=>{ if(typeof switchTab==='function') switchTab('profile'); loadProfile(); };
  }

  async function loadProfile(){
    ensureUI();
    const view=document.querySelector('#orgProfileView');
    if(!view)return;
    view.innerHTML='<div class="muted">Loading profile…</div>';
    const r=await db.from('organization_profile').select('*').eq('profile_key','masoras_avos').maybeSingle();
    if(r.error){view.innerHTML='<div class="short">'+esc(r.error.message)+'</div>';return;}
    profile=r.data||{profile_key:'masoras_avos',organization_name:'MASORAS AVOS',department_name:'YMA Kitchen & Maintenance'};
    renderView();
  }

  function addressLine(p){
    return [p.address_line1,p.address_line2,[p.city,p.state,p.zip].filter(Boolean).join(', ').replace(', ,',',')].filter(Boolean).join('<br>');
  }

  function renderView(){
    const p=profile||{};
    const wa=digits(p.whatsapp||p.cell||p.phone);
    const addr=addressLine(p);
    document.querySelector('#orgProfileView').innerHTML=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
        <div class="subcard">
          <h2 style="margin:0 0 4px">${esc(p.organization_name||'MASORAS AVOS')}</h2>
          <div style="font-size:18px;font-weight:700;color:#1f4e78">${esc(p.department_name||'YMA Kitchen & Maintenance')}</div>
          ${p.contact_name?`<div style="margin-top:14px"><b>${esc(p.contact_name)}</b>${p.title?`<div class="muted">${esc(p.title)}</div>`:''}</div>`:''}
          ${addr?`<div style="margin-top:12px">${addr}</div>`:''}
        </div>
        <div class="subcard">
          <h3 style="margin-top:0">Contact Information</h3>
          ${p.phone?`<div class="contact-line"><b>Phone:</b> <a href="tel:${esc(p.phone)}">${esc(p.phone)}</a></div>`:''}
          ${p.cell?`<div class="contact-line"><b>Cell:</b> <a href="tel:${esc(p.cell)}">${esc(p.cell)}</a></div>`:''}
          ${p.whatsapp?`<div class="contact-line"><b>WhatsApp:</b> <a class="iconlink" target="_blank" rel="noopener" href="https://wa.me/${wa}"><i class="bi bi-whatsapp"></i>${esc(p.whatsapp)}</a></div>`:''}
          ${p.email?`<div class="contact-line"><b>Email:</b> <a class="iconlink" href="mailto:${encodeURIComponent(p.email)}"><i class="bi bi-envelope-fill"></i>${esc(p.email)}</a></div>`:''}
          ${p.website?`<div class="contact-line"><b>Website:</b> <a target="_blank" rel="noopener" href="${esc(/^https?:\/\//i.test(p.website)?p.website:'https://'+p.website)}">${esc(p.website)}</a></div>`:''}
        </div>
      </div>
      <div class="subcard" style="margin-top:12px">
        <h3 style="margin-top:0">YMA Kitchen & Maintenance</h3>
        <div class="muted">Department / inventory operation under MASORAS AVOS</div>
        ${p.notes?`<div style="margin-top:10px;white-space:pre-wrap">${esc(p.notes)}</div>`:'<div style="margin-top:10px">Add notes, department details, hours, or other organization information here.</div>'}
      </div>`;
    document.querySelector('#editOrgProfile').onclick=openEdit;
  }

  function openEdit(){
    let m=document.querySelector('#orgProfileModal');
    if(!m){
      m=document.createElement('div');m.id='orgProfileModal';m.className='modal';
      m.innerHTML=`<div class="box"><div class="queue-title"><h3>MASORAS AVOS Profile</h3><button id="orgProfileCancel" type="button">Close</button></div>
      <form id="orgProfileForm" class="form" style="margin-top:12px">
        <label>Organization Name<input id="orgName" required></label>
        <label>Department Name<input id="orgDepartment"></label>
        <label>Contact Name<input id="orgContact"></label>
        <label>Title / Position<input id="orgTitle"></label>
        <label>Phone<input id="orgPhone" type="tel"></label>
        <label>Cell<input id="orgCell" type="tel"></label>
        <label>WhatsApp<input id="orgWhatsapp" type="tel"></label>
        <label>Email<input id="orgEmail" type="email"></label>
        <label class="full">Website<input id="orgWebsite" placeholder="https://..."></label>
        <label>Address Line 1<input id="orgAddress1"></label>
        <label>Address Line 2<input id="orgAddress2"></label>
        <label>City<input id="orgCity"></label>
        <label>State<input id="orgState"></label>
        <label>ZIP<input id="orgZip"></label>
        <label class="full">Notes / Organization Information<textarea id="orgNotes" rows="5"></textarea></label>
        <div class="full row"><button id="orgProfileCancel2" type="button">Cancel</button><button class="primary">Save Profile</button></div>
      </form><p id="orgProfileMsg" class="muted"></p></div>`;
      document.body.appendChild(m);
      m.querySelector('#orgProfileCancel').onclick=m.querySelector('#orgProfileCancel2').onclick=()=>m.classList.remove('show');
      m.querySelector('#orgProfileForm').onsubmit=saveProfile;
    }
    const p=profile||{};
    const map={orgName:'organization_name',orgDepartment:'department_name',orgContact:'contact_name',orgTitle:'title',orgPhone:'phone',orgCell:'cell',orgWhatsapp:'whatsapp',orgEmail:'email',orgWebsite:'website',orgAddress1:'address_line1',orgAddress2:'address_line2',orgCity:'city',orgState:'state',orgZip:'zip',orgNotes:'notes'};
    Object.entries(map).forEach(([id,key])=>m.querySelector('#'+id).value=p[key]||'');
    m.querySelector('#orgProfileMsg').textContent='';m.classList.add('show');
  }

  async function saveProfile(e){
    e.preventDefault();const m=document.querySelector('#orgProfileModal');const msg=m.querySelector('#orgProfileMsg');msg.textContent='Saving…';
    const p={
      profile_key:'masoras_avos',organization_name:m.querySelector('#orgName').value.trim()||'MASORAS AVOS',department_name:m.querySelector('#orgDepartment').value.trim()||'YMA Kitchen & Maintenance',
      contact_name:m.querySelector('#orgContact').value.trim()||null,title:m.querySelector('#orgTitle').value.trim()||null,phone:m.querySelector('#orgPhone').value.trim()||null,cell:m.querySelector('#orgCell').value.trim()||null,whatsapp:m.querySelector('#orgWhatsapp').value.trim()||null,email:m.querySelector('#orgEmail').value.trim()||null,website:m.querySelector('#orgWebsite').value.trim()||null,address_line1:m.querySelector('#orgAddress1').value.trim()||null,address_line2:m.querySelector('#orgAddress2').value.trim()||null,city:m.querySelector('#orgCity').value.trim()||null,state:m.querySelector('#orgState').value.trim()||null,zip:m.querySelector('#orgZip').value.trim()||null,notes:m.querySelector('#orgNotes').value.trim()||null,updated_at:new Date().toISOString()
    };
    let r;
    if(profile?.id) r=await db.from('organization_profile').update(p).eq('id',profile.id).select().single();
    else r=await db.from('organization_profile').insert(p).select().single();
    if(r.error){msg.textContent=r.error.message;return;}
    profile=r.data;m.classList.remove('show');renderView();
  }

  const bootProfile=()=>{ensureUI();setTimeout(ensureUI,1000)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootProfile);else bootProfile();
})();