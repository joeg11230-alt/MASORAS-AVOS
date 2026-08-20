(()=>{
  const getItem=id=>{try{return items.find(x=>Number(x.id)===Number(id))}catch(e){return null}};

  function ensureStyles(){
    if(document.querySelector('#productStatusStyles'))return;
    const s=document.createElement('style');s.id='productStatusStyles';s.textContent=`
      .item-status-row{display:flex;gap:7px;flex-wrap:wrap;margin:8px 0 4px}
      .item-status-badge{display:inline-flex;align-items:center;padding:4px 8px;border-radius:999px;font-size:11px;font-weight:900;letter-spacing:.2px}
      .item-active{background:#dff7e7;color:#116b35}.item-inactive{background:#eceff3;color:#5a6572}
      .item-instock{background:#dff7e7;color:#116b35}.item-outstock{background:#ffe1e1;color:#a31616}
      .item-status-toggle{display:flex;gap:8px;align-items:center;border:1px solid #cbd2dc;border-radius:8px;padding:9px;background:#fff}
      .item-status-toggle input{width:auto}
    `;document.head.appendChild(s);
  }

  function ensureFormToggle(){
    const form=document.querySelector('#form');if(!form)return;
    if(document.querySelector('#itemActive'))return;
    const label=document.createElement('label');
    label.innerHTML='Item Status<div class="item-status-toggle"><input id="itemActive" type="checkbox" checked><b id="itemActiveLabel">Active</b></div>';
    const inventoryType=document.querySelector('#inventoryType')?.closest('label');
    if(inventoryType)inventoryType.after(label);else form.prepend(label);
    const cb=label.querySelector('#itemActive'),txt=label.querySelector('#itemActiveLabel');
    cb.onchange=()=>txt.textContent=cb.checked?'Active':'Inactive';
  }

  function decorateCard(card){
    const item=getItem(card.dataset.id);if(!item)return;
    let row=card.querySelector('.item-status-row');
    if(!row){row=document.createElement('div');row.className='item-status-row';const h=card.querySelector('h3,.product-title');if(h)h.insertAdjacentElement('afterend',row);else card.prepend(row)}
    const active=item.is_active!==false;
    const inStock=Number(item.qty_on_hand||0)>0;
    row.innerHTML=`<span class="item-status-badge ${active?'item-active':'item-inactive'}">${active?'ACTIVE':'INACTIVE'}</span><span class="item-status-badge ${inStock?'item-instock':'item-outstock'}">${inStock?'IN STOCK':'OUT OF STOCK'}</span>`;
    card.style.opacity=active?'':'0.65';
  }

  function decorateAll(){document.querySelectorAll('#grid .product-card').forEach(decorateCard)}

  function syncModal(){
    ensureFormToggle();
    const modal=document.querySelector('#modal');if(!modal?.classList.contains('show'))return;
    const id=Number(document.querySelector('#id')?.value||0),item=id?getItem(id):null,cb=document.querySelector('#itemActive'),txt=document.querySelector('#itemActiveLabel');
    if(cb){cb.checked=item?item.is_active!==false:true;if(txt)txt.textContent=cb.checked?'Active':'Inactive'}
  }

  function addProfileStatus(){
    const id=Number(window.currentProductId||0),item=id?getItem(id):null;
    const body=document.querySelector('#profileBody > div:last-child');if(!item||!body)return;
    let row=body.querySelector('.profile-item-status');if(!row){row=document.createElement('div');row.className='item-status-row profile-item-status';body.prepend(row)}
    const active=item.is_active!==false,inStock=Number(item.qty_on_hand||0)>0;
    row.innerHTML=`<span class="item-status-badge ${active?'item-active':'item-inactive'}">${active?'ACTIVE':'INACTIVE'}</span><span class="item-status-badge ${inStock?'item-instock':'item-outstock'}">${inStock?'IN STOCK':'OUT OF STOCK'}</span>`;
  }

  ensureStyles();ensureFormToggle();
  const grid=document.querySelector('#grid');if(grid)new MutationObserver(()=>decorateAll()).observe(grid,{childList:true});
  const modal=document.querySelector('#modal');if(modal)new MutationObserver(syncModal).observe(modal,{attributes:true,attributeFilter:['class']});
  const profile=document.querySelector('#productModal');if(profile)new MutationObserver(()=>{if(profile.classList.contains('show'))setTimeout(addProfileStatus,0)}).observe(profile,{attributes:true,attributeFilter:['class']});
  setTimeout(decorateAll,500);setTimeout(decorateAll,1400);
})();