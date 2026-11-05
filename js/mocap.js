'use strict';
/* Casa Forte: movimentos gravados com captura de movimento (Mixamo).
   Cada movimento vira um .json com a posição 3D das juntas quadro a quadro
   (gerado por tools/converter-mixamo.mjs). O app veste o mesmo boneco com
   esses dados, então o visual e as guias de técnica continuam iguais. */

const MOCAP={
  squat:'assets/mixamo/squat.json',
  pushFull:'assets/mixamo/pushFull.json',
  highPlank:'assets/mixamo/highPlank.json',
  bicycle:'assets/mixamo/bicycle.json',
  burpee:'assets/mixamo/burpee.json',
  jabcross:'assets/mixamo/jabcross.json',
  shadowbox:'assets/mixamo/shadowbox.json',
  elbow:'assets/mixamo/elbow.json',
  knee:'assets/mixamo/knee.json',
  kickMid:'assets/mixamo/kickMid.json',
  mtBounce:'assets/mixamo/mtBounce.json',
  jog:'assets/mixamo/jog.json',
  jacks:'assets/mixamo/jacks.json',
  armStretch:'assets/mixamo/armStretch.json',
  kickLow:'assets/mixamo/kickLow.json',
  kickHigh:'assets/mixamo/kickHigh.json',
  hookLead:'assets/mixamo/hookLead.json',
  upperRear:'assets/mixamo/upperRear.json',
  hookRear:'assets/mixamo/hookRear.json',
  boxWarm:'assets/mixamo/boxWarm.json',
  pikeWalk:'assets/mixamo/pikeWalk.json',
  teep:'assets/mixamo/teep.json',
  dodge:'assets/mixamo/dodge.json',
  bodyJab:'assets/mixamo/bodyJab.json',
  ropeJump:'assets/mixamo/ropeJump.json',
  neckStretch:'assets/mixamo/neckStretch.json',
  stepTouch:'assets/mixamo/stepTouch.json',
  shuffle:'assets/mixamo/shuffle.json',
  twist:'assets/mixamo/twist.json',
  rumba:'assets/mixamo/rumba.json',
  armsUp:'assets/mixamo/armsUp.json',
  cabbage:'assets/mixamo/cabbage.json',
  bootyStep:'assets/mixamo/bootyStep.json',
  samba:'assets/mixamo/samba.json',
  salsa:'assets/mixamo/salsa.json',
  rainbow:'assets/mixamo/rainbow.json',
  jazzSquare:'assets/mixamo/jazzSquare.json',
  runningMan:'assets/mixamo/runningMan.json',
  rockette:'assets/mixamo/rockette.json',
  armPush:'assets/mixamo/armPush.json',
  armCircle:'assets/mixamo/armCircle.json',
  maraschino:'assets/mixamo/maraschino.json',
};
// velocidade de reprodução (1 = velocidade real); um pouco mais lento ajuda a aprender
const MOCAP_RATE={squat:0.8,bicycle:0.55,neckStretch:0.45};
// enquanto o arquivo carrega (ou sem internet), mostra um movimento parecido
if(typeof AN!=='undefined'){
  const alias={hiphop:'danceMarch',salsa:'danceMarch',samba:'danceMarch',belly:'danceMarch',situp:'crunch',bicycle:'crunch',
    snapKick:'teep',jog:'highknees',jacks:'danceMarch',armStretch:'circles',breathIdle:'breath',
    hookLead:'jabcross',hookRear:'jabcross',upperRear:'jabcross',boxWarm:'circles',pikeWalk:'dog',dodge:'squat',bodyJab:'jabcross',ropeJump:'highknees',neckStretch:'breath',stepTouch:'danceMarch',shuffle:'danceMarch',twist:'danceMarch',rumba:'danceMarch',armsUp:'danceMarch',cabbage:'danceMarch',bootyStep:'danceMarch',rainbow:'danceMarch',jazzSquare:'danceMarch',runningMan:'danceMarch',rockette:'danceMarch',armPush:'danceMarch',armCircle:'danceMarch',maraschino:'danceMarch'};
  for(const k in alias) if(!AN[k]) AN[k]=AN[alias[k]];
}
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
