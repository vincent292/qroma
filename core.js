export const types = [
  {id:'url',label:'Enlace',title:'Enlace web',icon:'link'},
  {id:'text',label:'Texto',title:'Texto libre',icon:'text'},
  {id:'phone',label:'Teléfono',title:'Llamada telefónica',icon:'phone'},
  {id:'whatsapp',label:'WhatsApp',title:'WhatsApp',icon:'chat'},
  {id:'email',label:'Correo',title:'Correo electrónico',icon:'mail'},
  {id:'wifi',label:'Wi-Fi',title:'Red Wi-Fi',icon:'wifi'},
  {id:'contact',label:'Contacto',title:'Tarjeta de contacto',icon:'contact'},
  {id:'location',label:'Ubicación',title:'Ubicación',icon:'pin'}
];
export const defaults = () => ({type:'url',fields:{url:{url:'https://ejemplo.com'},text:{text:''},phone:{phone:''},whatsapp:{phone:'',message:''},email:{email:'',subject:'',message:''},wifi:{ssid:'',password:'',security:'WPA',hidden:false},contact:{name:'',surname:'',company:'',phone:'',email:'',url:''},location:{latitude:'',longitude:''}},foreground:'#183e36',secondary:'#46786a',background:'#ffffff',gradient:false,transparent:false,dots:'rounded',corners:'extra-rounded',margin:8,logo:'',logoName:'',logoSize:22,frame:'none',frameText:'ESCANÉAME',flowerColor:'#cf94a0',leafColor:'#81977d',accentColor:'#b69560',floralStyle:'bouquets',floralSize:100,weddingNames:'',size:1200,format:'png'});
export const escapeWifi = value => String(value).replace(/([\\;,:" ])/g,match=>match===' '?' ':('\\'+match));
const vcard = value => String(value || '').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
const phone = value => String(value).replace(/[\s().-]/g,'');
export function payload(state) {
  const f = state.fields[state.type];
  const required = (value,message) => {if(!String(value || '').trim()) throw Error(message);return String(value).trim()};
  const validPhone = value => {const p=phone(required(value,'Escribe un número de teléfono.'));if(!/^\+?\d{5,15}$/.test(p))throw Error('Usa entre 5 y 15 dígitos, con prefijo internacional.');return p};
  const validEmail = value => {const e=required(value,'Escribe una dirección de correo.');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))throw Error('Revisa la dirección de correo.');return e};
  let data;
  switch(state.type){
    case 'url': {let url=required(f.url,'Añade el enlace que quieres compartir.');if(!/^https?:\/\//i.test(url))url='https://'+url;let parsed;try{parsed=new URL(url)}catch{throw Error('Escribe una dirección web válida.')}if(!['http:','https:'].includes(parsed.protocol)||!parsed.hostname.includes('.'))throw Error('Usa un enlace web http o https válido.');data=parsed.href;break;}
    case 'text':data=required(f.text,'Escribe el texto o los números que quieres compartir.');break;
    case 'phone':data='tel:'+validPhone(f.phone);break;
    case 'whatsapp':{const p=validPhone(f.phone).replace(/^\+/,'');data=`https://wa.me/${p}${f.message?'?text='+encodeURIComponent(f.message):''}`;break;}
    case 'email': {const e=validEmail(f.email);const params=[];if(f.subject)params.push('subject='+encodeURIComponent(f.subject));if(f.message)params.push('body='+encodeURIComponent(f.message));data='mailto:'+e+(params.length?'?'+params.join('&'):'');break;}
    case 'wifi':{const ssid=required(f.ssid,'Escribe el nombre de tu red Wi-Fi.');if(f.security!=='nopass')required(f.password,'Escribe la contraseña de la red.');data=`WIFI:T:${f.security};S:${escapeWifi(ssid)};P:${f.security==='nopass'?'':escapeWifi(f.password)};H:${Boolean(f.hidden)};;`;break;}
    case 'contact':{required(f.name,'Escribe al menos el nombre del contacto.');if(f.phone)validPhone(f.phone);if(f.email)validEmail(f.email);data=['BEGIN:VCARD','VERSION:3.0',`N:${vcard(f.surname)};${vcard(f.name)};;;`,`FN:${vcard([f.name,f.surname].filter(Boolean).join(' '))}`,f.company&&`ORG:${vcard(f.company)}`,f.phone&&`TEL;TYPE=CELL:${phone(f.phone)}`,f.email&&`EMAIL:${vcard(f.email)}`,f.url&&`URL:${vcard(f.url)}`,'END:VCARD'].filter(Boolean).join('\r\n');break;}
    case 'location':{required(f.latitude,'Escribe la latitud.');required(f.longitude,'Escribe la longitud.');const lat=Number(f.latitude),lng=Number(f.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)throw Error('Latitud: −90 a 90. Longitud: −180 a 180.');data=`https://www.google.com/maps?q=${lat},${lng}`;break;}
    default:throw Error('Selecciona un tipo de contenido válido.');
  }
  if(new TextEncoder().encode(data).length>1200)throw Error('El contenido es muy largo. Usa hasta 1200 bytes o comparte un enlace.');
  return data;
}
export function contrast(a,b){const lum=c=>{const rgb=c.replace('#','').match(/.{2}/g).map(n=>parseInt(n,16)/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722};const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
export function sanitizeProject(raw){
  if(!raw||raw.app!=='qroma'||raw.version!==1||!raw.state)throw Error('Este archivo no es un proyecto de Qroma compatible.');
  const src=raw.state,s=defaults();
  if(types.some(t=>t.id===src.type))s.type=src.type;
  for(const type of types)for(const key of Object.keys(s.fields[type.id])){const val=src.fields?.[type.id]?.[key];if(typeof s.fields[type.id][key]==='boolean')s.fields[type.id][key]=val===true;else if(typeof val==='string')s.fields[type.id][key]=val.slice(0,5000)}
  if(!['WPA','WEP','nopass'].includes(s.fields.wifi.security))s.fields.wifi.security='WPA';
  for(const k of ['foreground','secondary','background','flowerColor','leafColor','accentColor'])if(/^#[a-f0-9]{6}$/i.test(src[k]))s[k]=src[k];
  for(const k of ['gradient','transparent'])s[k]=src[k]===true;
  for(const [k,values] of Object.entries({dots:['rounded','dots','square','extra-rounded','classy','classy-rounded'],corners:['square','extra-rounded','dot'],frame:['none','simple','label','floral'],floralStyle:['bouquets','wreath','watercolor'],format:['png','svg','jpeg','webp']}))if(values.includes(src[k]))s[k]=src[k];
  for(const [k,min,max] of [['margin',8,16],['logoSize',12,28],['size',128,4096]])if(Number.isFinite(src[k]))s[k]=Math.round(Math.min(max,Math.max(min,src[k])));
  if(typeof src.frameText==='string')s.frameText=src.frameText.slice(0,28);
  s.floralSize=Number.isFinite(src.floralSize)?Math.round(Math.min(120,Math.max(75,src.floralSize))):100;
  if(typeof src.weddingNames==='string')s.weddingNames=src.weddingNames.slice(0,40);
  if(typeof src.logo==='string'&&/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(src.logo)&&src.logo.length<7500000)s.logo=src.logo;
  if(typeof src.logoName==='string')s.logoName=src.logoName.slice(0,100);
  return s;
}
