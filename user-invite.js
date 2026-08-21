(()=>{
  const SECTIONS=[
    ['organization_profile','Organization Profile'],
    ['kitchen','Kitchen Inventory'],
    ['maintenance','Maintenance Inventory'],
    ['needs_ordering','Needs Ordering'],
    ['order_queues','Order Queues'],
    ['receiving','Receiving'],
    ['vendors','Vendors']
  ];

  function ensureInviteUI(){
    const panel=document.querySelector('#usersPermissionsCard');
    const addBtn=document.querySelector('#addPermissionUser');
    if(!panel||!addBtn)return false;
    if(addBtn.dataset.inviteReady!=='1'){
      addBtn.dataset.inviteReady='1';
      addBtn.textContent='+ Invite / Add New User';
      addBtn.onclick=openInvite;
    }
    if(document.querySelector('#inviteUserModal'))return true;
    const modal=document.createElement('div');
    modal.id='inviteUserModal';modal.className='modal';
    modal.innerHTML=`<div class="box" style="max-width:780px">
      <div class="queue-title"><div><h3 style="margin:0">Add New User</h3><div class="muted">Save the user manually, or send an email invitation link.</div></div><button id="inviteClose" type="button">Close</button></div>
      <form id="inviteUserForm" style="margin-top:14px">
        <div class="form"><label>Name<input id="inviteName" placeholder="Full name"></label><label>Email<input id="inviteEmail" type="email" required placeholder="name@example.com"></label><label>Phone<input id="invitePhone" type="tel" placeholder="Phone number"></label><label>Access Level<select id="inviteRole"><option value="viewer">View Only</option><option value="editor">Editor</option></select></label></div>
        <h4 style="margin:16px 0 7px">Sections this user can access</h4>
        <div class="perm-checks">${SECTIONS.map(([key,label])=>`<label><input type="checkbox" name="inviteSection" value="${key}"> ${label}</label>`).join('')}</div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:14px"><input id="inviteActive" type="checkbox" checked style="width:auto"> <b>Active user</b></label>
        <div class="muted" style="margin-top:5px">Manual save creates the user access record. The user can then create/sign in with the same email. Invite sends the signup link by email.</div>
        <div class="row" style="margin-top:16px"><button id="inviteCancel" type="button">Cancel</button><button id="saveManualUser" type="button" style="background:#eef6ff;border-color:#2563eb;color:#174ea6;font-weight:800">Save User Manually</button><button class="primary" type="submit"><i class="bi bi-envelope-fill"></i> Send Invite Link</button></div><p id="inviteMsg" class="muted"></p>
      </form></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#inviteClose').onclick=modal.querySelector('#inviteCancel').onclick=()=>modal.classList.remove('show');
    modal.querySelector('#inviteUserForm').onsubmit=sendInvite;
    modal.querySelector('#saveManualUser').onclick=saveManualUser;
    return true;
  }

  function openInvite(){
    ensureInviteUI();const m=document.querySelector('#inviteUserModal');if(!m)return;
    m.querySelector('#inviteName').value='';m.querySelector('#inviteEmail').value='';m.querySelector('#invitePhone').value='';m.querySelector('#inviteRole').value='viewer';m.querySelector('#inviteActive').checked=true;
    m.querySelectorAll('[name="inviteSection"]').forEach(c=>c.checked=false);m.querySelector('#inviteMsg').textContent='';m.classList.add('show');
  }

  function readForm(){
    const m=document.querySelector('#inviteUserModal');
    const sections=[...m.querySelectorAll('[name="inviteSection"]:checked')].map(c=>c.value);
    return {m,sections,body:{display_name:m.querySelector('#inviteName').value.trim()||null,email:m.querySelector('#inviteEmail').value.trim().toLowerCase(),phone:m.querySelector('#invitePhone').value.trim()||null,role:m.querySelector('#inviteRole').value,active:m.querySelector('#inviteActive').checked,sections}};
  }

  function validate(body,sections,msg){
    if(!body.email){msg.textContent='Enter an email address.';return false;}
    if(!sections.length){msg.textContent='Choose at least one section.';return false;}
    return true;
  }

  async function saveManualUser(){
    const {m,sections,body}=readForm(),msg=m.querySelector('#inviteMsg');if(!validate(body,sections,msg))return;
    msg.textContent='Saving user…';
    const now=new Date().toISOString();
    const payload={email:body.email,display_name:body.display_name,phone:body.phone,role:body.role==='editor'?'editor':'viewer',sections:body.sections,active:body.active,invite_status:'manual',updated_at:now};
    const r=await db.from('app_users').upsert(payload,{onConflict:'email'}).select().single();
    if(r.error){msg.textContent='Could not save user: '+r.error.message;return;}
    msg.innerHTML='<span class="match">User saved manually ✓</span>';
    setTimeout(()=>{m.classList.remove('show');window.location.reload()},700);
  }

  async function sendInvite(e){
    e.preventDefault();const {m,sections,body}=readForm(),msg=m.querySelector('#inviteMsg');if(!validate(body,sections,msg))return;
    msg.textContent='Sending invitation…';
    try{
      const {data,error}=await db.functions.invoke('invite-app-user',{body});
      if(error){
        let detail=error.message||'Could not send invitation.';
        try{const ctx=error.context;if(ctx?.json){const j=await ctx.json();if(j?.error)detail=j.error;}}catch(_){ }
        msg.textContent='Invite failed: '+detail;return;
      }
      if(data?.error){msg.textContent='Invite failed: '+data.error;return;}
      msg.innerHTML='<span class="match">Invite sent to '+body.email+' ✓</span>';setTimeout(()=>{m.classList.remove('show');window.location.reload()},900);
    }catch(err){msg.textContent='Invite failed: '+(err?.message||err);}
  }

  let attempts=0;
  const timer=setInterval(()=>{attempts++;if(ensureInviteUI()||attempts>20)clearInterval(timer)},400);
  setTimeout(ensureInviteUI,1500);
})();