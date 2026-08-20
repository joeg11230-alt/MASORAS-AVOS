(()=>{
  const money2=n=>'$'+Number(n||0).toFixed(2);
  const fmtDate2=d=>d?new Date(d).toLocaleDateString():'';
  const getRows=vendorId=>(window.queues||queues||[]).filter(q=>Number(q.vendor_id)===Number(vendorId)&&q.status==='queued');
  const getOrderedRows=vendorId=>(window.queues||queues||[]).filter(q=>Number(q.vendor_id)===Number(vendorId)&&q.status==='ordered');
  const getVendor=vendorId=>(window.vendors||vendors||[]).find(v=>Number(v.id)===Number(vendorId));
  const getItem=id=>(window.items||items||[]).find(i=>Number(i.id)===Number(id));
  const priceFor=q=>q.unit_price!=null?Number(q.unit_price||0):Number(getItem(q.inventory_item_id)?.price||0);
  const totals=rows=>({cases:rows.reduce((s,q)=>s+Number(q.qty||0),0),grand:rows.reduce((s,q)=>s+Number(q.qty||0)*priceFor(q),0)});
  const digits2=s=>String(s||'').replace(/\D/g,'');
  const esc2=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));

  async function saveAcrossRows(rows, patch){
    if(!rows.length)return;
    const ids=rows.map(r=>r.id);
    const r=await db.from('vendor_order_queue').update(patch).in('id',ids);
    if(r.error)throw r.error;
    rows.forEach(row=>Object.assign(row,patch));
  }

  function orderMessage(vendorId){
    const v=getVendor(vendorId),rows=getRows(vendorId),t=totals(rows),note=rows[0]?.po_notes||'',poNumber=rows[0]?.purchase_order_number||'';
    const lines=['Masoras Avos Purchase Order'];
    if(poNumber)lines.push('Purchase Order #: '+poNumber);
    lines.push('Vendor: '+(v?.vendor||''),'Order Date: '+new Date().toLocaleDateString(),'');
    rows.forEach(q=>lines.push('- '+q.item_name+': '+q.qty+(q.unit?' '+q.unit:'')+' @ '+money2(priceFor(q))+' = '+money2(Number(q.qty||0)*priceFor(q))));
    lines.push('','Total Cases: '+t.cases,'Grand Total: '+money2(t.grand));
    if(note)lines.push('','Notes: '+note);
    return {v,rows,text:lines.join('\n'),subject:'Masoras Avos Purchase Order'+(poNumber?' #'+poNumber:'')+' - '+(v?.vendor||'Vendor')};
  }

  window.orderText=orderMessage;
  window.queueContactButtons=function(vendorId){
    const {v,rows,text,subject}=orderMessage(vendorId); if(!v||!rows.length)return'';
    let out='';
    if(v.email)out+='<a class="btn primary" href="mailto:'+encodeURIComponent(v.email)+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(text)+'"><i class="bi bi-envelope-fill"></i> Email Order</a>';
    const sms=digits2(v.cell||v.phone); if(sms)out+='<a class="btn" href="sms:'+sms+'?body='+encodeURIComponent(text)+'"><i class="bi bi-chat-dots-fill"></i> Text Order</a>';
    const wa=digits2(v.whatsapp||v.cell||v.phone); if(wa)out+='<a class="btn whatsapp" target="_blank" rel="noopener" href="https://wa.me/'+wa+'?text='+encodeURIComponent(text)+'"><i class="bi bi-whatsapp"></i> WhatsApp Order</a>';
    return out;
  };

  async function invoiceOptions(vendorId){
    const r=await db.from('vendor_invoices').select('id,invoice_number,invoice_date,amount,notes').eq('vendor_id',vendorId).order('invoice_date',{ascending:false}).order('created_at',{ascending:false});
    if(r.error)throw r.error;
    return r.data||[];
  }

  function matchText(total,invoice){
    if(!invoice)return '<span class="muted">No invoice matched yet.</span>';
    const amount=Number(invoice.amount||0),diff=amount-total;
    if(Math.abs(diff)<0.005)return '<span class="match">MATCH — Invoice '+money2(amount)+' equals PO '+money2(total)+'</span>';
    if(diff>0)return '<span class="over">INVOICE OVER by '+money2(diff)+' — Invoice '+money2(amount)+' vs PO '+money2(total)+'</span>';
    return '<span class="short">INVOICE UNDER by '+money2(Math.abs(diff))+' — Invoice '+money2(amount)+' vs PO '+money2(total)+'</span>';
  }

  async function renderInvoiceMatch(vendorId,rows,total,container){
    let invoices=[];
    try{invoices=await invoiceOptions(vendorId)}catch(e){container.innerHTML='<div class="muted">Could not load vendor invoices: '+esc2(e.message)+'</div>';return}
    const matched=rows[0]?.matched_invoice_id?Number(rows[0].matched_invoice_id):null;
    container.innerHTML='<div style="margin-top:14px;border-top:1px solid #d9dee7;padding-top:12px"><h3 style="margin:0 0 8px">Match Purchase Order to Invoice</h3><div class="row"><select id="poInvoiceSelect" style="min-width:280px;flex:1"><option value="">Select vendor invoice…</option>'+invoices.map(i=>'<option value="'+i.id+'" '+(Number(i.id)===matched?'selected':'')+'>Invoice '+esc2(i.invoice_number||('#'+i.id))+' — '+esc2(i.invoice_date||'')+' — '+money2(i.amount)+'</option>').join('')+'</select><button id="poMatchInvoice" type="button">Match Invoice</button><button id="poClearInvoice" type="button">Clear Match</button></div><div id="poMatchResult" style="margin-top:8px"></div></div>';
    const result=container.querySelector('#poMatchResult'),sel=container.querySelector('#poInvoiceSelect');
    const show=()=>{const inv=invoices.find(i=>Number(i.id)===Number(sel.value));result.innerHTML=matchText(total,inv)};
    show();
    container.querySelector('#poMatchInvoice').onclick=async()=>{const id=Number(sel.value);if(!id)return alert('Choose an invoice first.');try{await saveAcrossRows(rows,{matched_invoice_id:id,invoice_matched_at:new Date().toISOString()});show();alert('Invoice matched to this purchase order.')}catch(e){alert(e.message)}};
    container.querySelector('#poClearInvoice').onclick=async()=>{try{await saveAcrossRows(rows,{matched_invoice_id:null,invoice_matched_at:null});sel.value='';show()}catch(e){alert(e.message)}};
  }

  window.openPurchaseOrder=async function(vendorId){
    const v=getVendor(vendorId),rows=getRows(vendorId),t=totals(rows); if(!rows.length)return;
    $('#poVendorName').textContent=v?.vendor||'Vendor';
    const poNumber=rows[0]?.purchase_order_number||'';
    $('#poMeta').innerHTML='<div><b>Purchase Order #:</b> <span id="poNumberPrint">'+esc2(poNumber||'Not Set')+'</span></div><div><b>Order Date:</b> '+new Date().toLocaleDateString()+'</div><div><b>Order Received Date:</b> Pending</div>'+(v?.contact_person?'<div><b>Contact:</b> '+esc2(v.contact_person)+'</div>':'')+(v?.phone?'<div><b>Phone:</b> '+esc2(v.phone)+'</div>':'');
    $('#poTable').innerHTML='<table><tr><th>Item</th><th>SKU</th><th>Cases</th><th>Unit</th><th>Unit Price</th><th>Total</th></tr>'+rows.map(q=>{const item=getItem(q.inventory_item_id),price=priceFor(q);return '<tr><td><b>'+esc2(q.item_name)+'</b></td><td>'+esc2(item?.sku||'')+'</td><td>'+q.qty+'</td><td>'+esc2(q.unit||'')+'</td><td>'+money2(price)+'</td><td>'+money2(Number(q.qty||0)*price)+'</td></tr>'}).join('')+'</table>';
    $('#poTotals').innerHTML='<span>Total Cases: '+t.cases+'</span><span class="po-total">Grand Total: '+money2(t.grand)+'</span>';

    let extra=document.querySelector('#poExtra');
    if(!extra){extra=document.createElement('div');extra.id='poExtra';$('#poTotals').after(extra)}
    extra.innerHTML='<div style="margin-top:14px"><div class="print-hide" style="margin-bottom:12px"><label><b>Purchase Order Number</b><div class="row" style="margin-top:5px"><input id="poNumberInput" type="text" placeholder="Enter your PO number" value="'+esc2(poNumber)+'" style="max-width:260px"><button id="savePoNumber" type="button">Save PO Number</button></div></label></div><label><b>Purchase Order Notes</b><textarea id="poNotes" rows="3" placeholder="Delivery instructions, substitutions, special requests…">'+esc2(rows[0]?.po_notes||'')+'</textarea></label><div class="row print-hide" style="margin-top:6px"><button id="savePoNotes" type="button">Save Notes</button></div><div id="poPrintedNotes" style="margin-top:8px;white-space:pre-wrap">'+(rows[0]?.po_notes?'<b>Notes:</b> '+esc2(rows[0].po_notes):'')+'</div><div id="poInvoiceMatch"></div></div>';
    extra.querySelector('#savePoNumber').onclick=async()=>{const num=extra.querySelector('#poNumberInput').value.trim()||null;try{await saveAcrossRows(rows,{purchase_order_number:num});document.querySelector('#poNumberPrint').textContent=num||'Not Set';$('#poActions').innerHTML='<button onclick="window.print()"><i class="bi bi-printer-fill"></i> Print Order</button><button class="primary" id="poVendorProfile">Vendor Profile</button>'+window.queueContactButtons(vendorId)+'<button class="success" id="poCloseOrder">Close Order</button>';$('#poVendorProfile').onclick=()=>{$('#poModal').classList.remove('show');switchTab('vendors');openVendor(vendorId)};$('#poCloseOrder').onclick=()=>closeVendorOrder(vendorId);alert('Purchase order number saved.')}catch(e){alert(e.message)}};
    extra.querySelector('#savePoNotes').onclick=async()=>{const note=extra.querySelector('#poNotes').value.trim()||null;try{await saveAcrossRows(rows,{po_notes:note});extra.querySelector('#poPrintedNotes').innerHTML=note?'<b>Notes:</b> '+esc2(note):'';alert('Purchase order notes saved.')}catch(e){alert(e.message)}};

    $('#poActions').innerHTML='<button onclick="window.print()"><i class="bi bi-printer-fill"></i> Print Order</button><button class="primary" id="poVendorProfile">Vendor Profile</button>'+window.queueContactButtons(vendorId)+'<button class="success" id="poCloseOrder">Close Order</button>';
    $('#poVendorProfile').onclick=()=>{$('#poModal').classList.remove('show');switchTab('vendors');openVendor(vendorId)};
    $('#poCloseOrder').onclick=()=>closeVendorOrder(vendorId);
    $('#poModal').classList.add('show');
    await renderInvoiceMatch(vendorId,rows,t.grand,extra.querySelector('#poInvoiceMatch'));
  };

  const oldRenderReceiving=window.renderReceiving;
  if(typeof oldRenderReceiving==='function'){
    window.renderReceiving=function(){
      oldRenderReceiving();
      document.querySelectorAll('#receivewrap .receive-all').forEach(btn=>{
        const vendorId=Number(btn.dataset.vid),card=btn.closest('.card'); if(!card||card.querySelector('.receive-match-invoice'))return;
        const matchBtn=document.createElement('button');matchBtn.type='button';matchBtn.className='receive-match-invoice';matchBtn.textContent='Match Invoice';btn.before(matchBtn);
        const result=document.createElement('div');result.className='invoice-match-summary';result.style.marginTop='10px';card.appendChild(result);
        const rows=getOrderedRows(vendorId),t=totals(rows),matched=rows[0]?.matched_invoice_id;
        if(matched){invoiceOptions(vendorId).then(list=>{const inv=list.find(i=>Number(i.id)===Number(matched));result.innerHTML=matchText(t.grand,inv)}).catch(()=>{})}
        matchBtn.onclick=async()=>{let holder=document.querySelector('#receivingInvoiceMatchModal');if(!holder){holder=document.createElement('div');holder.id='receivingInvoiceMatchModal';holder.className='modal';holder.innerHTML='<div class="box" style="max-width:650px"><div class="queue-title"><h3>Match Purchase Order to Invoice</h3><button id="rimClose">Close</button></div><div id="rimBody"></div></div>';document.body.appendChild(holder);holder.querySelector('#rimClose').onclick=()=>holder.classList.remove('show')};holder.classList.add('show');await renderInvoiceMatch(vendorId,rows,t.grand,holder.querySelector('#rimBody'))};
      });
    };
  }
})();
