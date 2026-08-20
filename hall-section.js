(()=>{
  function ensureHall(){
    const nav=document.querySelector('nav');
    const main=document.querySelector('main.wrap');
    if(!nav||!main)return;
    let btn=nav.querySelector('#hallMainTab');
    if(!btn){
      btn=document.createElement('button');btn.type='button';btn.id='hallMainTab';btn.className='tab';btn.dataset.tab='hallHub';btn.textContent='Hall';
      const maintenance=nav.querySelector('#maintenanceMainTab');
      if(maintenance)maintenance.after(btn);else nav.appendChild(btn);
    }
    let section=document.querySelector('#hallHub');
    if(!section){section=document.createElement('section');section.id='hallHub';section.className='section';main.prepend(section);}
    section.innerHTML='<div class="card"><div class="section-head" style="margin-top:0;border-top:0;padding-top:0"><div><h2 style="margin:0">Hall</h2><div class="muted">Hall operations</div></div></div><div style="padding:18px 0 4px"><div class="subcard"><h3 style="margin-top:0">Hall Dashboard</h3><div class="muted">Hall tools and sections will be organized here.</div></div></div></div>';
    btn.onclick=()=>{document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));section.classList.add('active');nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureHall);else ensureHall();setTimeout(ensureHall,400);setTimeout(ensureHall,1200);
})();