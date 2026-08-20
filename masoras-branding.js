(()=>{
  let applying=false;
  function applyBranding(){
    if(applying)return; applying=true;
    try{
      document.title='Masoras Avos';
      const header=document.querySelector('header');
      if(header){
        header.querySelector('#masorasHeaderLogo')?.remove();
        header.querySelector('#userLanguageBox')?.remove();
        const h2=header.querySelector('h2');
        if(h2){h2.textContent='MASORAS AVOS';h2.style.cssText='margin:0;font-size:30px;line-height:1.1;font-weight:900;letter-spacing:1.5px;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.18);';}
        header.querySelectorAll('p,.muted,.subtitle,.masoras-subtitle').forEach(el=>el.remove());
        header.style.cssText+=';position:relative;min-height:108px;padding:20px 28px;box-sizing:border-box;background:linear-gradient(110deg,#173b66 0%,#24577b 55%,#247c78 100%);box-shadow:0 3px 12px rgba(0,0,0,.14);';
        let hebrew=header.querySelector('#masorasHebrewTitle');
        if(!hebrew){hebrew=document.createElement('div');hebrew.id='masorasHebrewTitle';hebrew.dir='rtl';hebrew.lang='he';hebrew.textContent='ישיבה מסורת אבות';header.appendChild(hebrew);}
        hebrew.style.cssText="position:absolute;right:28px;top:20px;font-size:31px;line-height:1.1;font-weight:900;color:#fff;white-space:nowrap;text-align:right;letter-spacing:.3px;text-shadow:0 2px 4px rgba(0,0,0,.18);font-family:'Arial Hebrew','Noto Sans Hebrew',Arial,sans-serif;";
      }
      const auth=document.querySelector('#auth .card.auth');
      if(auth){let brand=auth.querySelector('.login-brand');if(!brand){brand=document.createElement('div');brand.className='login-brand';brand.style.cssText='text-align:center;margin-bottom:18px';const signIn=auth.querySelector('h3');auth.insertBefore(brand,signIn||auth.firstChild);}brand.innerHTML='<div style="font-size:28px;font-weight:800;letter-spacing:.5px">MASORAS AVOS</div>';}
    }finally{applying=false}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyBranding,{once:true});else applyBranding();
  setTimeout(applyBranding,300);setTimeout(applyBranding,1200);
})();