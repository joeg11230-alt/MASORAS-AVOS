(()=>{
  let applying=false;
  const LOGO='https://raw.githubusercontent.com/joeg11230-alt/MASORAS-AVOS/300ea5a27d079c707de0c788b3c4c58047a08a28/assets/masoras-avos-logo.png';
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
        header.style.position='relative';
        header.style.minHeight='138px';
        header.style.boxSizing='border-box';
        let center=header.querySelector('#masorasHeaderLogo');
        if(!center){
          center=document.createElement('div');center.id='masorasHeaderLogo';
          center.style.cssText='position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:2;';
          center.innerHTML='<img src="'+LOGO+'" alt="Masoras Avos logo" style="width:112px;height:112px;object-fit:contain;display:block">';
          header.appendChild(center);
        }
        let hebrew=header.querySelector('#masorasHebrewTitle');
        if(!hebrew){
          hebrew=document.createElement('div');hebrew.id='masorasHebrewTitle';hebrew.dir='rtl';hebrew.lang='he';hebrew.textContent='ישיבה מסורת אבות';
          hebrew.style.cssText='position:absolute;right:28px;top:50%;transform:translateY(-50%);font-size:30px;font-weight:800;color:#fff;white-space:nowrap;text-align:right;z-index:2;';
          header.appendChild(hebrew);
        }
      }
      const auth=document.querySelector('#auth .card.auth');
      if(auth){
        let brand=auth.querySelector('.login-brand');
        if(!brand){brand=document.createElement('div');brand.className='login-brand';brand.style.textAlign='center';brand.style.marginBottom='18px';const signIn=auth.querySelector('h3');auth.insertBefore(brand,signIn||auth.firstChild);}
        if(brand.textContent.trim()!=='MASORAS AVOS') brand.innerHTML='<div style="font-size:28px;font-weight:800;letter-spacing:.5px">MASORAS AVOS</div>';
      }
    } finally { applying=false; }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyBranding,{once:true}); else applyBranding();
  setTimeout(applyBranding,300);setTimeout(applyBranding,1200);
})();