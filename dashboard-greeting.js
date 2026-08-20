(()=>{
  function greetingForHour(h,es){
    if(h>=5&&h<12)return es?'Buenos días':'Good Morning';
    if(h>=12&&h<18)return es?'Buenas tardes':'Good Afternoon';
    if(h>=18&&h<22)return es?'Buenas noches':'Good Evening';
    return es?'Buenas noches':'Good Night';
  }

  function visibleProfileName(){
    const candidates=[...document.querySelectorAll('#orgProfileView h1,#orgProfileView h2,#orgProfileView h3,#orgProfileView .profile-title,#orgProfileView .card b,#orgProfileView .card strong')];
    const hit=candidates.find(el=>{
      const t=(el.textContent||'').trim();
      return t && !/MASORAS AVOS|Contact Information|Users|Permissions/i.test(t);
    });
    return (hit?.textContent||'').trim();
  }

  async function getUserName(){
    try{
      if(!window.db)return visibleProfileName();
      const {data:{session}}=await db.auth.getSession();
      if(!session)return visibleProfileName();
      const email=(session.user.email||'').toLowerCase();
      let name='';
      try{
        const r=await db.from('app_users').select('display_name,email,role').ilike('email',email).maybeSingle();
        name=(r.data?.display_name||'').trim();
      }catch{}
      if(!name)name=(session.user.user_metadata?.full_name||session.user.user_metadata?.name||'').trim();
      if(!name)name=visibleProfileName();
      if(!name&&email==='joeg11230@gmail.com')name='Yossi Goldman';
      return name;
    }catch{return visibleProfileName()||'';}
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
    setTimeout(()=>render(true),3500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();