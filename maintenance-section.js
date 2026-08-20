(()=>{
  function ensureMaintenance(){
    const nav=document.querySelector('nav');
    const main=document.querySelector('main.wrap');
    const inventoryBtn=nav?.querySelector('.tab[data-tab="maintenanceInventory"]');
    if(!nav||!main||!inventoryBtn)return;

    inventoryBtn.hidden=true;
    inventoryBtn.style.display='none';
    inventoryBtn.textContent='Inventory';

    let maintenanceBtn=nav.querySelector('#maintenanceMainTab');
    if(!maintenanceBtn){
      maintenanceBtn=document.createElement('button');
      maintenanceBtn.id='maintenanceMainTab';
      maintenanceBtn.type='button';
      maintenanceBtn.className='tab';
      maintenanceBtn.textContent='Maintenance';
      maintenanceBtn.dataset.tab='maintenanceHub';
      const kitchen=nav.querySelector('#kitchenMainTab');
      const profile=nav.querySelector('.tab[data-tab="profile"]');
      if(kitchen)kitchen.after(maintenanceBtn);else if(profile)profile.after(maintenanceBtn);else nav.prepend(maintenanceBtn);
    }

    let section=document.querySelector('#maintenanceHub');
    if(!section){
      section=document.createElement('section');
      section.id='maintenanceHub';
      section.className='section';
      section.innerHTML=`
        <div class="card">
          <div class="section-head" style="margin-top:0;border-top:0;padding-top:0">
            <div><h2 style="margin:0">Maintenance</h2><div class="muted">Maintenance operations</div></div>
          </div>
          <div id="maintenanceSubTabs" class="row" style="margin-top:14px;border-bottom:1px solid #d9dee7;padding-bottom:10px">
            <button type="button" class="primary" data-maintenance-page="inventory">Inventory</button>
          </div>
          <div id="maintenanceLanding" style="padding:18px 0 4px">
            <h3 style="margin-top:0">Maintenance Dashboard</h3>
            <div class="grid">
              <button type="button" class="card" data-maintenance-page="inventory" style="text-align:left"><b>Inventory</b><div class="muted">Maintenance products and stock</div></button>
            </div>
          </div>
        </div>`;
      main.prepend(section);
    }

    const openHub=()=>{
      document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
      section.classList.add('active');
      nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
      maintenanceBtn.classList.add('active');
    };
    maintenanceBtn.onclick=openHub;

    section.onclick=e=>{
      const btn=e.target.closest('[data-maintenance-page]');if(!btn)return;
      if(btn.dataset.maintenancePage==='inventory'){
        if(typeof switchTab==='function')switchTab('maintenanceInventory');
        else inventoryBtn.click();
        setTimeout(()=>{nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));maintenanceBtn.classList.add('active');},0);
      }
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureMaintenance);else ensureMaintenance();
  setTimeout(ensureMaintenance,500);setTimeout(ensureMaintenance,1300);
})();
