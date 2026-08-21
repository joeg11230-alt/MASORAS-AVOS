(()=>{
  const host=()=>document.querySelector('#transportationPlaceholder');
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  function currentBus(){
    const title=host()?.querySelector('#busProfile h3')?.textContent||'';
    const num=title.match(/Bus\s*#(\d+)/i)?.[1];
    return num?Number(num):null;
  }
  async function findBusId(){
    const num=currentBus();if(!num||typeof db==='undefined')return null;
    const r=await db.from('transportation_buses').select('id').eq('bus_number',String(num)).maybeSingle();
    return r.data?.id||null;
  }
  function ensure(){
    const h=host(),profile=h?.querySelector('#busProfile .card');if(!profile)return;
    const docs=profile.querySelector('#busDocs')?.parentElement;if(!docs||docs.querySelector('#uploadMaintenanceDoc'))return;
    const row=docs.querySelector('.row');if(!row)return;
    const btn=document.createElement('button');btn.id='uploadMaintenanceDoc';btn.type='button';btn.textContent='⬆ Maintenance Documents';btn.style.cssText='background:#ede9fe;border-color:#7c3aed;color:#5b21b6;font-weight:800';
    const input=document.createElement('input');input.id='maintenanceDocFile';input.type='file';input.accept='application/pdf,image/*';input.style.display='none';input.multiple=true;
    row.appendChild(btn);row.appendChild(input);
    btn.onclick=()=>input.click();
    input.onchange=async()=>{for(const f of [...(input.files||[])])await upload(f);input.value='';};
    refresh();
  }
  async function upload(file){
    if(!file)return;if(file.size>10*1024*1024)return alert('Please keep maintenance documents under 10 MB each.');
    const busId=await findBusId();if(!busId)return alert('Could not identify this bus.');
    const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_'),path=`${busId}/maintenance/${Date.now()}-${safe}`;
    const up=await db.storage.from('bus-documents').upload(path,file,{upsert:false,contentType:file.type||undefined});
    if(up.error)return alert(up.error.message);
    const m=await db.from('transportation_bus_documents').insert({bus_id:busId,document_type:'maintenance',file_name:file.name,storage_path:path,uploaded_at:new Date().toISOString()});
    if(m.error)return alert(m.error.message);
    await refresh();
  }
  async function refresh(){
    const h=host(),box=h?.querySelector('#busDocs');if(!box)return;
    const busId=await findBusId();if(!busId)return;
    const r=await db.from('transportation_bus_documents').select('*').eq('bus_id',busId).order('uploaded_at',{ascending:false});if(r.error)return;
    const out=[];for(const d of r.data||[]){const s=await db.storage.from('bus-documents').createSignedUrl(d.storage_path,3600);if(s.error||!s.data?.signedUrl)continue;const label=d.document_type==='registration'?'Registration':d.document_type==='insurance_card'?'Insurance Card':d.document_type==='maintenance'?'Maintenance: '+(d.file_name||'Document'):'Other Document';out.push(`<a href="${esc(s.data.signedUrl)}" target="_blank" rel="noopener">View ${esc(label)}</a>`)}
    box.innerHTML=out.length?out.join(' &nbsp; • &nbsp; '):'No bus documents uploaded yet.';
  }
  const obs=new MutationObserver(()=>setTimeout(ensure,30));
  function start(){const h=host();if(h)obs.observe(h,{childList:true,subtree:true});setInterval(ensure,1000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();