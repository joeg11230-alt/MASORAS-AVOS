(()=>{
  let users=[];
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  async function loadUsers(){
    try{
      if(typeof db==='undefined')return;
      const r=await db.from('app_users').select('id,email,display_name,active').eq('active',true).order('display_name',{ascending:true,nullsFirst:false}).order('email');
      if(!r.error)users=r.data||[];
    }catch(e){console.error(e)}
  }
  function enhance(prefix){
    const modal=document.querySelector(`#${prefix}Modal`), hidden=document.querySelector(`#${prefix}Assign`), status=document.querySelector(`#${prefix}Status`);
    if(!modal||!hidden||!status)return;
    const isKitchen=prefix==='kt';
    if(!modal.querySelector(`#${prefix}AssignWrap`)){
      const label=hidden.closest('label');
      if(label){
        const current=hidden.value||'';
        hidden.type='hidden';
        label.firstChild.textContent='Assigned To';
        const wrap=document.createElement('div');wrap.id=`${prefix}AssignWrap`;wrap.style.cssText='display:grid;gap:7px;margin-top:5px';
        wrap.innerHTML=`<select id="${prefix}AssignUser"><option value="">Unassigned</option>${users.map(u=>`<option value="${esc(u.display_name||u.email)}">${esc(u.display_name||u.email)}</option>`).join('')}<option value="__outside__">+ Someone outside the app</option></select><input id="${prefix}AssignOutside" placeholder="Type outside person’s name" style="display:none">`;
        label.appendChild(wrap);
        const sel=wrap.querySelector(`#${prefix}AssignUser`), outside=wrap.querySelector(`#${prefix}AssignOutside`);
        const sync=()=>{if(sel.value==='__outside__'){outside.style.display='block';hidden.value=outside.value.trim()}else{outside.style.display='none';hidden.value=sel.value}};
        sel.onchange=sync;outside.oninput=sync;
        const match=[...sel.options].find(o=>o.value===current);if(match)sel.value=current;else if(current){sel.value='__outside__';outside.value=current;outside.style.display='block'}sync();
      }
    }
    if(!modal.querySelector(`#${prefix}CompletionWrap`)){
      const statusLabel=status.closest('label');
      if(statusLabel){
        const wrap=document.createElement('div');wrap.id=`${prefix}CompletionWrap`;wrap.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin-top:8px';
        wrap.innerHTML=`<button type="button" id="${prefix}NotDone" style="background:#fff7ed;border-color:#f97316;color:#9a3412;font-weight:900">Not Completed</button><button type="button" id="${prefix}Done" style="background:#16a34a;border-color:#15803d;color:white;font-weight:900">✓ Completed</button>`;
        statusLabel.appendChild(wrap);
        wrap.querySelector(`#${prefix}NotDone`).onclick=()=>{status.value='Open';paintCompletion(prefix)};
        wrap.querySelector(`#${prefix}Done`).onclick=()=>{status.value='Completed';paintCompletion(prefix)};
        status.addEventListener('change',()=>paintCompletion(prefix));
      }
    }
    paintCompletion(prefix);
    const save=document.querySelector(`#${prefix}Save`);
    if(save&&!save.dataset.assignCapture){save.dataset.assignCapture='1';save.addEventListener('click',()=>syncAssignment(prefix),true)}
  }
  function syncAssignment(prefix){
    const hidden=document.querySelector(`#${prefix}Assign`),sel=document.querySelector(`#${prefix}AssignUser`),outside=document.querySelector(`#${prefix}AssignOutside`);if(!hidden||!sel)return;
    hidden.value=sel.value==='__outside__'?(outside?.value.trim()||''):sel.value;
  }
  function paintCompletion(prefix){
    const status=document.querySelector(`#${prefix}Status`),done=document.querySelector(`#${prefix}Done`),not=document.querySelector(`#${prefix}NotDone`);if(!status||!done||!not)return;
    const isDone=status.value==='Completed';done.style.boxShadow=isDone?'0 0 0 3px rgba(22,163,74,.25)':'none';not.style.boxShadow=!isDone?'0 0 0 3px rgba(249,115,22,.22)':'none';
  }
  function refreshAssignments(){
    ['kt','mt'].forEach(prefix=>{
      const hidden=document.querySelector(`#${prefix}Assign`),sel=document.querySelector(`#${prefix}AssignUser`),outside=document.querySelector(`#${prefix}AssignOutside`);if(!hidden||!sel)return;
      const current=hidden.value||'';
      sel.innerHTML=`<option value="">Unassigned</option>${users.map(u=>`<option value="${esc(u.display_name||u.email)}">${esc(u.display_name||u.email)}</option>`).join('')}<option value="__outside__">+ Someone outside the app</option>`;
      if([...sel.options].some(o=>o.value===current)){sel.value=current;if(outside)outside.style.display='none'}else if(current){sel.value='__outside__';if(outside){outside.value=current;outside.style.display='block'}}
    });
  }
  const observer=new MutationObserver(()=>{enhance('kt');enhance('mt')});
  const boot=async()=>{await loadUsers();observer.observe(document.body,{childList:true,subtree:true});enhance('kt');enhance('mt');setInterval(async()=>{await loadUsers();refreshAssignments()},30000)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();