(()=>{
 function apply(){
  const targets=[document.querySelector('#auth .card.auth'),document.querySelector('#profile'),document.querySelector('#orgProfileView')].filter(Boolean);
  targets.forEach(t=>{
   if(t.querySelector('.masorasCopyrightBrand'))return;
   const b=document.createElement('div');b.className='masorasCopyrightBrand';
   b.style.cssText='margin:22px auto 8px;text-align:center;font-family:Trebuchet MS,Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:1px;color:#64748b;';
   b.innerHTML='<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;background:linear-gradient(90deg,#eef2ff,#ecfeff,#f0fdf4);border:1px solid #cbd5e1;box-shadow:0 2px 6px rgba(15,23,42,.08)"><span style="font-size:13px">©</span><span>2026 MASORAS AVOS</span><span style="font-size:9px;vertical-align:super">™</span></span>';
   t.appendChild(b);
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});setTimeout(apply,500);setTimeout(apply,1500);
})();