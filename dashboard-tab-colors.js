(()=>{
  const mainPalette=['#1f4e78','#7b2cbf','#0f766e','#b45309','#be123c','#0369a1','#4d7c0f'];
  const kitchenPalette=['#2563eb','#059669','#d97706','#7c3aed','#db2777','#0891b2'];
  const maintenancePalette=['#374151','#b45309','#0f766e','#7c3aed'];

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

  function paintCards(selector,palette){
    [...document.querySelectorAll(selector)].forEach((card,i)=>{
      const c=palette[i%palette.length];
      card.style.setProperty('border','2px solid '+c,'important');
      card.style.setProperty('background',c+'14','important');
      card.style.setProperty('box-shadow','0 4px 12px rgba(23,32,51,.08)','important');
      const title=card.querySelector('b');
      if(title) title.style.setProperty('color',c,'important');
      card.onmouseenter=()=>{card.style.transform='translateY(-2px)';card.style.boxShadow='0 6px 16px rgba(23,32,51,.14)';};
      card.onmouseleave=()=>{card.style.transform='';card.style.boxShadow='0 4px 12px rgba(23,32,51,.08)';};
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
    paintCards('#kitchenLanding .grid > .card',kitchenPalette);
    paintCards('#maintenanceLanding .grid > .card',maintenancePalette);
  }

  function init(){
    apply();setTimeout(apply,300);setTimeout(apply,1000);setTimeout(apply,1800);
    new MutationObserver(()=>requestAnimationFrame(apply)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();