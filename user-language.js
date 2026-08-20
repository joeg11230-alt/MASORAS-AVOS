(()=>{
  const ES={
    'Organization Profile':'Perfil de la Organización','Kitchen Inventory':'Inventario de Cocina','Maintenance Inventory':'Inventario de Mantenimiento','Needs Ordering':'Necesita Pedido','Order Queues':'Colas de Pedidos','Receiving':'Recepción','Vendors':'Proveedores','Inventory':'Inventario','Sign Out':'Cerrar sesión','Sign In':'Iniciar sesión','Create Account':'Crear cuenta','Forgot password?':'¿Olvidó su contraseña?','Show':'Mostrar','Hide':'Ocultar','Stay signed in & remember this device':'Mantener sesión iniciada y recordar este dispositivo','Email':'Correo electrónico','Password':'Contraseña','Phone':'Teléfono','Phone Ext.':'Ext.','Cell':'Celular','WhatsApp':'WhatsApp','Website':'Sitio web','Address':'Dirección','City':'Ciudad','State':'Estado','Zip':'Código postal','Notes':'Notas','Edit Profile':'Editar perfil','Save Profile':'Guardar perfil','Close':'Cerrar','Cancel':'Cancelar','Save':'Guardar','Delete':'Eliminar','Add Product':'Agregar producto','+ Add Kitchen Product':'+ Agregar producto de cocina','+ Add Maintenance Product':'+ Agregar producto de mantenimiento','Vendor':'Proveedor','Vendor Name':'Nombre del proveedor','Contact Person':'Persona de contacto','Item Name':'Nombre del artículo','Brand':'Marca','SKU / Product Code':'SKU / Código de producto','Category':'Categoría','Storage Location':'Ubicación de almacenamiento','Unit':'Unidad','Case / Pack Size':'Tamaño de caja / paquete','Pounds per Case':'Libras por caja','Price':'Precio','Qty On Hand':'Cantidad disponible','Target Stock':'Stock objetivo','Order Qty (Auto)':'Cantidad a pedir (auto)','Last Ordered Date':'Fecha del último pedido','Barcode':'Código de barras','Scan':'Escanear','Scan Barcode':'Escanear código de barras','Product Description / Information':'Descripción / Información del producto','Save Product':'Guardar producto','Delete Vendor':'Eliminar proveedor','Save Vendor':'Guardar proveedor','Add Vendor':'+ Agregar proveedor','Open Vendor':'Abrir proveedor','Order Queue':'Cola de pedidos','Ordering Queue':'Cola de pedidos','Items waiting to be ordered from this vendor':'Artículos esperando pedido de este proveedor','Invoices':'Facturas','Add Manually':'Agregar manualmente','Scan / Upload':'Escanear / Subir','Add Manual Order Item':'Agregar artículo manual al pedido','Add Manual Item':'Agregar artículo manual','Create Order':'Crear pedido','Close Order':'Cerrar pedido','Email Order':'Enviar pedido por correo','Text Order':'Enviar pedido por texto','WhatsApp Order':'Enviar pedido por WhatsApp','Print Order':'Imprimir pedido','Vendor Profile':'Perfil del proveedor','Purchase Order Notes':'Notas de la orden de compra','Save Notes':'Guardar notas','Match Purchase Order to Invoice':'Comparar orden de compra con factura','Match Invoice':'Comparar factura','Clear Match':'Quitar comparación','Order Date':'Fecha del pedido','Order Received Date':'Fecha de recepción','Pending':'Pendiente','Total Cases':'Total de cajas','Grand Total':'Total general','Item':'Artículo','Qty':'Cant.','Unit Price':'Precio unitario','Line Total':'Total de línea','Remove':'Quitar','Add to Queue':'Agregar a la cola','Add All to Queue':'Agregar todo a la cola','In Queue':'En cola','On Hand':'Disponible','Target':'Objetivo','Suggested':'Sugerido','Nothing needs ordering.':'No hay nada que necesite pedido.','No items are currently in an order queue. Add an item from Needs Ordering or use Add Manual Order Item.':'No hay artículos en la cola de pedidos. Agregue un artículo desde Necesita Pedido o use Agregar artículo manual.','No closed orders are waiting to be received.':'No hay pedidos cerrados esperando recepción.','Receive & Match':'Recibir y comparar','Ordered':'Pedido','Received':'Recibido','Status':'Estado','MATCH':'COINCIDE','Users & Permissions':'Usuarios y Permisos','Control what each user can see and whether they can make changes.':'Controle lo que cada usuario puede ver y si puede hacer cambios.','+ Invite New User':'+ Invitar nuevo usuario','Invite New User':'Invitar nuevo usuario','Name':'Nombre','Access Level':'Nivel de acceso','View Only':'Solo lectura','Editor':'Editor','Sections this user can access':'Secciones a las que puede acceder este usuario','Active user':'Usuario activo','Send Invite Link':'Enviar enlace de invitación','Active':'Activo','Inactive':'Inactivo','Language':'Idioma','English':'English','Spanish':'Español','View Only access — changes are disabled for this account.':'Acceso de solo lectura — los cambios están deshabilitados para esta cuenta.','Access not assigned':'Acceso no asignado','Your account is signed in, but an owner has not granted access yet.':'Su cuenta inició sesión, pero el propietario todavía no le ha dado acceso.'
  };
  const EN=Object.fromEntries(Object.entries(ES).map(([k,v])=>[v,k]));
  let lang='en',applying=false,rerunTimer=null;

  function translateText(root=document){
    if(applying)return;
    applying=true;
    try{
      const map=lang==='es'?ES:EN;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
      const nodes=[];let n;
      while(n=walker.nextNode())nodes.push(n);
      nodes.forEach(node=>{
        const p=node.parentElement;if(!p||['SCRIPT','STYLE','TEXTAREA'].includes(p.tagName))return;
        const raw=node.nodeValue||'',trim=raw.trim();if(!trim)return;
        const replacement=map[trim];if(replacement)node.nodeValue=raw.replace(trim,replacement);
      });
      document.querySelectorAll('option').forEach(o=>{const t=o.textContent.trim(),r=map[t];if(r)o.textContent=r});
      const placeholders={'Search item, vendor, barcode, SKU, brand...':'Buscar artículo, proveedor, código de barras, SKU, marca...','Item not in inventory':'Artículo que no está en inventario','case, box, each...':'caja, paquete, unidad...','Delivery instructions, substitutions, special requests…':'Instrucciones de entrega, sustituciones, solicitudes especiales…','Full name':'Nombre completo','Phone number':'Número de teléfono'};
      document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{
        if(lang==='es'&&placeholders[el.placeholder])el.placeholder=placeholders[el.placeholder];
        if(lang==='en'){const back=Object.entries(placeholders).find(([,v])=>v===el.placeholder);if(back)el.placeholder=back[0]}
      });
      document.documentElement.lang=lang;
    }finally{applying=false}
  }

  function ensureSelector(){
    const header=document.querySelector('header');if(!header)return;
    let box=document.querySelector('#userLanguageBox');
    if(!box){
      box=document.createElement('div');box.id='userLanguageBox';box.style.cssText='margin-top:7px;display:flex;gap:7px;align-items:center;font-size:13px;font-weight:700';
      box.innerHTML='<span id="languageLabel">Language:</span><select id="userLanguageSelect" style="width:auto;padding:5px 8px;border-radius:8px"><option value="en">English</option><option value="es">Español</option></select>';
      header.appendChild(box);
      box.querySelector('select').onchange=async e=>{
        const next=e.target.value==='es'?'es':'en';
        const r=await db.rpc('set_my_language',{p_language:next});
        if(r.error){alert(r.error.message);e.target.value=lang;return}
        lang=next;localStorage.setItem('masoras_language',lang);translateText(document);ensureSelector();
      };
    }
    box.querySelector('select').value=lang;
    box.querySelector('#languageLabel').textContent=lang==='es'?'Idioma:':'Language:';
  }

  async function loadLanguage(){
    try{
      const {data:{session}}=await db.auth.getSession();if(!session)return;
      const email=(session.user.email||'').toLowerCase();
      const r=await db.from('app_users').select('language').ilike('email',email).maybeSingle();
      lang=r.data?.language==='es'?'es':(localStorage.getItem('masoras_language')==='es'?'es':'en');
      localStorage.setItem('masoras_language',lang);ensureSelector();translateText(document);
    }catch(e){console.error('language load',e)}
  }

  function enhanceInvite(){
    const form=document.querySelector('#inviteUserForm');if(!form||form.querySelector('#inviteLanguage'))return;
    const role=document.querySelector('#inviteRole')?.closest('label');if(!role)return;
    const label=document.createElement('label');label.innerHTML='Language<select id="inviteLanguage"><option value="en">English</option><option value="es">Español</option></select>';role.after(label);
    form.addEventListener('submit',()=>{const sel=form.querySelector('#inviteLanguage');if(sel)window.__inviteLanguage=sel.value},true);
  }

  function patchInviteInvoke(){
    if(!window.db||db.__languagePatched)return;
    const original=db.functions.invoke.bind(db.functions);
    db.functions.invoke=async function(name,opts={}){
      if(name==='invite-app-user'&&opts.body){const sel=document.querySelector('#inviteLanguage');opts={...opts,body:{...opts.body,language:sel?.value||window.__inviteLanguage||'en'}}}
      return original(name,opts);
    };
    db.__languagePatched=true;
  }

  function rerun(){rerunTimer=null;ensureSelector();enhanceInvite();translateText(document)}
  function scheduleRerun(delay=140){if(rerunTimer)clearTimeout(rerunTimer);rerunTimer=setTimeout(rerun,delay)}
  function start(){
    patchInviteInvoke();loadLanguage();scheduleRerun(700);setTimeout(()=>scheduleRerun(0),1600);
    document.addEventListener('click',()=>scheduleRerun(180),true);
    document.addEventListener('submit',()=>scheduleRerun(250),true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();