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
    if(!section){section=document.createElement('section');section.id='maintenanceHub';section.className='section';main.prepend(section);}
    section.innerHTML=`
      <div class="card">
        <div class="section-head" style="margin-top:0;border-top:0;padding-top:0"><div><h2 style="margin:0">Maintenance</h2><div class="muted">Maintenance operations</div></div></div>
        <div id="maintenanceSubTabs" class="row" style="margin-top:14px;border-bottom:1px solid #d9dee7;padding-bottom:10px">
          <button type="button" data-maintenance-page="todo">To Do</button>
          <button type="button" data-maintenance-page="inventory">Inventory</button>
          <button type="button" data-maintenance-page="needs">Needs Ordering</button>
          <button type="button" data-maintenance-page="queues">Order Queue</button>
        </div>
        <div id="maintenanceLanding" style="padding:18px 0 4px"><h3 style="margin-top:0">Maintenance Dashboard</h3><div class="grid">
          <button type="button" class="card" data-maintenance-page="todo" style="text-align:left"><b>To Do</b><div class="muted">Maintenance tasks and work list</div></button>
          <button type="button" class="card" data-maintenance-page="inventory" style="text-align:left"><b>Inventory</b><div class="muted">Maintenance products and stock</div></button>
          <button type="button" class="card" data-maintenance-page="needs" style="text-align:left"><b>Needs Ordering</b><div class="muted">Maintenance items that need replenishment</div></button>
          <button type="button" class="card" data-maintenance-page="queues" style="text-align:left"><b>Order Queue</b><div class="muted">Maintenance orders waiting to be placed</div></button>
        </div></div>
        <div id="maintenancePlaceholder" style="display:none;padding:18px 0 4px"></div>
      </div>`;

    const setMaintenanceActive=()=>{nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));maintenanceBtn.classList.add('active');};
    const openHub=()=>{document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));section.classList.add('active');setMaintenanceActive();section.querySelector('#maintenanceLanding').style.display='block';section.querySelector('#maintenancePlaceholder').style.display='none';};
    maintenanceBtn.onclick=openHub;

    section.onclick=e=>{
      const btn=e.target.closest('[data-maintenance-page]');if(!btn)return;
      const page=btn.dataset.maintenancePage;
      if(page==='todo'){
        section.querySelector('#maintenanceLanding').style.display='none';
        const box=section.querySelector('#maintenancePlaceholder');box.style.display='block';
        box.innerHTML='<div class="subcard"><h3 style="margin-top:0">To Do</h3><div class="muted">Maintenance tasks and work list will be managed here.</div></div>';
        setMaintenanceActive();return;
      }
      if(page==='inventory'){
        if(typeof switchTab==='function')switchTab('maintenanceInventory');else inventoryBtn.click();setTimeout(setMaintenanceActive,0);return;
      }
      if(['needs','queues'].includes(page)){
        if(typeof switchTab==='function')switchTab(page);else nav.querySelector(`.tab[data-tab="${page}"]`)?.click();setTimeout(setMaintenanceActive,0);
      }
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureMaintenance);else ensureMaintenance();
  setTimeout(ensureMaintenance,500);setTimeout(ensureMaintenance,1300);
})();