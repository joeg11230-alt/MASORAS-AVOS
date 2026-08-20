(()=>{
  const SECTIONS=[
    ['organization_profile','Organization Profile','profile'],
    ['kitchen','Kitchen Inventory','inventory'],
    ['maintenance','Maintenance Inventory','maintenanceInventory'],
    ['needs_ordering','Needs Ordering','needs'],
    ['order_queues','Order Queues','queues'],
    ['receiving','Receiving','receiving'],
    ['vendors','Vendors','vendors']
  ];
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  let me=null,managedUsers=[];

  const canSection=key=>!!me&&(me.role==='owner'||(me.sections||[]).includes(key));
  const canEdit=key=>canSection(key)&&['owner','editor'].includes(me?.role);

  async function loadMe(){
    const {data:{session}}=await db.auth.getSession();
    if(!session)return;
    const email=session.user.email||'';
    const r=await db.from('app_users').select('*').ilike('email',email).maybeSingle();
    if(r.error){console.error(r.error);return;}
    me=r.data||{email,role:'none',sections:[],active:false};
    applyPermissions();
    if(me.role==='owner')await loadManagedUsers();
  }

  function roleBadge(){
    const who=document.querySelector('#who'); if(!who||!me)return;
    let b=document.querySelector('#permissionRoleBadge');
    if(!b){b=document.createElement('span');b.id='permissionRoleBadge';b.style.cssText='margin-left:8px;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:800;background:#e8f1f8;color:#123b60';who.after(b)}
    b.textContent=me.role==='owner'?'OWNER':me.role==='editor'?'EDITOR':me.role==='viewer'?'VIEW ONLY':'NO ACCESS';
  }

  function applyPermissions(){
    if(!me)return;
    roleBadge();
    if(!me.active||me.role==='none'){
      const app=document.querySelector('#app');
      if(app)app.innerHTML='<div class="wrap"><div class="card"><h2>Access not assigned</h2><p>Your account is signed in, but an owner has not granted access yet.</p><button id="permissionSignout">Sign Out</button></div></div>';
      document.querySelector('#permissionSignout')?.addEventListener('click',()=>db.auth.signOut());
      return;
    }
    SECTIONS.forEach(([key,label,tab])=>{
      document.querySelectorAll(`nav .tab[data-tab="${tab}"]`).forEach(btn=>btn.style.display=canSection(key)?'':'none');
    });
    const active=document.querySelector('nav .tab.active');
    if(active&&active.style.display==='none'){
      const first=SECTIONS.find(([key,,tab])=>canSection(key)&&document.querySelector(`nav .tab[data-tab="${tab}"]`));
      if(first)document.querySelector(`nav .tab[data-tab="${first[2]}"]`)?.click();
    }
    applyActionVisibility();
    ensureUsersPanel();
  }

  function hide(sel,hide=true){document.querySelectorAll(sel).forEach(el=>el.style.display=hide?'none':'')}
  function applyActionVisibility(){
    if(!me)return;
    const viewer=me.role==='viewer';
    hide('#editOrgProfile',!canEdit('organization_profile'));
    hide('#addVendor',!canEdit('vendors'));
    hide('#addManualQueue',!canEdit('order_queues'));
    hide('.add-q,.add-all',!(canEdit('needs_ordering')||canEdit('order_queues')));
    hide('.remove-q,.fix-remove,.close-order,.fix-close,.create-po,.fix-po,.manual-for-vendor,.fix-manual',!canEdit('order_queues'));
    hide('.receive-all,.receive-match-invoice',!canEdit('receiving'));
    hide('#profileEdit',viewer);
    hide('#profileQueue',!(canEdit('needs_ordering')||canEdit('order_queues')));
    document.body.classList.toggle('view-only-mode',viewer);
    let style=document.querySelector('#permissionStyles');
    if(!style){style=document.createElement('style');style.id='permissionStyles';style.textContent=`
      .permissions-card{margin-top:16px;border-top:4px solid #16a3a5}.perm-grid{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}.perm-user{padding:12px;border:1px solid #dce3eb;border-radius:12px;background:#fbfdff}.perm-sections{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.perm-chip{padding:4px 7px;border-radius:999px;background:#eaf4ff;color:#123b60;font-size:11px;font-weight:700}.perm-role{font-size:11px;font-weight:800;padding:4px 8px;border-radius:999px;background:#eef2f6}.perm-owner{background:#fff1c7;color:#7c5700}.perm-editor{background:#dff7ef;color:#126449}.perm-viewer{background:#edf1f5;color:#4b5968}.perm-checks{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin-top:8px}.perm-checks label{display:flex;gap:7px;align-items:center;border:1px solid #dce3eb;border-radius:9px;padding:8px;background:#fff}.perm-checks input{width:auto}.view-only-note{background:#fff7d6;border:1px solid #ecd87b;padding:9px 12px;border-radius:10px;margin:10px 0;font-weight:700}
    `;document.head.appendChild(style)}
    let note=document.querySelector('#viewOnlyNote');
    if(viewer&&!note){note=document.createElement('div');note.id='viewOnlyNote';note.className='view-only-note';note.textContent='View Only access — changes are disabled for this account.';document.querySelector('main.wrap')?.prepend(note)}
    if(!viewer&&note)note.remove();
  }

  async function loadManagedUsers(){
    if(me?.role!=='owner')return;
    const r=await db.from('app_users').select('*').order('role').order('email');
    if(r.error){console.error(r.error);return;}
    managedUsers=r.data||[];
    renderUsers();
  }

  function ensureUsersPanel(){
    const profile=document.querySelector('#profile');
    if(!profile)return;
    let panel=document.querySelector('#usersPermissionsCard');
    if(me?.role!=='owner'){panel?.remove();return;}
    if(!panel){
      panel=document.createElement('div');panel.id='usersPermissionsCard';panel.className='card permissions-card';panel.style.maxWidth='980px';panel.style.margin='16px auto 0';
      panel.innerHTML='<div class="queue-title"><div><h2 style="margin:0">Users & Permissions</h2><div class="muted">Control what each user can see and whether they can make changes.</div></div><button id="addPermissionUser" class="primary" type="button">+ Add User</button></div><div id="permissionUsersList" style="margin-top:12px"></div>';
      profile.appendChild(panel);
      panel.querySelector('#addPermissionUser').onclick=()=>openUserEditor(null);
    }
    renderUsers();
  }

  function renderUsers(){
    const list=document.querySelector('#permissionUsersList');if(!list||me?.role!=='owner')return;
    list.innerHTML=managedUsers.length?managedUsers.map(u=>{
      const roleClass=u.role==='owner'?'perm-owner':u.role==='editor'?'perm-editor':'perm-viewer';
      const chips=(u.sections||[]).map(k=>SECTIONS.find(s=>s[0]===k)?.[1]||k).map(x=>`<span class="perm-chip">${esc(x)}</span>`).join('');
      return `<div class="perm-user"><div class="perm-grid"><div><b>${esc(u.email)}</b> <span class="perm-role ${roleClass}">${u.role==='viewer'?'VIEW ONLY':u.role.toUpperCase()}</span>${u.active?'':' <span class="perm-role" style="background:#ffe3e3;color:#8b1b1b">INACTIVE</span>'}<div class="perm-sections">${u.role==='owner'?'<span class="perm-chip">All Sections</span>':chips||'<span class="muted">No sections assigned</span>'}</div></div><div>${u.role==='owner'?'<span class="muted">Owner</span>':`<button class="edit-perm" data-id="${u.id}">Edit</button>`}</div></div></div>`;
    }).join(''):'<div class="muted">No users added yet.</div>';
    list.querySelectorAll('.edit-perm').forEach(b=>b.onclick=()=>openUserEditor(Number(b.dataset.id)));
  }

  function openUserEditor(id){
    let modal=document.querySelector('#permissionUserModal');
    if(!modal){
      modal=document.createElement('div');modal.id='permissionUserModal';modal.className='modal';
      modal.innerHTML=`<div class="box" style="max-width:760px"><div class="queue-title"><h3 id="permModalTitle">User Permissions</h3><button id="permModalClose" type="button">Close</button></div><form id="permissionUserForm" style="margin-top:12px"><input id="permUserId" type="hidden"><div class="form"><label>Email<input id="permEmail" type="email" required></label><label>Access Level<select id="permRole"><option value="viewer">View Only</option><option value="editor">Editor</option></select></label></div><h4 style="margin-bottom:6px">Sections this user can access</h4><div class="perm-checks">${SECTIONS.map(([key,label])=>`<label><input type="checkbox" name="permSection" value="${key}"> ${label}</label>`).join('')}</div><label style="display:flex;gap:8px;align-items:center;margin-top:12px"><input id="permActive" type="checkbox" checked style="width:auto"> Active user</label><div class="row" style="margin-top:14px"><button id="permCancel" type="button">Cancel</button><button id="permDelete" type="button" class="danger">Remove User</button><button class="primary">Save Permissions</button></div><p id="permMsg" class="muted"></p></form></div>`;
      document.body.appendChild(modal);
      modal.querySelector('#permModalClose').onclick=modal.querySelector('#permCancel').onclick=()=>modal.classList.remove('show');
      modal.querySelector('#permissionUserForm').onsubmit=saveUser;
      modal.querySelector('#permDelete').onclick=deleteUser;
    }
    const u=id?managedUsers.find(x=>Number(x.id)===Number(id)):null;
    modal.querySelector('#permUserId').value=u?.id||'';
    modal.querySelector('#permEmail').value=u?.email||'';
    modal.querySelector('#permEmail').disabled=!!u;
    modal.querySelector('#permRole').value=u?.role==='editor'?'editor':'viewer';
    modal.querySelector('#permActive').checked=u?.active!==false;
    modal.querySelectorAll('[name="permSection"]').forEach(c=>c.checked=!!u?.sections?.includes(c.value));
    modal.querySelector('#permDelete').style.display=u?'':'none';
    modal.querySelector('#permMsg').textContent='';
    modal.querySelector('#permModalTitle').textContent=u?'Edit User Permissions':'Add User';
    modal.classList.add('show');
  }

  async function saveUser(e){
    e.preventDefault();
    const m=document.querySelector('#permissionUserModal'),id=Number(m.querySelector('#permUserId').value||0),email=m.querySelector('#permEmail').value.trim().toLowerCase(),role=m.querySelector('#permRole').value,active=m.querySelector('#permActive').checked,sections=[...m.querySelectorAll('[name="permSection"]:checked')].map(c=>c.value),msg=m.querySelector('#permMsg');
    if(!email)return;
    if(!sections.length){msg.textContent='Choose at least one section.';return;}
    msg.textContent='Saving…';
    const payload={email,role,active,sections,updated_at:new Date().toISOString()};
    const r=id?await db.from('app_users').update(payload).eq('id',id):await db.from('app_users').insert(payload);
    if(r.error){msg.textContent=r.error.message;return;}
    m.classList.remove('show');await loadManagedUsers();
  }

  async function deleteUser(){
    const m=document.querySelector('#permissionUserModal'),id=Number(m.querySelector('#permUserId').value||0);if(!id)return;
    if(!confirm('Remove this user from Masoras Avos access?'))return;
    const r=await db.from('app_users').delete().eq('id',id);if(r.error)return alert(r.error.message);
    m.classList.remove('show');await loadManagedUsers();
  }

  function watch(){
    const app=document.querySelector('#app');
    if(app)new MutationObserver(()=>{if(!app.hidden)setTimeout(loadMe,100)}).observe(app,{attributes:true,attributeFilter:['hidden']});
    const nav=document.querySelector('nav');
    if(nav)new MutationObserver(()=>{if(me)setTimeout(applyPermissions,0)}).observe(nav,{childList:true,subtree:true});
    document.addEventListener('click',()=>{if(me)setTimeout(applyActionVisibility,0)},true);
    setTimeout(loadMe,600);setTimeout(loadMe,1500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
})();