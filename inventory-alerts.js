(()=>{
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  let emailCheckBusy=false;

  function classify(item){
    if(item?.is_active===false)return null;
    const qty=Number(item?.qty_on_hand||0);
    const replenish=item?.reorder_point==null||item.reorder_point===''?null:Number(item.reorder_point);
    const low=item?.low_stock_level==null||item.low_stock_level===''?null:Number(item.low_stock_level);
    if(qty<=0)return {level:'out',label:'OUT OF STOCK',priority:3};
    if(replenish!=null&&qty<=replenish)return {level:'replenish',label:'REPLENISH NOW',priority:2};
    if(low!=null&&qty<=low)return {level:'low',label:'LOW STOCK',priority:1};
    return null;
  }

  function ensureStyles(){
    if(document.querySelector('#inventoryAlertStyles'))return;
    const s=document.createElement('style');s.id='inventoryAlertStyles';s.textContent=`
      #inventoryAlertsCard{margin:0 0 14px;border:1px solid #d9dee7;border-radius:12px;background:#fff;padding:14px}
      .inventory-alert-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
      .inventory-alert-list{display:grid;gap:8px;margin-top:10px}
      .inventory-alert-row{display:grid;grid-template-columns:minmax(180px,1fr) 120px 110px 130px;gap:10px;align-items:center;border:1px solid #e6eaf0;border-radius:9px;padding:9px;background:#fafbfd}
      .alert-pill{display:inline-block;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:900;text-align:center}
      .alert-out,.alert-replenish{background:#ffe1e1;color:#a31616}.alert-low{background:#fff1cf;color:#835400}
      @media(max-width:700px){.inventory-alert-row{grid-template-columns:1fr 1fr}.inventory-alert-name{grid-column:1/-1}}
    `;document.head.appendChild(s);
  }

  async function isOwner(){
    try{
      const {data:{session}}=await db.auth.getSession();if(!session?.user?.email)return false;
      const r=await db.from('app_users').select('role,active').ilike('email',session.user.email).maybeSingle();
      return r.data?.role==='owner'&&r.data?.active!==false;
    }catch(e){return false}
  }

  function getItems(){try{return Array.isArray(items)?items:[]}catch(e){return []}}

  function ensureCard(){
    let card=document.querySelector('#inventoryAlertsCard');if(card)return card;
    const profile=document.querySelector('#profile');if(!profile)return null;
    card=document.createElement('div');card.id='inventoryAlertsCard';
    const first=profile.querySelector('.card,.subcard')||profile.firstElementChild;
    if(first)first.before(card);else profile.prepend(card);
    return card;
  }

  async function renderAlerts(){
    if(!(await isOwner())){document.querySelector('#inventoryAlertsCard')?.remove();return;}
    ensureStyles();const card=ensureCard();if(!card)return;
    const alerts=getItems().map(item=>({item,status:classify(item)})).filter(x=>x.status).sort((a,b)=>b.status.priority-a.status.priority||String(a.item.item||'').localeCompare(String(b.item.item||'')));
    const count=alerts.length;
    card.innerHTML=`<div class="inventory-alert-head"><div><h3 style="margin:0">Inventory Alerts</h3><div class="muted">Low stock, replenish, and out-of-stock items</div></div><span class="badge">${count} alert${count===1?'':'s'}</span></div>`+
      (count?`<div class="inventory-alert-list">${alerts.map(({item,status})=>`<div class="inventory-alert-row"><div class="inventory-alert-name"><b>${esc(item.item||'Item')}</b><div class="muted">${esc((item.inventory_type||'Kitchen')+' Inventory')} • ${esc(item.vendor||'')}</div></div><div><b>Qty:</b> ${Number(item.qty_on_hand||0)}</div><div><b>Target:</b> ${Number(item.target_stock||0)}</div><div><span class="alert-pill alert-${status.level}">${status.label}</span></div></div>`).join('')}</div>`:`<div class="muted" style="margin-top:10px">No inventory alerts right now.</div>`);
  }

  function decorateCards(){
    document.querySelectorAll('#grid .product-card').forEach(card=>{
      const id=Number(card.dataset.id),item=getItems().find(x=>Number(x.id)===id),status=classify(item);if(!item)return;
      let badge=card.querySelector('.inventory-alert-mini');
      if(!status){badge?.remove();return;}
      if(!badge){badge=document.createElement('span');badge.className='alert-pill inventory-alert-mini';badge.style.marginTop='5px';card.appendChild(badge)}
      badge.className=`alert-pill inventory-alert-mini alert-${status.level}`;badge.textContent=status.label;
    });
  }

  async function processEmailAlerts(){
    if(emailCheckBusy)return;
    emailCheckBusy=true;
    try{
      const {data:{session}}=await db.auth.getSession();
      if(!session?.user)return;

      for(const item of getItems()){
        if(!item?.id)continue;
        const status=classify(item);
        const desired=status?.level||null;
        const current=item.email_alert_level||null;

        if(!desired){
          if(current){
            const r=await db.from('inventory_items').update({email_alert_level:null,email_alert_sent_at:null}).eq('id',item.id);
            if(!r.error){item.email_alert_level=null;item.email_alert_sent_at=null;}
          }
          continue;
        }

        if(current===desired)continue;

        const claim=await db.from('inventory_items')
          .update({email_alert_level:desired,email_alert_sent_at:new Date().toISOString()})
          .eq('id',item.id)
          .or(current===null?'email_alert_level.is.null':`email_alert_level.eq.${current}`)
          .select('id')
          .maybeSingle();

        if(claim.error||!claim.data?.id)continue;

        try{
          const send=await db.functions.invoke('inventory-alert-email',{
            body:{
              item:item.item||'Inventory Item',
              qty:Number(item.qty_on_hand||0),
              status:status.label,
              inventory:(item.inventory_type||'Kitchen')+' Inventory'
            }
          });
          if(send.error)throw send.error;
          item.email_alert_level=desired;
          item.email_alert_sent_at=new Date().toISOString();
        }catch(err){
          console.error('Inventory alert email failed',err);
          await db.from('inventory_items').update({email_alert_level:current,email_alert_sent_at:item.email_alert_sent_at||null}).eq('id',item.id).eq('email_alert_level',desired);
        }
      }
    }finally{emailCheckBusy=false;}
  }

  async function refresh(){await renderAlerts();decorateCards();await processEmailAlerts()}
  document.addEventListener('click',e=>{if(e.target.closest('[data-tab="profile"],#saveProfile,#add,#profileEdit'))setTimeout(refresh,250)},true);
  const grid=document.querySelector('#grid');if(grid)new MutationObserver(()=>{decorateCards();setTimeout(processEmailAlerts,150)}).observe(grid,{childList:true});
  db.channel('inventory-email-alerts').on('postgres_changes',{event:'UPDATE',schema:'public',table:'inventory_items'},()=>setTimeout(processEmailAlerts,350)).subscribe();
  setInterval(processEmailAlerts,30000);
  setTimeout(refresh,900);setTimeout(refresh,2000);
})();