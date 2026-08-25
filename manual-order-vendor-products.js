(()=>{
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  let productCache=[];

  function vendorById(id){
    return (Array.isArray(window.vendors)?window.vendors:[]).find(v=>Number(v.id)===Number(id))||null;
  }

  function ensureItemSelect(){
    const modal=document.querySelector('#manualOrderModal');
    const vendorSel=document.querySelector('#manualVendor');
    const old=document.querySelector('#manualItem');
    if(!modal||!vendorSel||!old)return;

    let itemSel=document.querySelector('#manualItemSelect');
    if(!itemSel){
      itemSel=document.createElement('select');
      itemSel.id='manualItemSelect';
      itemSel.required=true;
      itemSel.innerHTML='<option value="">Select vendor first…</option>';
      old.style.display='none';
      old.required=false;
      old.parentElement.insertBefore(itemSel,old);
      itemSel.onchange=()=>{
        const p=productCache.find(x=>Number(x.id)===Number(itemSel.value));
        old.value=p?.item||'';
        const unit=document.querySelector('#manualUnit');
        const price=document.querySelector('#manualPrice');
        if(p&&unit){
          let found=[...unit.options||[]].find(o=>String(o.value).toLowerCase()===String(p.unit||'').toLowerCase());
          if(p.unit&&!found){const o=document.createElement('option');o.value=p.unit;o.textContent=p.unit;unit.appendChild(o);}
          unit.value=p.unit||'';
        }
        if(p&&price)price.value=p.price??'';
      };
    }

    if(!vendorSel.dataset.productLinked){
      vendorSel.dataset.productLinked='1';
      vendorSel.addEventListener('change',loadProducts);
    }
    loadProducts();
  }

  async function loadProducts(){
    const vendorSel=document.querySelector('#manualVendor');
    const itemSel=document.querySelector('#manualItemSelect');
    const old=document.querySelector('#manualItem');
    if(!vendorSel||!itemSel||!old)return;
    const vendorId=Number(vendorSel.value||0);
    if(!vendorId){productCache=[];itemSel.innerHTML='<option value="">Select vendor first…</option>';old.value='';return;}
    const v=vendorById(vendorId);
    if(!v?.vendor){productCache=[];itemSel.innerHTML='<option value="">No vendor products found</option>';old.value='';return;}
    itemSel.disabled=true;itemSel.innerHTML='<option value="">Loading products…</option>';
    try{
      const r=await db.from('inventory_items').select('id,item,brand,sku,unit,price,is_active').eq('vendor',v.vendor).order('item');
      if(r.error)throw r.error;
      productCache=(r.data||[]).filter(x=>x.is_active!==false);
      itemSel.innerHTML='<option value="">Select '+esc(v.vendor)+' product…</option>'+productCache.map(p=>`<option value="${p.id}">${esc(p.item)}${p.brand?' — '+esc(p.brand):''}${p.sku?' — SKU '+esc(p.sku):''}</option>`).join('');
      if(!productCache.length)itemSel.innerHTML='<option value="">No products assigned to '+esc(v.vendor)+'</option>';
      old.value='';
    }catch(e){console.error(e);itemSel.innerHTML='<option value="">Could not load vendor products</option>';}
    itemSel.disabled=false;
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('#addManualQueue')||e.target.closest('.fix-manual')||e.target.closest('[data-kitchen-page="queues"]'))setTimeout(ensureItemSelect,80);
  },true);

  const obs=new MutationObserver(()=>{
    const m=document.querySelector('#manualOrderModal');
    if(m?.classList.contains('show'))setTimeout(ensureItemSelect,40);
  });
  function boot(){obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});setTimeout(ensureItemSelect,800);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();