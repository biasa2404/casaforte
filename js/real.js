'use strict';
/* Casa Forte: personagem realista (Mixamo) para os movimentos gravados.
   Um único personagem (.glb) é carregado e cada tela usa uma cópia dele.
   As guias de técnica são calculadas a partir dos ossos do próprio personagem. */

const REAL={url:'assets/mixamo/personagem.glb',ok:false,clips:{}};
const RBONES={hip:'Hips',spine:'Spine1',chest:'Spine2',nk:'Neck',headB:'Head',top:'HeadTop_End',
  shJ0:'RightArm',elbow0:'RightForeArm',hand0:'RightHand',shJ1:'LeftArm',elbow1:'LeftForeArm',hand1:'LeftHand',
  hipJ0:'RightUpLeg',knee0:'RightLeg',ankle0:'RightFoot',ball0:'RightToeBase',toe0:'RightToe_End',
  hipJ1:'LeftUpLeg',knee1:'LeftLeg',ankle1:'LeftFoot',ball1:'LeftToeBase',toe1:'LeftToe_End'};

function realLoad(){
  if(REAL.started||!window.THREE||!THREE.GLTFLoader||!THREE.SkeletonUtils) return;
  REAL.started=true;
  const l=new THREE.GLTFLoader();if(window.MeshoptDecoder) l.setMeshoptDecoder(MeshoptDecoder);
  l.load(REAL.url,g=>{REAL.tpl=g.scene;REAL.ok=true;},undefined,e=>{REAL.err=e;console.warn('personagem',e);});
}
function realClip(key){
  if(!MOCAP[key]) return null;
  let c=REAL.clips[key];
  if(!c){
    c=REAL.clips[key]={ok:false};
    fetch(MOCAP[key].replace(/\.json$/,'.anim.json')).then(r=>{if(!r.ok) throw new Error(r.status);return r.json();})
      .then(j=>{c.clip=THREE.AnimationClip.parse(j);c.ok=true;}).catch(e=>{c.err=e;});
  }
  return c.ok?c.clip:null;
}

class RealChar{
  constructor(scene){
    this.root=new THREE.Group();this.root.rotation.y=Math.PI/2; // de frente para +x, lado direito para a câmera
    this.obj=THREE.SkeletonUtils.clone(REAL.tpl);this.root.add(this.obj);scene.add(this.root);
    this.obj.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}});
    this.B={};this.obj.traverse(o=>{const n=(o.name||'').replace(/^mixamorig\d*:?/,'');if(!this.B[n]) this.B[n]=o;});
    this.mixer=new THREE.AnimationMixer(this.obj);this.fits={};this.key=null;
    // escala: perna do personagem = perna do boneco
    this.root.updateMatrixWorld(true);
    const P=n=>this.B[n].getWorldPosition(new THREE.Vector3());
    this.s=(L.TH+L.SH)/(P('RightUpLeg').distanceTo(P('RightLeg'))+P('RightLeg').distanceTo(P('RightFoot')));
    this.root.scale.setScalar(this.s);
  }
  set visible(v){this.root.visible=v;}
  use(key,clip){
    if(this.key===key) return this.fits[key];
    this.key=key;this.mixer.stopAllAction();this.action=this.mixer.clipAction(clip);this.action.play();
    this.dur=clip.duration;
    if(!this.fits[key]){ // posição: quadril no centro do tapete e pés no chão
      this.root.position.set(0,0,0);
      let minY=1e9,h0=null;const bb={x0:1e9,x1:-1e9,y1:-1e9},N=24,all=[];
      for(let i=0;i<N;i++){const J=this.joints(this.dur*i/N);if(!h0) h0=J.hip;all.push(J);
        ['ball0','ball1','toe0','toe1'].forEach(k=>minY=Math.min(minY,J[k][1]));}
      const off=[-h0[0],1.6-minY,-h0[2]];
      all.forEach(J=>Object.values(J).forEach(p=>{bb.x0=Math.min(bb.x0,p[0]+off[0]);bb.x1=Math.max(bb.x1,p[0]+off[0]);bb.y1=Math.max(bb.y1,p[1]+off[1]);}));
      bb.x0-=8;bb.x1+=8;bb.y1+=6;this.fits[key]={off,bb};
    }
    this.root.position.set(...this.fits[key].off);
    return this.fits[key];
  }
  joints(t){
    this.mixer.setTime(((t%this.dur)+this.dur)%this.dur);this.root.updateMatrixWorld(true);
    const J={},v=new THREE.Vector3();
    for(const k in RBONES){const b=this.B[RBONES[k]];if(b){b.getWorldPosition(v);J[k]=[v.x,v.y,v.z];}}
    J.sh=J.shJ0.map((x,i)=>(x+J.shJ1[i])/2);
    return J;
  }
}
