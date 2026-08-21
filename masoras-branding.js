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
        header.querySelectorAll('p,.muted,.subtitle,.masoras-subtitle,img,svg').forEach(el=>el.remove());
        const h2=header.querySelector('h2');
        const greetingWrap=header.querySelector('#dashboardGreetingWrap');
        [...header.children].forEach(el=>{if(el!==h2&&el!==greetingWrap)el.remove();});
        header.style.cssText='position:relative;min-height:122px;padding:22px 28px;box-sizing:border-box;background:linear-gradient(110deg,#173b66 0%,#24577b 55%,#247c78 100%);box-shadow:0 3px 12px rgba(0,0,0,.14);color:#fff;overflow:hidden;';
        if(h2){
          h2.textContent='MASORAS AVOS';
          h2.removeAttribute('class');
          h2.style.cssText='position:absolute;left:28px;top:18px;margin:0;padding:0;border:0;background:transparent!important;background-image:none!important;box-shadow:none!important;font-size:29px;line-height:1.1;font-weight:900;letter-spacing:1.4px;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.18);';
        }
        let cleanStyle=document.querySelector('#masorasHeaderCleanStyle');
        if(!cleanStyle){cleanStyle=document.createElement('style');cleanStyle.id='masorasHeaderCleanStyle';cleanStyle.textContent=`header h2,header h2::before,header h2::after{background:transparent!important;background-image:none!important;box-shadow:none!important;border:0!important;content:none!important}#masorasHebrewTitle{display:none!important}`;document.head.appendChild(cleanStyle);}
        const wrap=header.querySelector('#dashboardGreetingWrap');
        if(wrap){wrap.style.cssText='position:absolute;left:28px;top:56px;margin:0;color:#fff;line-height:1.2;background:transparent!important;';const greeting=wrap.querySelector('#dashboardGreeting');const clock=wrap.querySelector('#dashboardClock');if(greeting)greeting.style.cssText='font-weight:800;font-size:16px;color:#fff;margin:0;background:transparent!important;';if(clock)clock.style.cssText='font-weight:700;font-size:13px;color:#fff;margin-top:4px;background:transparent!important;';}
      }
      const auth=document.querySelector('#auth .card.auth');
      if(auth){let brand=auth.querySelector('.login-brand');if(!brand){brand=document.createElement('div');brand.className='login-brand';brand.style.cssText='text-align:center;margin-bottom:18px';const signIn=auth.querySelector('h3');auth.insertBefore(brand,signIn||auth.firstChild);}brand.innerHTML='<div style="font-size:28px;font-weight:800;letter-spacing:.5px">MASORAS AVOS</div>';}
    }finally{applying=false}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyBranding,{once:true});else applyBranding();
  setTimeout(applyBranding,300);setTimeout(applyBranding,1200);setTimeout(applyBranding,2500);setTimeout(applyBranding,5000);
})();