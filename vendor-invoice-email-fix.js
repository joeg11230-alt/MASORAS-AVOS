(()=>{
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const money=n=>'$'+Number(n||0).toFixed(2);
  const vendorModal=()=>document.querySelector('#vendorModal');
  const invoiceModal=()=>document.querySelector('#invoiceModal');
  const currentVendorId=()=>Number(document.querySelector('#vid')?.value||0)||null;
  const currentVendorName=()=>document.querySelector('#vname')?.value?.trim()||'Vendor';
  const currentVendorEmail=()=>document.querySelector('#vemail')?.value?.trim()||'';

  function ensureEmailButton(){
    const vm=vendorModal(); if(!vm)return;
    if(vm.querySelector('#emailVendorProfile'))return;
    const form=vm.querySelector('#vendorForm'); if(!form)return;
    const row=form.querySelector('.full.row'); if(!row)return;
    const btn=document.createElement('button');
    btn.id='emailVendorProfile';btn.type='button';btn.className='primary';
    btn.style.cssText='background:#dbeafe;color:#1d4ed8;border-color:#60a5fa;font-weight:800';
    btn.innerHTML='✉ Email Vendor';
    btn.onclick=()=>{
      const email=currentVendorEmail();
      if(!email)return alert('This vendor does not have an email address saved yet.');
      const subject=`Masoras Avos - ${currentVendorName()}`;
      location.href=`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}`;
    };
    row.insertBefore(btn,row.lastElementChild);
  }

  function resetInvoiceForm(vendorId){
    const im=invoiceModal();if(!im)return;
    im.querySelector('#invoiceVendorId').value=vendorId||'';
    im.querySelector('#invoiceNumber').value='';
    im.querySelector('#invoiceDate').value=new Date().toISOString().slice(0,10);
    im.querySelector('#invoiceAmount').value='';
    im.querySelector('#invoiceNotes').value='';
    im.querySelector('#invoiceFile').value='';
    const msg=im.querySelector('#invoiceMsg');if(msg)msg.textContent='';
  }
  function openInvoice(scan=false){
    const id=currentVendorId();if(!id)return alert('Save the vendor profile first, then add an invoice.');
    const im=invoiceModal();if(!im)return alert('Invoice form is unavailable. Please refresh the app.');
    resetInvoiceForm(id);im.classList.add('show');
    setTimeout(()=>{(scan?im.querySelector('#invoiceFile'):im.querySelector('#invoiceNumber'))?.click?.();if(!scan)im.querySelector('#invoiceNumber')?.focus();},50);
  }

  async function loadInvoices(vendorId=currentVendorId()){
    const list=document.querySelector('#invoiceList');if(!list||!vendorId)return;
    list.innerHTML='<div class="muted">Loading invoices…</div>';
    try{
      const r=await db.from('vendor_invoices').select('*').eq('vendor_id',vendorId).order('invoice_date',{ascending:false}).order('id',{ascending:false});
      if(r.error)throw r.error;
      const rows=r.data||[];
      if(!rows.length){list.innerHTML='<div class="muted">No invoices saved for this vendor yet.</div>';return;}
      const html=[];
      for(const inv of rows){
        let view='';
        if(inv.file_path){
          const s=await db.storage.from('vendor-invoices').createSignedUrl(inv.file_path,3600);
          if(!s.error&&s.data?.signedUrl)view=`<a class="btn" href="${esc(s.data.signedUrl)}" target="_blank" rel="noopener">View File</a>`;
        }
        html.push(`<div class="subcard" style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><b>${esc(inv.invoice_number||'Invoice')}</b><div class="muted">${esc(inv.invoice_date||'No date')} • ${money(inv.amount)}</div>${inv.notes?`<div style="margin-top:4px">${esc(inv.notes)}</div>`:''}${inv.file_name?`<div class="muted" style="margin-top:3px">${esc(inv.file_name)}</div>`:''}</div><div>${view}</div></div>`);
      }
      list.innerHTML=html.join('');
    }catch(e){console.error(e);list.innerHTML=`<div class="muted">Could not load invoices: ${esc(e?.message||e)}</div>`;}
  }

  async function saveInvoice(e){
    if(e){e.preventDefault();e.stopImmediatePropagation();}
    const im=invoiceModal();if(!im)return;
    const msg=im.querySelector('#invoiceMsg');
    const vendorId=Number(im.querySelector('#invoiceVendorId').value||0)||currentVendorId();
    if(!vendorId){if(msg)msg.textContent='Save the vendor profile first.';return;}
    const number=im.querySelector('#invoiceNumber').value.trim()||null;
    const date=im.querySelector('#invoiceDate').value||null;
    const amountRaw=im.querySelector('#invoiceAmount').value;
    const amount=amountRaw===''?null:Number(amountRaw);
    const notes=im.querySelector('#invoiceNotes').value.trim()||null;
    const file=im.querySelector('#invoiceFile').files?.[0]||null;
    if(amount!==null&&(!Number.isFinite(amount)||amount<0)){if(msg)msg.textContent='Enter a valid invoice amount.';return;}
    if(file&&file.size>15*1024*1024){if(msg)msg.textContent='Please keep invoice files under 15 MB.';return;}
    if(msg)msg.textContent='Saving invoice…';
    let path=null;
    try{
      if(file){
        const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
        path=`${vendorId}/${Date.now()}-${safe}`;
        const up=await db.storage.from('vendor-invoices').upload(path,file,{upsert:false,contentType:file.type||undefined});
        if(up.error)throw up.error;
      }
      const payload={vendor_id:vendorId,invoice_number:number,invoice_date:date,amount,notes,file_path:path,file_name:file?.name||null,updated_at:new Date().toISOString()};
      const r=await db.from('vendor_invoices').insert(payload);
      if(r.error)throw r.error;
      if(msg)msg.textContent='Invoice saved successfully.';
      await loadInvoices(vendorId);
      setTimeout(()=>im.classList.remove('show'),350);
    }catch(err){
      console.error(err);
      if(path)try{await db.storage.from('vendor-invoices').remove([path]);}catch{}
      if(msg)msg.textContent='Invoice save failed: '+(err?.message||err);
    }
  }

  function wire(){
    ensureEmailButton();
    const vm=vendorModal();const im=invoiceModal();
    if(vm&&!vm.dataset.invoiceFix){
      vm.dataset.invoiceFix='1';
      vm.addEventListener('click',e=>{
        const manual=e.target.closest('#manualInvoice');if(manual){e.preventDefault();e.stopImmediatePropagation();openInvoice(false);return;}
        const scan=e.target.closest('#scanInvoice');if(scan){e.preventDefault();e.stopImmediatePropagation();openInvoice(true);return;}
      },true);
    }
    if(im&&!im.dataset.invoiceFix){
      im.dataset.invoiceFix='1';
      im.addEventListener('submit',saveInvoice,true);
      im.querySelector('#invoiceCancel')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();im.classList.remove('show');},true);
    }
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('.vendor-link')||e.target.closest('#addVendor'))setTimeout(()=>{wire();loadInvoices();},80);
  },true);
  const obs=new MutationObserver(()=>{
    wire();
    const vm=vendorModal();if(vm?.classList.contains('show')){ensureEmailButton();const id=currentVendorId();if(id&&!vm.dataset.loadedInvoiceVendor){vm.dataset.loadedInvoiceVendor=String(id);loadInvoices(id);}else if(id&&vm.dataset.loadedInvoiceVendor!==String(id)){vm.dataset.loadedInvoiceVendor=String(id);loadInvoices(id);}}
  });
  function start(){wire();obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','value']});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();