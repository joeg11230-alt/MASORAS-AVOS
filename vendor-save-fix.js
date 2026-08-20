(()=>{
  const q=id=>document.querySelector(id);
  const val=id=>q(id)?.value?.trim()||'';
  const nullable=id=>val(id)||null;

  async function saveVendor(e){
    if(e.target?.id!=='vendorForm')return;
    e.preventDefault();
    e.stopImmediatePropagation();

    const form=e.target;
    const saveBtn=form.querySelector('button[type="submit"],button.primary');
    const oldText=saveBtn?.textContent;
    if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='Saving…';}

    try{
      const id=Number(val('#vid')||0);
      const name=val('#vname');
      if(!name)throw new Error('Vendor name is required.');

      const statusBtn=q('#vendorStatusBtn');
      const isActive=statusBtn ? !statusBtn.classList.contains('inactive') : true;
      const payload={
        vendor:name,
        contact_person:nullable('#vcontact'),
        phone:nullable('#vphone'),
        phone_ext:nullable('#vphoneExt'),
        cell:nullable('#vcell'),
        whatsapp:nullable('#vwhatsapp'),
        email:nullable('#vemail'),
        website:nullable('#vwebsite'),
        delivery_days:nullable('#vdays'),
        delivery_details:nullable('#vdetails'),
        notes:nullable('#vnotes'),
        is_active:isActive,
        updated_at:new Date().toISOString()
      };

      let result;
      if(id){
        result=await db.from('vendors').update(payload).eq('id',id).select('*').maybeSingle();
      }else{
        result=await db.from('vendors').insert(payload).select('*').single();
      }
      if(result.error)throw result.error;

      const saved=result.data;
      if(saved?.id)q('#vid').value=saved.id;
      if(typeof window.loadAll==='function')await window.loadAll();
      else if(typeof loadAll==='function')await loadAll();
      if(typeof window.renderVendors==='function')window.renderVendors();

      const modal=q('#vendorModal');
      if(modal)modal.classList.remove('show');
    }catch(err){
      console.error('Vendor save failed',err);
      alert('Could not save vendor: '+(err?.message||err));
    }finally{
      if(saveBtn){saveBtn.disabled=false;saveBtn.textContent=oldText||'Save Vendor';}
    }
  }

  document.addEventListener('submit',saveVendor,true);
})();