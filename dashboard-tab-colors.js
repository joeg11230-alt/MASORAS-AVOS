(()=>{
  const palette=['#1f4e78','#7b2cbf','#0f766e','#b45309','#be123c','#0369a1','#4d7c0f'];
  function apply(){
    const nav=document.querySelector('nav');if(!nav)return;
    const tabs=[...nav.querySelectorAll(':scope > .tab')].filter(b=>getComputedStyle(b).display!=='none').slice(0,7);
    tabs.forEach((btn,i)=>{
      const c=palette[i%palette.length];
      btn.style.setProperty('background',c,'important');
      btn.style.setProperty('border-color',c,'important');
      btn.style.setProperty('color','#fff','important');
      btn.style.fontWeight='700';
      btn.style.boxShadow=btn.classList.contains('active')?'0 0 0 3px rgba(23,32,51,.22)':'none';
    });
  }
  function init(){apply();setTimeout(apply,300);setTimeout(apply,1000);new MutationObserver(apply).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();