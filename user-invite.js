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
      addBtn.textContent='+ Invite New User';
      addBtn.onclick=openInvite;
    }
    if(document.querySelector('#inviteUserModal'))return true;
    const modal=document.createElement('div');
    modal.id='inviteUserModal';modal.className='modal';
    modal.innerHTML=`<div class="box" style="max-width:780px">
      <div class="queue-title"><div><h3 style="margin:0">Invite New User</h3><div class="muted">Send an email invitation link and assign access before they sign in.</div></div><button id="inviteClose" type="button">Close</button></div>
      <form id="inviteUserForm" style="margin-top:14px">
        <div class="form"><label>Name<input id="inviteName" placeholder="Full name"></label><label>Email<input id="inviteEmail" type="email" required placeholder="name@example.com"></label><label>Phone<input id="invitePhone" type="tel" placeholder="Phone number"></label><label>Access Level<select id="inviteRole"><option value="viewer">View Only</option><option value="editor">Editor</option></select></label></div>
        <h4 style="margin:16px 0 7px">Sections this user can access</h4>
        <div class="perm-checks">${SECTIONS.map(([key,label])=>`<label><input type="checkbox" name="inviteSection" value="${key}"> ${label}</label>`).join('')}</div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:14px"><input id="inviteActive" type="checkbox" checked style="width:auto"> <b>Active user</b></label>
        <div class="muted" style="margin-top:5px">Inactive users stay on your user list but cannot access Masoras Avos until you reactivate them.</div>
        <div class="row" style="margin-top:16px"><button id="inviteCancel" type="button">Cancel</button><button class="primary" type="submit"><i class="bi bi-envelope-fill"></i> Send Invite Link</button></div><p id="inviteMsg" class="muted"></p>
      </form></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#inviteClose').onclick=modal.querySelector('#inviteCancel').onclick=()=>modal.classList.remove('show');
    modal.querySelector('#inviteUserForm').onsubmit=sendInvite;
    return true;
  }

  function openInvite(){
    ensureInviteUI();const m=document.querySelector('#inviteUserModal');if(!m)return;
    m.querySelector('#inviteName').value='';m.querySelector('#inviteEmail').value='';m.querySelector('#invitePhone').value='';m.querySelector('#inviteRole').value='viewer';m.querySelector('#inviteActive').checked=true;
    m.querySelectorAll('[name="inviteSection"]').forEach(c=>c.checked=false);m.querySelector('#inviteMsg').textContent='';m.classList.add('show');
  }

  async function sendInvite(e){
    e.preventDefault();const m=document.querySelector('#inviteUserModal'),msg=m.querySelector('#inviteMsg');
    const sections=[...m.querySelectorAll('[name="inviteSection"]:checked')].map(c=>c.value);if(!sections.length){msg.textContent='Choose at least one section.';return;}
    const body={display_name:m.querySelector('#inviteName').value.trim()||null,email:m.querySelector('#inviteEmail').value.trim().toLowerCase(),phone:m.querySelector('#invitePhone').value.trim()||null,role:m.querySelector('#inviteRole').value,active:m.querySelector('#inviteActive').checked,sections};
    msg.textContent='Sending invitation…';const {data,error}=await db.functions.invoke('invite-app-user',{body});
    if(error){msg.textContent=error.message||'Could not send invitation.';return;}if(data?.error){msg.textContent=data.error;return;}
    msg.innerHTML='<span class="match">Invite sent to '+body.email+'.</span>';setTimeout(()=>{m.classList.remove('show');window.location.reload()},900);
  }

  let attempts=0;
  const timer=setInterval(()=>{attempts++;if(ensureInviteUI()||attempts>20)clearInterval(timer)},400);
  setTimeout(ensureInviteUI,1500);
})();