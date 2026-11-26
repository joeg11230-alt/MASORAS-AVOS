(()=>{
  const OFFICIAL_URL='https://dwspectrum.com/';
  function ensureDWSpectrum(){
    const nav=document.querySelector('nav');
    const main=document.querySelector('main.wrap');
    if(!nav||!main)return;

    let btn=nav.querySelector('#dwSpectrumMainTab');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.id='dwSpectrumMainTab';
      btn.className='tab';
      btn.dataset.tab='dwSpectrumHub';
      btn.innerHTML='<span class="dw-tab-mark">DW</span><span>DW Spectrum</span>';
    }
    const buildingAccess=nav.querySelector('#buildingAccessMainTab');
    const hvac=nav.querySelector('#hvacMainTab');
    const placementAnchor=hvac||buildingAccess;
    if(placementAnchor&&placementAnchor.nextElementSibling!==btn)placementAnchor.after(btn);
    else if(!placementAnchor&&!btn.parentElement)nav.appendChild(btn);

    let section=document.querySelector('#dwSpectrumHub');
    if(!section){
      section=document.createElement('section');
      section.id='dwSpectrumHub';
      section.className='section';
      main.prepend(section);
    }
    section.innerHTML=`
      <div class="card dw-spectrum-card">
        <div class="dw-spectrum-hero">
          <div class="dw-spectrum-logo" aria-label="DW Spectrum"><span>DW</span><strong>SPECTRUM</strong></div>
          <div>
            <h2>DW Spectrum</h2>
            <p>Building video-management and camera monitoring</p>
          </div>
        </div>
        <div class="dw-spectrum-grid">
          <div class="dw-spectrum-panel">
            <i class="bi bi-camera-video-fill"></i>
            <div><h3>DW Spectrum Windows App</h3><p>The launcher for your installed DW Spectrum client will be connected here.</p><span class="dw-pending"><i class="bi bi-hourglass-split"></i> App launcher details needed</span></div>
          </div>
          <div class="dw-spectrum-panel">
            <i class="bi bi-shield-lock-fill"></i>
            <div><h3>Secure Access</h3><p>Your DW Spectrum username, password and camera credentials will not be stored in MASORAS AVOS.</p><a href="${OFFICIAL_URL}" target="_blank" rel="noopener noreferrer" class="dw-official-link"><i class="bi bi-globe2"></i> Official DW Spectrum Website</a></div>
          </div>
        </div>
      </div>`;

    let style=document.querySelector('#dwSpectrumStyles');
    if(!style){
      style=document.createElement('style');
      style.id='dwSpectrumStyles';
      style.textContent=`
        #dwSpectrumMainTab{background:#4c1d95!important;border-color:#4c1d95!important;color:#fff!important;font-weight:800;display:inline-flex;align-items:center;gap:7px}
        .dw-tab-mark{display:inline-flex;align-items:center;justify-content:center;padding:2px 5px;border-radius:5px;background:#f97316;color:#fff;font-size:11px;font-weight:950}
        .dw-spectrum-card{border-top:5px solid #f97316;background:linear-gradient(145deg,#fff7ed,#fff 48%,#f5f3ff)}
        .dw-spectrum-hero{display:flex;align-items:center;gap:18px;padding:8px 0 20px;border-bottom:1px solid #ddd6fe}
        .dw-spectrum-logo{display:flex;align-items:center;overflow:hidden;border-radius:12px;box-shadow:0 7px 18px rgba(76,29,149,.18)}
        .dw-spectrum-logo span{padding:15px 13px;background:#f97316;color:#fff;font-size:24px;font-weight:950}
        .dw-spectrum-logo strong{padding:15px 16px;background:#24143f;color:#fff;font-size:18px;letter-spacing:.08em}
        .dw-spectrum-hero h2{margin:0;color:#2e1065;font-size:26px}.dw-spectrum-hero p{margin:5px 0 0;color:#64748b;font-weight:700}
        .dw-spectrum-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-top:18px}
        .dw-spectrum-panel{display:grid;grid-template-columns:46px 1fr;gap:13px;padding:18px;border:2px solid #ddd6fe;border-radius:14px;background:#fff;box-shadow:0 5px 14px rgba(46,16,101,.08)}
        .dw-spectrum-panel>i{font-size:32px;color:#6d28d9}.dw-spectrum-panel h3{margin:0 0 6px;color:#2e1065}.dw-spectrum-panel p{margin:0 0 13px;color:#64748b;line-height:1.45}
        .dw-pending{display:inline-flex;align-items:center;gap:7px;padding:8px 10px;border-radius:9px;background:#fff7ed;color:#c2410c;font-weight:850;font-size:13px}
        .dw-official-link{display:inline-flex;align-items:center;gap:7px;padding:9px 12px;border-radius:9px;background:#4c1d95;color:#fff;text-decoration:none;font-weight:850}
        @media(max-width:700px){.dw-spectrum-hero{align-items:flex-start;flex-direction:column}.dw-spectrum-logo strong{font-size:15px}.dw-spectrum-grid{grid-template-columns:1fr}}
      `;
      document.head.appendChild(style);
    }

    if(!window.__dwSpectrumNavObserver){
      window.__dwSpectrumNavObserver=new MutationObserver(()=>setTimeout(ensureDWSpectrum,0));
      window.__dwSpectrumNavObserver.observe(nav,{childList:true});
    }

    btn.onclick=()=>{
      document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
      section.classList.add('active');
      nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureDWSpectrum);
  else ensureDWSpectrum();
  setTimeout(ensureDWSpectrum,400);
  setTimeout(ensureDWSpectrum,1200);
  setTimeout(ensureDWSpectrum,2500);
})();