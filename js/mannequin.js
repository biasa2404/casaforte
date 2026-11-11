'use strict';
/* Casa Forte: boneco 3D articulado (three.js) e guias de técnica.
   Usa a cinemática de engine.js: cada pose 2D (vista lateral) vira um corpo 3D
   com volume, roupa, sombra e câmera que pode ser girada com o dedo ou o mouse. */

const HAS3D=(()=>{try{if(!window.THREE) return false;const c=document.createElement('canvas');return !!(c.getContext('webgl')||c.getContext('experimental-webgl'));}catch(e){return false;}})();

const LOOK={skin:0xC68A62,top:null,legs:0x263540,shoe:0xF3F1EC,sole:null,hair:0x2A1D16,band:null};

function jointMap(j){
  return {hip:j.hip,sh:j.sh,nk:j.nk,head:j.head,
    elbow0:j.arms[0][0],hand0:j.arms[0][1],elbow1:j.arms[1][0],hand1:j.arms[1][1],
    knee0:j.legs[0][0],ankle0:j.legs[0][1],toe0:j.legs[0][2],knee1:j.legs[1][0],ankle1:j.legs[1][1],toe1:j.legs[1][2]};
}
const zOf=name=>/0$/.test(name)?(/elbow|hand/.test(name)?11:5.5):(/1$/.test(name)?(/elbow|hand/.test(name)?-11:-5.5):0);
const vsub=(a,b)=>a.map((x,i)=>x-b[i]),vdot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),vlen=a=>Math.hypot(...a);
function angAt(a,b,c){ // funciona em 2D e 3D
  const v1=vsub(a,b),v2=vsub(c,b),d=vdot(v1,v2)/((vlen(v1)*vlen(v2))||1);
  return Math.acos(Math.max(-1,Math.min(1,d)))/RAD;
}
function devFromLine(a,b,c){ // distância de b até a reta a-c
  const u=vsub(c,a),w=vsub(b,a),k=vdot(w,u)/(vdot(u,u)||1);
  return vlen(w.map((x,i)=>x-u[i]*k));
}

