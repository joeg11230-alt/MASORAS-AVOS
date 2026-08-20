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
        if(h2){
          h2.textContent='MASORAS AVOS';
          h2.style.cssText='margin:0;font-size:34px;line-height:1;font-weight:900;letter-spacing:1.4px;text-shadow:0 2px 0 rgba(0,0,0,.08);';
        }
        header.querySelectorAll('p,.muted,.subtitle,.masoras-subtitle').forEach(el=>el.remove());
        [...header.querySelectorAll('div,span')].forEach(el=>{
          const t=(el.textContent||'').trim();
          if(/^(Shared live inventory|YMA Kitchen\s*&\s*Maintenance Inventory)$/i.test(t)) el.remove();
        });
        header.style.position='relative';
        header.style.minHeight='108px';
        header.style.padding='18px 28px';
        header.style.boxSizing='border-box';
        header.style.display='flex';
        header.style.alignItems='flex-start';
        header.style.justifyContent='space-between';
        header.style.background='linear-gradient(135deg,#1f4e78 0%,#173b5f 100%)';
        header.style.boxShadow='0 3px 12px rgba(0,0,0,.16)';

        let center=header.querySelector('#masorasHeaderLogo');
        if(!center){
          center=document.createElement('div');center.id='masorasHeaderLogo';
          center.innerHTML='<img src="'+LOGO+'" alt="Masoras Avos logo">';
          header.appendChild(center);
        }
        center.style.cssText='position:absolute;left:50%;top:12px;transform:translateX(-50%);display:flex;align-items:flex-start;justify-content:center;pointer-events:none;z-index:2;';
        const logo=center.querySelector('img');if(logo)logo.style.cssText='width:82px;height:82px;object-fit:contain;display:block;filter:drop-shadow(0 2px 2px rgba(0,0,0,.18));';

        let hebrew=header.querySelector('#masorasHebrewTitle');
        if(!hebrew){hebrew=document.createElement('div');hebrew.id='masorasHebrewTitle';hebrew.dir='rtl';hebrew.lang='he';hebrew.textContent='ישיבה מסורת אבות';header.appendChild(hebrew);}
        hebrew.style.cssText="position:absolute;right:28px;top:18px;font-size:38px;line-height:1;font-weight:900;color:#fff;white-space:nowrap;text-align:right;z-index:2;letter-spacing:.5px;text-shadow:0 2px 0 rgba(0,0,0,.10);font-family:'Arial Hebrew','Noto Sans Hebrew','Rubik',Arial,sans-serif;";
      }
      const auth=document.querySelector('#auth .card.auth');
      if(auth){
        let brand=auth.querySelector('.login-brand');
        if(!brand){brand=document.createElement('div');brand.className='login-brand';brand.style.textAlign='center';brand.style.marginBottom='18px';const signIn=auth.querySelector('h3');auth.insertBefore(brand,signIn||auth.firstChild);}
        brand.innerHTML='<div style="font-size:28px;font-weight:800;letter-spacing:.5px">MASORAS AVOS</div>';
      }
    } finally { applying=false; }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyBranding,{once:true}); else applyBranding();
  setTimeout(applyBranding,300);setTimeout(applyBranding,1200);
})();