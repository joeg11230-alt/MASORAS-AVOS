(()=>{
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  async function updateUserName(){
    try{
      if(!window.db)return;
      const {data:{session}}=await db.auth.getSession();if(!session)return;
      const email=(session.user.email||'').toLowerCase();
      const r=await db.from('app_users').select('display_name,email').ilike('email',email).maybeSingle();
      const name=(r.data?.display_name||session.user.user_metadata?.full_name||session.user.user_metadata?.name||email).trim();if(!name)return;
      const brand=[...document.querySelectorAll('header *, .brand, h1, h2')].find(el=>/MASORAS AVOS/i.test((el.textContent||'').trim()));if(!brand)return;
      let line=document.querySelector('#dashboardUserName');
      if(!line){line=document.createElement('div');line.id='dashboardUserName';line.style.cssText='font-size:14px;font-weight:700;opacity:.9;margin-top:3px;letter-spacing:.1px';brand.insertAdjacentElement('afterend',line)}
      line.innerHTML=esc(name);
    }catch(e){console.error('dashboard user name',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{updateUserName();setTimeout(updateUserName,900)});else{updateUserName();setTimeout(updateUserName,900)}
})();