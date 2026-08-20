(()=>{
  let activeProductId=null,stream=null,scanning=false;
  const $=s=>document.querySelector(s);

  function ensureUI(){
    if(!$('#barcodeScanModal')){
      const m=document.createElement('div');
      m.id='barcodeScanModal';m.className='modal';
      m.innerHTML=`<div class="box" style="max-width:560px">
        <div class="queue-title"><div><h3 style="margin:0">Scan Barcode</h3><div class="muted">Point the camera at the product barcode.</div></div><button id="barcodeScanClose" type="button">Close</button></div>
        <video id="barcodeVideo" autoplay playsinline muted style="width:100%;margin-top:14px;border-radius:12px;background:#111;min-height:260px;object-fit:cover"></video>
        <div id="barcodeScanMsg" class="muted" style="margin-top:10px">Starting camera…</div>
      </div>`;
      document.body.appendChild(m);
      $('#barcodeScanClose').onclick=stopScanner;
      m.addEventListener('click',e=>{if(e.target===m)stopScanner()});
    }
    if($('#productModal') && !$('#profileScanBarcode')){
      const actions=$('#productModal .actions');
      if(actions){
        const b=document.createElement('button');
        b.id='profileScanBarcode';b.type='button';b.className='primary';
        b.innerHTML='<i class="bi bi-upc-scan"></i> Scan Barcode';
        b.onclick=()=>startScanner('profile');
        actions.insertBefore(b,actions.firstChild);
      }
    }
    const editScan=$('#scan');
    if(editScan) editScan.onclick=()=>startScanner('edit');
  }

  const originalOpen=window.openProductProfile;
  if(typeof originalOpen==='function'){
    window.openProductProfile=function(id){activeProductId=Number(id)||null;const r=originalOpen.apply(this,arguments);setTimeout(ensureUI,0);return r};
  }

  async function startScanner(mode){
    ensureUI();
    if(!('BarcodeDetector' in window)){
      alert('Barcode scanning is not supported by this browser. Try opening Masoras Avos in Chrome on your phone.');
      return;
    }
    stopTracks();
    const m=$('#barcodeScanModal'),msg=$('#barcodeScanMsg'),video=$('#barcodeVideo');
    m.dataset.mode=mode;m.classList.add('show');msg.textContent='Starting camera…';
    try{
      stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      video.srcObject=stream;await video.play();
      msg.textContent='Scanning… hold the barcode steady inside the camera view.';
      scanning=true;
      const formats=['ean_13','ean_8','upc_a','upc_e','code_128','code_39','codabar','itf'];
      let detector;
      try{detector=new BarcodeDetector({formats})}catch{detector=new BarcodeDetector()}
      scanLoop(detector,video,mode);
    }catch(e){
      msg.textContent='Could not open the camera. Please allow camera access and try again.';
    }
  }

  async function scanLoop(detector,video,mode){
    while(scanning){
      try{
        const codes=await detector.detect(video);
        if(codes&&codes.length){
          const value=String(codes[0].rawValue||'').trim();
          if(value){await acceptBarcode(value,mode);return;}
        }
      }catch(e){}
      await new Promise(r=>setTimeout(r,180));
    }
  }

  async function acceptBarcode(value,mode){
    scanning=false;
    const msg=$('#barcodeScanMsg');
    msg.textContent='Barcode found: '+value;
    if(mode==='edit'){
      const input=$('#barcode');if(input)input.value=value;
      setTimeout(stopScanner,450);return;
    }
    if(!activeProductId){msg.textContent='Barcode found, but no product is open.';return;}
    const r=await db.from('inventory_items').update({barcode:value,updated_at:new Date().toISOString()}).eq('id',activeProductId);
    if(r.error){msg.textContent=r.error.message;return;}
    if(typeof loadAll==='function')await loadAll();
    msg.textContent='Saved barcode: '+value;
    setTimeout(()=>{stopScanner();if(typeof window.openProductProfile==='function')window.openProductProfile(activeProductId)},600);
  }

  function stopTracks(){if(stream){stream.getTracks().forEach(t=>t.stop());stream=null}}
  function stopScanner(){scanning=false;stopTracks();const m=$('#barcodeScanModal');if(m)m.classList.remove('show');const v=$('#barcodeVideo');if(v)v.srcObject=null}

  ensureUI();setTimeout(ensureUI,700);setTimeout(ensureUI,1800);
})();