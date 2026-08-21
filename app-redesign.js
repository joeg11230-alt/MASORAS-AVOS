(()=>{
  const style=document.createElement('style');
  style.id='ma2026Redesign';
  style.textContent=`
    :root{--ma26-navy:#183b66;--ma26-blue:#2563eb;--ma26-teal:#0f8b8d;--ma26-green:#16865b;--ma26-gold:#d99416;--ma26-purple:#7c3aed;--ma26-red:#c33b52;--ma26-ink:#17263a;--ma26-bg:#eef3f8}
    body{background:radial-gradient(circle at 15% 0,#f9fbfd 0,#eef4f9 35%,#e9eff5 100%)!important}
    header{border-bottom:1px solid rgba(255,255,255,.15)!important}
    .status{border:0!important;background:#f9fbfd!important;color:#334155!important}
    nav{padding:12px 18px!important;gap:8px!important;border-bottom:1px solid #dbe4ee!important}
    nav .tab{min-height:40px;border-radius:12px!important;padding:9px 14px!important;box-shadow:0 2px 5px rgba(15,35,55,.06)!important}
    main.wrap{max-width:1320px!important;padding:22px 18px 60px!important}
    #profile>.card{max-width:1320px!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important}
    #profile>.card>div:first-child{display:none!important}
    #profile #orgProfileView{margin-top:0!important}
    .ma26-shell{display:grid;gap:18px}
    .ma26-hero{position:relative;overflow:hidden;border-radius:24px;padding:28px 30px;background:linear-gradient(120deg,#173b66,#235d85 55%,#168b88);color:white;box-shadow:0 14px 35px rgba(23,59,102,.19)}
    .ma26-hero:after{content:'';position:absolute;width:240px;height:240px;border-radius:50%;right:-90px;top:-100px;background:rgba(255,255,255,.08)}
    .ma26-hero h1{margin:0 0 7px;font-size:31px;letter-spacing:.4px}.ma26-hero p{margin:0;opacity:.87;font-weight:600}
    .ma26-section-label{font-size:13px;letter-spacing:.9px;text-transform:uppercase;font-weight:900;color:#64748b;margin:2px 0 -5px}
    .ma26-depts{display:grid;grid-template-columns:repeat(4,minmax(190px,1fr));gap:14px}
    .ma26-dept{position:relative;min-height:155px;padding:20px;border:0!important;border-radius:20px!important;color:#fff!important;text-align:left;overflow:hidden;box-shadow:0 10px 22px rgba(23,38,58,.13)!important;transition:.2s ease!important}
    .ma26-dept:hover{transform:translateY(-4px)!important;box-shadow:0 14px 30px rgba(23,38,58,.2)!important}
    .ma26-dept:after{content:'';position:absolute;width:105px;height:105px;border-radius:50%;right:-24px;bottom:-32px;background:rgba(255,255,255,.15)}
    .ma26-dept .ma26-icon{font-size:25px;margin-bottom:22px}.ma26-dept b{display:block;font-size:20px;margin-bottom:5px}.ma26-dept small{display:block;font-size:12px;opacity:.88;line-height:1.35}
    .ma26-kitchen{background:linear-gradient(135deg,#245ea8,#3387d5)!important}.ma26-maint{background:linear-gradient(135deg,#c2780a,#e8a72c)!important}.ma26-hall{background:linear-gradient(135deg,#8d2a7b,#b548a2)!important}.ma26-transport{background:linear-gradient(135deg,#18795f,#23a37c)!important}
    .ma26-ops{display:grid;grid-template-columns:repeat(4,minmax(170px,1fr));gap:12px}
    .ma26-op{background:white!important;border:1px solid #dde6ef!important;border-radius:17px!important;padding:17px!important;text-align:left;box-shadow:0 6px 16px rgba(27,57,88,.07)!important;color:#23384d!important}
    .ma26-op b{display:block;font-size:16px}.ma26-op span{font-size:12px;color:#718096}.ma26-op i{float:right;font-size:20px}
    .ma26-profile-wrap{background:#fff;border:1px solid #dfe7ef;border-radius:20px;padding:18px 20px;box-shadow:0 7px 20px rgba(30,61,91,.06)}
    .ma26-profile-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px}.ma26-profile-head h3{margin:0;color:#274866}.ma26-profile-wrap #orgProfileOriginal>div{grid-template-columns:repeat(2,minmax(250px,1fr))!important}
    #kitchenHub>.card,#maintenanceHub>.card,#transportationHub>.card{border:0!important;background:transparent!important;box-shadow:none!important;padding:0!important}
    #kitchenHub .section-head,#maintenanceHub .section-head,#transportationHub .section-head{background:white;border:1px solid #dfe7ef!important;padding:18px 20px!important;border-radius:18px!important;box-shadow:0 6px 18px rgba(25,55,85,.06)}
    #kitchenSubTabs,#maintenanceSubTabs,#transportationSubTabs{background:white;border:1px solid #dfe7ef!important;border-radius:16px;padding:11px!important;box-shadow:0 5px 14px rgba(25,55,85,.05)}
    #kitchenLanding .grid,#maintenanceLanding .grid,#transportationLanding .grid{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))!important;gap:14px!important}
    #kitchenLanding .card,#maintenanceLanding .card,#transportationLanding .card{min-height:120px!important;border-radius:18px!important;padding:18px!important;box-shadow:0 7px 18px rgba(25,55,85,.08)!important}
    @media(max-width:980px){.ma26-depts{grid-template-columns:repeat(2,1fr)}.ma26-ops{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:580px){.ma26-depts,.ma26-ops{grid-template-columns:1fr}.ma26-hero{padding:22px}.ma26-hero h1{font-size:25px}}
  `;
  document.head.appendChild(style);

  function clickTab(selector){const el=document.querySelector(selector);if(el)el.click()}
  function buildDashboard(){
    const view=document.querySelector('#orgProfileView');if(!view||view.dataset.ma26==='1')return;
    view.dataset.ma26='1';
    const original=document.createElement('div');original.id='orgProfileOriginal';
    while(view.firstChild)original.appendChild(view.firstChild);
    view.appendChild(document.createElement('div'));
    const shell=view.firstElementChild;shell.className='ma26-shell';
    shell.innerHTML=`
      <div class="ma26-hero"><h1>Operations Dashboard</h1><p>MASORAS AVOS • Kitchen, facilities, hall and transportation at a glance.</p></div>
      <div class="ma26-section-label">Departments</div>
      <div class="ma26-depts">
        <button class="ma26-dept ma26-kitchen" data-open="#kitchenMainTab"><div class="ma26-icon"><i class="bi bi-cup-hot-fill"></i></div><b>Kitchen</b><small>Menus, prep, recipes, inventory, Potato Kugel and tasks</small></button>
        <button class="ma26-dept ma26-maint" data-open="#maintenanceMainTab"><div class="ma26-icon"><i class="bi bi-tools"></i></div><b>Maintenance</b><small>Work orders, inventory, ordering and recurring tasks</small></button>
        <button class="ma26-dept ma26-hall" data-open="#hallMainTab"><div class="ma26-icon"><i class="bi bi-building"></i></div><b>Hall</b><small>Hall operations and event support</small></button>
        <button class="ma26-dept ma26-transport" data-open="#transportationMainTab"><div class="ma26-icon"><i class="bi bi-bus-front-fill"></i></div><b>Transportation</b><small>Drivers, buses, maintenance, certification and inspections</small></button>
      </div>
      <div class="ma26-section-label">Quick Operations</div>
      <div class="ma26-ops">
        <button class="ma26-op" data-open="nav .tab[data-tab='needs']"><i class="bi bi-exclamation-triangle"></i><b>Needs Ordering</b><span>Items that need replenishment</span></button>
        <button class="ma26-op" data-open="nav .tab[data-tab='queues']"><i class="bi bi-cart-check"></i><b>Order Queue</b><span>Orders waiting to be placed</span></button>
        <button class="ma26-op" data-open="nav .tab[data-tab='receiving']"><i class="bi bi-box-arrow-in-down"></i><b>Receiving</b><span>Incoming orders and deliveries</span></button>
        <button class="ma26-op" data-open="nav .tab[data-tab='vendors']"><i class="bi bi-truck"></i><b>Vendors</b><span>Vendor profiles, items and ordering</span></button>
      </div>
      <div class="ma26-profile-wrap"><div class="ma26-profile-head"><div><h3>Organization Information</h3><div class="muted">Contact and profile information</div></div><button id="ma26EditProfile" class="primary"><i class="bi bi-pencil-square"></i> Edit Profile</button></div><div id="ma26ProfileMount"></div></div>`;
    shell.querySelector('#ma26ProfileMount').appendChild(original);
    shell.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>clickTab(b.dataset.open));
    shell.querySelector('#ma26EditProfile').onclick=()=>document.querySelector('#editOrgProfile')?.click();
    document.querySelector('.ma-dashboard')?.remove();
  }
  function apply(){buildDashboard();document.querySelector('.ma-dashboard')?.remove()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(apply,700);setTimeout(apply,1600)});else{setTimeout(apply,500);setTimeout(apply,1400)}
  new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true});
})();