/* Guias de técnica por movimento */
const GUIDES={
  squat:[{t:'ang',j:['hip','knee0','ankle0'],goal:80,tol:22,label:'Joelho'},{t:'plumb',j:'toe0',label:'Ponta do pé'}],
  squatPause:[{t:'ang',j:['hip','knee0','ankle0'],goal:90,tol:15,label:'Joelho'},{t:'plumb',j:'toe0',label:'Ponta do pé'}],
  squatJump:[{t:'ang',j:['hip','knee0','ankle0'],goal:90,tol:15,label:'Joelho'}],
  squatLight:[{t:'ang',j:['hip','knee0','ankle0'],goal:120,tol:15,label:'Joelho'}],
  lunge:[{t:'ang',j:['hip','knee0','ankle0'],goal:90,tol:14,label:'Joelho da frente'},{t:'ang',j:['hip','knee1','ankle1'],goal:90,tol:18,label:'Joelho de trás'}],
  bulgarian:[{t:'ang',j:['hip','knee0','ankle0'],goal:90,tol:14,label:'Joelho da frente'},{t:'plumb',j:'toe0',label:'Ponta do pé'}],
  lungeJump:[{t:'ang',j:['hip','knee0','ankle0'],goal:90,tol:16,label:'Joelho'}],
  bridge:[{t:'line',j:['sh','hip','knee0'],tol:4,label:'Ombro, quadril e joelho em linha'},{t:'ang',j:['hip','knee0','ankle0'],goal:90,tol:15,label:'Joelho'}],
  bridge1:[{t:'line',j:['sh','hip','knee0'],tol:4,label:'Ombro, quadril e joelho em linha'}],
  bridge1Pause:[{t:'line',j:['sh','hip','knee0'],tol:4,label:'Ombro, quadril e joelho em linha'}],
  bridgeHold:[{t:'line',j:['sh','hip','knee0'],tol:4,label:'Ombro, quadril e joelho em linha'}],
  pushKnee:[{t:'line',j:['sh','hip','knee0'],tol:3,label:'Corpo reto'},{t:'ang',j:['sh','elbow0','hand0'],goal:90,tol:15,label:'Cotovelo'}],
  pushFull:[{t:'line',j:['sh','hip','ankle0'],tol:5,label:'Corpo reto'},{t:'ang',j:['sh','elbow0','hand0'],goal:70,tol:25,label:'Cotovelo'}],
  pushDecl:[{t:'line',j:['sh','hip','ankle0'],tol:3,label:'Corpo reto'},{t:'ang',j:['sh','elbow0','hand0'],goal:90,tol:15,label:'Cotovelo'}],
  highPlank:[{t:'line',j:['sh','hip','ankle0'],tol:5,label:'Corpo reto'},{t:'plumb',j:'hand0',label:'Mão abaixo do ombro'}],
  plank:[{t:'line',j:['sh','hip','ankle0'],tol:3,label:'Corpo reto'},{t:'ang',j:['sh','elbow0','hand0'],goal:90,tol:12,label:'Cotovelo'}],
  dip1:[{t:'ang',j:['sh','elbow0','hand0'],goal:90,tol:15,label:'Cotovelo'}],
  dip2:[{t:'ang',j:['sh','elbow0','hand0'],goal:90,tol:15,label:'Cotovelo'}],
  dip3:[{t:'ang',j:['sh','elbow0','hand0'],goal:90,tol:15,label:'Cotovelo'}],
  pike:[{t:'ang',j:['sh','hip','ankle0'],goal:80,tol:20,label:'Quadril alto'}],
  pikeElev:[{t:'ang',j:['sh','hip','knee0'],goal:90,tol:20,label:'Quadril'}],
  goodmorning:[{t:'ang',j:['sh','hip','knee0'],goal:100,tol:15,label:'Quadril'}],
  goodmorningSlow:[{t:'ang',j:['sh','hip','knee0'],goal:100,tol:15,label:'Quadril'}],
  birddog:[{t:'line',j:['hand0','sh','hip'],tol:6,label:'Braço na linha das costas'},{t:'plumb',j:'knee0',label:'Joelho abaixo do quadril'}],
  birddogSlow:[{t:'line',j:['hand0','sh','hip'],tol:6,label:'Braço na linha das costas'},{t:'plumb',j:'knee0',label:'Joelho abaixo do quadril'}],
  climber:[{t:'line',j:['sh','hip','ankle1'],tol:5,label:'Quadril baixo'}],
  climberSlow:[{t:'line',j:['sh','hip','ankle1'],tol:5,label:'Quadril baixo'}],
  warrior:[{t:'ang',j:['hip','knee0','ankle0'],goal:95,tol:15,label:'Joelho da frente'},{t:'plumb',j:'ankle0',label:'Joelho sobre o tornozelo'}],
  chair:[{t:'ang',j:['hip','knee0','ankle0'],goal:110,tol:15,label:'Joelho'}],
  dog:[{t:'line',j:['hand0','sh','hip'],tol:5,label:'Braços e costas em linha'}],
  tree:[{t:'plumb',j:'ankle0',label:'Peso no pé de apoio'}],
  knee:[{t:'ang',j:['hip','knee1','ankle1'],goal:60,tol:20,label:'Joelho de trás'}],
  teep:[{t:'line',j:['hip','knee0','ankle0'],tol:5,label:'Perna estendida no chute'}],
};

/* Movimentos de luta em que as mãos voltam para a guarda alta (altura da testa) */
const GUARDA_ALTA=new Set(['mtBounce','jabcross','hookLead','hookRear','upperRear','elbow','teep','kickLow','kickMid','kickHigh','dodge','bodyJab','shadowbox','knee','combo','boxWarm']);

