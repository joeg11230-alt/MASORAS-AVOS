(()=>{
  function arrangeHome(){
    const nav=document.querySelector('nav');
    const app=document.querySelector('#app');
    if(!nav||!app)return;

    const folder=nav.querySelector('#kitchenFolder');
    let kitchen=nav.querySelector('.tab[data-tab="inventory"]');
    if(folder&&kitchen){
      nav.insertBefore(kitchen,folder);
      folder.remove();
      kitchen.style.width='';
    }

    const profile=nav.querySelector('.tab[data-tab="profile"]');
    kitchen=nav.querySelector('.tab[data-tab="inventory"]');
    const maintenance=nav.querySelector('.tab[data-tab="maintenanceInventory"]');
    const needs=nav.querySelector('.tab[data-tab="needs"]');
    const queues=nav.querySelector('.tab[data-tab="queues"]');
    const receiving=nav.querySelector('.tab[data-tab="receiving"]');
    const vendors=nav.querySelector('.tab[data-tab="vendors"]');

    if(profile) profile.textContent='Organization Profile';
    if(kitchen) kitchen.textContent='KITCHEN';
    if(maintenance) maintenance.textContent='Maintenance Inventory';

    [profile,kitchen,maintenance,needs,queues,receiving,vendors].filter(Boolean).forEach(btn=>nav.appendChild(btn));

    const wanted=new Set(['profile','inventory','maintenanceInventory','needs','queues','receiving','vendors']);
    nav.querySelectorAll('.tab').forEach(btn=>{
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