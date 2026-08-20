(()=>{
  function arrangeHome(){
    const nav=document.querySelector('nav');
    const app=document.querySelector('#app');
    if(!nav||!app)return;

    const folder=nav.querySelector('#kitchenFolder');
    let inventory=nav.querySelector('.tab[data-tab="inventory"]');
    if(folder&&inventory){nav.insertBefore(inventory,folder);folder.remove();inventory.style.width='';}

    const profile=nav.querySelector('.tab[data-tab="profile"]');
    inventory=nav.querySelector('.tab[data-tab="inventory"]');
    const kitchenHub=nav.querySelector('#kitchenMainTab');
    const maintenanceInventory=nav.querySelector('.tab[data-tab="maintenanceInventory"]');
    const maintenanceHub=nav.querySelector('#maintenanceMainTab');
    const hallHub=nav.querySelector('#hallMainTab');
    const needs=nav.querySelector('.tab[data-tab="needs"]');
    const queues=nav.querySelector('.tab[data-tab="queues"]');
    const receiving=nav.querySelector('.tab[data-tab="receiving"]');
    const vendors=nav.querySelector('.tab[data-tab="vendors"]');

    if(profile) profile.textContent='Organization Profile';
    if(inventory){inventory.textContent='Inventory';inventory.hidden=!!kitchenHub;inventory.style.display=kitchenHub?'none':'';}
    if(kitchenHub)kitchenHub.textContent='Kitchen';
    if(maintenanceInventory){maintenanceInventory.textContent='Inventory';maintenanceInventory.hidden=!!maintenanceHub;maintenanceInventory.style.display=maintenanceHub?'none':'';}
    if(maintenanceHub)maintenanceHub.textContent='Maintenance';
    if(hallHub)hallHub.textContent='Hall';

    [profile,kitchenHub||inventory,maintenanceHub||maintenanceInventory,hallHub,needs,queues,receiving,vendors].filter(Boolean).forEach(btn=>nav.appendChild(btn));

    const wanted=new Set(['profile','inventory','maintenanceInventory','needs','queues','receiving','vendors','kitchenHub','maintenanceHub','hallHub']);
    nav.querySelectorAll('.tab').forEach(btn=>{
      if(btn.id==='kitchenMainTab'||btn.id==='maintenanceMainTab'||btn.id==='hallMainTab')return;
      if(!wanted.has(btn.dataset.tab)) btn.style.display='none';
    });
  }

  let landed=false;
  function landOnProfile(){arrangeHome();const app=document.querySelector('#app');const profile=document.querySelector('nav .tab[data-tab="profile"]');if(!app||app.hidden||!profile||landed)return;landed=true;profile.click();}
  function init(){arrangeHome();setTimeout(arrangeHome,300);setTimeout(arrangeHome,900);setTimeout(arrangeHome,1600);const app=document.querySelector('#app');if(app){new MutationObserver(()=>{if(app.hidden){landed=false;return;}setTimeout(landOnProfile,50);}).observe(app,{attributes:true,attributeFilter:['hidden']});}setTimeout(landOnProfile,500);setTimeout(landOnProfile,1200);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();