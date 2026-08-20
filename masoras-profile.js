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
    tab.className='tab';tab.dataset.tab='profile';tab.textContent='Organization Profile';
    nav.appendChild(tab);
    const section=document.createElement('section');
    section.id='profile';section.className='section';
    section.innerHTML=`<div class="card" style="max-width:980px;margin:auto"><div style="display:flex;justify-content:flex-end"><button id="editOrgProfile" class="primary" type="button"><i class="bi bi-pencil-square"></i> Edit Profile</button></div><div id="orgProfileView" style="margin-top:14px"></div></div>`;
    main.appendChild(section);
    tab.onclick=()=>{ if(typeof switchTab==='function') switchTab('profile'); loadProfile(); };
  }

  async function loadProfile(){
    ensureUI();const view=document.querySelector('#orgProfileView');if(!view)return;
    view.innerHTML='<div class="muted">Loading profile…</div>';
    const r=await db.from('organization_profile').select('*').eq('profile_key','masoras_avos').maybeSingle();
    if(r.error){view.innerHTML='<div class="short">'+esc(r.error.message)+'</div>';return;}
    profile=r.data||{profile_key:'masoras_avos',organization_name:'MASORAS AVOS'};renderView();
  }

  function addressLine(p){return [p.address_line1,p.address_line2,[p.city,p.state,p.zip].filter(Boolean).join(', ')].filter(Boolean).join('<br>');}

  function renderView(){
    const p=profile||{},wa=digits(p.whatsapp||p.cell||p.phone),addr=addressLine(p),parts=[];
    if(p.contact_name||p.title||addr){parts.push(`<div class="subcard">${p.contact_name?`<div style="font-size:20px;font-weight:800">${esc(p.contact_name)}</div>`:''}${p.title?`<div class="muted">${esc(p.title)}</div>`:''}${addr?`<div style="margin-top:10px">${addr}</div>`:''}</div>`);}
    const contacts=[];
    if(p.phone)contacts.push(`<div class="contact-line"><b>Phone:</b> <a href="tel:${esc(p.phone)}">${esc(p.phone)}</a></div>`);
    if(p.cell)contacts.push(`<div class="contact-line"><b>Cell:</b> <a href="tel:${esc(p.cell)}">${esc(p.cell)}</a></div>`);
    if(p.whatsapp)contacts.push(`<div class="contact-line"><b>WhatsApp:</b> <a class="iconlink" target="_blank" rel="noopener" href="https://wa.me/${wa}"><i class="bi bi-whatsapp"></i>${esc(p.whatsapp)}</a></div>`);
    if(p.email)contacts.push(`<div class="contact-line"><b>Email:</b> <a class="iconlink" href="mailto:${encodeURIComponent(p.email)}"><i class="bi bi-envelope-fill"></i>${esc(p.email)}</a></div>`);
    if(p.website)contacts.push(`<div class="contact-line"><b>Website:</b> <a target="_blank" rel="noopener" href="${esc(/^https?:\/\//i.test(p.website)?p.website:'https://'+p.website)}">${esc(p.website)}</a></div>`);
    if(contacts.length)parts.push(`<div class="subcard">${contacts.join('')}</div>`);
    if(p.notes)parts.push(`<div class="subcard" style="white-space:pre-wrap">${esc(p.notes)}</div>`);
    document.querySelector('#orgProfileView').innerHTML=parts.length?`<div style="display:grid;gap:12px">${parts.join('')}</div>`:'<div class="muted">Use Edit Profile to add organization information.</div>';
    document.querySelector('#editOrgProfile').onclick=openEdit;
  }

  function openEdit(){
    let m=document.querySelector('#orgProfileModal');
    if(!m){m=document.createElement('div');m.id='orgProfileModal';m.className='modal';m.innerHTML=`<div class="box"><div class="queue-title"><h3>Organization Profile</h3><button id="orgProfileCancel" type="button">Close</button></div><form id="orgProfileForm" class="form" style="margin-top:12px"><label>Organization Name<input id="orgName" required></label><label>Department Name<input id="orgDepartment"></label><label>Contact Name<input id="orgContact"></label><label>Title / Position<input id="orgTitle"></label><label>Phone<input id="orgPhone" type="tel"></label><label>Cell<input id="orgCell" type="tel"></label><label>WhatsApp<input id="orgWhatsapp" type="tel"></label><label>Email<input id="orgEmail" type="email"></label><label class="full">Website<input id="orgWebsite" placeholder="https://..."></label><label>Address Line 1<input id="orgAddress1"></label><label>Address Line 2<input id="orgAddress2"></label><label>City<input id="orgCity"></label><label>State<input id="orgState"></label><label>ZIP<input id="orgZip"></label><label class="full">Notes<textarea id="orgNotes" rows="5"></textarea></label><div class="full row"><button id="orgProfileCancel2" type="button">Cancel</button><button class="primary">Save Profile</button></div></form><p id="orgProfileMsg" class="muted"></p></div>`;document.body.appendChild(m);m.querySelector('#orgProfileCancel').onclick=m.querySelector('#orgProfileCancel2').onclick=()=>m.classList.remove('show');m.querySelector('#orgProfileForm').onsubmit=saveProfile;}
    const p=profile||{},map={orgName:'organization_name',orgDepartment:'department_name',orgContact:'contact_name',orgTitle:'title',orgPhone:'phone',orgCell:'cell',orgWhatsapp:'whatsapp',orgEmail:'email',orgWebsite:'website',orgAddress1:'address_line1',orgAddress2:'address_line2',orgCity:'city',orgState:'state',orgZip:'zip',orgNotes:'notes'};
    Object.entries(map).forEach(([id,key])=>m.querySelector('#'+id).value=p[key]||'');m.querySelector('#orgProfileMsg').textContent='';m.classList.add('show');
  }

  async function saveProfile(e){e.preventDefault();const m=document.querySelector('#orgProfileModal'),msg=m.querySelector('#orgProfileMsg');msg.textContent='Saving…';const p={profile_key:'masoras_avos',organization_name:m.querySelector('#orgName').value.trim()||'MASORAS AVOS',department_name:m.querySelector('#orgDepartment').value.trim()||null,contact_name:m.querySelector('#orgContact').value.trim()||null,title:m.querySelector('#orgTitle').value.trim()||null,phone:m.querySelector('#orgPhone').value.trim()||null,cell:m.querySelector('#orgCell').value.trim()||null,whatsapp:m.querySelector('#orgWhatsapp').value.trim()||null,email:m.querySelector('#orgEmail').value.trim()||null,website:m.querySelector('#orgWebsite').value.trim()||null,address_line1:m.querySelector('#orgAddress1').value.trim()||null,address_line2:m.querySelector('#orgAddress2').value.trim()||null,city:m.querySelector('#orgCity').value.trim()||null,state:m.querySelector('#orgState').value.trim()||null,zip:m.querySelector('#orgZip').value.trim()||null,notes:m.querySelector('#orgNotes').value.trim()||null,updated_at:new Date().toISOString()};const r=await db.from('organization_profile').upsert(p,{onConflict:'profile_key'}).select().single();if(r.error){msg.textContent=r.error.message;return;}profile=r.data;m.classList.remove('show');renderView();}

  const bootProfile=()=>{ensureUI();setTimeout(ensureUI,1000)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootProfile);else bootProfile();
})();