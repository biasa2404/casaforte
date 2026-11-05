'use strict';
/* Usado só por tools/converter-mixamo.mjs: lê o .fbx do Mixamo no navegador
   e grava as posições das juntas em JSON (bem mais leve para o site). */



const BONES=['Hips','Spine','Spine1','Spine2','Neck','Head','HeadTop_End',
  'RightArm','RightForeArm','RightHand','LeftArm','LeftForeArm','LeftHand',
  'RightUpLeg','RightLeg','RightFoot','RightToeBase','RightToe_End',
  'LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','LeftToe_End'];
const NOMES=['hip','spine','chest','nk','headB','top','shJ0','elbow0','hand0','shJ1','elbow1','hand1','hipJ0','knee0','ankle0','ball0','toe0','hipJ1','knee1','ankle1','ball1','toe1'];
const OSSO={hip:'Hips',spine:'Spine1',chest:'Spine2',nk:'Neck',headB:'Head',top:'HeadTop_End',
  shJ0:'RightArm',elbow0:'RightForeArm',hand0:'RightHand',shJ1:'LeftArm',elbow1:'LeftForeArm',hand1:'LeftHand',
  hipJ0:'RightUpLeg',knee0:'RightLeg',ankle0:'RightFoot',ball0:'RightToeBase',toe0:'RightToe_End',
  hipJ1:'LeftUpLeg',knee1:'LeftLeg',ankle1:'LeftFoot',ball1:'LeftToeBase',toe1:'LeftToe_End'};
function assar(buf,fps=30){return new Promise((ok,fail)=>{const obj=new THREE.FBXLoader().parse(buf,'');try{
  const clip=obj.animations&&obj.animations[0];if(!clip) throw new Error('sem animação');
  const root=new THREE.Group();root.add(obj);root.rotation.y=Math.PI/2; // de frente para +x, lado direito para a câmera
  const B={};obj.traverse(o=>{const n=(o.name||'').replace(/^mixamorig\d*/,'');if(BONES.includes(n)&&!B[n]) B[n]=o;});
  BONES.forEach(n=>{if(!B[n]) throw new Error('osso ausente: '+n);});
  const mixer=new THREE.AnimationMixer(obj);mixer.clipAction(clip).play();
  const raw=t=>{mixer.setTime(t);root.updateMatrixWorld(true);const o={};BONES.forEach(n=>{o[n]=B[n].getWorldPosition(new THREE.Vector3());});return o;};
  const p0=raw(0),leg=p0.RightUpLeg.distanceTo(p0.RightLeg)+p0.RightLeg.distanceTo(p0.RightFoot),s=(L.TH+L.SH)/leg;
  const N=Math.max(2,Math.round(clip.duration*fps)),fr=[];let minY=1e9;
  for(let i=0;i<N;i++) fr.push(raw(clip.duration*i/N));
  fr.forEach(p=>['RightToeBase','LeftToeBase','RightToe_End','LeftToe_End'].forEach(n=>minY=Math.min(minY,p[n].y)));
  const off=[-p0.Hips.x,-minY,-p0.Hips.z],r1=x=>Math.round(x*10)/10;
  const frames=fr.map(p=>NOMES.flatMap(k=>{const v=p[OSSO[k]];return [r1((v.x+off[0])*s),r1((v.y+off[1])*s+1.6),r1((v.z+off[2])*s)];}));
  ok({fps:N/clip.duration,dur:clip.duration,keys:NOMES,frames});
}catch(e){fail(e);}});}

/* Clip do movimento em JSON (para o personagem realista), só com ossos usados e números arredondados */
function clipJSON(buf){
  const obj=new THREE.FBXLoader().parse(buf,'');const clip=obj.animations[0];
  const j=THREE.AnimationClip.toJSON(clip);
  j.tracks=j.tracks.filter(t=>/quaternion$/.test(t.name)||/Hips\.position$/.test(t.name));
  j.tracks.forEach(t=>{t.times=t.times.map(x=>Math.round(x*1000)/1000);t.values=t.values.map(x=>Math.round(x*(t.name.endsWith('position')?100:10000))/(t.name.endsWith('position')?100:10000));});
  return j;
}
/* Personagem com pele: vira .glb sem animações, materiais simples e texturas de 1024 px */
async function personagemGLB(buf){
  const ch=new THREE.FBXLoader().parse(buf,'');
  await new Promise(r=>setTimeout(r,4000)); // espera as texturas
  ch.traverse(o=>{if(!o.isMesh) return;const alpha=/Hair|Eyelash/.test(o.name);const conv=m=>{
    if(m.map&&!alpha) m.map.format=THREE.RGBFormat; if(m.normalMap) m.normalMap.format=THREE.RGBFormat;
    return new THREE.MeshStandardMaterial({name:m.name,map:m.map,normalMap:alpha?null:m.normalMap,roughness:/Sneakers|Shoe/.test(o.name)?0.6:0.85,metalness:0,transparent:alpha,alphaTest:alpha?0.4:0,side:alpha?THREE.DoubleSide:THREE.FrontSide});};
    o.material=Array.isArray(o.material)?o.material.map(conv):conv(o.material);});
  ch.animations=[];
  const glb=await new Promise(r=>new THREE.GLTFExporter().parse(ch,r,{binary:true,maxTextureSize:1024,onlyVisible:true}));
  const u8=new Uint8Array(glb);let s='';for(let i=0;i<u8.length;i+=32768) s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));
  return btoa(s);
}
