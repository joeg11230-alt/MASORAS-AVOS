(()=>{
  function greetingForHour(h,es){
    if(h>=5&&h<12)return es?'Buenos días':'Good Morning';
    if(h>=12&&h<18)return es?'Buenas tardes':'Good Afternoon';
    if(h>=18&&h<22)return es?'Buenas noches':'Good Evening';
    return es?'Buenas noches':'Good Night';
  }

  function ensureGreeting(){
    const brand=[...document.querySelectorAll('header *, .brand, h1, h2')].find(el=>/MASORAS AVOS/i.test((el.textContent||'').trim()));
    if(!brand)return null;
    let wrap=document.querySelector('#dashboardGreetingWrap');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.id='dashboardGreetingWrap';
      wrap.style.cssText='margin-top:6px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:13px;opacity:.96';
      wrap.innerHTML='<span id="dashboardGreeting" style="font-weight:800"></span><span id="dashboardClock" style="font-weight:700"></span>';
      const nameLine=document.querySelector('#dashboardUserName');
      (nameLine||brand).insertAdjacentElement('afterend',wrap);
    }
    return wrap;
  }

  function render(){
    const wrap=ensureGreeting();if(!wrap)return;
    const now=new Date();
    const es=document.documentElement.lang==='es'||document.querySelector('#userLanguageSelect')?.value==='es';
    wrap.querySelector('#dashboardGreeting').textContent=greetingForHour(now.getHours(),es);
    wrap.querySelector('#dashboardClock').textContent=now.toLocaleTimeString(es?'es-US':'en-US',{hour:'numeric',minute:'2-digit',second:'2-digit'});
  }

  function start(){render();setInterval(render,1000);setTimeout(render,800);setTimeout(render,1800);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();