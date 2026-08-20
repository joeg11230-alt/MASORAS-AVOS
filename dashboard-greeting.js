(()=>{
  function greetingForHour(h,es){
    if(h>=5&&h<12)return es?'Buenos días':'Good Morning';
    if(h>=12&&h<18)return es?'Buenas tardes':'Good Afternoon';
    if(h>=18&&h<22)return es?'Buenas noches':'Good Evening';
    return es?'Buenas noches':'Good Night';
  }

  async function getUserName(){
    try{
      if(!window.db)return '';
      const {data:{session}}=await db.auth.getSession();
      if(!session)return '';
      const email=(session.user.email||'').toLowerCase();
      const r=await db.from('app_users').select('display_name,email').ilike('email',email).maybeSingle();
      return (r.data?.display_name||session.user.user_metadata?.full_name||session.user.user_metadata?.name||'').trim();
    }catch{return '';}
  }

  function ensureGreeting(){
    const brand=[...document.querySelectorAll('header *, .brand, h1, h2')].find(el=>/MASORAS AVOS/i.test((el.textContent||'').trim()));
    if(!brand)return null;
    let wrap=document.querySelector('#dashboardGreetingWrap');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='dashboardGreetingWrap';
      wrap.style.cssText='margin-top:6px;font-size:13px;opacity:.96';
      wrap.innerHTML='<div id="dashboardGreeting" style="font-weight:800;font-size:15px"></div><div id="dashboardClock" style="font-weight:700;margin-top:3px"></div>';
      const nameLine=document.querySelector('#dashboardUserName');
      if(nameLine)nameLine.style.display='none';
      (nameLine||brand).insertAdjacentElement('afterend',wrap);
    }
    return wrap;
  }

  let cachedName='';
  async function render(forceName=false){
    const wrap=ensureGreeting();if(!wrap)return;
    if(forceName||!cachedName)cachedName=await getUserName();
    const now=new Date();
    const es=document.documentElement.lang==='es'||document.querySelector('#userLanguageSelect')?.value==='es';
    const greeting=greetingForHour(now.getHours(),es);
    wrap.querySelector('#dashboardGreeting').textContent=cachedName?`${greeting}, ${cachedName}`:greeting;
    wrap.querySelector('#dashboardClock').textContent=now.toLocaleTimeString(es?'es-US':'en-US',{hour:'numeric',minute:'2-digit',second:'2-digit'});
  }

  function start(){
    render(true);
    setInterval(()=>render(false),1000);
    setTimeout(()=>render(true),900);
    setTimeout(()=>render(true),1800);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();