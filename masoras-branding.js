(()=>{
  let applying=false;
  function applyBranding(){
    if(applying)return;
    applying=true;
    try{
      document.title='Masoras Avos';
      const header=document.querySelector('header');
      if(header){
        const h2=header.querySelector('h2');
        if(h2 && h2.textContent!=='MASORAS AVOS') h2.textContent='MASORAS AVOS';
        header.querySelectorAll('p,.muted,.subtitle,.masoras-subtitle').forEach(el=>el.remove());
        [...header.querySelectorAll('div,span')].forEach(el=>{
          const t=(el.textContent||'').trim();
          if(/^(Shared live inventory|YMA Kitchen\s*&\s*Maintenance Inventory)$/i.test(t)) el.remove();
        });
      }
      const auth=document.querySelector('#auth .card.auth');
      if(auth){
        let brand=auth.querySelector('.login-brand');
        if(!brand){
          brand=document.createElement('div');
          brand.className='login-brand';
          brand.style.textAlign='center';
          brand.style.marginBottom='18px';
          const signIn=auth.querySelector('h3');
          auth.insertBefore(brand,signIn||auth.firstChild);
        }
        if(brand.textContent.trim()!=='MASORAS AVOS') brand.innerHTML='<div style="font-size:28px;font-weight:800;letter-spacing:.5px">MASORAS AVOS</div>';
      }
    } finally { applying=false; }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyBranding,{once:true});
  else applyBranding();
  setTimeout(applyBranding,300);
  setTimeout(applyBranding,1200);
})();