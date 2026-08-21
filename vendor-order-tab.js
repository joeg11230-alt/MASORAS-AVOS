(()=>{
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  let currentVendor=null,vendorItems=[];
  async function loadVendorItems(vendorId){
    const v=(window.vendors||[]).find(x=>Number(x.id)===Number(vendorId));
    currentVendor=v||null;
    if(!v||typeof db==='undefined')return [];
    const r=await db.from('inventory_items').select('id,vendor,item,brand,sku,unit,case_pack,pounds_per_case,price,is_active').eq('vendor',v.vendor).order('item');
    if(r.error)throw r.error;
    vendorItems=(r.data||[]).filter(i=>i.is_active!==false);
    return vendorItems;
  }
  function ensureSection(){
    const modal=document.querySelector('#vendorModal'),box=modal?.querySelector('.box'),vid=Number(document.querySelector('#vid')?.value||0);
    if(!modal||!box||!vid)return;
    let sec=modal.querySelector('#vendorQuickOrderSection');
    if(!sec){
      sec=document.createElement('div');sec.id='vendorQuickOrderSection';sec.className='subcard';sec.style.cssText='margin-top:14px;border:2px solid #2563eb;background:#f8fbff';
      const target=modal.querySelector('#vendorOrderSection')||modal.querySelector('#invoiceSection');
      if(target)target.before(sec);else box.appendChild(sec);
    }
    sec.innerHTML='<div class="section-head" style="margin:0;border:0;padding:0"><div><h3 style="margin:0">Order</h3><div class="muted">Select from this vendor’s inventory items and add directly to the order queue.</div></div></div><div id="vendorQuickOrderBody" style="margin-top:10px"><div class="muted">Loading vendor inventory…</div></div>';
    loadVendorItems(vid).then(draw).catch(e=>{sec.querySelector('#vendorQuickOrderBody').innerHTML='<div class="short">Could not load vendor items: '+esc(e.message)+'</div>'});
  }
  function draw(){
    const body=document.querySelector('#vendorQuickOrderBody');if(!body)return;
    if(!vendorItems.length){body.innerHTML='<div class="muted">No active inventory items are assigned to this vendor yet.</div>';return;}
    body.innerHTML=`<div class="form" style="grid-template-columns:2fr .65fr .8fr .85fr"><label>Inventory Item<select id="vendorOrderItem"><option value="">Select item…</option>${vendorItems.map(i=>`<option value="${i.id}">${esc(i.item)}${i.brand?' — '+esc(i.brand):''}${i.sku?' — SKU '+esc(i.sku):''}</option>`).join('')}</select></label><label>Qty<input id="vendorOrderQty" type="number" min="1" step="1" value="1"></label><label>Unit<input id="vendorOrderUnit" readonly></label><label>Price<input id="vendorOrderPrice" type="number" min="0" step=".01"></label></div><div id="vendorOrderItemInfo" class="muted" style="margin-top:6px"></div><div class="row" style="margin-top:10px"><button id="vendorAddOrderItem" class="primary" type="button">+ Add to Order Queue</button><button id="vendorOpenOrderQueue" type="button">Open Order Queue</button></div><div id="vendorOrderStatus" class="muted" style="margin-top:6px"></div>`;
    const sel=body.querySelector('#vendorOrderItem'),qty=body.querySelector('#vendorOrderQty'),unit=body.querySelector('#vendorOrderUnit'),price=body.querySelector('#vendorOrderPrice'),info=body.querySelector('#vendorOrderItemInfo');
    const sync=()=>{const i=vendorItems.find(x=>Number(x.id)===Number(sel.value));unit.value=i?.unit||'';price.value=i?.price??'';info.textContent=i?`Case/Pack: ${i.case_pack||'—'}${i.pounds_per_case?` • ${i.pounds_per_case} lbs/case`:''}`:''};
    sel.onchange=sync;sync();
    body.querySelector('#vendorAddOrderItem').onclick=async()=>{const i=vendorItems.find(x=>Number(x.id)===Number(sel.value)),status=body.querySelector('#vendorOrderStatus');if(!i)return alert('Choose an inventory item first.');const q=Math.max(1,Number(qty.value)||1);status.textContent='Adding…';const payload={vendor_id:currentVendor.id,inventory_item_id:i.id,item_name:i.item,qty:Math.round(q),unit:unit.value||i.unit||null,unit_price:price.value===''?null:Number(price.value),status:'queued',added_at:new Date().toISOString()};const r=await db.from('vendor_order_queue').insert(payload);if(r.error){status.textContent='Could not add item: '+r.error.message;return;}status.textContent=`${i.item} added to order queue ✓`;try{if(typeof loadAll==='function')await loadAll()}catch(e){};};
    body.querySelector('#vendorOpenOrderQueue').onclick=()=>{document.querySelector('#vendorModal')?.classList.remove('show');try{if(typeof switchTab==='function')switchTab('queues')}catch(e){}};
  }
  function wrapOpen(){if(typeof window.openVendor!=='function'||window.openVendor.__vendorOrderWrapped)return;const old=window.openVendor;const wrapped=async function(id){const r=await old(id);setTimeout(ensureSection,40);return r};wrapped.__vendorOrderWrapped=true;window.openVendor=wrapped;}
  const obs=new MutationObserver(()=>{wrapOpen();const m=document.querySelector('#vendorModal');if(m?.classList.contains('show'))setTimeout(ensureSection,40)});
  function boot(){wrapOpen();obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();