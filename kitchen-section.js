(()=>{
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

  function ensureKitchen(){
    const nav=document.querySelector('nav');
    const main=document.querySelector('main.wrap');
    const inventoryBtn=nav?.querySelector('.tab[data-tab="inventory"]');
    if(!nav||!main||!inventoryBtn)return;

    inventoryBtn.style.display='none';
    inventoryBtn.textContent='Inventory';

    let kitchenBtn=nav.querySelector('#kitchenMainTab');
    if(!kitchenBtn){
      kitchenBtn=document.createElement('button');
      kitchenBtn.id='kitchenMainTab';
      kitchenBtn.type='button';
      kitchenBtn.className='tab';
      kitchenBtn.textContent='KITCHEN';
      kitchenBtn.dataset.tab='kitchenHub';
      const profile=nav.querySelector('.tab[data-tab="profile"]');
      if(profile)profile.after(kitchenBtn);else nav.prepend(kitchenBtn);
    }

    let section=document.querySelector('#kitchenHub');
    if(!section){
      section=document.createElement('section');
      section.id='kitchenHub';
      section.className='section';
      section.innerHTML=`
        <div class="card">
          <div class="section-head" style="margin-top:0;border-top:0;padding-top:0">
            <div><h2 style="margin:0">KITCHEN</h2><div class="muted">Kitchen operations</div></div>
          </div>
          <div id="kitchenSubTabs" class="row" style="margin-top:14px;border-bottom:1px solid #d9dee7;padding-bottom:10px">
            <button type="button" class="primary" data-kitchen-page="inventory">Inventory</button>
            <button type="button" data-kitchen-page="recipes">Recipes</button>
            <button type="button" data-kitchen-page="menu">Menu</button>
            <button type="button" data-kitchen-page="prep">PREP AMOUNT</button>
          </div>
          <div id="kitchenLanding" style="padding:18px 0 4px">
            <h3 style="margin-top:0">Kitchen Dashboard</h3>
            <div class="grid">
              <button type="button" class="card" data-kitchen-page="inventory" style="text-align:left"><b>Inventory</b><div class="muted">Kitchen products and stock</div></button>
              <button type="button" class="card" data-kitchen-page="recipes" style="text-align:left"><b>Recipes</b><div class="muted">Kitchen recipe library</div></button>
              <button type="button" class="card" data-kitchen-page="menu" style="text-align:left"><b>Menu</b><div class="muted">Plan and manage menus</div></button>
              <button type="button" class="card" data-kitchen-page="prep" style="text-align:left"><b>PREP AMOUNT</b><div class="muted">Prep quantities and production amounts</div></button>
            </div>
          </div>
          <div id="kitchenPlaceholder" style="display:none;padding:18px 0 4px"></div>
        </div>`;
      main.prepend(section);
    }

    const openHub=()=>{
      document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
      section.classList.add('active');
      nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
      kitchenBtn.classList.add('active');
      section.querySelector('#kitchenLanding').style.display='block';
      section.querySelector('#kitchenPlaceholder').style.display='none';
    };

    kitchenBtn.onclick=openHub;

    section.onclick=e=>{
      const btn=e.target.closest('[data-kitchen-page]');if(!btn)return;
      const page=btn.dataset.kitchenPage;
      if(page==='inventory'){
        if(typeof switchTab==='function')switchTab('inventory');
        else inventoryBtn.click();
        setTimeout(()=>{
          nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
          kitchenBtn.classList.add('active');
        },0);
        return;
      }
      const titles={recipes:'Recipes',menu:'Menu',prep:'PREP AMOUNT'};
      const desc={recipes:'Recipe management will live here.',menu:'Kitchen menu planning will live here.',prep:'Kitchen prep quantities and production amounts will live here.'};
      section.querySelector('#kitchenLanding').style.display='none';
      const box=section.querySelector('#kitchenPlaceholder');
      box.style.display='block';
      box.innerHTML=`<div class="subcard"><h3 style="margin-top:0">${esc(titles[page]||page)}</h3><div class="muted">${esc(desc[page]||'')}</div></div>`;
      section.querySelectorAll('#kitchenSubTabs button').forEach(b=>b.classList.toggle('primary',b.dataset.kitchenPage===page));
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureKitchen);else ensureKitchen();
  setTimeout(ensureKitchen,400);setTimeout(ensureKitchen,1200);
})();