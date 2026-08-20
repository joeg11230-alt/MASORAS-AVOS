(()=>{
  const style=document.createElement('style');
  style.textContent=`
    :root{--ma-navy:#173b63;--ma-navy2:#245786;--ma-teal:#168b88;--ma-gold:#d39a2f;--ma-green:#23845c;--ma-red:#c14d4d;--ma-purple:#6857a8;--ma-bg:#f3f6fa;--ma-ink:#17263a}
    body{background:linear-gradient(180deg,#eef4fa 0,#f7f9fc 260px,#f5f7fa 100%);color:var(--ma-ink)}
    header{background:linear-gradient(110deg,var(--ma-navy),var(--ma-navy2) 60%,#217778)!important;padding:20px 22px!important;box-shadow:0 3px 18px rgba(16,43,71,.18)}
    header h2{font-size:26px!important;letter-spacing:.5px;font-weight:800!important}
    .status{background:rgba(255,255,255,.96)!important;padding:10px 18px!important;box-shadow:0 1px 0 rgba(25,50,80,.08)}
    nav{gap:8px!important;padding:12px 16px!important;background:rgba(255,255,255,.97)!important;box-shadow:0 3px 10px rgba(24,55,85,.06);position:sticky;top:0;z-index:5}
    nav .tab{border:1px solid #d6e0eb!important;border-radius:11px!important;padding:10px 14px!important;font-weight:700;background:#fff!important;color:#28445f!important;transition:.18s ease;box-shadow:0 1px 2px rgba(20,45,70,.03)}
    nav .tab:hover{transform:translateY(-1px);border-color:#9db5cc!important;box-shadow:0 4px 12px rgba(24,55,85,.09)}
    nav .tab.active{background:linear-gradient(135deg,var(--ma-navy),var(--ma-navy2))!important;color:#fff!important;border-color:transparent!important;box-shadow:0 5px 14px rgba(29,74,117,.24)}
    main.wrap{max-width:1240px!important;padding-top:22px!important}
    .card,.subcard{border:1px solid #dfe7ef!important;box-shadow:0 7px 22px rgba(30,61,91,.07);background:rgba(255,255,255,.97)!important}
    .card{border-radius:16px!important}.subcard{border-radius:13px!important}
    button,.btn{border-radius:10px!important;font-weight:700;transition:.15s ease}
    button:hover,.btn:hover{transform:translateY(-1px)}
    button.primary,.btn.primary{background:linear-gradient(135deg,var(--ma-navy),var(--ma-navy2))!important;border-color:transparent!important;box-shadow:0 4px 11px rgba(29,74,117,.18)}
    button.success{background:linear-gradient(135deg,#237b55,#31a070)!important;border-color:transparent!important}
    .btn.whatsapp{box-shadow:0 4px 10px rgba(37,211,102,.18)}
    input,select,textarea{border-radius:10px!important;border-color:#cdd9e5!important;background:#fbfdff}
    input:focus,select:focus,textarea:focus{outline:none;border-color:#6d9bc5!important;box-shadow:0 0 0 3px rgba(57,116,168,.12)}
    .product-card{border-top:4px solid #3c84bd!important}.product-card:hover{box-shadow:0 10px 25px rgba(28,67,103,.12)!important;transform:translateY(-2px)}
    #vendors .card{border-top:4px solid var(--ma-teal)!important}
    #needs .card{border-top:4px solid var(--ma-gold)!important}
    #queues .card{border-top:4px solid var(--ma-purple)!important}
    #receiving .card{border-top:4px solid var(--ma-green)!important}
    .badge,.pill{border-radius:999px!important;font-weight:700}
    table{border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(30,61,91,.04)}
    th{background:#edf4fa!important;color:#294763!important;font-weight:800!important}
    tr:nth-child(even) td{background:#fbfdff}
    #profile>.card{max-width:1100px!important;padding:20px!important}
    #profile .queue-title>div>h2{font-size:26px;color:var(--ma-navy)}
    .ma-dashboard{display:grid;grid-template-columns:repeat(5,minmax(150px,1fr));gap:12px;margin:0 0 18px}
    .ma-stat{position:relative;overflow:hidden;border-radius:15px;padding:16px;color:#fff;min-height:112px;box-shadow:0 8px 20px rgba(25,58,88,.15)}
    .ma-stat:after{content:'';position:absolute;width:82px;height:82px;border-radius:50%;right:-22px;bottom:-30px;background:rgba(255,255,255,.13)}
    .ma-stat .icon{font-size:22px;margin-bottom:12px}.ma-stat .value{font-size:27px;font-weight:900;line-height:1}.ma-stat .label{font-size:12px;font-weight:800;opacity:.92;margin-top:7px;text-transform:uppercase;letter-spacing:.45px}
    .ma-blue{background:linear-gradient(135deg,#255d91,#347fba)}.ma-gold{background:linear-gradient(135deg,#b97a18,#dca63e)}.ma-purple{background:linear-gradient(135deg,#6553a5,#8572c5)}.ma-teal{background:linear-gradient(135deg,#11706e,#1ca19d)}.ma-green{background:linear-gradient(135deg,#287652,#3b9d72)}
    .ma-profile-accent{border-left:4px solid var(--ma-navy)!important}
    @media(max-width:950px){.ma-dashboard{grid-template-columns:repeat(2,minmax(150px,1fr))}}
    @media(max-width:560px){.ma-dashboard{grid-template-columns:1fr}.ma-stat{min-height:94px}nav .tab{white-space:nowrap}}
  `;
  document.head.appendChild(style);

  function statData(){
    let inv=[],vs=[],qs=[];
    try{if(typeof items!=='undefined'&&Array.isArray(items))inv=items}catch{}
    try{if(typeof vendors!=='undefined'&&Array.isArray(vendors))vs=vendors}catch{}
    try{if(typeof queues!=='undefined'&&Array.isArray(queues))qs=queues}catch{}
    const needs=inv.filter(x=>Math.max(Number(x.target_stock||0)-Number(x.qty_on_hand||0),0)>0).length;
    const queued=qs.filter(q=>q.status==='queued').length;
    const receiving=qs.filter(q=>q.status==='ordered').length;
    return {products:inv.length,needs,queued,vendors:vs.length,receiving};
  }

  function makeDashboard(){
    const section=document.querySelector('#profile');
    const card=section?.querySelector(':scope > .card');
    if(!card)return;
    let dash=card.querySelector('.ma-dashboard');
    if(!dash){
      dash=document.createElement('div');dash.className='ma-dashboard';
      const first=card.querySelector('.queue-title');
      first?.insertAdjacentElement('afterend',dash);
    }
    const s=statData();
    dash.innerHTML=`
      <div class="ma-stat ma-blue"><div class="icon"><i class="bi bi-box-seam"></i></div><div class="value">${s.products}</div><div class="label">Inventory Items</div></div>
      <div class="ma-stat ma-gold"><div class="icon"><i class="bi bi-exclamation-triangle"></i></div><div class="value">${s.needs}</div><div class="label">Needs Ordering</div></div>
      <div class="ma-stat ma-purple"><div class="icon"><i class="bi bi-cart-check"></i></div><div class="value">${s.queued}</div><div class="label">Queue Items</div></div>
      <div class="ma-stat ma-teal"><div class="icon"><i class="bi bi-truck"></i></div><div class="value">${s.vendors}</div><div class="label">Vendors</div></div>
      <div class="ma-stat ma-green"><div class="icon"><i class="bi bi-box-arrow-in-down"></i></div><div class="value">${s.receiving}</div><div class="label">Receiving</div></div>`;
    card.querySelectorAll('.subcard').forEach(c=>c.classList.add('ma-profile-accent'));
  }

  function refresh(){makeDashboard()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{setTimeout(refresh,400);setTimeout(refresh,1300)});else{setTimeout(refresh,250);setTimeout(refresh,1100)}
  document.addEventListener('click',e=>{if(e.target.closest('[data-tab="profile"]'))setTimeout(refresh,120)});
  setInterval(()=>{const p=document.querySelector('#profile.section.active');if(p)refresh()},5000);
})();