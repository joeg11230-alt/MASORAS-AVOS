(()=>{
  const n=x=>Number(x)||0;
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const money=x=>'$'+n(x).toFixed(2);
  const digits=s=>String(s||'').replace(/\D/g,'');

  async function fetchOrderData(vendorId){
    const [qr,vr]=await Promise.all([
      db.from('vendor_order_queue').select('*').eq('vendor_id',vendorId).eq('status','queued').order('added_at',{ascending:true}),
      db.from('vendors').select('*').eq('id',vendorId).maybeSingle()
    ]);
    if(qr.error)throw qr.error;if(vr.error)throw vr.error;
    const rows=qr.data||[],v=vr.data||null;
    const ids=[...new Set(rows.map(r=>r.inventory_item_id).filter(Boolean))];
    let itemMap={};
    if(ids.length){const ir=await db.from('inventory_items').select('id,sku,price').in('id',ids);if(ir.error)throw ir.error;(ir.data||[]).forEach(i=>itemMap[i.id]=i)}
    return {rows,v,itemMap};
  }

  function ensureModal(){
    let m=document.querySelector('#poModal');
    const complete=m&&['#poVendorName','#poMeta','#poTable','#poTotals','#poExtra','#poActions','#poClose'].every(sel=>m.querySelector(sel));
    if(complete)return m;
    if(m)m.remove();
    m=document.createElement('div');m.id='poModal';m.className='modal';
    m.innerHTML=`<div class="box po-modal"><div class="print-area"><div class="queue-title"><div><h2 style="margin:0">Masoras Avos Purchase Order</h2><div id="poVendorName" class="po-vendor"></div></div><button id="poClose" class="print-hide" type="button">Close</button></div><div id="poMeta" class="po-meta"></div><div id="poTable"></div><div id="poTotals" class="order-summary"></div><div id="poExtra"></div><div id="poActions" class="actions print-hide" style="margin-top:16px"></div></div></div>`;
    document.body.appendChild(m);
    m.querySelector('#poClose').onclick=()=>m.classList.remove('show');
    return m;
  }

  function sendOrderButtons(v,text,subject){
    const email=v?.email?`<a class="btn primary" href="mailto:${encodeURIComponent(v.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}"><i class="bi bi-envelope-fill"></i> Email Order</a>`:`<button type="button" disabled title="Add an email address to this vendor">Email Order — No Email</button>`;
    const sms=digits(v?.cell||v?.phone);
    const textBtn=sms?`<a class="btn" href="sms:${sms}?body=${encodeURIComponent(text)}"><i class="bi bi-chat-dots-fill"></i> Text Order</a>`:`<button type="button" disabled title="Add a cell or phone number to this vendor">Text Order — No Number</button>`;
    const wa=digits(v?.whatsapp||v?.cell||v?.phone);
    const waBtn=wa?`<a class="btn whatsapp" target="_blank" rel="noopener" href="https://wa.me/${wa}?text=${encodeURIComponent(text)}"><i class="bi bi-whatsapp"></i> WhatsApp Order</a>`:`<button type="button" disabled title="Add a WhatsApp or cell number to this vendor">WhatsApp Order — No Number</button>`;
    return email+textBtn+waBtn;
  }

  async function openPO(vendorId){
    try{
      vendorId=Number(vendorId);if(!vendorId)return alert('Vendor could not be identified for this order.');
      const {rows:r,v,itemMap}=await fetchOrderData(vendorId);
      if(!r.length)return alert('There are no queued items for this vendor.');
      const price=q=>q.unit_price!=null?n(q.unit_price):n(itemMap[q.inventory_item_id]?.price);
      const m=ensureModal(),cases=r.reduce((s,q)=>s+n(q.qty),0),grand=r.reduce((s,q)=>s+n(q.qty)*price(q),0);
      m.querySelector('#poVendorName').textContent=v?.vendor||'Vendor';
      m.querySelector('#poMeta').innerHTML=`<div><b>Order Date:</b> ${new Date().toLocaleDateString()}</div><div><b>Order Received Date:</b> Pending</div>${v?.contact_person?`<div><b>Contact:</b> ${esc(v.contact_person)}</div>`:''}${v?.phone?`<div><b>Phone:</b> ${esc(v.phone)}${v.phone_ext?` ext. ${esc(v.phone_ext)}`:''}</div>`:''}${v?.email?`<div><b>Email:</b> ${esc(v.email)}</div>`:''}`;
      m.querySelector('#poTable').innerHTML='<table><tr><th>Item</th><th>SKU</th><th>Cases</th><th>Unit</th><th>Unit Price</th><th>Total</th></tr>'+r.map(q=>{const p=price(q);return `<tr><td><b>${esc(q.item_name)}</b></td><td>${esc(itemMap[q.inventory_item_id]?.sku||'')}</td><td>${n(q.qty)}</td><td>${esc(q.unit||'')}</td><td>${money(p)}</td><td>${money(n(q.qty)*p)}</td></tr>`}).join('')+'</table>';
      m.querySelector('#poTotals').innerHTML=`<span>Total Cases: ${cases}</span><span class="po-total">Grand Total: ${money(grand)}</span>`;
      const note=r[0]?.po_notes||'';
      const lines=['Masoras Avos Purchase Order','Vendor: '+(v?.vendor||''),'Order Date: '+new Date().toLocaleDateString(),''];
      r.forEach(q=>lines.push('- '+q.item_name+': '+n(q.qty)+(q.unit?' '+q.unit:'')+' @ '+money(price(q))+' = '+money(n(q.qty)*price(q))));
      lines.push('','Total Cases: '+cases,'Grand Total: '+money(grand));if(note)lines.push('','Notes: '+note);
      const text=lines.join('\n'),subject='Masoras Avos Purchase Order - '+(v?.vendor||'Vendor');
      m.querySelector('#poExtra').innerHTML=`<div class="print-hide" style="margin-top:16px;padding:12px;border:1px solid #d9dee7;border-radius:10px;background:#f8fbfd"><div style="font-weight:800;margin-bottom:8px">Send Order Directly to Vendor</div><div class="row">${sendOrderButtons(v,text,subject)}</div></div><div style="margin-top:14px"><label><b>Purchase Order Notes</b><textarea id="poNotesFix" rows="3">${esc(note)}</textarea></label><div class="row print-hide" style="margin-top:6px"><button id="savePoNotesFix" type="button">Save Notes</button></div><div id="poPrintedNotesFix" style="margin-top:8px;white-space:pre-wrap">${note?'<b>Notes:</b> '+esc(note):''}</div></div>`;
      m.querySelector('#savePoNotesFix').onclick=async()=>{const val=m.querySelector('#poNotesFix').value.trim()||null,ids=r.map(x=>x.id);const res=await db.from('vendor_order_queue').update({po_notes:val}).in('id',ids);if(res.error)return alert(res.error.message);m.querySelector('#poPrintedNotesFix').innerHTML=val?'<b>Notes:</b> '+esc(val):'';alert('Purchase order notes saved.');};
      m.querySelector('#poActions').innerHTML=`<button id="poPrintFix" type="button"><i class="bi bi-printer-fill"></i> Print Order</button><button class="primary" id="poVendorFix" type="button">Vendor Profile</button><button class="success" id="poCloseOrderFix" type="button">Close Order</button>`;
      m.querySelector('#poPrintFix').onclick=()=>window.print();
      m.querySelector('#poVendorFix').onclick=()=>{m.classList.remove('show');try{switchTab('vendors');openVendor(vendorId)}catch(e){alert(e.message||e)}};
      m.querySelector('#poCloseOrderFix').onclick=()=>{try{closeVendorOrder(vendorId)}catch(e){alert(e.message||e)}};
      m.classList.add('show');
    }catch(e){console.error('Create Order failed',e);alert('Could not create purchase order: '+(e?.message||e));}
  }

  window.openPurchaseOrder=openPO;
  document.addEventListener('click',e=>{
    const b=e.target.closest('button,a');if(!b)return;
    const label=(b.textContent||'').trim().toLowerCase();
    const isCreate=b.matches('.create-po,.fix-po,.create-vendor-po')||label==='create order'||label==='crear pedido';
    if(!isCreate)return;
    const card=b.closest('[data-queue-vendor]');
    const id=Number(b.dataset.vid||b.dataset.vendorId||card?.dataset.queueVendor||document.querySelector('#vid')?.value||0);
    if(!id)return;
    e.preventDefault();e.stopImmediatePropagation();openPO(id);
  },true);
})();