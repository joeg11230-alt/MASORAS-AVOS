(()=>{
  function arrangeHome(){
    const nav=document.querySelector('nav');
    const app=document.querySelector('#app');
    if(!nav||!app)return;

    const profile=nav.querySelector('.tab[data-tab="profile"]');
    const kitchen=nav.querySelector('.tab[data-tab="inventory"]');
    const maintenance=nav.querySelector('.tab[data-tab="maintenanceInventory"]');
    const needs=nav.querySelector('.tab[data-tab="needs"]');
    const queues=nav.querySelector('.tab[data-tab="queues"]');
    const receiving=nav.querySelector('.tab[data-tab="receiving"]');
    const vendors=nav.querySelector('.tab[data-tab="vendors"]');

    if(profile) profile.textContent='Organization Profile';
    if(kitchen) kitchen.textContent='Kitchen Inventory';
    if(maintenance) maintenance.textContent='Maintenance Inventory';

    let folder=nav.querySelector('#kitchenFolder');
    if(kitchen){
      if(!folder){
        folder=document.createElement('div');
        folder.id='kitchenFolder';
        folder.style.cssText='display:flex;flex-direction:column;gap:4px;width:100%;';
        const head=document.createElement('button');
        head.type='button';head.id='kitchenFolderHead';head.className='tab';
        head.innerHTML='<span style="margin-right:7px">📁</span><b>KITCHEN</b><span id="kitchenFolderArrow" style="margin-left:auto">▾</span>';
        const sub=document.createElement('div');sub.id='kitchenFolderSub';sub.style.cssText='display:block;padding-left:18px;';
        kitchen.parentNode.insertBefore(folder,kitchen);folder.append(head,sub);sub.appendChild(kitchen);
        kitchen.style.width='100%';
        head.onclick=()=>{const open=sub.style.display!=='none';sub.style.display=open?'none':'block';head.querySelector('#kitchenFolderArrow').textContent=open?'▸':'▾';};
      }else{
        const sub=folder.querySelector('#kitchenFolderSub');if(sub&&!sub.contains(kitchen))sub.appendChild(kitchen);
      }
    }

    [profile,folder,maintenance,needs,queues,receiving,vendors].filter(Boolean).forEach(el=>nav.appendChild(el));

    const wanted=new Set(['profile','inventory','maintenanceInventory','needs','queues','receiving','vendors']);
    nav.querySelectorAll('.tab').forEach(btn=>{
      if(btn.id==='kitchenFolderHead')return;
      if(!wanted.has(btn.dataset.tab)) btn.style.display='none';
    });
  }

  let landed=false;
  function landOnProfile(){
    arrangeHome();
    const app=document.querySelector('#app');
    const profile=document.querySelector('nav .tab[data-tab="profile"]');
    if(!app||app.hidden||!profile||landed)return;
    landed=true;
    profile.click();
  }

  function init(){
    arrangeHome();
    setTimeout(arrangeHome,300);
    setTimeout(arrangeHome,900);
    const app=document.querySelector('#app');
    if(app){
      new MutationObserver(()=>{
        if(app.hidden){landed=false;return;}
        setTimeout(landOnProfile,50);
      }).observe(app,{attributes:true,attributeFilter:['hidden']});
    }
    setTimeout(landOnProfile,500);
    setTimeout(landOnProfile,1200);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();