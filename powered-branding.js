(()=>{
  const markup=`<div class="masoras-powered-brand"><div class="mp-main">POWERED BY <span>MASORAS AVOS</span> <b>2026</b> <sup>™</sup></div><div class="mp-sub">DRIVEN BY <strong>ALLES BSD INC.</strong></div></div>`;
  function addStyle(){if(document.querySelector('#masorasPoweredStyle'))return;const s=document.createElement('style');s.id='masorasPoweredStyle';s.textContent=`
    .masoras-powered-brand{margin:24px auto 6px;padding:16px 18px;text-align:center;border-radius:16px;max-width:760px;background:linear-gradient(125deg,#eef7ff,#fff6e8,#eefcf7);border:1px solid #dbe6ef;box-shadow:0 8px 24px rgba(25,55,90,.10);letter-spacing:.6px}
    .masoras-powered-brand .mp-main{font-family:"Trebuchet MS","Arial Rounded MT Bold",Arial,sans-serif;font-size:16px;font-weight:900;color:#24415f;text-transform:uppercase}
    .masoras-powered-brand .mp-main span{font-size:21px;font-style:italic;letter-spacing:1.5px;background:linear-gradient(90deg,#1f4e78,#7c3aed,#0f766e);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 1px 0 rgba(255,255,255,.45)}
    .masoras-powered-brand .mp-main b{color:#b45309}.masoras-powered-brand sup{color:#7c3aed;font-size:11px;margin-left:2px}
    .masoras-powered-brand .mp-sub{margin-top:6px;font-family:Georgia,"Times New Roman",serif;font-size:13px;font-style:italic;color:#66758a;letter-spacing:1.3px}
    .masoras-powered-brand .mp-sub strong{color:#0f766e;font-size:14px}
    #auth .masoras-powered-brand{margin-top:22px;max-width:440px}
    #profile .masoras-powered-brand{margin-top:18px}
  `;document.head.appendChild(s)}
  function place(){addStyle();const auth=document.querySelector('#auth');if(auth&&!auth.querySelector('.masoras-powered-brand'))auth.insertAdjacentHTML('beforeend',markup);const profile=document.querySelector('#profile');if(profile&&!profile.querySelector('.masoras-powered-brand'))profile.insertAdjacentHTML('beforeend',markup)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',place);else place();
  setTimeout(place,300);setTimeout(place,1000);setInterval(place,2500);
})();