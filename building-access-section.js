(()=>{
  const PROTECTOR_URL='https://ac.idtechsolutions.com/#/';
  const tools=[
    {icon:'bi-speedometer2',title:'System Overview',description:'View panels, readers and overall access-control status.'},
    {icon:'bi-door-open',title:'Doors & Readers',description:'Open the door and reader management area.'},
    {icon:'bi-people',title:'Users & Access Cards',description:'Manage cardholders, users and assigned credentials.'},
    {icon:'bi-shield-lock',title:'Access Privilege Groups',description:'Review and manage building access permissions.'},
    {icon:'bi-clock-history',title:'Door Activity',description:'Review historical door and access activity.'},
    {icon:'bi-calendar-week',title:'Door Time Zones',description:'Manage regular and one-time door schedules.'},
    {icon:'bi-person-clock',title:'User Time Zones',description:'Manage when users are permitted to enter.'},
    {icon:'bi-exclamation-triangle',title:'Alerts & Notifications',description:'Review access-control warnings and system notices.'}
  ];

  function openProtector(){
    window.open(PROTECTOR_URL,'_blank','noopener,noreferrer');
  }

  function ensureBuildingAccess(){
    const nav=document.querySelector('nav');
    const main=document.querySelector('main.wrap');
    if(!nav||!main)return;

    let btn=nav.querySelector('#buildingAccessMainTab');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.id='buildingAccessMainTab';
      btn.className='tab';
      btn.dataset.tab='buildingAccessHub';
      btn.textContent='Building Access';
      const transportation=nav.querySelector('#transportationMainTab');
      if(transportation)transportation.after(btn);else nav.appendChild(btn);
    }

    let section=document.querySelector('#buildingAccessHub');
    if(!section){
      section=document.createElement('section');
      section.id='buildingAccessHub';
      section.className='section';
      main.prepend(section);
    }

    section.innerHTML=`
      <div class="card building-access-card">
        <div class="section-head" style="margin-top:0;border-top:0;padding-top:0">
          <div>
            <h2 style="margin:0">Building Access</h2>
            <div class="muted">24/7/365 access control throughout the entire building</div>
          </div>
          <button type="button" class="primary protector-open">
            <i class="bi bi-box-arrow-up-right"></i> Open PROTECTOR.Net
          </button>
        </div>
        <div class="building-access-status">
          <i class="bi bi-shield-check"></i>
          <div><b>Building Access Control</b><div class="muted">Use this dashboard to reach the appropriate PROTECTOR.Net area. Your PROTECTOR.Net sign-in remains separate and secure.</div></div>
        </div>
        <div class="building-access-grid">
          ${tools.map((item,index)=>`
            <button type="button" class="building-access-tool" data-access-tool="${index}">
              <i class="bi ${item.icon}"></i>
              <span><b>${item.title}</b><small>${item.description}</small></span>
              <i class="bi bi-chevron-right"></i>
            </button>
          `).join('')}
        </div>
        <div class="building-access-note">
          <i class="bi bi-lock-fill"></i>
          No PROTECTOR.Net password or access credential is stored in MASORAS AVOS.
        </div>
      </div>`;

    let style=document.querySelector('#buildingAccessStyles');
    if(!style){
      style=document.createElement('style');
      style.id='buildingAccessStyles';
      style.textContent=`
        #buildingAccessMainTab{background:#334155!important;border-color:#334155!important;color:#fff!important;font-weight:800}
        .building-access-card{border-top:5px solid #334155}
        .building-access-status{display:flex;gap:12px;align-items:center;margin-top:16px;padding:14px;border:1px solid #cbd5e1;border-radius:12px;background:linear-gradient(135deg,#eef2ff,#f8fafc)}
        .building-access-status>i{font-size:30px;color:#166534}
        .building-access-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:16px}
        .building-access-tool{min-height:104px;text-align:left;display:grid;grid-template-columns:38px 1fr auto;gap:10px;align-items:center;padding:16px;border:2px solid #cbd5e1;background:#fff;box-shadow:0 4px 12px rgba(15,23,42,.08);transition:transform .15s,box-shadow .15s,border-color .15s}
        .building-access-tool:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(15,23,42,.14);border-color:#334155}
        .building-access-tool>i:first-child{font-size:27px;color:#1d4ed8}
        .building-access-tool span{display:flex;flex-direction:column;gap:5px}
        .building-access-tool b{font-size:16px;color:#172033}
        .building-access-tool small{font-size:12px;line-height:1.35;color:#687386}
        .building-access-note{display:flex;gap:8px;align-items:center;margin-top:16px;padding:11px 13px;border-radius:10px;background:#ecfdf5;color:#166534;font-size:13px;font-weight:700}
        @media(max-width:700px){.building-access-grid{grid-template-columns:1fr}.building-access-card .section-head{align-items:flex-start}.protector-open{width:100%}}
      `;
      document.head.appendChild(style);
    }

    section.querySelectorAll('.protector-open,.building-access-tool').forEach(el=>el.onclick=openProtector);
    btn.onclick=()=>{
      document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
      section.classList.add('active');
      nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureBuildingAccess);
  else ensureBuildingAccess();
  setTimeout(ensureBuildingAccess,400);
  setTimeout(ensureBuildingAccess,1200);
})();