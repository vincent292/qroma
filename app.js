import {types,defaults,payload,contrast,sanitizeProject} from './core.js';
const $=id=>document.getElementById(id);
const icon=name=>`<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
let state=defaults(), currentSvg=null, valid=false, renderVersion=0, timer, toastTimer;
const presets=[{name:'Bosque',fg:'#183e36',bg:'#ffffff',secondary:'#46786a'},{name:'Tinta',fg:'#222329',bg:'#ffffff',secondary:'#626877'},{name:'Índigo',fg:'#4c3c86',bg:'#f5f0ff',secondary:'#7a52b3'},{name:'Terracota',fg:'#873e2f',bg:'#fff6e9',secondary:'#ac5b35'},{name:'Océano',fg:'#164968',bg:'#eff9fc',secondary:'#237e89'}];
const fields={
 url:[{key:'url',label:'Tu enlace',placeholder:'https://tu-sitio.com',type:'url',hint:'Tu web, redes sociales, un menú, un PDF… cualquier enlace público.',required:true}],
 text:[{key:'text',label:'Tu texto o números',placeholder:'Escribe algo que quieras compartir…',type:'textarea',hint:'Hasta 1200 bytes. Los textos cortos crean códigos más fáciles de leer.',required:true}],
 phone:[{key:'phone',label:'Número de teléfono',placeholder:'+591 70000000',type:'tel',hint:'Incluye el prefijo del país, por ejemplo +591 para Bolivia.',required:true}],
 whatsapp:[{key:'phone',label:'Número de WhatsApp',placeholder:'+591 70000000',type:'tel',required:true},{key:'message',label:'Mensaje inicial',placeholder:'¡Hola! Me gustaría saber más.',type:'textarea'}],
 email:[{key:'email',label:'Correo electrónico',placeholder:'hola@tu-marca.com',type:'email',required:true},{key:'subject',label:'Asunto',placeholder:'Hablemos de tu proyecto',type:'text'},{key:'message',label:'Mensaje',placeholder:'Hola…',type:'textarea'}],
 wifi:[{key:'ssid',label:'Nombre de la red (SSID)',placeholder:'El nombre exacto de tu Wi-Fi',type:'text',required:true},{key:'security',label:'Seguridad',type:'select',options:[['WPA','WPA / WPA2 / WPA3'],['WEP','WEP'],['nopass','Sin contraseña']]},{key:'password',label:'Contraseña',placeholder:'Contraseña de la red',type:'password'},{key:'hidden',label:'La red está oculta',type:'checkbox'}],
 contact:[{key:'name',label:'Nombre',placeholder:'Tu nombre',type:'text',required:true},{key:'surname',label:'Apellido',placeholder:'Tu apellido',type:'text'},{key:'company',label:'Empresa',placeholder:'Tu marca o empresa',type:'text'},{key:'phone',label:'Teléfono',placeholder:'+591 70000000',type:'tel'},{key:'email',label:'Correo',placeholder:'hola@tu-marca.com',type:'email'},{key:'url',label:'Página web',placeholder:'https://tu-marca.com',type:'url'}],
 location:[{key:'latitude',label:'Latitud',placeholder:'-16.5000',type:'number',required:true},{key:'longitude',label:'Longitud',placeholder:'-68.1500',type:'number',hint:'Puedes copiar las coordenadas desde Google Maps.',required:true}]
};
function showToast(message){$('toast').textContent=message;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4000)}
function renderFields(){
  $('content-types').innerHTML=types.map(t=>`<button type="button" class="type-button" data-type="${t.id}" aria-pressed="${t.id===state.type}">${icon(t.icon)}${t.label}</button>`).join('');
  const container=$('content-fields');container.replaceChildren();
  for(const field of fields[state.type]){
    const group=document.createElement('div');group.className='field-group';
    const label=document.createElement('label');label.htmlFor='content-'+field.key;label.className=field.type==='checkbox'?'switch-label':'field-label';label.textContent=field.label+(field.required?' *':'');
    let input;
    if(field.type==='textarea'){input=document.createElement('textarea');input.rows=3;input.maxLength=1200}
    else if(field.type==='select'){input=document.createElement('select');for(const [value,text]of field.options){const o=document.createElement('option');o.value=value;o.textContent=text;input.append(o)}}
    else{input=document.createElement('input');input.type=field.type;if(field.type==='number')input.step='any';if(field.type!=='checkbox')input.maxLength=1200}
    input.id='content-'+field.key;input.name=field.key;input.autocomplete='off';if(field.placeholder)input.placeholder=field.placeholder;
    if(field.type==='checkbox'){input.checked=state.fields[state.type][field.key];label.prepend(input);group.append(label)}else{input.value=state.fields[state.type][field.key];if(field.required){input.required=true;input.setAttribute('aria-describedby','content-error')}group.append(label,input)}
    if(field.hint){const hint=document.createElement('p');hint.className='input-hint';hint.textContent=field.hint;group.append(hint)}
    input.addEventListener('input',()=>{state.fields[state.type][field.key]=field.type==='checkbox'?input.checked:input.value;if(field.key==='security')syncWifi();scheduleRender()});
    container.append(group);
  }
  syncWifi();$('preview-type').textContent=types.find(t=>t.id===state.type).title;
}
function syncWifi(){if(state.type==='wifi')$('content-password').closest('.field-group').hidden=state.fields.wifi.security==='nopass'}
function buildChoices(){
  $('presets').innerHTML=presets.map((p,i)=>`<button class="preset" data-preset="${i}" aria-label="Paleta ${p.name}" title="${p.name}" aria-pressed="false"><span style="background:${p.fg}"></span><span style="background:${p.secondary}"></span><span style="background:${p.bg}"></span></button>`).join('');
  const dots=[['square','Cuadrados'],['rounded','Suaves'],['dots','Círculos'],['extra-rounded','Redondos'],['classy','Orgánicos'],['classy-rounded','Fluidos']];
  $('dot-styles').innerHTML=dots.map(([id,name])=>`<button class="shape-choice" data-dots="${id}" aria-pressed="false"><span aria-hidden="true" class="dot-sample ${id}">${'<i></i>'.repeat(9)}</span>${name}</button>`).join('');
  $('corner-styles').innerHTML=[['square','Cuadradas'],['extra-rounded','Suaves'],['dot','Circulares']].map(([id,name])=>`<button data-corners="${id}" aria-pressed="false"><span aria-hidden="true" class="eye-demo ${id}"></span>${name}</button>`).join('');
}
function syncControls(){
  for(const id of ['foreground','secondary','background']){$(id).value=state[id];$(id+'-hex').value=state[id].toUpperCase()}
  for(const id of ['gradient','transparent'])$(id).checked=state[id];
  $('secondary-color').hidden=!state.gradient;$('background').disabled=state.transparent;$('background-hex').disabled=state.transparent;
  for(const [id,key]of [['margin','margin'],['logo-size','logoSize'],['frame-text','frameText'],['export-format','format']])$(id).value=state[key];
  $('margin-value').value=state.margin+'%';$('logo-size-value').value=state.logoSize+'%';
  const standard=[512,1200,2048,4096].includes(state.size);$('export-size').value=standard?String(state.size):'custom';$('custom-size-field').hidden=standard;$('custom-size').value=state.size;
  $('logo-controls').hidden=!state.logo;$('logo-thumbnail').src=state.logo||'';$('logo-name').textContent=state.logoName;
  for(const el of document.querySelectorAll('[data-dots],[data-corners],[data-frame]')){const key=el.dataset.dots?'dots':el.dataset.corners?'corners':'frame';el.setAttribute('aria-pressed',String(el.dataset[key]===state[key]))}
  for(const el of document.querySelectorAll('[data-preset]')){const p=presets[Number(el.dataset.preset)],selected=p.fg===state.foreground&&p.bg===state.background;el.setAttribute('aria-pressed',String(selected));el.querySelector('svg')?.remove();if(selected)el.insertAdjacentHTML('beforeend',icon('check'))}
  $('frame-text').disabled=state.frame!=='label';$('format-badge').textContent=state.format==='jpeg'?'JPG':state.format.toUpperCase();
  $('preview-dimensions').textContent=state.format==='svg'?'Vector · escalable':`${state.size} × ${state.size} px`;
}
function setError(message){$('content-error').textContent=message;$('content-error').hidden=!message;$('download').disabled=Boolean(message)||!currentSvg;valid=!message&&Boolean(currentSvg);$('preview-stage').style.opacity=message?'.45':'1';$('qr-preview').setAttribute('aria-label',message?'Vista previa no válida. Revisa el contenido.':'Código QR generado');document.querySelector('.preview-live').lastChild.textContent=message?' Revisa los datos':' Actualizada'}
function scheduleRender(){clearTimeout(timer);$('download').disabled=true;valid=false;renderVersion++;timer=setTimeout(render,130)}
function options(data,size,s){const color={color:s.foreground};if(s.gradient)color.gradient={type:'linear',rotation:Math.PI/4,colorStops:[{offset:0,color:s.foreground},{offset:1,color:s.secondary}]};return{width:size,height:size,type:'svg',data,margin:Math.round(size*s.margin/100),qrOptions:{errorCorrectionLevel:'H'},dotsOptions:{type:s.dots,...color},cornersSquareOptions:{type:s.corners,...color},cornersDotOptions:{type:s.corners==='dot'?'dot':'square',...color},backgroundOptions:{color:s.transparent?'#ffffff00':s.background},image:s.logo||undefined,imageOptions:{hideBackgroundDots:true,imageSize:s.logoSize/100,margin:Math.round(size*.012),saveAsBlob:true,crossOrigin:'anonymous'}}}
function addSvgElement(name,attrs,text){const el=document.createElementNS('http://www.w3.org/2000/svg',name);for(const [k,v]of Object.entries(attrs))el.setAttribute(k,String(v));if(text!==undefined)el.textContent=text;return el}
async function makeSvg(data,size,s=structuredClone(state)){
  const hasFrame=s.frame!=='none',label=s.frame==='label',pad=hasFrame?Math.round(size*.045):0,bottom=label?Math.round(size*.11):pad,inner=size-pad*2-(label?Math.round(size*.08):0);
  const qr=new QRCodeStyling(options(data,inner,s));const raw=await qr.getRawData('svg');const text=await raw.text();const parsed=new DOMParser().parseFromString(text,'image/svg+xml');const svg=parsed.documentElement;
  if(!hasFrame){svg.setAttribute('width',size);svg.setAttribute('height',size);svg.setAttribute('viewBox',`0 0 ${inner} ${inner}`);return svg}
  const out=addSvgElement('svg',{xmlns:'http://www.w3.org/2000/svg',width:size,height:size,viewBox:`0 0 ${size} ${size}`});
  out.append(addSvgElement('rect',{x:0,y:0,width:size,height:size,rx:Math.round(size*.035),fill:s.foreground}));
  out.append(addSvgElement('rect',{x:pad,y:pad,width:size-pad*2,height:size-pad-bottom,rx:Math.round(size*.015),fill:s.transparent?'#ffffff':s.background}));
  const group=addSvgElement('g',{transform:`translate(${(size-inner)/2},${pad})`});group.append(...Array.from(svg.children));out.append(group);
  if(label)out.append(addSvgElement('text',{x:size/2,y:size-bottom*.45,'text-anchor':'middle','dominant-baseline':'middle',fill:contrast(s.foreground,'#ffffff')>contrast(s.foreground,'#183e36')?'#ffffff':'#183e36','font-family':'Arial, sans-serif','font-weight':700,'font-size':Math.round(size*(s.frameText.length>18?.027:.035)),'letter-spacing':size*.002},s.frameText||'ESCANÉAME'));
  return out;
}
async function render(){
  clearTimeout(timer);const version=++renderVersion;
  let data;try{data=payload(state)}catch(e){setError(e.message);return}
  try{const svg=await makeSvg(data,600);if(version!==renderVersion)return;currentSvg=svg;$('qr-preview').replaceChildren(svg);setError('');updateContrast();verifyReading(svg,data,version)}catch(e){if(version!==renderVersion)return;setError('No se pudo generar el QR. Reduce el texto o prueba otra imagen.');console.error('QR render failed',e)}
}
async function verifyReading(svg,data,version){
  if(typeof jsQR!=='function')return;
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
  try{const img=new Image();img.src=url;await img.decode();if(version!==renderVersion)return;const canvas=document.createElement('canvas');canvas.width=canvas.height=600;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.fillRect(0,0,600,600);ctx.drawImage(img,0,0,600,600);const pixels=ctx.getImageData(0,0,600,600);const decoded=jsQR(pixels.data,600,600,{inversionAttempts:'attemptBoth'});if(version!==renderVersion)return;const el=$('scan-status'),ok=decoded?.data===data;el.classList.toggle('warning',!ok||state.transparent);el.querySelector('span').textContent=ok?(state.transparent?'Lectura comprobada sobre blanco. Usa un fondo claro.':'Lectura comprobada. Pruébalo también con tu cámara.'):'No se confirmó la lectura. Prueba otras esquinas o más contraste.';
  }catch{if(version===renderVersion)updateContrast()}finally{URL.revokeObjectURL(url)}
}
function updateContrast(){const bg=state.transparent?'#ffffff':state.background,ratio=Math.min(contrast(state.foreground,bg),state.gradient?contrast(state.secondary,bg):100);const warning=ratio<4.5||state.transparent;const el=$('scan-status');el.classList.toggle('warning',warning);el.querySelector('span').textContent=state.transparent?'Usa un fondo claro al colocar este QR transparente.':ratio<4.5?'Contraste bajo. Oscurece el código o aclara el fondo.':'Buen contraste para escanear';if(state.logo)el.querySelector('span').textContent+=' Prueba el logo con tu cámara.'}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
async function download(){
  if(!valid)return;if(!$('custom-size-field').hidden&&!$('custom-size').checkValidity()){$('custom-size').reportValidity();return}const btn=$('download');btn.disabled=true;btn.querySelector('span').textContent='Preparando…';
  try{const snapshot=structuredClone(state),data=payload(snapshot),size=snapshot.size;if(!Number.isInteger(size)||size<128||size>4096)throw Error('Elige un tamaño entre 128 y 4096 píxeles.');const format=snapshot.format,svg=await makeSvg(data,size,snapshot),serialized=new XMLSerializer().serializeToString(svg),blob=new Blob([serialized],{type:'image/svg+xml;charset=utf-8'});const name=`qroma-${snapshot.type}-${size}`;
    if(format==='svg')downloadBlob(blob,name+'.svg');else{const url=URL.createObjectURL(blob);try{const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d');if(format==='jpeg'){ctx.fillStyle=snapshot.background;ctx.fillRect(0,0,size,size)}ctx.drawImage(img,0,0,size,size);const result=await new Promise(resolve=>canvas.toBlob(resolve,'image/'+format,.96));if(!result)throw Error('No se pudo exportar la imagen.');const actual=result.type.split('/')[1];downloadBlob(result,name+'.'+(actual==='jpeg'?'jpg':actual));}finally{URL.revokeObjectURL(url)}}
    showToast('Tu QR está listo. Pruébalo con tu cámara antes de compartir.');
  }catch(e){showToast(e.message||'No se pudo descargar. Prueba otro formato.')}finally{btn.querySelector('span').textContent='Descargar QR';btn.disabled=!valid}
}
async function loadLogo(file){if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)){showToast('Selecciona una imagen PNG, JPG o WebP.');return}if(file.size>5*1024*1024){showToast('La imagen debe pesar menos de 5 MB.');return}try{const img=await createImageBitmap(file);const side=Math.min(800,Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*side/Math.max(img.width,img.height)));canvas.height=Math.max(1,Math.round(img.height*side/Math.max(img.width,img.height)));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);img.close();state.logo=canvas.toDataURL('image/png');state.logoName=file.name;syncControls();scheduleRender();showToast('Imagen añadida. Ajusta su tamaño a tu gusto.')}catch{showToast('No se pudo abrir esa imagen. Prueba otro archivo.')}finally{$('logo-file').value=''}}
const storageKey='qroma-designs-v1';
function getDesigns(){try{const data=JSON.parse(localStorage.getItem(storageKey)||'[]');return Array.isArray(data)?data.slice(0,30):[]}catch{return[]}}
function saveDesign(){try{payload(state);const title=(state.fields[state.type].url||state.fields[state.type].name||state.fields[state.type].ssid||state.fields[state.type].text||types.find(t=>t.id===state.type).title).slice(0,60);const designs=getDesigns();designs.unshift({id:crypto.randomUUID(),title,date:new Date().toISOString(),project:{app:'qroma',version:1,state:structuredClone(state)}});localStorage.setItem(storageKey,JSON.stringify(designs.slice(0,30)));showToast('Diseño guardado. Encuéntralo en «Mis diseños».')}catch(e){showToast(e.name==='QuotaExceededError'?'Sin espacio local. Exporta tu proyecto desde «Mis diseños».':e.message||'No se pudo guardar en este navegador.')}}
function renderLibrary(){const list=$('library-list');list.replaceChildren();const designs=getDesigns();if(!designs.length){const p=document.createElement('p');p.className='empty-library';p.textContent='Tu colección empieza aquí. Guarda tu primer diseño desde el estudio.';list.append(p);return}for(const design of designs){const row=document.createElement('div');row.className='library-item';const info=document.createElement('div');info.className='library-item-info';const title=document.createElement('h3');title.textContent=design.title;const date=document.createElement('p');date.textContent=new Date(design.date).toLocaleDateString('es',{year:'numeric',month:'short',day:'numeric'});info.append(title,date);const open=document.createElement('button');open.textContent='Abrir';open.addEventListener('click',()=>{try{state=sanitizeProject(design.project);renderFields();syncControls();render();$('library-dialog').close();showToast('Diseño abierto. Puedes seguir editándolo.')}catch(e){showToast(e.message)}});const remove=document.createElement('button');remove.textContent='Eliminar';remove.setAttribute('aria-label','Eliminar '+design.title);remove.addEventListener('click',()=>{try{localStorage.setItem(storageKey,JSON.stringify(getDesigns().filter(d=>d.id!==design.id)));renderLibrary();showToast('Diseño eliminado de este navegador.')}catch{showToast('No se pudo eliminar el diseño.')}});row.append(info,open,remove);list.append(row)}}
function activateTab(tab){for(const button of document.querySelectorAll('[data-panel]')){const active=button===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;$('panel-'+button.dataset.panel).hidden=!active}}
buildChoices();renderFields();syncControls();
$('content-types').addEventListener('click',e=>{const b=e.target.closest('[data-type]');if(!b)return;state.type=b.dataset.type;renderFields();scheduleRender()});
$('content-form').addEventListener('submit',e=>e.preventDefault());
document.querySelector('.design-tabs').addEventListener('click',e=>{const tab=e.target.closest('[data-panel]');if(tab)activateTab(tab)});
document.querySelector('.design-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tabs=Array.from(document.querySelectorAll('[data-panel]'));let index=tabs.indexOf(document.activeElement);index=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;activateTab(tabs[index]);tabs[index].focus()});
for(const id of ['foreground','secondary','background']){
  $(id).addEventListener('input',()=>{state[id]=$(id).value;syncControls();scheduleRender()});
  $(id+'-hex').addEventListener('input',()=>{const value=$(id+'-hex').value;if(/^#[a-f0-9]{6}$/i.test(value)){state[id]=value.toLowerCase();$(id+'-hex').setCustomValidity('');$(id).value=value;scheduleRender()}else $(id+'-hex').setCustomValidity('Usa un color como #183E36')});
  $(id+'-hex').addEventListener('blur',()=>{$(id+'-hex').setCustomValidity('');syncControls()});
}
for(const id of ['gradient','transparent'])$(id).addEventListener('change',()=>{state[id]=$(id).checked;syncControls();scheduleRender()});
$('presets').addEventListener('click',e=>{const b=e.target.closest('[data-preset]');if(!b)return;const p=presets[Number(b.dataset.preset)];state.foreground=p.fg;state.secondary=p.secondary;state.background=p.bg;state.transparent=false;syncControls();scheduleRender()});
for(const [container,key]of [['dot-styles','dots'],['corner-styles','corners']])$(container).addEventListener('click',e=>{const b=e.target.closest(`[data-${key}]`);if(b){state[key]=b.dataset[key];syncControls();scheduleRender()}});
document.querySelector('.frame-grid').addEventListener('click',e=>{const b=e.target.closest('[data-frame]');if(b){state.frame=b.dataset.frame;syncControls();scheduleRender()}});
for(const [id,key]of [['margin','margin'],['logo-size','logoSize'],['frame-text','frameText']])$(id).addEventListener('input',()=>{state[key]=id==='frame-text'?$(id).value:Number($(id).value);if(id!=='frame-text')$(id+'-value').value=state[key]+'%';scheduleRender()});
$('logo-file').addEventListener('change',()=>loadLogo($('logo-file').files[0]));
for(const event of ['dragenter','dragover'])$('upload-zone').addEventListener(event,e=>{e.preventDefault();$('upload-zone').classList.add('drag-over')});
for(const event of ['dragleave','drop'])$('upload-zone').addEventListener(event,e=>{e.preventDefault();$('upload-zone').classList.remove('drag-over');if(event==='drop')loadLogo(e.dataTransfer.files[0])});
$('remove-logo').addEventListener('click',()=>{state.logo='';state.logoName='';syncControls();scheduleRender()});
$('export-size').addEventListener('change',()=>{const custom=$('export-size').value==='custom';$('custom-size-field').hidden=!custom;state.size=custom?Math.min(4096,Math.max(128,Number($('custom-size').value)||800)):Number($('export-size').value);syncControls();if(custom){$('export-size').value='custom';$('custom-size-field').hidden=false}$('download').disabled=!valid});
$('custom-size').addEventListener('input',()=>{const value=Number($('custom-size').value);const ok=Number.isInteger(value)&&value>=128&&value<=4096;$('custom-size').setCustomValidity(ok?'':'Usa un número entero entre 128 y 4096.');$('download').disabled=!ok||!valid;if(ok){state.size=value;$('preview-dimensions').textContent=state.format==='svg'?'Vector · escalable':`${value} × ${value} px`}});
$('export-format').addEventListener('change',()=>{state.format=$('export-format').value;syncControls();if(state.format==='jpeg'&&state.transparent)showToast('JPG usa un fondo sólido. Elige PNG, WebP o SVG para transparencia.')});
$('download').addEventListener('click',download);$('save-design').addEventListener('click',saveDesign);
$('reset').addEventListener('click',()=>{state=defaults();renderFields();syncControls();activateTab($('tab-colors'));render();showToast('Nuevo lienzo. Vamos a crear algo más.')});
$('open-library').addEventListener('click',()=>{renderLibrary();$('library-dialog').showModal()});$('open-help').addEventListener('click',()=>$('help-dialog').showModal());
for(const button of document.querySelectorAll('.close-dialog,.close-help'))button.addEventListener('click',()=>button.closest('dialog').close());
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
$('export-project').addEventListener('click',()=>{downloadBlob(new Blob([JSON.stringify({app:'qroma',version:1,state},null,2)],{type:'application/json'}),'mi-diseno.qroma.json');showToast('Proyecto exportado. Contiene el contenido y la imagen de este diseño.')});
$('import-project').addEventListener('change',async()=>{const file=$('import-project').files[0];if(!file)return;try{if(file.size>8*1024*1024)throw Error('El proyecto supera el tamaño permitido (8 MB).');state=sanitizeProject(JSON.parse(await file.text()));renderFields();syncControls();await render();$('library-dialog').close();showToast('Proyecto importado. Ya puedes editarlo.')}catch(e){showToast(e instanceof SyntaxError?'El archivo JSON no es válido.':e.message)}finally{$('import-project').value=''}});
if(typeof QRCodeStyling==='undefined')setError('No se pudo cargar el generador. Recarga la página.');else render();
