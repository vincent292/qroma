// Vector ornaments stay outside the QR's reserved square and scale with exports.
const ns='http://www.w3.org/2000/svg';
const node=(name,attrs={},text)=>{const el=document.createElementNS(ns,name);for(const [key,value]of Object.entries(attrs))el.setAttribute(key,String(value));if(text!==undefined)el.textContent=text;return el};
export const weddingPalettes=[
  {name:'Acuarela romántica',ink:'#655c53',paper:'#fbf8f1',flower:'#b9697c',leaf:'#88aeb5',accent:'#ae8952',style:'watercolor'},
  {name:'Rosa & salvia',ink:'#394e42',paper:'#fffdf9',flower:'#cf94a0',leaf:'#81977d',accent:'#b69560'},
  {name:'Marfil & olivo',ink:'#414a32',paper:'#fffef9',flower:'#d8c4a4',leaf:'#88916c',accent:'#b29353'},
  {name:'Lavanda',ink:'#514260',paper:'#fefcff',flower:'#b39bc9',leaf:'#88988b',accent:'#bcaa83'}
];
export function floralLayout(size){return{qrSize:size*.64,x:size*.18,y:size*.18}}
function leaf(parent,x,y,angle,scale,color){const g=node('g',{transform:`translate(${x} ${y}) rotate(${angle}) scale(${scale})`});g.append(node('path',{d:'M0 0C-19-3-24-21-21-32C-7-30 5-17 0 0Z',fill:color,opacity:.82}));g.append(node('path',{d:'M0 0-17-26',fill:'none',stroke:color,'stroke-width':.7}));parent.append(g)}
function rose(parent,x,y,r,color,accent){const g=node('g',{transform:`translate(${x} ${y})`});
  for(let layer=0;layer<3;layer++){const count=layer===2?5:7,rad=r*(1-layer*.26);for(let i=0;i<count;i++){g.append(node('ellipse',{cx:0,cy:-rad*.38,rx:rad*.53,ry:rad*.68,transform:`rotate(${i*360/count+layer*23})`,fill:color,stroke:'#fffdf9','stroke-width':r*.018,opacity:.62+layer*.12}))}}
  g.append(node('path',{d:`M${-r*.18} 0Q0 ${-r*.26} ${r*.17} 0Q0 ${r*.2} ${-r*.09} ${r*.05}`,stroke:accent,'stroke-width':r*.045,fill:'none','stroke-linecap':'round'}));parent.append(g)
}
function blossom(parent,x,y,r,color,accent){const g=node('g',{transform:`translate(${x} ${y})`});for(let i=0;i<5;i++)g.append(node('ellipse',{cx:0,cy:-r*.48,rx:r*.37,ry:r*.55,transform:`rotate(${i*72})`,fill:color,opacity:.75}));g.append(node('circle',{r:r*.16,fill:accent}));parent.append(g)}
function bouquet(parent,x,y,rotation,s){const g=node('g',{transform:`translate(${x} ${y}) rotate(${rotation})`});
  for(const d of ['M0 0C-30-22-53-63-51-114','M0 0C23-35 25-77 13-123','M0 0C-9-25-20-66-15-144','M0 0C37-13 64-42 70-80'])g.append(node('path',{d,fill:'none',stroke:s.leafColor,'stroke-width':1.6,opacity:.8}));
  for(const [lx,ly,a,z]of [[-48,-90,-45,.8],[-47,-70,110,.8],[-33,-48,-40,.85],[-20,-91,40,.7],[-16,-116,-25,.7],[17,-95,60,.8],[23,-69,155,.85],[12,-35,70,.8],[51,-54,45,.75],[61,-67,130,.65],[-8,-20,-35,.7]])leaf(g,lx,ly,a,z,s.leafColor);
  for(const [cx,cy]of [[-62,-112],[29,-129],[77,-86],[-32,-143]]){g.append(node('path',{d:`M${cx+8} ${cy+20} ${cx} ${cy}`,stroke:s.accentColor,'stroke-width':.8,fill:'none'}));for(let j=0;j<3;j++)g.append(node('circle',{cx:cx+(j-1)*5,cy:cy-Math.abs(j-1)*5,r:2.4,fill:s.accentColor,opacity:.8}))}
  rose(g,-12,-65,27,s.flowerColor,s.accentColor);rose(g,17,-92,19,s.flowerColor,s.accentColor);blossom(g,-39,-102,15,s.flowerColor,s.accentColor);blossom(g,43,-49,12,s.flowerColor,s.accentColor);parent.append(g)
}
let watercolorAssets;
async function getWatercolors(){
  if(!watercolorAssets)watercolorAssets=Promise.all(['top','bottom'].map(async part=>{const response=await fetch(new URL(`./assets/floral/watercolor-${part}.png`,import.meta.url));if(!response.ok)throw Error('No se pudo cargar la acuarela.');const blob=await response.blob();return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)})})).catch(error=>{watercolorAssets=null;throw error});
  return watercolorAssets;
}
export async function createFloralFrame(qr,size,s){
  const svg=node('svg',{xmlns:ns,width:size,height:size,viewBox:'0 0 1000 1000','data-floral-preview':'true'});
  if(!s.transparent)svg.append(node('rect',{width:1000,height:1000,fill:s.background}));
  const floral={flowerColor:s.flowerColor,leafColor:s.leafColor,accentColor:s.accentColor};
  const ornaments=node('g',{'aria-label':'Decoración floral'});const scale=s.floralSize/100;
  if(s.floralStyle==='watercolor'){
    const [top,bottom]=await getWatercolors();
    const width=1000*scale,left=(1000-width)/2;
    ornaments.append(node('image',{href:top,x:left,y:0,width,height:width*368/560}));
    ornaments.append(node('image',{href:bottom,x:left,y:1000-width*328/520,width,height:width*328/520}));
  }else if(s.floralStyle==='wreath'){
    ornaments.append(node('ellipse',{cx:500,cy:491,rx:434,ry:443,fill:'none',stroke:s.leafColor,'stroke-width':1.2,opacity:.6}));
    for(let i=0;i<36;i++){const angle=i*Math.PI*2/36,x=500+433*Math.cos(angle),y=491+442*Math.sin(angle);leaf(ornaments,x,y,angle*180/Math.PI+90,scale*.65,s.leafColor);if(i%3===0)leaf(ornaments,x,y,angle*180/Math.PI+210,scale*.48,s.leafColor)}
    for(const [x,y,r]of [[180,183,32],[146,226,22],[820,795,32],[856,751,22]])rose(ornaments,x,y,r*scale,s.flowerColor,s.accentColor);
    for(const [x,y]of [[212,150],[788,828]])blossom(ornaments,x,y,17*scale,s.flowerColor,s.accentColor);
  }else{
    for(const [x,y,rotation]of [[150,200,30],[850,800,210],[820,180,120],[180,820,300]]){const g=node('g',{transform:`translate(${x} ${y}) scale(${scale})`});bouquet(g,0,0,rotation,floral);ornaments.append(g)}
  }
  svg.append(ornaments);
  // Opaque backing protects the quiet zone even with a transparent outer frame.
  svg.append(node('rect',{x:180,y:180,width:640,height:640,fill:s.transparent?'#ffffff':s.background}));
  const group=node('g',{transform:`translate(180 180) scale(${640/(size*.64)})`});group.append(...Array.from(qr.children));svg.append(group);
  const topText=s.frameText||'Nuestra boda',names=s.weddingNames;
  svg.append(node('rect',{x:270,y:65,width:460,height:70,rx:25,fill:s.transparent?'#ffffff':s.background}));
  svg.append(node('text',{x:500,y:111,'text-anchor':'middle',fill:s.foreground,'font-family':'Georgia, Times New Roman, serif','font-style':'italic','font-size':topText.length>20?25:33},topText));
  if(names){svg.append(node('rect',{x:205,y:851,width:590,height:57,rx:20,fill:s.transparent?'#ffffff':s.background}));svg.append(node('text',{x:500,y:886,'text-anchor':'middle',fill:s.foreground,'font-family':'Georgia, Times New Roman, serif','font-size':names.length>27?23:29},names))}
  svg.append(node('text',{x:500,y:names?934:891,'text-anchor':'middle',fill:s.foreground,'font-family':'Arial, sans-serif','font-size':12,'letter-spacing':3},'ESCANEA Y ACOMPÁÑANOS'));
  return svg;
}
