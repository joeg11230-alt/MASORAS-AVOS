(()=>{
  const HONEYWELL_URL='https://mytotalconnectcomfort.com/portal/Locations';

  function ensureHVAC(){
    const nav=document.querySelector('nav');
    const main=document.querySelector('main.wrap');
    if(!nav||!main)return;

    let btn=nav.querySelector('#hvacMainTab');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.id='hvacMainTab';
      btn.className='tab';
      btn.dataset.tab='hvacHub';
      btn.innerHTML='<i class="bi bi-thermometer-snow"></i><span>HVAC</span>';
    }

    const buildingAccess=nav.querySelector('#buildingAccessMainTab');
    if(buildingAccess&&buildingAccess.nextElementSibling!==btn)buildingAccess.after(btn);
    else if(!buildingAccess&&!btn.parentElement)nav.appendChild(btn);

    let section=document.querySelector('#hvacHub');
    if(!section){
      section=document.createElement('section');
      section.id='hvacHub';
      section.className='section';
      main.prepend(section);
    }

    section.innerHTML=`
      <div class="card hvac-card">
        <div class="hvac-hero">
          <div class="hvac-icon" aria-hidden="true"><i class="bi bi-thermometer-half"></i></div>
          <div>
            <h2>HVAC</h2>
            <p>Heating, ventilation and air-conditioning controls</p>
          </div>
        </div>

        <div class="hvac-subtabs" role="tablist" aria-label="HVAC systems">
          <button type="button" class="hvac-subtab active" data-hvac-page="honeywell">
            <span class="honeywell-mark">H</span> Honeywell
          </button>
        </div>

        <div class="hvac-page active" data-hvac-panel="honeywell">
          <div class="honeywell-card">
            <div class="honeywell-brand">
              <span class="honeywell-logo">Honeywell</span>
              <span>Total Connect Comfort</span>
            </div>
            <p>Open the Honeywell Locations portal to view and manage the building's thermostats and comfort settings.</p>
            <a class="honeywell-open" href="${HONEYWELL_URL}" target="_blank" rel="noopener noreferrer">
              <i class="bi bi-box-arrow-up-right"></i>
              Open Honeywell Total Connect Comfort
            </a>
            <div class="hvac-security-note">
              <i class="bi bi-shield-lock-fill"></i>
              Your Honeywell username and password are not stored in MASORAS AVOS.
            </div>
          </div>
        </div>
      </div>`;

    let style=document.querySelector('#hvacStyles');
    if(!style){
      style=document.createElement('style');
      style.id='hvacStyles';
      style.textContent=`
        #hvacMainTab{background:#0f766e!important;border-color:#0f766e!important;color:#fff!important;font-weight:850;display:inline-flex;align-items:center;gap:7px}
        #hvacMainTab i{font-size:16px}
        .hvac-card{border-top:5px solid #0f766e;background:linear-gradient(145deg,#f0fdfa,#fff 48%,#fef2f2)}
        .hvac-hero{display:flex;align-items:center;gap:15px;padding:6px 0 18px;border-bottom:1px solid #ccfbf1}
        .hvac-icon{width:58px;height:58px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:#0f766e;color:#fff;font-size:30px;box-shadow:0 8px 18px rgba(15,118,110,.22)}
        .hvac-hero h2{margin:0;color:#134e4a;font-size:27px}.hvac-hero p{margin:5px 0 0;color:#64748b;font-weight:700}
        .hvac-subtabs{display:flex;gap:10px;margin:18px 0}
        .hvac-subtab{border:0;border-radius:10px;padding:10px 15px;background:#e2e8f0;color:#334155;font-weight:850;cursor:pointer;display:inline-flex;align-items:center;gap:8px}
        .hvac-subtab.active{background:#d71920;color:#fff;box-shadow:0 5px 14px rgba(215,25,32,.22)}
        .honeywell-mark{display:inline-flex;align-items:center;justify-content:center;width:23px;height:23px;border-radius:6px;background:#fff;color:#d71920;font-weight:950}
        .hvac-page{display:none}.hvac-page.active{display:block}
        .honeywell-card{padding:22px;border:2px solid #fecaca;border-radius:15px;background:#fff;box-shadow:0 6px 16px rgba(127,29,29,.08)}
        .honeywell-brand{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;color:#64748b;font-weight:800}
        .honeywell-logo{color:#d71920;font-size:27px;font-weight:950;letter-spacing:-.04em}
        .honeywell-card p{margin:14px 0 18px;color:#475569;line-height:1.5}
        .honeywell-open{display:inline-flex;align-items:center;gap:8px;padding:11px 14px;border-radius:10px;background:#d71920;color:#fff;text-decoration:none;font-weight:900}
        .honeywell-open:hover{background:#b91c1c}
        .hvac-security-note{display:flex;align-items:center;gap:8px;margin-top:17px;padding:11px 12px;border-radius:10px;background:#f0fdfa;color:#0f766e;font-weight:750;font-size:13px}
        @media(max-width:700px){.hvac-hero{align-items:flex-start}.honeywell-card{padding:17px}.honeywell-open{width:100%;box-sizing:border-box;justify-content:center;text-align:center}}
      `;
      document.head.appendChild(style);
    }

    section.querySelectorAll('.hvac-subtab').forEach(tab=>{
      tab.onclick=()=>{
        section.querySelectorAll('.hvac-subtab').forEach(item=>item.classList.toggle('active',item===tab));
        section.querySelectorAll('.hvac-page').forEach(panel=>panel.classList.toggle('active',panel.dataset.hvacPanel===tab.dataset.hvacPage));
      };
    });

    btn.onclick=()=>{
      document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
      section.classList.add('active');
      nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    };

    if(!window.__hvacNavObserver){
      window.__hvacNavObserver=new MutationObserver(()=>setTimeout(ensureHVAC,0));
      window.__hvacNavObserver.observe(nav,{childList:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureHVAC);
  else ensureHVAC();
  setTimeout(ensureHVAC,400);
  setTimeout(ensureHVAC,1200);
  setTimeout(ensureHVAC,2500);
})();