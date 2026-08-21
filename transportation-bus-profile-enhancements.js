(()=>{
  const host=()=>document.querySelector('#transportationPlaceholder');
  const esc=s=>String(s??'').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
  const COLORS=['White','Black','Silver','Gray','Red','Maroon','Orange','Yellow','Green','Lime Green','Blue','Navy Blue','Light Blue','Teal','Purple','Brown','Tan','Beige','Gold','Other'];
  const SEATS=Array.from({length:91},(_,i)=>i+10);
  const WHEEL=['NA',0,1,2,3,4,5,6,7,8,9,10,12,14,16];

  function replaceWithSelect(old,values,current,naNull=false){
    if(!old||old.tagName==='SELECT')return old;
    const sel=document.createElement('select');sel.id=old.id;sel.className=old.className||'';
    values.forEach(v=>{const o=document.createElement('option');o.value=(naNull&&v==='NA')?'':String(v);o.textContent=String(v);if((naNull&&v==='NA'&&(current==null||current===''))||String(current??'')===String(v))o.selected=true;sel.appendChild(o)});
    old.replaceWith(sel);return sel;
  }

  function currentOldNumber(){
    const p=host()?.querySelector('#busProfile');
    return p?.dataset.busOldNumber||((p?.querySelector('h3')?.textContent||'').replace(/^Bus\s*#/i,'').replace(/\s*-EV\s*$/i,'').trim());
  }

  function paintEv(){
    const h=host();if(!h)return;
    h.querySelectorAll('#busTabs button').forEach(btn=>{
      const text=(btn.textContent||'').trim();
      if(/40-EV|\bEV\b/i.test(text)){
        btn.style.background='#16a34a';btn.style.borderColor='#15803d';btn.style.color='#fff';
        if(!/-EV/i.test(text))btn.textContent=text+'-EV';
      }
    });
    const profile=h.querySelector('#busProfile');if(!profile)return;
    const fuel=profile.querySelector('#busFuel')?.value||'';
    const title=profile.querySelector('h3');
    if(title&&fuel==='EV'){
      const raw=(title.textContent||'').replace(/\s*-EV\s*$/i,'');
      title.innerHTML=esc(raw)+` <span style="color:#16a34a;font-weight:900">-EV</span>`;
    }
  }

  function enhanceProfile(){
    const h=host(),profile=h?.querySelector('#busProfile');if(!profile||!profile.querySelector('#saveBus'))return;
    if(profile.dataset.enhancedBus==='1'){paintEv();return}
    profile.dataset.enhancedBus='1';
    const title=profile.querySelector('h3');
    const shown=(title?.textContent||'').replace(/^Bus\s*#/i,'').trim();
    profile.dataset.busOldNumber=shown;

    const grid=profile.querySelector('.grid');
    if(grid&&!profile.querySelector('#busNumberEdit')){
      const label=document.createElement('label');label.innerHTML=`Bus #<input id="busNumberEdit" value="${esc(shown)}" placeholder="Bus number">`;
      grid.prepend(label);
    }

    const seats=profile.querySelector('#busSeats');if(seats)replaceWithSelect(seats,SEATS,seats.value||null,false);
    const wheel=profile.querySelector('#busWheel');if(wheel)replaceWithSelect(wheel,WHEEL,wheel.value||null,true);
    const color=profile.querySelector('#busColor');if(color){const cur=color.value||'';replaceWithSelect(color,COLORS,cur,false)}

    const fuel=profile.querySelector('#busFuel');if(fuel){fuel.addEventListener('change',()=>{paintEv();if(fuel.value==='EV'){const inp=profile.querySelector('#busNumberEdit');if(inp&&!/-EV$/i.test(inp.value.trim()))inp.value=inp.value.trim()+'-EV'}})}

    const save=profile.querySelector('#saveBus');
    save.addEventListener('click',async()=>{
      const old=profile.dataset.busOldNumber,newNum=(profile.querySelector('#busNumberEdit')?.value||'').trim();
      if(!newNum)return alert('Enter a bus number.');
      if(newNum!==old){
        const r=await db.from('transportation_buses').update({bus_number:newNum,updated_at:new Date().toISOString()}).eq('bus_number',old);
        if(r.error)return alert('Could not update bus number: '+r.error.message);
        profile.dataset.busOldNumber=newNum;
        setTimeout(()=>window.loadTransportationBuses?.(),700);
      }
    },true);
    paintEv();
  }

  function ensureAddBus(){
    const h=host(),tabs=h?.querySelector('#busTabs');if(!tabs||h.querySelector('#addBusTabBtn'))return;
    const b=document.createElement('button');b.id='addBusTabBtn';b.type='button';b.textContent='+ Add Bus';b.style.cssText='border-radius:999px;font-weight:900;background:#111827;color:#fff;border-color:#111827';
    tabs.appendChild(b);
    b.onclick=async()=>{
      const num=(prompt('Enter the new bus number:')||'').trim();if(!num)return;
      const exists=await db.from('transportation_buses').select('id').eq('bus_number',num).maybeSingle();
      if(exists.data)return alert('That bus number already exists.');
      const r=await db.from('transportation_buses').insert({bus_number:num,status:'Active',fuel_type:'Diesel'}).select().single();
      if(r.error)return alert('Could not add bus: '+r.error.message);
      await window.loadTransportationBuses?.();
    };
  }

  function enhance(){ensureAddBus();enhanceProfile();paintEv()}
  const obs=new MutationObserver(()=>setTimeout(enhance,0));
  function start(){const h=host();if(h)obs.observe(h,{childList:true,subtree:true});enhance();setInterval(enhance,1200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();