(()=>{
  function applyFooter(){
    document.querySelectorAll('#kitchenPlaceholder .mf-month').forEach(m=>{
      let f=m.querySelector('.mf-pro-footer');
      if(!f){f=document.createElement('div');f.className='mf-pro-footer';m.appendChild(f);}
      f.innerHTML='<span>Powered by MASORAS AVOS™</span><span> • </span><span>Driven by ALLES BSD © 2026–2027</span><span> • </span><span>Designed by YGEE_2026–2027</span>';
    });
  }
  function style(){if(document.querySelector('#mfProfessionalPrintStyle'))return;const s=document.createElement('style');s.id='mfProfessionalPrintStyle';s.textContent=`
    .mf-pro-footer{padding:6px 10px;text-align:center;font-size:10px;font-weight:800;letter-spacing:.35px;color:#475569;border-top:1px solid #dbe3ec;background:#fff}
    @page{size:Letter landscape;margin:.22in}
    @media print{
      .mf-month:not(.print-hidden){width:10.52in!important;height:7.82in!important;border:1.5px solid #334155!important;background:#fff!important;font-family:Arial,Helvetica,sans-serif!important}
      .mf-head{flex:0 0 .62in!important;padding:4px 10px 3px!important;background:#173b66!important;color:#fff!important;border-bottom:0!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      .mf-title{height:.38in!important;gap:10px!important}.mf-title input{color:#fff!important;font-size:17pt!important;font-weight:900!important;text-transform:uppercase!important}.mf-title b{font-size:19pt!important;color:#fff!important;letter-spacing:2.5px!important}
      .mf-weekdays{flex:0 0 .34in!important}.mf-weekdays div{background:#e7edf4!important;color:#173b66!important;font-size:9pt!important;font-weight:900!important;padding:4px 2px!important;border-right:1px solid #b8c4d1!important;border-bottom:1px solid #b8c4d1!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      .mf-week{flex:1 1 0!important}.mf-day{padding:4px 5px!important;border-color:#c7d1dc!important;background:#fff!important}.mf-day.empty{background:#f6f8fb!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      .mf-date{font-size:8pt!important;color:#173b66!important;font-weight:900!important;border-bottom:1px solid #e2e8f0!important;padding-bottom:2px!important;margin-bottom:3px!important}.mf-day textarea{font-size:8.5pt!important;line-height:1.16!important;font-family:Arial,Helvetica,sans-serif!important}
      .mf-notes{flex:0 0 .58in!important;padding:4px 8px!important;background:#f8fafc!important;border-top:1.5px solid #94a3b8!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.mf-notes b{font-size:8pt!important;color:#173b66!important;text-transform:uppercase!important;letter-spacing:.5px!important}.mf-notes textarea{height:.34in!important;font-size:8pt!important;background:transparent!important}
      .mf-pro-footer{display:block!important;visibility:visible!important;flex:0 0 .22in!important;padding:3px 6px!important;font-size:6.8pt!important;line-height:1!important;color:#475569!important;border-top:1px solid #dbe3ec!important;box-sizing:border-box!important;white-space:nowrap!important}
    }
  `;document.head.appendChild(s)}
  function apply(){style();applyFooter()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  new MutationObserver(()=>requestAnimationFrame(applyFooter)).observe(document.documentElement,{childList:true,subtree:true});
  setTimeout(apply,400);setTimeout(apply,1200);
})();