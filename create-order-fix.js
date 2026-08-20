(()=>{
  const n=x=>Number(x)||0;
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
  const money=x=>'$'+n(x).toFixed(2);
  const digits=s=>String(s||'').replace(/\D/g,'');

  function getQueues(){ try{return queues||[]}catch{return window.queues||[]} }
  function getVendors(){ try{return vendors||[]}catch{return window.vendors||[]} }
  function getItems(){ try{return items||[]}catch{return window.items||[]} }
  function vendor(id){return getVendors().find(v=>Number(v.id)===Number(id));}
  function item(id){return getItems().find(i=>Number(i.id)===Number(id));}
  function rows(id){return getQueues().filter(q=>Number(q.vendor_id)===Number(id)&&String(q.status).toLowerCase()==='queued');}
  function price(q){return q.unit_price!=null?n(q.unit_price):n(item(q.inventory_item_id)?.price);}

  function ensureModal(){
    let m=document.querySelector('#poModal');
    if(m && m.querySelector('#poVendorName') && m.querySelector('#poTable')) return m;
    if(m) m.remove();
    m=document.createElement('div');m.id='poModal';m.className='modal';
    m.innerHTML=`<div class="box po-modal"><div class="print-area">
      <div class="queue-title"><div><h2 style="margin:0">Masoras Avos Purchase Order</h2><div id="poVendorName" class="po-vendor"></div></div><button id="poClose" class="print-hide" type="button">Close</button></div>
      <div id="poMeta" class="po-meta"></div><div id="poTable"></div><div id="poTotals" class="order-summary"></div><div id="poExtra"></div><div id="poActions" class="actions print-hide" style="margin-top:16px"></div>
    </div></div>`;
    document.body.appendChild(m);m.querySelector('#poClose').onclick=()=>m.classList.remove('show');return m;
  }

  function contactButtons(v,text,subject){
    let out='';
    if(v?.email) out+=`<a class="btn primary" href="mailto:${encodeURIComponent(v.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}"><i class="bi bi-envelope-fill"></i> Email Order</a>`;
    const sms=digits(v?.cell||v?.phone); if(sms) out+=`<a class="btn" href="sms:${sms}?body=${encodeURIComponent(text)}"><i class="bi bi-chat-dots-fill"></i> Text Order</a>`;
    const wa=digits(v?.whatsapp||v?.cell||v?.phone); if(wa) out+=`<a class="btn whatsapp" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${encodeURIComponent(text)}"><i class="bi bi-whatsapp"></i> WhatsApp Order</a>`;
    return out;
  }

  async function openPO(vendorId){
    const v=vendor(vendorId),r=rows(vendorId); if(!r.length){alert('There are no queued items for this vendor.');return;}
    const m=ensureModal(),cases=r.reduce((s,q)=>s+n(q.qty),0),grand=r.reduce((s,q)=>s+n(q.qty)*price(q),0);
    m.querySelector('#poVendorName').textContent=v?.vendor||'Vendor';
    m.querySelector('#poMeta').innerHTML=`<div><b>Order Date:</b> ${new Date().toLocaleDateString()}</div><div><b>Order Received Date:</b> Pending</div>${v?.contact_person?`<div><b>Contact:</b> ${esc(v.contact_person)}</div>`:''}${v?.phone?`<div><b>Phone:</b> ${esc(v.phone)}${v.phone_ext?` ext. ${esc(v.phone_ext)}`:''}</div>`:''}`;
    m.querySelector('#poTable').innerHTML='<table><tr><th>Item</th><th>SKU</th><th>Cases</th><th>Unit</th><th>Unit Price</th><th>Total</th></tr>'+r.map(q=>{const it=item(q.inventory_item_id),p=price(q);return `<tr><td><b>${esc(q.item_name)}</b></td><td>${esc(it?.sku||'')}</td><td>${n(q.qty)}</td><td>${esc(q.unit||'')}</td><td>${money(p)}</td><td>${money(n(q.qty)*p)}</td></tr>`}).join('')+'</table>';
    m.querySelector('#poTotals').innerHTML=`<span>Total Cases: ${cases}</span><span class="po-total">Grand Total: ${money(grand)}</span>`;
    const note=r[0]?.po_notes||'';
    m.querySelector('#poExtra').innerHTML=`<div style="margin-top:14px"><label><b>Purchase Order Notes</b><textarea id="poNotesFix" rows="3">${esc(note)}</textarea></label><div class="row print-hide" style="margin-top:6px"><button id="savePoNotesFix" type="button">Save Notes</button></div><div id="poPrintedNotesFix" style="margin-top:8px;white-space:pre-wrap">${note?'<b>Notes:</b> '+esc(note):''}</div></div>`;
    m.querySelector('#savePoNotesFix').onclick=async()=>{const val=m.querySelector('#poNotesFix').value.trim()||null;const ids=r.map(x=>x.id);const res=await db.from('vendor_order_queue').update({po_notes:val}).in('id',ids);if(res.error)return alert(res.error.message);r.forEach(x=>x.po_notes=val);m.querySelector('#poPrintedNotesFix').innerHTML=val?'<b>Notes:</b> '+esc(val):'';alert('Purchase order notes saved.');};
    const lines=['Masoras Avos Purchase Order','Vendor: '+(v?.vendor||''),'Order Date: '+new Date().toLocaleDateString(),''];r.forEach(q=>lines.push('- '+q.item_name+': '+n(q.qty)+(q.unit?' '+q.unit:'')+' @ '+money(price(q))+' = '+money(n(q.qty)*price(q))));lines.push('','Total Cases: '+cases,'Grand Total: '+money(grand));if(note)lines.push('','Notes: '+note);const text=lines.join('\n'),subject='Masoras Avos Purchase Order - '+(v?.vendor||'Vendor');
    m.querySelector('#poActions').innerHTML=`<button id="poPrintFix" type="button"><i class="bi bi-printer-fill"></i> Print Order</button><button class="primary" id="poVendorFix" type="button">Vendor Profile</button>${contactButtons(v,text,subject)}<button class="success" id="poCloseOrderFix" type="button">Close Order</button>`;
    m.querySelector('#poPrintFix').onclick=()=>window.print();
    m.querySelector('#poVendorFix').onclick=()=>{m.classList.remove('show');try{switchTab('vendors');openVendor(vendorId)}catch(e){alert(e.message||e)}};
    m.querySelector('#poCloseOrderFix').onclick=()=>{try{closeVendorOrder(vendorId)}catch(e){alert(e.message||e)}};
    m.classList.add('show');
  }

  window.openPurchaseOrder=openPO;
  document.addEventListener('click',e=>{
    const b=e.target.closest('.create-po,.fix-po,.create-vendor-po'); if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();const id=Number(b.dataset.vid||b.closest('[data-queue-vendor]')?.dataset.queueVendor);if(id)openPO(id);
  },true);
})();