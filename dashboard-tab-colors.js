(()=>{
  const mainPalette=['#1f4e78','#7b2cbf','#0f766e','#b45309','#be123c','#0369a1','#4d7c0f'];
  const kitchenPalette=['#2563eb','#059669','#d97706','#7c3aed','#db2777','#0891b2'];
  const maintenancePalette=['#374151','#b45309','#0f766e'];

  function paint(buttons,palette){
    buttons.forEach((btn,i)=>{
      const c=palette[i%palette.length];
      btn.style.setProperty('background',c,'important');
      btn.style.setProperty('border-color',c,'important');
      btn.style.setProperty('color','#fff','important');
      btn.style.fontWeight='700';
      btn.style.boxShadow=btn.classList.contains('active')||btn.classList.contains('primary')?'0 0 0 3px rgba(23,32,51,.22)':'none';
    });
  }

  function apply(){
    const nav=document.querySelector('nav');
    if(nav){
      const tabs=[...nav.querySelectorAll(':scope > .tab')].filter(b=>getComputedStyle(b).display!=='none').slice(0,7);
      paint(tabs,mainPalette);
    }
    paint([...document.querySelectorAll('#kitchenSubTabs > button')],kitchenPalette);
    paint([...document.querySelectorAll('#maintenanceSubTabs > button')],maintenancePalette);
  }

  function init(){
    apply();
    setTimeout(apply,300);setTimeout(apply,1000);setTimeout(apply,1800);
    new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
