(()=>{
  let applying=false;
  function applyBranding(){
    if(applying)return; applying=true;
    try{
      document.title='Masoras Avos';
      const header=document.querySelector('header');
      if(header){
        header.querySelector('#masorasHeaderLogo')?.remove();
        header.querySelector('#masorasHebrewTitle')?.remove();
        header.querySelector('#userLanguageBox')?.remove();
        header.querySelectorAll('p,.muted,.subtitle,.masoras-subtitle').forEach(el=>el.remove());
        [...header.querySelectorAll('div,span')].forEach(el=>{const t=(el.textContent||'').trim();if(/^(Shared live inventory|YMA Kitchen\s*&\s*Maintenance Inventory|ישיבה מסורת אבות)$/i.test(t))el.remove();});
        header.style.cssText='position:relative;min-height:122px;padding:22px 28px;box-sizing:border-box;background:linear-gradient(110deg,#173b66 0%,#24577b 55%,#247c78 100%);box-shadow:0 3px 12px rgba(0,0,0,.14);color:#fff;';
        const h2=header.querySelector('h2');
        if(h2){h2.textContent='MASORAS AVOS';h2.style.cssText='position:absolute;left:28px;top:18px;margin:0;padding:0;background:transparent!important;background-color:transparent!important;border:0!important;box-shadow:none!important;font-size:29px;line-height:1.1;font-weight:900;letter-spacing:1.4px;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.18);';}
        const wrap=header.querySelector('#dashboardGreetingWrap');
        if(wrap){wrap.style.cssText='position:absolute;left:28px;top:56px;margin:0;color:#fff;line-height:1.2;';const greeting=wrap.querySelector('#dashboardGreeting');const clock=wrap.querySelector('#dashboardClock');if(greeting)greeting.style.cssText='font-weight:800;font-size:16px;color:#fff;margin:0;';if(clock)clock.style.cssText='font-weight:700;font-size:13px;color:#fff;margin-top:4px;';}
      }
      const auth=document.querySelector('#auth .card.auth');
      if(auth){let brand=auth.querySelector('.login-brand');if(!brand){brand=document.createElement('div');brand.className='login-brand';brand.style.cssText='text-align:center;margin-bottom:18px';const signIn=auth.querySelector('h3');auth.insertBefore(brand,signIn||auth.firstChild);}brand.innerHTML='<div style="font-size:28px;font-weight:800;letter-spacing:.5px">MASORAS AVOS</div>';}
    }finally{applying=false}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyBranding,{once:true});else applyBranding();
  setTimeout(applyBranding,300);setTimeout(applyBranding,1200);setTimeout(applyBranding,2500);
})();