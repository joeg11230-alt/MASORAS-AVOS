(()=>{
  const esc2=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const num2=n=>Number(n)||0;
  const money2=n=>'$'+num2(n).toFixed(2);

  function activeQueuedRows(){
    try{return (queues||[]).filter(q=>String(q.status||'').toLowerCase()==='queued');}
    catch{return [];}
  }

  function fallbackRenderQueues(){
    const wrap=document.querySelector('#queuewrap');
    if(!wrap)return;
    const active=activeQueuedRows();
    if(!active.length){
      wrap.innerHTML='<div class="card">No items are currently in an order queue. Add an item from Needs Ordering or use Add Manual Order Item.</div>';
      return;
    }
    const grouped={};
    active.forEach(q=>(grouped[q.vendor_id]??=[]).push(q));
    wrap.innerHTML=Object.keys(grouped).map(id=>{
      const rows=grouped[id];
      let v=null;
      try{v=vendorById(id);}catch{}
      const vendorName=v?.vendor||rows[0]?.vendor_name||'Vendor';
      const cases=rows.reduce((s,q)=>s+num2(q.qty),0);
      const grand=rows.reduce((s,q)=>{
        let price=q.unit_price;
        try{if(price==null&&q.inventory_item_id)price=itemById(q.inventory_item_id)?.price;}catch{}
        return s+num2(q.qty)*num2(price);
      },0);
      return '<div class="card" data-queue-vendor="'+id+'" style="margin-bottom:12px">'+
        '<div class="queue-title"><div><h3 style="margin:0">'+esc2(vendorName)+'</h3><span class="badge">'+rows.length+' item'+(rows.length===1?'':'s')+'</span></div>'+
        '<div class="row"><button class="fix-manual" data-vid="'+id+'">Add Manual Item</button><button class="fix-po" data-vid="'+id+'">Create Order</button><button class="success fix-close" data-vid="'+id+'">Close Order</button></div></div>'+
        '<table style="margin-top:10px"><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Unit Price</th><th>Line Total</th><th></th></tr>'+
        rows.map(q=>{let price=q.unit_price;try{if(price==null&&q.inventory_item_id)price=itemById(q.inventory_item_id)?.price;}catch{};return '<tr><td>'+esc2(q.item_name||'')+'</td><td><input class="fix-qty queue-qty" type="number" min="1" value="'+num2(q.qty)+'" data-id="'+q.id+'"></td><td>'+esc2(q.unit||'')+'</td><td>'+money2(price)+'</td><td><b>'+money2(num2(q.qty)*num2(price))+'</b></td><td><button class="danger fix-remove" data-id="'+q.id+'">Remove</button></td></tr>'}).join('')+
        '</table><div class="order-summary"><span>Total Cases: '+cases+'</span><span class="po-total">Grand Total: '+money2(grand)+'</span></div></div>';
    }).join('');

    document.querySelectorAll('.fix-qty').forEach(i=>i.onchange=async()=>{try{await updateQueue(i.dataset.id,{qty:Math.max(1,num2(i.value))});}catch(e){alert(e.message||e)}});
    document.querySelectorAll('.fix-remove').forEach(b=>b.onclick=()=>{try{removeQueue(Number(b.dataset.id));}catch(e){alert(e.message||e)}});
    document.querySelectorAll('.fix-close').forEach(b=>b.onclick=()=>{try{closeVendorOrder(Number(b.dataset.vid));}catch(e){alert(e.message||e)}});
    document.querySelectorAll('.fix-po').forEach(b=>b.onclick=()=>{try{openPurchaseOrder(Number(b.dataset.vid));}catch(e){alert(e.message||e)}});
    document.querySelectorAll('.fix-manual').forEach(b=>b.onclick=()=>{try{openManualOrderItem(Number(b.dataset.vid));}catch(e){alert(e.message||e)}});
  }

  const original=window.renderQueues;
  window.renderQueues=function(){
    let failed=false;
    try{if(typeof original==='function')original();else failed=true;}catch(e){console.error('Original queue render failed',e);failed=true;}
    const active=activeQueuedRows();
    const wrap=document.querySelector('#queuewrap');
    const renderedCards=wrap?.querySelectorAll('[data-queue-vendor]').length||0;
    if(failed||(active.length&&renderedCards===0))fallbackRenderQueues();
  };

  const originalAdd=window.addItemToQueue;
  if(typeof originalAdd==='function'){
    window.addItemToQueue=async function(itemId,openAfter){
      await originalAdd(itemId,false);
      try{await loadAll();}catch{}
      try{window.renderQueues();}catch{}
      if(openAfter){
        try{const x=itemById(itemId),vid=vendorIdByName(x?.vendor);switchTab('queues');setTimeout(()=>document.querySelector('[data-queue-vendor="'+vid+'"]')?.scrollIntoView({behavior:'smooth'}),100);}catch{}
      }
    };
  }

  setTimeout(()=>{try{window.renderQueues();}catch{}},800);
  setTimeout(()=>{try{window.renderQueues();}catch{}},1800);
})();