(()=>{
  const COPIERS=[
    {type:'B&W',location:'Main Office',serial:'27Y02466',model:'IRADVDX8986I',ip:'192.168.2.23'},
    {type:'B&W',location:'1st Floor Teacher Room',serial:'27Y02380',model:'IRADVDX8986I',ip:'192.168.2.201'},
    {type:'B&W',location:'2nd Floor Teacher Room',serial:'27Y08230',model:'IRADVDX8986I',ip:'192.168.2.205'},
    {type:'Color',location:'Main Office',serial:'4LY16735',model:'IRADVDXC3930I',ip:'192.168.2.209'}
  ];
  const BOGEN_URL='https://192.168.6.230/dashboard';

  function openInternal(url){
    window.open(url,'_blank','noopener,noreferrer');
  }

  function copierCard(copier){
    const isColor=copier.type==='Color';
    return `<article class="office-copier-card ${isColor?'office-copier-color':'office-copier-bw'}">
      <div class="office-copier-card-head">
        <div><span class="office-device-badge">${copier.type}</span><h3>${copier.location}</h3></div>
        <i class="bi ${isColor?'bi-palette':'bi-printer'}"></i>
      </div>
      <dl class="office-device-details">
        <div><dt>Model</dt><dd>${copier.model}</dd></div>
        <div><dt>Serial Number</dt><dd>${copier.serial}</dd></div>
        <div><dt>IP Address</dt><dd>${copier.ip}</dd></div>
      </dl>
      <button type="button" class="office-open-device" data-office-url="https://${copier.ip}"><i class="bi bi-box-arrow-up-right"></i> Open Copier Dashboard</button>
    </article>`;
  }

  function ensureOffice(){
    const nav=document.querySelector('nav');
    const main=document.querySelector('main.wrap');
    if(!nav||!main)return;

    let btn=nav.querySelector('#officeMainTab');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.id='officeMainTab';
      btn.className='tab';
      btn.dataset.tab='officeHub';
      btn.textContent='Office';
    }
    const profile=nav.querySelector('.tab[data-tab="profile"]');
    const kitchen=nav.querySelector('#kitchenMainTab');
    if(profile&&profile.nextElementSibling!==btn)profile.after(btn);
    else if(!profile&&kitchen&&kitchen.previousElementSibling!==btn)kitchen.before(btn);
    else if(!btn.parentElement)nav.prepend(btn);

    let section=document.querySelector('#officeHub');
    if(!section){
      section=document.createElement('section');
      section.id='officeHub';
      section.className='section';
      main.prepend(section);
    }

    section.innerHTML=`
      <div class="card office-card">
        <div class="section-head" style="margin-top:0;border-top:0;padding-top:0">
          <div><h2 style="margin:0">Office</h2><div class="muted">Office equipment and building communication systems</div></div>
        </div>
        <div id="officeSubTabs" class="office-subtabs">
          <button type="button" data-office-page="copiers" class="active"><i class="bi bi-printer"></i> Copiers</button>
          <button type="button" data-office-page="bogen"><i class="bi bi-broadcast-pin"></i> Bogen</button>
        </div>
        <div id="officeCopiers" class="office-page active">
          <div class="office-page-head"><div><h3>Canon Copiers</h3><div class="muted">Copier locations, models, serial numbers and network addresses</div></div><span class="office-count">${COPIERS.length} copiers</span></div>
          <div class="office-copier-grid">${COPIERS.map(copierCard).join('')}</div>
          <div class="office-network-note"><i class="bi bi-wifi"></i> Copier dashboards are available while connected to the Masoras Avos building network.</div>
        </div>
        <div id="officeBogen" class="office-page">
          <div class="office-bogen-panel">
            <div class="office-bogen-icon"><i class="bi bi-broadcast-pin"></i></div>
            <div class="office-bogen-content"><h3>Bogen System Dashboard</h3><p>Open the building Bogen dashboard for system access and status.</p><div class="office-address"><span>IP Address</span><strong>192.168.6.230</strong></div><button type="button" class="office-open-bogen" data-office-url="${BOGEN_URL}"><i class="bi bi-box-arrow-up-right"></i> Open Bogen Dashboard</button><div class="office-network-note"><i class="bi bi-shield-lock"></i> This internal address is available while connected to the Masoras Avos building network.</div></div>
          </div>
        </div>
      </div>`;

    let style=document.querySelector('#officeStyles');
    if(!style){
      style=document.createElement('style');
      style.id='officeStyles';
      style.textContent=`
        .office-card{border-top:5px solid #b45309}
        .office-subtabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px;padding-bottom:12px;border-bottom:1px solid #d9dee7}
        .office-subtabs button{font-weight:800;color:#fff;border-width:2px;box-shadow:none}
        .office-subtabs button[data-office-page="copiers"]{background:#2563eb;border-color:#2563eb}
        .office-subtabs button[data-office-page="bogen"]{background:#0f766e;border-color:#0f766e}
        .office-subtabs button.active{box-shadow:0 0 0 3px rgba(23,32,51,.20)}
        .office-page{display:none;padding-top:18px}
        .office-page.active{display:block}
        .office-page-head{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:12px}
        .office-page-head h3,.office-bogen-content h3{margin:0 0 4px}
        .office-count{padding:6px 10px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:12px;font-weight:800}
        .office-copier-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:12px}
        .office-copier-card{border:2px solid #cbd5e1;border-radius:13px;padding:15px;background:#fff;box-shadow:0 4px 12px rgba(23,32,51,.08)}
        .office-copier-bw{border-top:5px solid #2563eb;background:linear-gradient(145deg,#eff6ff,#fff 55%)}
        .office-copier-color{border-top:5px solid #7c3aed;background:linear-gradient(145deg,#f5f3ff,#fff 55%)}
        .office-copier-card-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
        .office-copier-card-head h3{margin:7px 0 0;font-size:17px}
        .office-copier-card-head>i{font-size:28px;color:#2563eb}
        .office-copier-color .office-copier-card-head>i{color:#7c3aed}
        .office-device-badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:900}
        .office-copier-color .office-device-badge{background:#ede9fe;color:#6d28d9}
        .office-device-details{margin:14px 0;display:grid;gap:8px}
        .office-device-details div{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #e8edf3;padding-bottom:7px}
        .office-device-details dt{color:#687386;font-size:12px;font-weight:700}
        .office-device-details dd{margin:0;text-align:right;font-size:13px;font-weight:800;overflow-wrap:anywhere}
        .office-open-device,.office-open-bogen{background:#1f4e78;color:#fff;border-color:#1f4e78;font-weight:800;width:100%}
        .office-network-note{display:flex;gap:8px;align-items:flex-start;margin-top:14px;padding:10px 12px;border-radius:10px;background:#f1f5f9;color:#475569;font-size:12px;font-weight:700}
        .office-bogen-panel{display:grid;grid-template-columns:92px 1fr;gap:18px;padding:20px;border:2px solid #0f766e;border-radius:14px;background:linear-gradient(135deg,#ecfdf5,#fff);max-width:760px}
        .office-bogen-icon{width:82px;height:82px;border-radius:18px;background:#0f766e;color:#fff;display:flex;align-items:center;justify-content:center;font-size:38px}
        .office-bogen-content p{margin:5px 0 14px;color:#687386}
        .office-address{display:flex;justify-content:space-between;gap:14px;padding:12px;border:1px solid #a7f3d0;border-radius:10px;background:#fff;margin-bottom:12px}
        .office-address span{color:#687386;font-size:13px;font-weight:700}.office-address strong{overflow-wrap:anywhere}
        @media(max-width:700px){.office-copier-grid{grid-template-columns:1fr}.office-bogen-panel{grid-template-columns:1fr}.office-bogen-icon{width:64px;height:64px}.office-address{flex-direction:column;gap:4px}}
      `;
      document.head.appendChild(style);
    }

    function showPage(page){
      section.querySelectorAll('.office-page').forEach(x=>x.classList.toggle('active',x.id===`office${page[0].toUpperCase()+page.slice(1)}`));
      section.querySelectorAll('#officeSubTabs [data-office-page]').forEach(x=>x.classList.toggle('active',x.dataset.officePage===page));
    }
    section.querySelectorAll('#officeSubTabs [data-office-page]').forEach(x=>x.onclick=()=>showPage(x.dataset.officePage));
    section.querySelectorAll('[data-office-url]').forEach(x=>x.onclick=()=>openInternal(x.dataset.officeUrl));
    btn.onclick=()=>{
      document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
      section.classList.add('active');
      nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      showPage('copiers');
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureOffice);
  else ensureOffice();
  setTimeout(ensureOffice,400);
  setTimeout(ensureOffice,1200);
})();
