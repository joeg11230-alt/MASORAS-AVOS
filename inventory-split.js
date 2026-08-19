(()=>{
  let currentType='Kitchen';
  const escS=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));

  const nav=document.querySelector('nav');
  const kitchenBtn=nav?.querySelector('.tab[data-tab="inventory"]');
  if(!nav||!kitchenBtn)return;
  kitchenBtn.textContent='Kitchen Inventory';

  const maintenanceBtn=document.createElement('button');
  maintenanceBtn.className='tab';
  maintenanceBtn.type='button';
  maintenanceBtn.dataset.tab='maintenanceInventory';
  maintenanceBtn.textContent='Maintenance Inventory';
  kitchenBtn.after(maintenanceBtn);

  function filterGrid(){
    const grid=document.querySelector('#grid');
    if(!grid)return;
    grid.querySelectorAll('.product-card').forEach(card=>{
      const id=Number(card.dataset.id);
      const item=items.find(x=>Number(x.id)===id);
      const type=item?.inventory_type||'Kitchen';
      card.style.display=type===currentType?'':'none';
    });
    const add=document.querySelector('#add');
    if(add)add.textContent=currentType==='Kitchen'?'+ Add Kitchen Product':'+ Add Maintenance Product';
  }

  function selectType(type){
    currentType=type;
    switchTab('inventory');
    document.querySelectorAll('nav .tab').forEach(b=>b.classList.remove('active'));
    (type==='Kitchen'?kitchenBtn:maintenanceBtn).classList.add('active');
    filterGrid();
  }

  kitchenBtn.addEventListener('click',()=>{currentType='Kitchen';setTimeout(filterGrid,0)});
  maintenanceBtn.onclick=()=>selectType('Maintenance');

  const grid=document.querySelector('#grid');
  if(grid)new MutationObserver(filterGrid).observe(grid,{childList:true,subtree:false});

  const form=document.querySelector('#form');
  if(form&&!document.querySelector('#inventoryType')){
    const label=document.createElement('label');
    label.innerHTML='Inventory Type<select id="inventoryType"><option value="Kitchen">Kitchen Inventory</option><option value="Maintenance">Maintenance Inventory</option></select>';
    const vendorLabel=document.querySelector('#vendor')?.closest('label');
    if(vendorLabel)vendorLabel.before(label); else form.prepend(label);
  }

  const modal=document.querySelector('#modal');
  if(modal)new MutationObserver(()=>{
    if(!modal.classList.contains('show'))return;
    const id=Number(document.querySelector('#id')?.value||0);
    const item=id?items.find(x=>Number(x.id)===id):null;
    const sel=document.querySelector('#inventoryType');
    if(sel)sel.value=item?.inventory_type||currentType;
  }).observe(modal,{attributes:true,attributeFilter:['class']});

  if(form){
    form.onsubmit=async e=>{
      e.preventDefault();
      const id=$('#id').value;
      const p={
        inventory_type:$('#inventoryType').value||'Kitchen',
        vendor:$('#vendor').value.trim(),item:$('#item').value.trim(),brand:$('#brand').value.trim()||null,sku:$('#sku').value.trim()||null,
        category:$('#category').value.trim()||null,storage_location:$('#storage').value.trim()||null,unit:$('#unit').value.trim()||null,
        case_pack:$('#casepack').value.trim()||null,pounds_per_case:$('#pounds').value||null,price:$('#price').value||null,
        qty_on_hand:$('#qty').value||0,target_stock:$('#target').value||0,last_ordered_date:$('#date').value||null,
        product_description:$('#description').value.trim()||null,notes:$('#notes').value.trim()||null,barcode:$('#barcode').value.trim()||null,
        updated_at:new Date().toISOString()
      };
      if(imageFile){
        const path=Date.now()+'-'+imageFile.name.replace(/[^a-zA-Z0-9._-]/g,'_');
        const u=await db.storage.from('product-images').upload(path,imageFile);
        if(u.error)return alert(u.error.message);
        p.image_url=db.storage.from('product-images').getPublicUrl(path).data.publicUrl;
      }
      const r=id?await db.from('inventory_items').update(p).eq('id',id):await db.from('inventory_items').insert(p);
      if(r.error)return alert(r.error.message);
      closeItem();
      currentType=p.inventory_type;
      await loadAll();
      selectType(currentType);
    };
  }

  const oldOpenProductProfile=window.openProductProfile;
  if(typeof oldOpenProductProfile==='function'){
    window.openProductProfile=function(id){
      oldOpenProductProfile(id);
      const item=items.find(x=>Number(x.id)===Number(id));
      const body=document.querySelector('#profileBody > div:last-child');
      if(item&&body&&!body.querySelector('.inventory-type-line')){
        const line=document.createElement('div');
        line.className='profile-field inventory-type-line';
        line.innerHTML='<b>Inventory:</b> '+escS((item.inventory_type||'Kitchen')+' Inventory');
        body.querySelector('.profile-grid')?.prepend(line);
      }
    };
  }

  setTimeout(filterGrid,100);
})();