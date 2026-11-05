'use strict';
/* Casa Forte: movimentos gravados com captura de movimento (Mixamo).
   Cada movimento vira um .json com a posição 3D das juntas quadro a quadro
   (gerado por tools/converter-mixamo.mjs). O app veste o mesmo boneco com
   esses dados, então o visual e as guias de técnica continuam iguais. */

const MOCAP={
  squat:'assets/mixamo/squat.json',
  hiphop:'assets/mixamo/hiphop.json',
};
// velocidade de reprodução (1 = velocidade real); um pouco mais lento ajuda a aprender
const MOCAP_RATE={squat:0.8};
// enquanto o arquivo carrega (ou sem internet), mostra um movimento parecido
if(typeof AN!=='undefined'&&!AN.hiphop) AN.hiphop=AN.danceMarch;
const _mc={};

function mocapFor(key){
  const url=MOCAP[key];if(!url) return null;
  let r=_mc[url];
  if(!r){
    r=_mc[url]={ok:false};
    fetch(url).then(x=>{if(!x.ok) throw new Error(x.status);return x.json();}).then(d=>{
      Object.assign(r,d);
      const bb={x0:1e9,x1:-1e9,y1:-1e9};
      d.frames.forEach(f=>{for(let i=0;i<f.length;i+=3){bb.x0=Math.min(bb.x0,f[i]);bb.x1=Math.max(bb.x1,f[i]);bb.y1=Math.max(bb.y1,f[i+1]);}});
      bb.x0-=8;bb.x1+=8;bb.y1+=4;r.bb=bb;r.ok=true;
    }).catch(e=>{r.err=e;console.warn('mocap',url,e);});
  }
  return r.ok?r:null;
}

/* Posições 3D das juntas no tempo t (segundos), em laço. 0 = lado direito, mais perto da câmera */
function mocapJoints(r,t){
  const n=r.frames.length,x=((t*r.fps)%n+n)%n,i=Math.floor(x),k=x-i,A=r.frames[i],B=r.frames[(i+1)%n],J={};
  r.keys.forEach((name,q)=>{const o=q*3;J[name]=[A[o]+(B[o]-A[o])*k,A[o+1]+(B[o+1]-A[o+1])*k,A[o+2]+(B[o+2]-A[o+2])*k];});
  return J;
}
