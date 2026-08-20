(()=>{
  function val(h,s){const el=h.querySelector(s);return el?String(el.value||'').trim():''}
  async function saveDriverRpc(h,btn){
    const first=val(h,'#dFirst'),last=val(h,'#dLast'),ssn=val(h,'#dSSN4').replace(/\D/g,'');
    if(!first||!last){alert('Enter first and last name.');return}
    if(ssn&&ssn.length!==4){alert('SSN field stores the last 4 digits only.');return}
    const args={
      p_id:Number(btn.dataset.id)||null,
      p_first_name:first,p_middle_initial:val(h,'#dMI')||null,p_last_name:last,
      p_address:val(h,'#dAddress')||null,p_city:val(h,'#dCity')||null,p_state:val(h,'#dState')||null,p_zip:val(h,'#dZip')||null,
      p_home_phone:val(h,'#dHome')||null,p_cell_phone:val(h,'#dCell')||null,p_email:val(h,'#dEmail')||null,
      p_drivers_license_number:val(h,'#dLicense')||null,p_drivers_license_state:val(h,'#dLicenseState')||null,p_drivers_license_class:val(h,'#dLicenseClass')||null,
      p_drivers_license_expiration:val(h,'#dLicenseExp')||null,p_ssn_last4:ssn||null,
      p_medical_certificate_number:val(h,'#dMedNo')||null,p_medical_certificate_expiration:val(h,'#dMedExp')||null,
      p_notes:val(h,'#dNotes')||null,p_active:!!h.querySelector('#dActive')?.checked
    };
    const old=btn.textContent;btn.disabled=true;btn.textContent='Saving…';
    try{
      const r=await db.rpc('save_transportation_driver',args);
      if(r.error)throw r.error;
      h.querySelector('#driverModal')?.classList.remove('show');
      if(typeof window.loadTransportationDrivers==='function')await window.loadTransportationDrivers();
      alert('Driver information saved.');
    }catch(e){console.error('driver save',e);alert('Could not save driver: '+(e?.message||e));}
    finally{btn.disabled=false;btn.textContent=old;}
  }
  document.addEventListener('click',e=>{
    const btn=e.target.closest('#saveDriver');if(!btn)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    const h=document.querySelector('#transportationPlaceholder');if(h)saveDriverRpc(h,btn);
  },true);
})();