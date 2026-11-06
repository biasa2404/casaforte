'use strict';
/* Casa Forte: personagem realista (Mixamo) para os movimentos gravados.
   Um único personagem (.glb) é carregado e cada tela usa uma cópia dele.
   As guias de técnica são calculadas a partir dos ossos do próprio personagem. */

const REAL={url:'assets/mixamo/personagem.glb',ok:false,clips:{}};
// espessura aproximada do corpo em volta de cada osso (unidades do boneco), para encostar no chão
const RAIO={hip:6,spine:7,chest:7,nk:4,headB:6,top:3,shJ0:4,shJ1:4,elbow0:2.5,elbow1:2.5,hand0:1.5,hand1:1.5,
  hipJ0:5,hipJ1:5,knee0:3,knee1:3,ankle0:3,ankle1:3,ball0:1.6,ball1:1.6,toe0:1,toe1:1};
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
    this.rest={};for(const n in this.B){const b=this.B[n];if(b.isBone) this.rest[n]={q:b.quaternion.clone(),p:b.position.clone()};}
    // escala: perna do personagem = perna do boneco
    this.root.updateMatrixWorld(true);
    const P=n=>this.B[n].getWorldPosition(new THREE.Vector3());
    this.s=(L.TH+L.SH)/(P('RightUpLeg').distanceTo(P('RightLeg'))+P('RightLeg').distanceTo(P('RightFoot')));
    this.root.scale.setScalar(this.s);
  }
  set visible(v){this.root.visible=v;}
  /* Veste a Sophie com uma pose do boneco antigo (vista lateral, juntas 2D):
     cada osso é girado para apontar na direção do segmento correspondente. */
  /* Transição suave: guarda a pose atual e, nos próximos instantes, mistura com a nova */
  snap(){
    if(!this.shown) return;const q={};for(const n in this.rest) q[n]=[this.B[n].quaternion.clone(),this.B[n].position.clone()];
    this.blend={q,root:this.root.position.clone(),t0:performance.now(),d:280};
  }
  blendStep(){
    this.shown=true;const b=this.blend;if(!b) return;
    let k=(performance.now()-b.t0)/b.d;if(k>=1){this.blend=null;return;}
    k=k*k*(3-2*k);
    for(const n in b.q){const B=this.B[n];B.quaternion.copy(b.q[n][0].clone().slerp(B.quaternion,k));B.position.copy(b.q[n][1].clone().lerp(B.position,k));}
    this.root.position.copy(b.root.clone().lerp(this.root.position,k));this.root.updateMatrixWorld(true);
  }
  poseJ(j,id){
    if(this.key!=='~pose'||this.poseId!==id){this.snap();this.mixer.stopAllAction();this.key='~pose';this.poseId=id;}
    const B=this.B,T=THREE,W=n=>B[n].getWorldPosition(new T.Vector3());
    for(const n in this.rest){B[n].quaternion.copy(this.rest[n].q);B[n].position.copy(this.rest[n].p);}
    this.root.position.set(0,0,0);this.root.updateMatrixWorld(true);
    if(this.footPitch==null){const f=W('RightToeBase').sub(W('RightFoot'));this.footPitch=Math.atan2(-f.y,Math.hypot(f.x,f.z));}
    const rot=(n,dq)=>{const b=B[n];if(!b) return;const pq=b.parent.getWorldQuaternion(new T.Quaternion()),wq=b.getWorldQuaternion(new T.Quaternion());
      b.quaternion.copy(pq.invert().multiply(dq.multiply(wq)));b.updateMatrixWorld(true);};
    const aim=(n,c,d)=>{if(!B[n]||!B[c]) return;const cur=W(c).sub(W(n)).normalize();if(d.lengthSq()<1e-6) return;rot(n,new T.Quaternion().setFromUnitVectors(cur,d.clone().normalize()));};
    const basis=(u,l)=>{u=u.clone().normalize();l=l.clone().addScaledVector(u,-l.dot(u)).normalize();return new T.Matrix4().makeBasis(new T.Vector3().crossVectors(u,l),u,l);};
    const V=(p,z=0)=>new T.Vector3(p[0],p[1],z),sub=(a,b)=>a.clone().sub(b);
    const hip=V(j.hip),sh=V(j.sh),up=sub(sh,hip).normalize();
    // quadril e tronco: o tronco do boneco é uma reta do quadril ao ombro
    const Mt=basis(up,new T.Vector3(0,0,1)),Mr=basis(sub(W('Spine2'),W('Hips')),sub(W('RightUpLeg'),W('LeftUpLeg')));
    rot('Hips',new T.Quaternion().setFromRotationMatrix(Mt.multiply(Mr.invert())));
    aim('Neck','Head',sub(V(j.head),V(j.nk)));
    const at=(f,z)=>V([j.hip[0]+up.x*f,j.hip[1]+up.y*f],z);
    const pitch=this.footPitch;
    [['Right',0,1],['Left',1,-1]].forEach(([s,i,zs])=>{
      const [el,ha]=j.arms[i],[kn,an,to]=j.legs[i];
      aim(s+'Arm',s+'ForeArm',sub(V(el,11.5*zs),at(L.T-3,10*zs)));
      aim(s+'ForeArm',s+'Hand',sub(V(ha),V(el)));
      aim(s+'UpLeg',s+'Leg',sub(V(kn),V(j.hip)));
      aim(s+'Leg',s+'Foot',sub(V(an),V(kn)));
      // o pé do boneco antigo vai do tornozelo à ponta; o da Sophie, do tornozelo à base dos dedos (mais inclinado)
      const fd=sub(V(to),V(an)).normalize(),c=Math.cos(-pitch),sn=Math.sin(-pitch);
      aim(s+'Foot',s+'ToeBase',new T.Vector3(fd.x*c-fd.y*sn,fd.x*sn+fd.y*c,0));
    });
    // posição: quadril no lugar do quadril do boneco, e o ponto mais baixo na mesma altura
    const h=W('Hips'),off=sub(hip,h);this.root.position.copy(off);this.root.updateMatrixWorld(true);
    let sMin=1e9;for(const k in RAIO){const b=B[RBONES[k]];if(b){const y=b.getWorldPosition(new T.Vector3()).y-RAIO[k];if(y<sMin) sMin=y;}}
    const rm={hip:6,sh:6,head:7.6},pts=[['hip',j.hip],['sh',j.sh],['head',j.head]];
    j.arms.forEach(([e,a])=>pts.push(['e',e],['a',a]));j.legs.forEach(([k,a,t])=>pts.push(['k',k],['an',a],['t',t]));
    const r2={e:2.75,a:2.5,k:3.75,an:0,t:0};let mMin=1e9;pts.forEach(([k,p])=>{const y=p[1]-(rm[k]??r2[k]??0);if(y<mMin) mMin=y;});
    this.root.position.y+=Math.max(0,mMin)-sMin;this.root.updateMatrixWorld(true);
    // mãos apoiadas no chão: braço da Sophie tem outro tamanho, então leva a mão até o chão (IK de dois ossos)
    [['Right',0],['Left',1]].forEach(([s2,i])=>{
      const ha=j.arms[i][1];if(ha[1]>4) return;
      const A=W(s2+'Arm'),Bp=W(s2+'ForeArm'),C=W(s2+'Hand'),a=A.distanceTo(Bp),b=Bp.distanceTo(C);
      const Tt=new T.Vector3(ha[0],RAIO.hand0+0.3,C.z),dv=sub(Tt,A),d=Math.min(dv.length(),a+b-0.01);if(d<Math.abs(a-b)+0.01) return;
      const u=dv.normalize(),pe=sub(Bp,A).addScaledVector(u,-sub(Bp,A).dot(u));if(pe.lengthSq()<1e-6) pe.set(0,0,1).cross(u);pe.normalize();
      const ca=(a*a+d*d-b*b)/(2*a*d),sa=Math.sqrt(Math.max(0,1-ca*ca)),B2=A.clone().addScaledVector(u,a*ca).addScaledVector(pe,a*sa);
      aim(s2+'Arm',s2+'ForeArm',sub(B2,A));aim(s2+'ForeArm',s2+'Hand',sub(A.clone().addScaledVector(u,d),B2));
    });
  }
  use(key,clip){
    if(this.key===key) return this.fits[key];
    this.snap();this.key=key;this.mixer.stopAllAction();this.action=this.mixer.clipAction(clip);this.action.play();
    this.dur=clip.duration;
    if(!this.fits[key]){ // posição: quadril no centro do tapete e pés no chão
      this.root.position.set(0,0,0);
      let minY=1e9,h0=null;const bb={x0:1e9,x1:-1e9,y1:-1e9},N=24,all=[];
      for(let i=0;i<N;i++){const J=this.joints(this.dur*i/N);if(!h0) h0=J.hip;all.push(J);
        // ponto mais baixo do corpo: osso menos a espessura aproximada do corpo em volta dele
        for(const k in RAIO) if(J[k]) minY=Math.min(minY,J[k][1]-RAIO[k]);}
      const off=[-h0[0],-minY,-h0[2]];
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
