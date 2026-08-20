(()=>{
  const val=id=>document.querySelector(id)?.value?.trim()||'';

  function ensureVendorExt(){
    const phone=document.querySelector('#vphone');
    const form=document.querySelector('#vendorForm');
    if(!phone||!form||document.querySelector('#vphoneExt'))return;
    const label=document.createElement('label');
    label.innerHTML='Phone Ext.<input id="vphoneExt" placeholder="Ext.">';
    phone.closest('label')?.insertAdjacentElement('afterend',label);
  }

  async function fillVendorExt(){
    ensureVendorExt();
    const input=document.querySelector('#vphoneExt');
    const id=Number(document.querySelector('#vid')?.value||0);
    if(!input)return;
    if(!id){input.value='';return;}
    const r=await db.from('vendors').select('phone_ext').eq('id',id).maybeSingle();
    if(!r.error)input.value=r.data?.phone_ext||'';
  }

  async function saveVendorExt(){
    const ext=val('#vphoneExt')||null;
    let id=Number(document.querySelector('#vid')?.value||0);
    if(!id){
      const name=val('#vname');
      if(name){
        const r=await db.from('vendors').select('id').eq('vendor',name).order('id',{ascending:false}).limit(1).maybeSingle();
        id=Number(r.data?.id||0);
      }
    }
    if(id)await db.from('vendors').update({phone_ext:ext,updated_at:new Date().toISOString()}).eq('id',id);
  }

  function ensureOrgExt(){
    const phone=document.querySelector('#orgPhone');
    const form=document.querySelector('#orgProfileForm');
    if(!phone||!form||document.querySelector('#orgPhoneExt'))return;
    const label=document.createElement('label');
    label.innerHTML='Phone Ext.<input id="orgPhoneExt" placeholder="Ext.">';
    phone.closest('label')?.insertAdjacentElement('afterend',label);
  }

  async function fillOrgExt(){
    ensureOrgExt();
    const input=document.querySelector('#orgPhoneExt');
    if(!input)return;
    const r=await db.from('organization_profile').select('phone_ext').eq('profile_key','masoras_avos').maybeSingle();
    if(!r.error)input.value=r.data?.phone_ext||'';
  }

  async function saveOrgExt(){
    const ext=val('#orgPhoneExt')||null;
    await db.from('organization_profile').update({phone_ext:ext,updated_at:new Date().toISOString()}).eq('profile_key','masoras_avos');
    setTimeout(showOrgExt,200);
  }

  let lastOrgExt=null;
  async function showOrgExt(){
    const view=document.querySelector('#orgProfileView');
    if(!view)return;
    const r=await db.from('organization_profile').select('phone_ext').eq('profile_key','masoras_avos').maybeSingle();
    if(r.error)return;
    const ext=r.data?.phone_ext||'';
    if(ext===lastOrgExt && view.querySelector('.phone-ext-display'))return;
    lastOrgExt=ext;
    let display=view.querySelector('.phone-ext-display');
    if(!ext){if(display)display.remove();return;}
    const phoneLine=[...view.querySelectorAll('.contact-line')].find(x=>/^Phone:/i.test(x.textContent.trim()));
    if(!phoneLine)return;
    if(!display){display=document.createElement('span');display.className='phone-ext-display';phoneLine.appendChild(display);}
    display.textContent=' Ext. '+ext;
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('#addVendor')||e.target.closest('.vendor-link'))setTimeout(fillVendorExt,100);
    if(e.target.closest('#editOrgProfile'))setTimeout(fillOrgExt,100);
    if(e.target.closest('[data-tab="profile"],#organizationProfileTab'))setTimeout(showOrgExt,150);
  });

  document.addEventListener('submit',e=>{
    if(e.target?.id==='vendorForm')setTimeout(saveVendorExt,350);
    if(e.target?.id==='orgProfileForm')setTimeout(saveOrgExt,350);
  },true);

  const boot=()=>{
    ensureVendorExt();ensureOrgExt();showOrgExt();
    const vm=document.querySelector('#vendorModal');
    if(vm&&!vm.dataset.extObserver){vm.dataset.extObserver='1';new MutationObserver(()=>{if(vm.classList.contains('show'))fillVendorExt()}).observe(vm,{attributes:true,attributeFilter:['class']});}
    const om=document.querySelector('#orgProfileModal');
    if(om&&!om.dataset.extObserver){om.dataset.extObserver='1';new MutationObserver(()=>{if(om.classList.contains('show'))fillOrgExt()}).observe(om,{attributes:true,attributeFilter:['class']});}
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,700));else setTimeout(boot,700);
})();