class Stage{
  constructor(canvas,overlay,opt={}){
    this.c=canvas;this.ov=overlay;this.opt=opt;this.yaw=opt.yaw??0.5;this.pitch=0.16;this.guides=opt.guides??true;
    const r=this.r=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:!!opt.capture});
    r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
    r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
    r.outputEncoding=THREE.sRGBEncoding;
    const s=this.scene=new THREE.Scene();
    this.cam=new THREE.PerspectiveCamera(30,1,1,3000);
    s.add(new THREE.HemisphereLight(0xffffff,0x7f9a8e,0.8));
    const key=new THREE.DirectionalLight(0xffffff,0.85);key.position.set(70,170,140);key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);const sc=key.shadow.camera;sc.left=-140;sc.right=140;sc.top=140;sc.bottom=-60;sc.near=10;sc.far=600;key.shadow.radius=4;
    s.add(key);s.add(key.target);this.key=key;
    const rim=new THREE.DirectionalLight(0xfff1e0,0.35);rim.position.set(-120,90,-80);s.add(rim);
    // chão e tapete
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.ShadowMaterial({opacity:0.16}));
    floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;s.add(floor);
    this.matMat=new THREE.MeshStandardMaterial({color:0xcfe3da,roughness:0.95});
    this.mat=new THREE.Mesh(new THREE.BoxGeometry(1,1.2,48),this.matMat);this.mat.position.y=-0.6;this.mat.receiveShadow=true;s.add(this.mat);
    this.props=new THREE.Group();s.add(this.props);
    this.buildBody();
    this.applyColors();
    if(opt.interactive!==false) this.bindDrag();
    this.an=null;
  }
  m(c,rough=0.62){return new THREE.MeshStandardMaterial({color:c,roughness:rough,metalness:0.02});}
  buildBody(){
    const s=this.scene;this.parts={};
    const skin=this.mSkin=this.m(LOOK.skin,0.55),top=this.mTop=this.m(0x0b7a5e,0.7),legs=this.mLegs=this.m(LOOK.legs,0.75),
      shoe=this.mShoe=this.m(LOOK.shoe,0.5),sole=this.mSole=this.m(0x0b7a5e,0.6),hair=this.m(LOOK.hair,0.8);
    this.mBand=this.m(0xc2410c,0.6);
    const add=(name,geo,mat)=>{const me=new THREE.Mesh(geo,mat);me.castShadow=true;me.receiveShadow=true;s.add(me);this.parts[name]=me;return me;};
    const cyl=(r1,r2)=>new THREE.CylinderGeometry(r2,r1,1,22,1);
    const sph=new THREE.SphereGeometry(1,28,20);
    for(const i of [0,1]){
      add('ua'+i,cyl(3.3,2.7),skin);add('fa'+i,cyl(2.6,2.0),skin);
      add('shJ'+i,sph,skin);add('elJ'+i,sph,skin);add('hand'+i,sph,skin);
      add('th'+i,cyl(5.6,3.7),legs);add('sh'+i,cyl(3.6,2.4),legs);
      add('hipJ'+i,sph,legs);add('knJ'+i,sph,legs);add('anJ'+i,sph,skin);
      add('foot'+i,sph,shoe);add('sole'+i,sph,sole);
    }
    add('pelvis',sph,legs);add('waist',cyl(1,1),top);add('chest',sph,top);
    add('neck',cyl(2.7,2.5),skin);add('head',sph,skin);add('hair',sph,hair);add('bun',sph,hair);add('band',new THREE.TorusGeometry(6.9,1.0,10,40),this.mBand);
  }
  applyColors(){
    const cs=getComputedStyle(document.documentElement);
    const acc=cs.getPropertyValue('--accent').trim()||'#0B7A5E',mat=cs.getPropertyValue('--mat').trim()||'#DCE6E0',warm=cs.getPropertyValue('--warm').trim()||'#C2410C';
    try{this.mTop.color.set(acc);this.mSole.color.set(acc);this.matMat.color.set(mat);this.mBand.color.set(warm);}catch(e){}
  }
  bindDrag(){
    let down=null;
    const el=this.ov||this.c;
    el.style.touchAction='pan-y';
    el.addEventListener('pointerdown',e=>{this.yawTarget=null;down={x:e.clientX,y:e.clientY,yaw:this.yaw,pitch:this.pitch};el.setPointerCapture?.(e.pointerId);});
    el.addEventListener('pointermove',e=>{if(!down) return;this.yaw=Math.max(-1.45,Math.min(1.45,down.yaw-(e.clientX-down.x)*0.008));this.pitch=Math.max(-0.05,Math.min(0.7,down.pitch+(e.clientY-down.y)*0.004));});
    const up=()=>{down=null;};el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    el.addEventListener('dblclick',()=>{this.yaw=this.opt.yaw??0.5;this.pitch=0.16;});
  }
  setSeq(seq,an){ // sequência de movimentos gravados (combinação de golpes ou coreografia)
    this.seq=null;this.setAnim(an,seq[0].k);this.seq=seq;this.seqTot=seq.reduce((a,x)=>a+x.ms,0);
    seq.forEach(x=>{mocapFor(x.k);try{realLoad();realClip(x.k);}catch(e){}});
  }
  seqAt(ms){ // qual movimento e em que ponto dele, no instante ms
    let m=((ms%this.seqTot)+this.seqTot)%this.seqTot,i=0;
    while(i<this.seq.length-1&&m>=this.seq[i].ms){m-=this.seq[i].ms;i++;}
    const x=this.seq[i],d=m/1000*(x.rate??1);return {i,k:x.k,t:(x.t0||0)+(x.len?d%x.len:d),seg:x,local:m};
  }
  setAnim(an,key){
    this.seq=null;
    if(this.an===an&&this.key2===key) return; this.an=an;this.key2=key;this.mcOn=false;this.tSet=performance.now();
    if(key) mocapFor(key); // começa a carregar o movimento gravado, se houver
    const b=bbox(an);this.bb=b;this.fitMat(b);
    this.mat.scale.x=Math.max(70,b.x1-b.x0+40);this.mat.position.x=(b.x0+b.x1)/2;
    // objetos (cadeira)
    while(this.props.children.length) this.props.remove(this.props.children[0]);
    an.props.forEach(p=>{
      if(p.type!=='chair') return;
      const wood=this.m(0x9a6b45,0.7),g=new THREE.Group();
      const box=(w,h,d,x,y,z)=>{const me=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wood);me.position.set(x,y,z);me.castShadow=true;me.receiveShadow=true;g.add(me);};
      box(28,2.4,30,0,26.8,0);
      [-12,12].forEach(x=>[-13,13].forEach(z=>box(2.2,26,2.2,x,13,z)));
      const bx=p.back<0?-13:13; box(2.2,36,30,bx,44,0);
      g.position.x=p.x;this.props.add(g);
    });
  }
  showBody(v){if(this._body===v) return;this._body=v;for(const k in this.parts) this.parts[k].visible=v;}
  fitMat(b){this.mat.scale.x=Math.max(70,b.x1-b.x0+40);this.mat.position.x=(b.x0+b.x1)/2;}
  resize(){
    const w=this.c.clientWidth,h=this.c.clientHeight;if(!w||!h) return false;
    if(this._w!==w||this._h!==h){this._w=w;this._h=h;this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.updateProjectionMatrix();
      if(this.ov){const d=Math.min(2,window.devicePixelRatio||1);this.ov.width=w*d;this.ov.height=h*d;}}
    return true;
  }
  place(name,a,b){ // cilindro entre a e b
    const me=this.parts[name],A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),len=d.length()||0.001;
    me.position.copy(A).addScaledVector(d,0.5);me.scale.set(1,len,1);
    me.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
  }
  ball(name,p,r,sx,sy,sz){const me=this.parts[name];me.position.set(...p);me.scale.set(sx??r,sy??r,sz??r);}
  pose(j){
    const z=(p,zz)=>[p[0],p[1],zz];
    const td=[j.sh[0]-j.hip[0],j.sh[1]-j.hip[1]],tl=Math.hypot(...td),tu=[td[0]/tl,td[1]/tl];
    const at=(f,zz=0)=>[j.hip[0]+tu[0]*f,j.hip[1]+tu[1]*f,zz];
    const rotZ=Math.atan2(-tu[0],tu[1]);
    // tronco
    const pel=this.parts.pelvis;pel.position.set(...at(3));pel.scale.set(6.6,7.2,9.6);pel.rotation.set(0,0,rotZ);
    this.place('waist',at(4),at(18));this.parts.waist.scale.set(6.2,this.parts.waist.scale.y,8.4);
    const ch=this.parts.chest;ch.position.set(...at(23.5));ch.scale.set(7,11.5,10.6);ch.rotation.set(0,0,rotZ);
    this.place('neck',at(30),z(j.nk,0));
    const hd=j.head,hu=[hd[0]-j.nk[0],hd[1]-j.nk[1]],hl=Math.hypot(...hu)||1,hn=[hu[0]/hl,hu[1]/hl],face=[hn[1],-hn[0]];
    this.ball('head',[hd[0],hd[1],0],7.6,7.4,8.2,7.2);
    this.parts.head.rotation.set(0,0,Math.atan2(-hn[0],hn[1]));
    const hair=this.parts.hair;hair.position.set(hd[0]-face[0]*1.6+hn[0]*0.9,hd[1]-face[1]*1.6+hn[1]*0.9,0);hair.scale.set(7.4,7.6,7.6);hair.rotation.copy(this.parts.head.rotation);
    this.ball('bun',[hd[0]-face[0]*8.2+hn[0]*3,hd[1]-face[1]*8.2+hn[1]*3,0],3.4);
    const band=this.parts.band;band.position.set(hd[0]+hn[0]*3.6-face[0]*0.4,hd[1]+hn[1]*3.6-face[1]*0.4,0);band.rotation.set(0,0,0);
    band.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),new THREE.Vector3(hn[0],hn[1],0));
    band.scale.set(1,0.98,1);
    // braços e pernas
    for(const i of [0,1]){
      const sz=i?-10:10,az=i?-11.5:11.5,lz=i?-5.6:5.6;
      const shp=at(L.T-3,sz),[el,ha]=j.arms[i],[kn,an,to]=j.legs[i];
      this.ball('shJ'+i,shp,3.7);
      this.place('ua'+i,shp,z(el,az));this.ball('elJ'+i,z(el,az),2.75);
      this.place('fa'+i,z(el,az),z(ha,az));
      this.ball('hand'+i,z(ha,az),2.5,2.4,2.9,2.1);
      const hp=at(1,lz);
      this.ball('hipJ'+i,hp,5.4);
      this.place('th'+i,hp,z(kn,lz));this.ball('knJ'+i,z(kn,lz),3.75);
      this.place('sh'+i,z(kn,lz),z(an,lz));this.ball('anJ'+i,z(an,lz),2.4);
      // tênis: elipsoide do tornozelo até a ponta
      const fd=[to[0]-an[0],to[1]-an[1]],fl=Math.hypot(...fd)||1,fu=[fd[0]/fl,fd[1]/fl];
      const fc=[an[0]+fu[0]*3.6,an[1]+fu[1]*3.6-0.6,lz];
      const ft=this.parts['foot'+i];ft.position.set(...fc);ft.scale.set(3.0,6.6,3.3);ft.rotation.set(0,0,Math.atan2(-fu[0],fu[1]));
      const so=this.parts['sole'+i];const nrm=[fu[1],-fu[0]];
      so.position.set(fc[0]+nrm[0]*1.9*Math.sign(-nrm[1]||1)*0,fc[1]-1.9,lz);so.scale.set(2.8,6.4,3.1);so.rotation.copy(ft.rotation);
      so.position.set(fc[0]-nrm[0]*1.6,fc[1]-nrm[1]*1.6,lz);
    }
  }
  /* veste o boneco a partir das juntas 3D do movimento gravado */
  pose3(J){
    const V=a=>new THREE.Vector3(...a),M=new THREE.Matrix4();
    const orient=(me,up,lat)=>{ // eixo y = para cima, z = lateral (lado direito), x = frente
      const u=up.clone().normalize(),l=lat.clone().addScaledVector(u,-lat.dot(u)).normalize(),f=new THREE.Vector3().crossVectors(u,l);
      M.makeBasis(f,u,l);me.quaternion.setFromRotationMatrix(M);return f;};
    const hip=V(J.hip),nk=V(J.nk),hR=V(J.hipJ0),hL=V(J.hipJ1),sR=V(J.shJ0),sL=V(J.shJ1);
    const tu=nk.clone().sub(hip).normalize(),latH=hR.clone().sub(hL),latS=sR.clone().sub(sL);
    const pel=this.parts.pelvis;pel.position.copy(hip).addScaledVector(tu,2);pel.scale.set(6.6,7.2,9.6);orient(pel,tu,latH);
    const chC=V(J.chest).lerp(nk,0.25),cu=nk.clone().sub(V(J.spine)).normalize();
    const ch=this.parts.chest;ch.position.copy(chC).addScaledVector(cu,-2);ch.scale.set(7,11.5,10.6);orient(ch,cu,latS);
    this.place('waist',pel.position.toArray(),ch.position.toArray());this.parts.waist.scale.set(6.2,this.parts.waist.scale.y,8.4);orient(this.parts.waist,ch.position.clone().sub(pel.position),latH.clone().add(latS));
    const hb=V(J.headB),ht=V(J.top),hn=ht.clone().sub(hb).normalize(),hc=hb.clone().lerp(ht,0.48);
    this.place('neck',nk.toArray(),hb.toArray());
    const hd=this.parts.head;hd.position.copy(hc);hd.scale.set(7.4,8.2,7.2);const face=orient(hd,hn,latS);
    const hair=this.parts.hair;hair.position.copy(hc).addScaledVector(face,-1.6).addScaledVector(hn,0.9);hair.scale.set(7.4,7.6,7.6);hair.quaternion.copy(hd.quaternion);
    const bun=this.parts.bun;bun.position.copy(hc).addScaledVector(face,-8.2).addScaledVector(hn,3);bun.scale.setScalar(3.4);
    const band=this.parts.band;band.position.copy(hc).addScaledVector(hn,3.6).addScaledVector(face,-0.4);band.scale.set(1,0.98,1);
    band.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),hn);
    const upW=new THREE.Vector3(0,1,0);
    for(const i of [0,1]){
      const sh=J['shJ'+i],el=J['elbow'+i],ha=J['hand'+i];
      this.ball('shJ'+i,sh,3.7);this.place('ua'+i,sh,el);this.ball('elJ'+i,el,2.75);this.place('fa'+i,el,ha);
      const hdir=V(ha).sub(V(el)).normalize(),hand=this.parts['hand'+i];
      hand.position.copy(V(ha)).addScaledVector(hdir,2.2);hand.scale.set(2.4,2.9,2.1);hand.quaternion.setFromUnitVectors(upW,hdir);
      const hp=J['hipJ'+i],kn=J['knee'+i],an=J['ankle'+i],to=J['toe'+i];
      this.ball('hipJ'+i,hp,5.4);this.place('th'+i,hp,kn);this.ball('knJ'+i,kn,3.75);
      this.place('sh'+i,kn,an);this.ball('anJ'+i,an,2.4);
      const A=V(an),fd=V(to).sub(A),fl=fd.length()||1;fd.normalize();
      const nrm=upW.clone().addScaledVector(fd,-upW.dot(fd)).normalize();
      const fc=A.clone().addScaledVector(fd,fl*0.4).addScaledVector(nrm,-1.2);
      const ft=this.parts['foot'+i];ft.position.copy(fc);ft.scale.set(3.0,Math.max(6.2,fl*0.62),3.3);ft.quaternion.setFromUnitVectors(upW,fd);
      const so=this.parts['sole'+i];so.position.copy(fc).addScaledVector(nrm,-1.6);so.scale.set(2.8,ft.scale.y*0.97,3.1);so.quaternion.copy(ft.quaternion);
    }
  }
  frame(ms){
    if(!this.an||!this.resize()) return;
    const sq=this.seq?this.seqAt(ms):null;this.seqNow=sq;
    const k2=sq?sq.k:(this.key2&&MOCAP[this.key2]?this.key2:null);
    const clip=k2&&this.real!==false?(realLoad(),realClip(k2)):null;
    if(clip&&REAL.ok&&!this.char){try{this.char=new RealChar(this.scene);}catch(e){console.warn(e);this.real=false;}}
    // enquanto o movimento gravado carrega, a Sophie faz a versão montada do mesmo movimento
    const rc=k2&&REAL.clips[k2],falhou=REAL.err||(rc&&rc.err)||this.real===false;
    const mc=k2&&falhou?mocapFor(k2):null;
    const montado=k2&&!(clip&&this.char)&&!falhou&&this.char&&AN[k2]?k2:null;
    if(k2&&!montado&&!falhou&&!(clip&&this.char)&&performance.now()-(this.tSet||0)<30000){
      if(this.char) this.char.visible=false;this.showBody(false);this.j=null;
      this.r.setClearColor(0x000000,0);this.r.clear();
      if(this.ov){const ctx=this.ov.getContext('2d'),d=this.ov.width/this._w;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,this._w,this._h);
        ctx.font='600 15px "Atkinson Hyperlegible",system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--muted').trim()||'#667';
        ctx.fillText('Carregando o movimento…',this._w/2,this._h/2);ctx.textAlign='start';}
      return;
    }
    if(this.char) this.char.colorir(!!(this.cores||window.CORES));
    let j;
    if(clip&&this.char){
      const fit=this.char.use(k2,clip);
      if(this.mcOn!=='real'){this.mcOn='real';this.bb={...fit.bb};this.fitMat(this.bb);}
      else if(sq){const b=this.bb,f=fit.bb;if(f.x0<b.x0||f.x1>b.x1||f.y1>b.y1){this.bb={x0:Math.min(b.x0,f.x0),x1:Math.max(b.x1,f.x1),y1:Math.max(b.y1,f.y1)};this.fitMat(this.bb);}}
      this.char.visible=true;this.showBody(false);
      j={J3:this.char.joints(sq?sq.t:this.clipSec(ms,this.char.dur,k2))};this.char.blendStep();
      if(GUARDA_ALTA.has(k2)) this.char.guardaAlta(k2==='mtBounce');
    } else if(mc&&!montado){
      if(this.char) this.char.visible=false;this.showBody(true);
      if(!this.mcOn){this.mcOn=true;this.bb=mc.bb;this.fitMat(mc.bb);}
      const J=mocapJoints(mc,sq?sq.t%(mc.frames.length/mc.fps):this.clipSec(ms,mc.frames.length/mc.fps,k2));J.sh=J.shJ0.map((x,i)=>(x+J.shJ1[i])/2);j={J3:J};this.pose3(J);
    } else {
      j=solve(poseAt(montado?AN[montado]:this.an,ms));
      // poses montadas: a Sophie também faz, girando os ossos dela para cada pose
      if(this.real!==false&&HAS3D){try{realLoad();}catch(e){}
        if(REAL.ok&&!this.char){try{this.char=new RealChar(this.scene);}catch(e){console.warn(e);this.real=false;}}}
      if(this.char&&this.real!==false){
        try{this.char.poseJ(j,this.key2||this.an);this.char.blendStep();if(GUARDA_ALTA.has(sq?sq.k:this.key2)){this.char.punho('Right');this.char.punho('Left');}this.char.visible=true;this.showBody(false);
          if(this.mcOn!=='pose'){this.mcOn='pose';const b=bbox(this.an);this.bb={x0:b.x0-6,x1:b.x1+6,y1:b.y1+10};this.fitMat(this.bb);}}
        catch(e){console.warn(e);this.char.visible=false;this.showBody(true);this.pose(j);} // só neste quadro; tenta de novo no próximo
      } else if(this.real!==false&&!REAL.err&&!REAL.ok&&performance.now()-(this.tSet||0)<10000){
        this.showBody(false);this.r.setClearColor(0x000000,0);this.r.clear();this.j=null;
        if(this.ov){const ctx=this.ov.getContext('2d'),d=this.ov.width/this._w;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,this._w,this._h);}
        return;
      } else {if(this.char) this.char.visible=false;this.showBody(true);this.pose(j);}
    }
    this.j=j;
    if(this.yawTarget!=null) this.yaw+=(this.yawTarget-this.yaw)*0.06;
    // câmera desliza até o novo enquadramento, sem pulo
    if(!this.bbS) this.bbS={...this.bb};
    else{const f=0.15;for(const k of ['x0','x1','y1']) this.bbS[k]+=(this.bb[k]-this.bbS[k])*f;}
    const b=this.bbS,cx=(b.x0+b.x1)/2,cy=Math.max(b.y1,40)/2+2;
    const half=Math.max((b.x1-b.x0)/2+14,(Math.max(b.y1,50))/2*(this.cam.aspect)+10);
    const vh=Math.max(b.y1/2+12,half/this.cam.aspect);
    const dist=vh/Math.tan(this.cam.fov*RAD/2)*1.04;
    this.cam.position.set(cx+Math.sin(this.yaw)*Math.cos(this.pitch)*dist,cy+Math.sin(this.pitch)*dist,Math.cos(this.yaw)*Math.cos(this.pitch)*dist);
    this.cam.lookAt(cx,cy,0);
    this.key.position.set(cx+70,170,140);this.key.target.position.set(cx,0,0);
    this.r.render(this.scene,this.cam);
    this.drawGuides(j);
  }
  drawCola(txt){ // colinha da aula, no alto da tela
    const ctx=this.ov.getContext('2d'),cs=getComputedStyle(document.documentElement);
    ctx.font='700 16px "Atkinson Hyperlegible",system-ui,sans-serif';
    const maxW=this._w-24,words=txt.split(' '),lines=[];let cur='';
    words.forEach(w=>{const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxW-28&&cur){lines.push(cur);cur=w;}else cur=t;});lines.push(cur);
    const w=Math.min(maxW,Math.max(...lines.map(l=>ctx.measureText(l).width))+28),h=lines.length*21+16,x=(this._w-w)/2,y=10;
    ctx.fillStyle=cs.getPropertyValue('--accent').trim()||'#0B7A5E';ctx.globalAlpha=.95;ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,h,12):ctx.rect(x,y,w,h);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle=cs.getPropertyValue('--accent-ink').trim()||'#fff';ctx.textAlign='center';
    lines.forEach((l,i)=>ctx.fillText(l,this._w/2,y+25+i*21));ctx.textAlign='start';
  }
  clipSec(ms,dur,k){ // tempo do movimento gravado; com ritmo do nível, se houver
    if(this.tempo&&typeof MOCAP_PTS!=='undefined'&&MOCAP_PTS[k]) return ritmoClip(ms,dur,MOCAP_PTS[k],this.tempo);
    return ms/1000*(MOCAP_RATE[k]||1);
  }
  cycleMs(){
    const k=this.key2,rate=(k&&MOCAP_RATE[k])||1;
    if(this.mcOn==='real'&&this.char) return this.char.dur*1000/rate;
    if(this.mcOn&&k){const m=mocapFor(k);if(m) return m.frames.length/m.fps*1000/rate;}
    return this.an?this.an.total:2000;
  }
  proj(p){const v=new THREE.Vector3(...p).project(this.cam);return [(v.x+1)/2*this._w,(1-v.y)/2*this._h];}
  drawGuides(j){
    const ov=this.ov;if(!ov) return;const ctx=ov.getContext('2d'),d=ov.width/this._w;
    ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,this._w,this._h);
    const list=this.guideList!=null?this.guideList:(this.guides&&!this.seq?GUIDES[this.key2]:null);
    if(this.cola) this.drawCola(this.cola);
    if(!list||!list.length) return;
    const cs=getComputedStyle(document.documentElement),ok=cs.getPropertyValue('--accent').trim(),ink=cs.getPropertyValue('--ink').trim(),srf=cs.getPropertyValue('--surface').trim();
    const J=j.J3||jointMap(j),P=j.J3?(n=>this.proj(J[n])):(n=>this.proj([J[n][0],J[n][1],zOf(n)+(n.match(/0$/)?6:0)]));
    const pill=(x,y,txt,good)=>{
      ctx.font='700 13px "Atkinson Hyperlegible",system-ui,sans-serif';const w=ctx.measureText(txt).width+16;
      x=Math.max(4,Math.min(this._w-w-4,x));y=Math.max(4,Math.min(this._h-26,y));
      ctx.fillStyle=good?ok:srf;ctx.globalAlpha=.94;ctx.beginPath();ctx.roundRect?ctx.roundRect(x,y,w,22,11):ctx.rect(x,y,w,22);ctx.fill();ctx.globalAlpha=1;
      ctx.strokeStyle=good?ok:ink;ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle=good?(cs.getPropertyValue('--accent-ink').trim()||'#fff'):ink;ctx.fillText(txt,x+8,y+15.5);
    };
    let row=0;
    list.forEach(g=>{
      ctx.save();ctx.lineCap='round';
      if(g.t==='ang'){
        const [a,b,c]=g.j,v=angAt(J[a],J[b],J[c]),good=Math.abs(v-g.goal)<=g.tol;
        const B=P(b),A=P(a),C=P(c),a1=Math.atan2(A[1]-B[1],A[0]-B[0]),a2=Math.atan2(C[1]-B[1],C[0]-B[0]);
        let da=a2-a1;while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;
        ctx.strokeStyle=good?ok:ink;ctx.globalAlpha=good?1:.55;ctx.lineWidth=3;
        ctx.beginPath();ctx.arc(B[0],B[1],22,a1,a1+da,da<0);ctx.stroke();ctx.globalAlpha=1;
        pill(B[0]+16,B[1]-34,`${g.label} ${Math.round(v)}°${good?' ✓':' · meta '+g.goal+'°'}`,good);
      } else if(g.t==='line'){
        const [a,b,c]=g.j,dv=devFromLine(J[a],J[b],J[c]),good=dv<=g.tol;
        const A=P(a),C=P(c);ctx.strokeStyle=good?ok:ink;ctx.globalAlpha=good?.95:.5;ctx.lineWidth=2.5;ctx.setLineDash([7,6]);
        ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(C[0],C[1]);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
        pill(12,12+34*row++ +28,g.label+(good?' ✓':''),good);
      } else if(g.t==='link'){
        const A=P(g.j[0]),B=P(g.j[1]),col=cs.getPropertyValue('--warm').trim()||'#C2410C';
        ctx.strokeStyle=col;ctx.lineWidth=3;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();ctx.setLineDash([]);
        ctx.fillStyle=col;[A,B].forEach(q=>{ctx.beginPath();ctx.arc(q[0],q[1],5,0,7);ctx.fill();});
        if(g.label) pill(Math.max(A[0],B[0])+14,(A[1]+B[1])/2-11,g.label,false);
      } else if(g.t==='dot'){
        const A=P(g.j),col=cs.getPropertyValue('--warm').trim()||'#C2410C',pulse=9+3*Math.sin(performance.now()/180);
        ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.arc(A[0],A[1],pulse,0,7);ctx.stroke();
        if(g.label) pill(A[0]+16,A[1]-30,g.label,false);
      } else if(g.t==='plumb'){
        const p=J[g.j],z0=j.J3?p[2]:zOf(g.j)+6,A=this.proj([p[0],0,z0]),B=this.proj([p[0],p[1]+46,z0]);
        ctx.strokeStyle=ink;ctx.globalAlpha=.45;ctx.lineWidth=2;ctx.setLineDash([3,6]);
        ctx.beginPath();ctx.moveTo(A[0],A[1]);ctx.lineTo(B[0],B[1]);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.8;
        ctx.font='600 12px "Atkinson Hyperlegible",system-ui,sans-serif';ctx.fillStyle=ink;ctx.fillText(g.label,A[0]+8,A[1]+14);
      }
      ctx.restore();
    });
  }
}

/* Miniaturas: um único renderizador gera imagens estáticas das poses */
let _thumb=null;
function thumbURL(an,ms,w=168,h=126){
  if(!HAS3D) return null;
  try{
    if(!_thumb){const c=document.createElement('canvas');c.style.cssText=`position:fixed;left:-9999px;top:0;width:${w}px;height:${h}px`;document.body.appendChild(c);_thumb=new Stage(c,null,{interactive:false,capture:true,guides:false,yaw:0.55});}
    _thumb.applyColors();_thumb.an=null;_thumb.setAnim(an,null);_thumb.frame(ms);
    return _thumb.c.toDataURL('image/png');
  }catch(e){return null;}
}
