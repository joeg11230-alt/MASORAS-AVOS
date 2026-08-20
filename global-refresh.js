(()=>{
  function ensure(){
    if(document.querySelector('#globalRefreshBtn'))return;
    const style=document.createElement('style');
    style.textContent=`@keyframes masorasSpin{to{transform:rotate(360deg)}}#globalRefreshBtn{position:fixed;right:18px;bottom:18px;z-index:9999;width:44px;height:44px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;color:#1f4e78;box-shadow:0 4px 14px rgba(15,23,42,.18);display:flex;align-items:center;justify-content:center;font-size:21px;padding:0;cursor:pointer}#globalRefreshBtn:hover{background:#eef6ff}#globalRefreshBtn.spinning i{animation:masorasSpin .8s linear infinite}#globalRefreshBtn .refreshLabel{position:absolute;right:52px;background:#172033;color:#fff;border-radius:8px;padding:5px 8px;font-size:11px;white-space:nowrap;opacity:0;pointer-events:none;transition:.15s}#globalRefreshBtn:hover .refreshLabel{opacity:1}`;
    document.head.appendChild(style);
    const b=document.createElement('button');b.id='globalRefreshBtn';b.type='button';b.title='Refresh page';b.setAttribute('aria-label','Refresh page');b.innerHTML='<span class="refreshLabel">Refresh</span><i class="bi bi-arrow-repeat">↻</i>';
    b.onclick=()=>{if(b.classList.contains('spinning'))return;b.classList.add('spinning');b.disabled=true;setTimeout(()=>location.reload(),350);};
    document.body.appendChild(b);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure);else ensure();
  new MutationObserver(ensure).observe(document.documentElement,{childList:true,subtree:true});
})();