'use strict';
/* Casa Forte: ritmo de cada repetição nos exercícios de força.
   Base: ACSM (2009) recomenda velocidade lenta a moderada para iniciantes, para
   aprender a técnica com controle. Schoenfeld e colegas (2015) mostraram ganho de
   massa parecido com repetições de 0,5 a 8 segundos; acima de 10 s parece pior.
   Por isso o ritmo fica sempre entre 3 e 5 s. No nível avançado ele fica mais lento
   e ganha pausa embaixo: sem peso, isso deixa o exercício mais difícil. O que mais
   conta para crescer é chegar perto do cansaço com boa técnica, não o ritmo em si. */

const RITMO_NIVEL=[
  {D:2,P:0,U:1,txt:'2 s descendo, 1 s subindo'},
  {D:3,P:0,U:1,txt:'3 s descendo, 1 s subindo'},
  {D:3,P:1,U:1,txt:'3 s descendo, 1 s parado embaixo, 1 s subindo'},
];
const RITMO_FALA=[
  'Siga o ritmo da personagem: dois segundos para descer e um para subir.',
  'Siga o ritmo da personagem: três segundos para descer, devagar, e um para subir.',
  'Siga o ritmo da personagem: três segundos para descer, um segundo parado embaixo e um para subir.',
];
// movimentos com fase de descida e subida (saltos, pranchas, luta, dança e yoga ficam no ritmo natural)
const RITMO_MOV=new Set(['squat','squatLight','lunge','bulgarian','bridge','bridge1','calf','goodmorning',
  'pushKnee','pushFull','pushDecl','dip1','dip2','dip3','pike','pikeElev','superman','supermanTop','crunch','legraise']);
// pontos do movimento gravado: b = embaixo, e = fim da subida (o resto é a pausa natural em pé)
const MOCAP_PTS={squat:{b:0.44,e:0.82}};
const TOPO=0.3; // segundos parado em cima

function ritmoDe(key,tier){
  if(!RITMO_MOV.has(key)) return null;
  return RITMO_NIVEL[Math.max(0,Math.min(2,tier|0))];
}
/* Versão da animação desenhada com o ritmo do nível */
const _ritmoCache={};
function ritmoAnim(an,key,tier){
  const r=ritmoDe(key,tier);if(!r||!an||an.f.length!==2) return an;
  const id=key+'|'+tier;if(_ritmoCache[id]) return _ritmoCache[id];
  // o primeiro trecho desce ou sobe? compara a altura das juntas nas duas poses
  const alt=p=>{const j=solve(p);return [j.hip,j.sh,j.head,...j.arms.flat(),...j.legs.flat()].reduce((s,q)=>s+q[1],0);};
  const [a,b]=an.f.map(x=>x.p),desce=alt(b)<alt(a);
  const S=x=>x*1000,f=[];
  if(desce){ // a = em cima, b = embaixo
    f.push({p:a,d:S(r.D)});if(r.P) f.push({p:b,d:S(r.P)});f.push({p:b,d:S(r.U)});f.push({p:a,d:S(TOPO)});
  } else { // a = embaixo, b = em cima
    f.push({p:a,d:S(r.U)});f.push({p:b,d:S(TOPO)});f.push({p:b,d:S(r.D)});if(r.P) f.push({p:a,d:S(r.P)});
  }
  // cada pose aparece uma vez antes de repetir: o trecho p->próximo usa a pose seguinte da lista
  const out={...an,f,total:f.reduce((s,x)=>s+x.d,0),bb:an.bb};
  return _ritmoCache[id]=out;
}
/* Tempo do movimento gravado (s) para o instante ms, com o ritmo do nível */
function ritmoClip(ms,dur,pts,r){
  const T=(1-pts.e)*dur,R=(r.D+r.P+r.U)*1000+T*1000;let x=((ms%R)+R)%R/1000,f;
  if(x<r.D) f=pts.b*x/r.D;
  else if((x-=r.D)<r.P) f=pts.b;
  else if((x-=r.P)<r.U) f=pts.b+(pts.e-pts.b)*x/r.U;
  else f=pts.e+(1-pts.e)*Math.min(1,(x-r.U)/T);
  return f*dur;
}
