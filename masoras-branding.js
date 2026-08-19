(()=>{
  function applyBranding(){
    document.title='Masoras Avos - YMA Kitchen & Maintenance Inventory';
    const header=document.querySelector('header');
    if(header){
      const h2=header.querySelector('h2');
      if(h2)h2.textContent='MASORAS AVOS';
      [...header.children].forEach(el=>{if(el!==h2)el.remove()});
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
      brand.innerHTML='<div style="font-size:28px;font-weight:800;letter-spacing:.5px">MASORAS AVOS</div><div style="margin-top:5px;color:#687386;font-weight:600">YMA Kitchen & Maintenance Inventory</div>';
    }
    document.querySelectorAll('.masoras-profile-title').forEach(el=>el.textContent='MASORAS AVOS');
  }
  applyBranding();
  setTimeout(applyBranding,300);
  setTimeout(applyBranding,1200);
})();