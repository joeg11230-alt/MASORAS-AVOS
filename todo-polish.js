(()=>{
  function addStyles(){
    if(document.querySelector('#todoPolishStyles'))return;
    const s=document.createElement('style');
    s.id='todoPolishStyles';
    s.textContent=`
      #kitchenPlaceholder [data-v],#maintenancePlaceholder [data-v],
      #ktPrint,#ktEmail,#ktPdf,#mtPrint,#mtEmail,#mtPdf,
      #ktAdd,#mtAdd{border:0!important;border-radius:999px!important;font-weight:900!important;padding:9px 15px!important;box-shadow:0 2px 8px rgba(15,23,42,.10);transition:.18s ease;}
      #kitchenPlaceholder [data-v]:hover,#maintenancePlaceholder [data-v]:hover,
      #ktPrint:hover,#ktEmail:hover,#ktPdf:hover,#mtPrint:hover,#mtEmail:hover,#mtPdf:hover,
      #ktAdd:hover,#mtAdd:hover{transform:translateY(-1px);box-shadow:0 5px 14px rgba(15,23,42,.16)}
      #kitchenPlaceholder [data-v="today"],#maintenancePlaceholder [data-v="today"]{background:#2563eb!important;color:#fff!important}
      #kitchenPlaceholder [data-v="upcoming"],#maintenancePlaceholder [data-v="upcoming"]{background:#facc15!important;color:#422006!important}
      #kitchenPlaceholder [data-v="overdue"],#maintenancePlaceholder [data-v="overdue"]{background:#dc2626!important;color:#fff!important}
      #kitchenPlaceholder [data-v="recurring"],#maintenancePlaceholder [data-v="recurring"]{background:linear-gradient(135deg,#16a34a 0%,#16a34a 48%,#7e22ce 52%,#7e22ce 100%)!important;color:#fff!important}
      #kitchenPlaceholder [data-v="completed"],#maintenancePlaceholder [data-v="completed"]{background:#15803d!important;color:#fff!important;border-color:#166534!important}
      #kitchenPlaceholder [data-v].primary,#maintenancePlaceholder [data-v].primary{outline:3px solid rgba(15,23,42,.18)!important;outline-offset:2px!important;filter:saturate(1.08) brightness(.98)}
      #ktPrint,#mtPrint{background:#0f766e!important;color:#fff!important}
      #ktEmail,#mtEmail{background:#7c3aed!important;color:#fff!important}
      #ktPdf,#mtPdf{background:#db2777!important;color:#fff!important}
      #ktAdd,#mtAdd{background:#0891b2!important;color:#fff!important}
      #kitchenPlaceholder .subcard,#maintenancePlaceholder .subcard{border-radius:18px!important;box-shadow:0 10px 30px rgba(15,23,42,.08)!important;border:1px solid #e2e8f0!important;background:linear-gradient(180deg,#fff 0%,#fbfdff 100%)!important}
      #kitchenPlaceholder .kt-card,#maintenancePlaceholder .mt-card{border-radius:14px!important;box-shadow:0 3px 12px rgba(15,23,42,.07)!important;transition:.18s ease;background:#fff!important}
      #kitchenPlaceholder .kt-card:hover,#maintenancePlaceholder .mt-card:hover{transform:translateY(-1px);box-shadow:0 7px 18px rgba(15,23,42,.12)!important}
    `;
    document.head.appendChild(s);
  }
  function boot(){addStyles();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();