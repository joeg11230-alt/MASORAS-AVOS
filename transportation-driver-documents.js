(()=>{
  const host=()=>document.querySelector('#transportationPlaceholder');
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const currentDriverId=()=>Number(host()?.querySelector('#saveDriver')?.dataset.id)||null;

  function ensureActions(){
    const h=host(),modal=h?.querySelector('#driverModal');if(!h||!modal)return;
    let row=modal.querySelector('#driverDocumentActions');
    if(!row){
      row=document.createElement('div');row.id='driverDocumentActions';
      row.style.cssText='margin-top:18px;padding-top:14px;border-top:1px solid #d9dee7;display:flex;gap:10px;flex-wrap:wrap;align-items:center';
      row.innerHTML=`<button type="button" id="emailDriverAction" style="background:#e0f2fe;border-color:#0284c7;color:#075985;font-weight:800">✉ Email Driver</button><button type="button" id="uploadLicenseAction" style="background:#fef3c7;border-color:#d97706;color:#92400e;font-weight:800">⬆ Driver License Upload</button><button type="button" id="uploadMedicalAction" style="background:#dcfce7;border-color:#16a34a;color:#166534;font-weight:800">⬆ Medical Certificate Upload</button><input id="driverLicenseFile" type="file" accept="application/pdf,image/*" style="display:none"><input id="driverMedicalFile" type="file" accept="application/pdf,image/*" style="display:none"><div id="driverDocumentStatus" class="muted" style="width:100%;margin-top:2px"></div>`;
      const actions=modal.querySelector('#saveDriver')?.closest('.row');
      if(actions)actions.after(row);else modal.querySelector('.box')?.appendChild(row);
      row.querySelector('#emailDriverAction').onclick=emailDriver;
      row.querySelector('#uploadLicenseAction').onclick=()=>pickFile('drivers_license');
      row.querySelector('#uploadMedicalAction').onclick=()=>pickFile('medical_certificate');
      row.querySelector('#driverLicenseFile').onchange=e=>uploadFile('drivers_license',e.target.files?.[0]);
      row.querySelector('#driverMedicalFile').onchange=e=>uploadFile('medical_certificate',e.target.files?.[0]);
    }
    refreshDocuments();
  }

  function emailDriver(){
    const h=host(),email=(h?.querySelector('#dEmail')?.value||'').trim();
    if(!email)return alert('Enter and save the driver email address first.');
    const first=(h.querySelector('#dFirst')?.value||'').trim(),last=(h.querySelector('#dLast')?.value||'').trim();
    const subject=`Masoras Avos Transportation - ${[first,last].filter(Boolean).join(' ')||'Driver'}`;
    window.location.href=`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}`;
  }

  function pickFile(type){
    if(!currentDriverId())return alert('Save the driver profile first, then upload documents.');
    const h=host();
    (type==='drivers_license'?h.querySelector('#driverLicenseFile'):h.querySelector('#driverMedicalFile'))?.click();
  }

  async function uploadFile(type,file){
    if(!file)return;
    const h=host(),driverId=currentDriverId(),status=h?.querySelector('#driverDocumentStatus');
    if(!driverId)return alert('Save the driver profile first.');
    if(file.size>10*1024*1024)return alert('Please keep driver documents under 10 MB.');
    const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const path=`${driverId}/${type}/${Date.now()}-${safe}`;
    if(status)status.textContent='Uploading document…';
    try{
      const existing=await db.from('transportation_driver_documents').select('*').eq('driver_id',driverId).eq('document_type',type).maybeSingle();
      if(existing.data?.storage_path)await db.storage.from('driver-documents').remove([existing.data.storage_path]);
      const up=await db.storage.from('driver-documents').upload(path,file,{upsert:false,contentType:file.type||undefined});
      if(up.error)throw up.error;
      const payload={driver_id:driverId,document_type:type,file_name:file.name,storage_path:path,uploaded_at:new Date().toISOString()};
      const meta=existing.data?.id?await db.from('transportation_driver_documents').update(payload).eq('id',existing.data.id):await db.from('transportation_driver_documents').insert(payload);
      if(meta.error)throw meta.error;
      if(status)status.textContent=(type==='drivers_license'?'Driver license':'Medical certificate')+' uploaded successfully.';
      await refreshDocuments();
    }catch(e){console.error(e);if(status)status.textContent='Upload failed: '+(e?.message||e);}
  }

  async function refreshDocuments(){
    const h=host(),driverId=currentDriverId(),status=h?.querySelector('#driverDocumentStatus');if(!h||!status)return;
    if(!driverId){status.textContent='Save the driver profile before uploading documents.';return;}
    try{
      const r=await db.from('transportation_driver_documents').select('*').eq('driver_id',driverId);
      if(r.error)throw r.error;
      const docs=r.data||[];
      const labels=[];
      for(const d of docs){
        const s=await db.storage.from('driver-documents').createSignedUrl(d.storage_path,3600);
        if(!s.error&&s.data?.signedUrl){
          const label=d.document_type==='drivers_license'?'Driver License':'Medical Certificate';
          labels.push(`<a href="${esc(s.data.signedUrl)}" target="_blank" rel="noopener">View ${label}</a>`);
        }
      }
      status.innerHTML=labels.length?labels.join(' &nbsp; • &nbsp; '):'No driver documents uploaded yet.';
    }catch(e){status.textContent='Could not load uploaded documents.';}
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('.editDriver')||e.target.closest('#addDriverBtn'))setTimeout(ensureActions,80);
  },true);
  const obs=new MutationObserver(()=>{const m=host()?.querySelector('#driverModal');if(m?.classList.contains('show'))ensureActions();});
  function start(){const h=host();if(h)obs.observe(h,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();