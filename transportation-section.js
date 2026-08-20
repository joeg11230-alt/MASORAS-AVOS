(()=>{
  function ensureTransportation(){
    const nav=document.querySelector('nav');
    const main=document.querySelector('main.wrap');
    if(!nav||!main)return;
    let btn=nav.querySelector('#transportationMainTab');
    if(!btn){
      btn=document.createElement('button');btn.type='button';btn.id='transportationMainTab';btn.className='tab';btn.dataset.tab='transportationHub';btn.textContent='Transportation';
      const hall=nav.querySelector('#hallMainTab');
      if(hall)hall.after(btn);else nav.appendChild(btn);
    }
    let section=document.querySelector('#transportationHub');
    if(!section){section=document.createElement('section');section.id='transportationHub';section.className='section';main.prepend(section);}
    section.innerHTML='<div class="card"><div class="section-head" style="margin-top:0;border-top:0;padding-top:0"><div><h2 style="margin:0">Transportation</h2><div class="muted">Transportation operations</div></div></div><div style="padding:18px 0 4px"><div class="subcard"><h3 style="margin-top:0">Transportation Dashboard</h3><div class="muted">Transportation tools and sections will be organized here.</div></div></div></div>';
    btn.onclick=()=>{document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));section.classList.add('active');nav.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');};
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureTransportation);else ensureTransportation();setTimeout(ensureTransportation,400);setTimeout(ensureTransportation,1200);
})();