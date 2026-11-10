'use strict';
/* Casa Forte: corpo, cinemática e biblioteca de movimentos */
/* ---------- Corpo e cinemática ---------- */
const L={T:34,N:6,HR:8,UA:22,FA:20,TH:30,SH:28,FT:8};
const RAD=Math.PI/180;
const dir=a=>[Math.sin(a*RAD),-Math.cos(a*RAD)];
const add=(p,a,l)=>{const d=dir(a);return [p[0]+d[0]*l,p[1]+d[1]*l]};
const ang=(p,q)=>Math.atan2(q[0]-p[0],-(q[1]-p[1]))/RAD;
function ik(P,T,l1,l2,pref){
  let dx=T[0]-P[0],dy=T[1]-P[1],d=Math.hypot(dx,dy)||0.001;
  const ux=dx/d,uy=dy/d;
  d=Math.min(d,l1+l2-0.01); d=Math.max(d,Math.abs(l1-l2)+0.01);
  const a=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))));
  const b=Math.atan2(uy,ux);
  const j1=[P[0]+l1*Math.cos(b+a),P[1]+l1*Math.sin(b+a)],j2=[P[0]+l1*Math.cos(b-a),P[1]+l1*Math.sin(b-a)];
  const mx=P[0]+ux*d/2,my=P[1]+uy*d/2;
  const s1=(j1[0]-mx)*pref[0]+(j1[1]-my)*pref[1],s2=(j2[0]-mx)*pref[0]+(j2[1]-my)*pref[1];
  return [s1>=s2?j1:j2,[P[0]+ux*d,P[1]+uy*d]];
}
const isPt=v=>Array.isArray(v)&&typeof v[0]==='number';
const pair=v=>v==null?[null,null]:(isPt(v)?[v.slice(),v.slice()]:[v[0]??null,v[1]??null]);
function norm(p){
  const t=p.sh?ang(p.hip,p.sh):p.t;
  return {hip:p.hip.slice(),t,hd:p.hd??t,hk:pair(p.hk),ar:pair(p.ar),fk:pair(p.fk),lg:pair(p.lg),
    to:typeof p.to==='number'?[p.to,p.to]:(p.to||[90,90]),ep:pair(p.ep||[-1,0.3]),kp:pair(p.kp||[1,0.15]),cv:p.cv||0,pv:p.pv||0,hp:p.hp||0,hf:p.hf||0};
}
function mix(a,b,k){
  if(a==null||b==null) return k<0.5?a:b;
  if(typeof a==='number') return a+(b-a)*k;
  if(Array.isArray(a)) return a.map((v,i)=>mix(v,b[i],k));
  const o={}; for(const key in a) o[key]=mix(a[key],b[key],k); return o;
}
function solve(p){
  const hip=p.hip,sh=add(hip,p.t,L.T),nk=add(sh,p.hd,L.N),head=add(nk,p.hd,L.HR);
  const arms=[0,1].map(i=>{
    if(p.hk[i]) return ik(sh,p.hk[i],L.UA,L.FA,p.ep[i]||[-1,0.3]);
    const a=p.ar[i]||[10,15]; const e=add(sh,a[0],L.UA); return [e,add(e,a[1],L.FA)];
  });
  const legs=[0,1].map(i=>{
    let k,an;
    if(p.fk[i]) [k,an]=ik(hip,p.fk[i],L.TH,L.SH,p.kp[i]||[1,0.15]);
    else {const a=p.lg[i]||[0,0]; k=add(hip,a[0],L.TH); an=add(k,a[1],L.SH);}
    return [k,an,add(an,p.to[i],L.FT)];
  });
  return {hip,sh,nk,head,arms,legs,cv:p.cv||0,pv:p.pv||0,hp:p.hp||0,hf:p.hf||0};
}
function A(frames,props){
  const f=frames.map(([p,d])=>({p:norm(p),d}));
  return {f,props:props||[],total:f.reduce((s,x)=>s+x.d,0)};
}
function poseAt(an,ms){
  const f=an.f; let t=((ms%an.total)+an.total)%an.total;
  for(let i=0;i<f.length;i++){
    const d=f[i].d; if(d<=0) continue;
    if(t<d){const k=t/d,e=0.5-0.5*Math.cos(Math.PI*k);return mix(f[i].p,f[(i+1)%f.length].p,e);}
    t-=d;
  }
  return f[0].p;
}
const swapAnim=(an,k)=>({...an,total:an.total*k,f:an.f.map(x=>({p:x.p,d:x.d*k}))});

/* ---------- Poses ---------- */
const ST=(o={})=>({hip:[0,57.5],t:180,ar:[[8,12],[-4,4]],fk:[[2,0],[-2,0]],...o});
function pushP(kind,s,hx=44){
  const py=kind==='decline'?34:(kind==='knee'?2:6);
  const Lt=kind==='knee'?L.T+L.TH:L.T+L.TH+L.SH;
  const px=hx-Math.sqrt(Lt*Lt-(40-py)**2);
  const sx=px+Math.sqrt(Math.max(1,Lt*Lt-(s-py)**2));
  const pv=[px,py],shp=[sx,s],a=ang(pv,shp),hip=add(pv,a,Lt-L.T);
  const foot=kind==='knee'?add(pv,-125,L.SH):pv;
  return {hip,sh:shp,hk:[hx,0],ep:[-1,0.8],fk:foot,kp:[0,-1],to:kind==='knee'?-95:30};
}
function plankF(s){
  const py=6,Lt=L.T+L.TH+L.SH,sx=20,px=sx-Math.sqrt(Lt*Lt-(23-py)**2);
  const shp=[sx,s],a=ang([px,py],shp),hip=add([px,py],a,Lt-L.T);
  return {hip,sh:shp,ar:[[0,90],[0,90]],fk:[px,py],kp:[0,-1],to:30};
}
const G=(o={})=>({hip:[0,55],t:178,hk:[[16,98],[10,100]],ep:[[0.3,-1],[0.3,-1]],fk:[[14,0],[-14,0]],kp:[[1,.2],[1,.2]],to:[90,70],...o});
const CH=(x,back=-1)=>({type:'chair',x,back});
const QUAD={hip:[0,30],t:110.7,hd:115,hk:[[32,0],[32,0]],ep:[-1,0],fk:[[-28,1],[-28,1]],kp:[[0,-1],[0,-1]],to:-90};

const AN={};
// Força: pernas
{const a=ST({ar:[[10,18],[6,12]]}),b={hip:[-14,28],t:135,ar:[[85,90],[80,88]],fk:[[3,0],[1,0]]};
 AN.squat=A([[a,900],[b,900]]);
 AN.squatPause=A([[a,900],[b,1500],[b,900]]);
 AN.squatJump=A([[a,450],[b,350],[{hip:[0,72],t:180,ar:[[170,175],[160,170]],fk:[[2,14],[-2,14]],to:[30,30]},350]]);
 AN.squatLight=A([[a,1100],[{...b,hip:[-8,40],t:155},1100]]);}
{const ar=[[4,8],[-4,0]];
 const st=ST({fk:[[0,0],[0,0]],ar}),lo={hip:[0,30],t:178,fk:[[26,0],[-26,4]],kp:[[1,.2],[.2,-1]],to:[90,40],ar};
 AN.lunge=A([[st,900],[lo,900]]);
 const bu={hip:[0,54],t:178,fk:[[18,0],[-34,31]],kp:[[1,.2],[.2,-1]],to:[90,-90],ar:[[6,10],[0,4]]};
 AN.bulgarian=A([[bu,1000],[{...bu,hip:[-4,28],t:165},1000]],[CH(-40,-1)]);
 const ja=[[30,60],[-20,10]];
 const Lp={...lo,ar:ja},J={hip:[0,64],t:180,fk:[[10,8],[-10,8]],kp:[[1,.2],[1,.2]],to:[60,60],ar:ja},Rp={hip:[0,30],t:178,fk:[[-26,4],[26,0]],kp:[[.2,-1],[1,.2]],to:[40,90],ar:ja};
 AN.lungeJump=A([[Lp,400],[J,350],[Rp,400],[J,350]]);}
{const base={sh:[-34,4],hd:-90,ar:[[90,90],[90,90]],kp:[[.3,1],[.3,1]]};
 const a={...base,hip:[0,4],fk:[[26,0],[24,0]]},b={...base,hip:[-4,24],fk:[[26,0],[24,0]]};
 AN.bridge=A([[a,1100],[b,1100]]);
 const a1={...base,hip:[0,4],fk:[[26,0],null],lg:[null,[120,120]]},b1={...base,hip:[-4,24],fk:[[26,0],null],lg:[null,[124,124]]};
 AN.bridge1=A([[a1,1100],[b1,1100]]);
 AN.bridge1Pause=A([[a1,1100],[b1,1800],[b1,1100]]);
 AN.bridgeHold=A([[b,2500],[{...b,hip:[-4,25]},2500]]);}
AN.calf=A([[ST({fk:[[0,0],[0,0]],to:[90,90]}),700],[{hip:[0,63.5],t:180,ar:[[8,12],[-4,4]],fk:[[0,6],[0,6]],to:[40,40]},700]]);
{const gm=ST({ar:[[150,-110],[150,-110]]});
 const gb={hip:[-10,55],t:95,hd:100,ar:[[65,-195],[65,-195]],fk:[[2,0],[-2,0]]};
 AN.goodmorning=A([[gm,1100],[gb,1100]]);
 AN.goodmorningSlow=A([[gm,1600],[gb,1400],[gb,1600]]);}
// Força: empurrar
AN.pushKnee=A([[pushP('knee',40),900],[pushP('knee',15),900]]);
AN.pushFull=A([[pushP('full',40),900],[pushP('full',16),900]]);
{const t=pushP('decline',40); AN.pushDecl=A([[t,1000],[pushP('decline',18),1000]],[CH(t.fk[0]-6,-1)]);}
{const dip=fx=>A([[{hip:[-4,36],t:180,hk:[-6,29],ep:[-1,0.2],fk:[fx,0],kp:[.3,1]},1000],[{hip:[-1,12],t:176,hk:[-6,29],ep:[-1,0.2],fk:[fx,0],kp:[.3,1]},1000]],[CH(-19,-1)]);
 AN.dip1=dip(28);AN.dip2=dip(38);AN.dip3=dip(48);}
AN.highPlank=A([[pushP('full',40),1600],[pushP('full',38.5),1600]]);
AN.pike=A([[{hip:[2,54],t:53,hk:[52,0],ep:[-1,0.8],fk:[[-22,0],[-24,0]],to:30},1000],[{hip:[14,50],t:41,hk:[52,0],ep:[-1,0.8],fk:[[-22,0],[-24,0]],to:30},1000]]);
AN.pikeElev=A([[{hip:[0,66],t:24,hk:[30,0],ep:[-1,0.8],fk:[[-22,31],[-24,31]],kp:[[1,.3],[1,.3]],to:-90},1100],[{hip:[6,54],t:25,hk:[30,0],ep:[-1,0.8],fk:[[-22,31],[-24,31]],kp:[[1,.3],[1,.3]],to:-90},1100]],[CH(-28,-1)]);
// Costas e core
{const lie={hip:[0,4],t:92,hd:100,ar:[[90,90],[90,90]],lg:[[-90,-90],[-90,-90]],to:[-90,-90]};
 AN.superman=A([[lie,900],[{...lie,t:104,hd:110,ar:[[112,112],[106,106]],lg:[[-102,-102],[-99,-99]]},1300],[{...lie,t:104,hd:110,ar:[[112,112],[106,106]],lg:[[-102,-102],[-99,-99]]},900]]);
 // puxada deitada: braços estendidos à frente (Y) e depois cotovelos puxados para trás (W), peito um pouco elevado
 {const Y={...lie,t:100,hd:104,ar:[[112,112],[110,110]]},Wp={...lie,t:100,hd:104,ar:[[-118,76],[-116,78]]};
  AN.pronePull=A([[Y,700],[Wp,700],[Wp,300]]);
  AN.pronePullPause=A([[Y,800],[Wp,800],[Wp,1600]]);}
 AN.supermanTop=A([[lie,900],[{...lie,t:104,hd:110,ar:[[112,112],[106,106]]},1100]]);
 const s1={...lie,t:102,hd:106,ar:[[118,118],[98,98]],lg:[[-92,-92],[-104,-104]]},s2={...lie,t:102,hd:106,ar:[[98,98],[118,118]],lg:[[-104,-104],[-92,-92]]};
 AN.swimmer=A([[s1,600],[s2,600]]);}
{const a={hip:[0,30],t:110.7,hd:115,ar:[[0,0],null],hk:[null,[32,0]],ep:[-1,0],fk:[[-28,1],null],lg:[null,[0,-90]],kp:[[0,-1],[1,.15]],to:[-90,-90]};
 const b={...a,ar:[[100,100],null],lg:[null,[-92,-92]]};
 AN.birddog=A([[a,1200],[b,1500],[b,1200]]);
 AN.birddogSlow=A([[a,1500],[b,2600],[b,1500]]);}
AN.plank=A([[plankF(23),1600],[plankF(24.5),1600]]);
{const b=pushP('full',40),px=b.fk;
 // joelho vem em direção ao peito sem encostar no chão; a outra perna fica estendida; na troca, as duas passam pelo meio
 const fr=[b.hip[0]+12,8],kp=[[1,0.2],[1,0.2]];
 const c1={...b,fk:[fr,px],kp,to:[40,30]},c2={...b,fk:[px,fr],kp,to:[30,40]};
 // segura cada lado e troca rápido, como no movimento real
 const cl=d=>A([[c1,d*0.75],[c1,d*0.25],[c2,d*0.75],[c2,d*0.25]]);
 AN.climberSlow=cl(560);AN.climber=cl(380);AN.climberFast=cl(280);}
{const base={hip:[0,4],kp:[[.3,1],[.3,1]],fk:[[24,0],[22,0]]};
 AN.crunch=A([[{...base,sh:[-34,4],ar:[[90,90],[90,90]]},900],[{...base,sh:[-26,22],hd:-40,ar:[[60,70],[60,70]]},900]]);}
AN.legraise=A([[{hip:[0,4],t:-90,ar:[[90,90],[90,90]],lg:[[96,96],[96,96]],to:[180,180]},1200],[{hip:[0,4],t:-90,ar:[[90,90],[90,90]],lg:[[178,178],[178,178]],to:[120,120]},1200]]);
AN.vup=A([[{hip:[0,4],t:-90,ar:[[-90,-90],[-90,-90]],lg:[[95,95],[95,95]],to:[180,180]},1000],[{hip:[0,4],t:-140,hd:-130,ar:[[-210,-210],[-214,-214]],lg:[[140,140],[140,140]],to:[150,150]},1000]]);
{const st={hip:[0,57.5],t:180,hk:[[4,48],[0,48]],ep:[-1,0.3],fk:[[2,0],[-2,0]],to:[90,90]};
 const sq={hip:[-10,26],t:125,hk:[[24,0],[22,0]],ep:[-1,0.3],fk:[[3,0],[1,0]],to:[90,90]};
 const pk={...pushP('full',40,24),fk:[pushP('full',40,24).fk,pushP('full',40,24).fk],ep:[-1,0.3],to:[30,30]};
 const jp={hip:[0,70],t:180,hk:[[6,140],[2,140]],ep:[-1,0.3],fk:[[2,10],[-2,10]],to:[40,40]};
 AN.burpee=A([[st,300],[sq,300],[pk,450],[sq,300],[jp,300]]);
 AN.burpee0=A([[st,450],[sq,450],[pk,700],[sq,450]]);}
// Aquecimento e volta à calma
AN.highknees=A([[{hip:[0,58],t:180,ar:[[-35,40],[35,100]],lg:[[80,0],[0,0]]},320],[{hip:[0,58],t:180,ar:[[35,100],[-35,40]],lg:[[0,0],[80,0]]},320]]);
AN.buttkicks=A([[{hip:[0,58],t:180,ar:[[-30,60],[30,110]],lg:[[-5,-165],[0,0]],to:[-60,90]},280],[{hip:[0,58],t:180,ar:[[30,110],[-30,60]],lg:[[0,0],[-5,-165]],to:[90,-60]},280]]);
AN.circles=A([0,90,180,270,360].map((a,i)=>[ST({ar:[[a,a+8],[a+180,a+188]]}),i===4?0:380]));
AN.breath=A([[ST({ar:[[6,10],[2,6]]}),3500],[ST({ar:[[176,178],[170,174]]}),3500]]);
{const a=ST({ar:[[6,8],[2,4]]}),b={hip:[-8,57],t:28,hd:20,hk:[[16,1],[13,1]],ep:[1,0],fk:[[2,0],[-2,0]]};
 const a2={...a,hk:[[4,49],[1,49]],ep:[1,0]};delete a2.ar;
 AN.fold=A([[a2,2200],[b,3000],[b,2200]]);}
AN.quadStretch=A([[{hip:[0,57.5],t:180,hk:[[24,82],[-4,54]],ep:[[-1,0.3],[-1,-0.5]],fk:[[0,0],null],lg:[null,[2,-175]],to:[90,180]},2500],[{hip:[0,57.5],t:182,hk:[[25,84],[-4,53]],ep:[[-1,0.3],[-1,-0.5]],fk:[[0,0],null],lg:[null,[4,-174]],to:[90,180]},2500]]);
// Muay Thai
{const g=G(),jab=G({hk:[[46,96],[10,100]]}),cross=G({t:170,hip:[3,55],hk:[[16,98],[47,96]]});
 const knee=G({t:192,hk:[[26,86],[24,88]],fk:[[14,0],[10,36]],kp:[[1,.2],[1,0.8]],to:[90,20]});
 AN.mtBounce=A([[g,260],[G({hip:[0,58],fk:[[14,3],[-14,3]]}),260]]);
 AN.jabcross=A([[g,260],[jab,260],[g,260],[cross,320],[g,420]]);
 AN.combo=A([[g,240],[jab,240],[g,240],[cross,280],[g,300],[knee,320],[g,420]]);
 AN.knee=A([[g,420],[G({hk:[[30,100],[28,100]]}),220],[knee,320]]);
 const ch=G({t:186,fk:[[18,30],[-14,0]],kp:[[1,0.6],[1,.2]],to:[60,70]}),kk=G({t:198,fk:[[56,50],[-14,0]],kp:[[1,0.6],[1,.2]],to:[170,70]});
 AN.teep=A([[g,450],[ch,200],[kk,260],[ch,220]]);
 const rh=(ty)=>A([[g,450],[G({t:200,fk:[[14,0],[12,34]],kp:[[1,.2],[1,0.7]],hk:[[18,100],[-6,70]]}),200],[G({t:212,fk:[[14,0],[58,ty]],kp:[[1,.2],[1,0.5]],hk:[[20,102],[-16,62]],to:[90,100]}),300],[G({t:200,fk:[[14,0],[12,34]],kp:[[1,.2],[1,0.7]],hk:[[18,100],[-6,70]]}),220]]);
 AN.kickLow=rh(30);AN.kickMid=rh(62);AN.kickHigh=rh(82);
 AN.elbow=A([[g,380],[G({t:172,hk:[[4,104],[10,100]],ep:[[1,0.4],[0.3,-1]]}),260],[G({t:168,hip:[3,55],hk:[[16,98],[6,106]],ep:[[0.3,-1],[1,0.4]]}),300]]);}
// Yoga
AN.dog=A([[{hip:[2,54],t:53,hk:[52,0],ep:[-1,0.8],fk:[[-22,0],[-24,0]],to:30},3000],[{hip:[2,55.5],t:53,hk:[52,0],ep:[-1,0.8],fk:[[-22,0],[-24,0]],to:30},3000]]);
AN.child=A([[{hip:[-6,10],t:76,hd:104,cv:14,hk:[[58,1],[56,1]],ep:[0,1],fk:[[-12,2],[-12,2]],kp:[[1,-0.2],[1,-0.2]],to:[-90,-90]},3000],[{hip:[-6,10.6],t:75,hd:102,cv:16,hk:[[58,1],[56,1]],ep:[0,1],fk:[[-12,2],[-12,2]],kp:[[1,-0.2],[1,-0.2]],to:[-90,-90]},3000]]);
AN.cobra=A([[{hip:[0,4],t:128,hd:136,hk:[[22,0],[20,0]],ep:[-1,0.2],lg:[[-90,-90],[-90,-90]],to:[-90,-90]},3000],[{hip:[0,4],t:134,hd:144,hk:[[22,0],[20,0]],ep:[-1,0.2],lg:[[-90,-90],[-90,-90]],to:[-90,-90]},3000]]);
AN.warrior=A([[{hip:[0,34],t:180,ar:[[178,180],[174,178]],fk:[[28,0],[-40,0]],to:[90,60]},3000],[{hip:[0,33],t:182,ar:[[182,184],[178,182]],fk:[[28,0],[-40,0]],to:[90,60]},3000]]);
AN.chair=A([[{hip:[-12,34],t:150,ar:[[160,165],[156,160]],fk:[[3,0],[1,0]]},3000],[{hip:[-12,32.5],t:149,ar:[[162,167],[158,162]],fk:[[3,0],[1,0]]},3000]]);
AN.tree=A([[{hip:[0,57.5],t:180,ar:[[178,180],[176,178]],fk:[[0,0],[6,28]],kp:[[1,.15],[1,0.2]],to:[90,0]},3000],[{hip:[0,57.5],t:181,ar:[[181,183],[179,181]],fk:[[0,0],[6,28]],kp:[[1,.15],[1,0.2]],to:[90,0]},3000]]);
AN.catcow=A([[{...QUAD,t:114,hd:150,cv:-42,pv:-14,hp:45},2200],[{...QUAD,t:96,hd:40,cv:42,pv:14,hp:-12},2200]]);
{const sf={hip:[0,6],ep:[0,1],lg:[[90,90],[90,90]],to:[180,180]},dobra={...sf,t:122,hd:120,cv:6,hk:[[50,13],[48,13]]};
 AN.seatfold=A([[{...sf,t:150,hk:[[40,24],[38,24]]},2800],[dobra,3200],[dobra,2800]]);}
// Dança e aeróbico
AN.danceMarch=A([[{hip:[0,57],t:180,ar:[[170,175],[20,40]],lg:[[50,-10],[0,0]]},480],[{hip:[0,57],t:180,ar:[[20,40],[170,175]],lg:[[0,0],[50,-10]]},480]]);
{const fk=[[16,0],[-14,0]];
 AN.dancePunch=A([[{hip:[-6,46],t:168,ar:[[175,178],[30,60]],fk},260],[{hip:[-2,53],t:178,ar:[[100,120],[100,120]],fk},260],[{hip:[-6,46],t:168,ar:[[30,60],[175,178]],fk},260],[{hip:[-2,53],t:178,ar:[[100,120],[100,120]],fk},260]]);}
{const a=ST({ar:[[90,100],[90,100]]});
 const k1={hip:[0,57],t:186,ar:[[160,170],[150,160]],fk:[[46,30],[-2,0]],kp:[[1,.5],[1,.2]],to:[150,90]};
 const k2={hip:[0,57],t:186,ar:[[160,170],[150,160]],fk:[[2,0],[46,30]],kp:[[1,.2],[1,.5]],to:[90,150]};
 AN.danceKick=A([[a,320],[k1,320],[a,320],[k2,320]]);}
AN.shadowbox=swapAnim(AN.jabcross,0.75);

/* ---------- Desenho ---------- */
let COL={};
function readCol(){const cs=getComputedStyle(document.documentElement);['ink','muted','line','accent','mat','warm','surface','bg'].forEach(k=>COL[k]=cs.getPropertyValue('--'+k).trim());}
readCol();
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',readCol);}catch(e){}
new MutationObserver(readCol).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
function bbox(an){
  if(an.bb) return an.bb;
  const b={x0:1e9,x1:-1e9,y1:-1e9},N=28;
  for(let i=0;i<N;i++){
    const j=solve(poseAt(an,an.total*i/N));
    [j.hip,j.sh,j.nk,...j.arms.flat(),...j.legs.flat()].forEach(p=>{b.x0=Math.min(b.x0,p[0]);b.x1=Math.max(b.x1,p[0]);b.y1=Math.max(b.y1,p[1]);});
    b.x0=Math.min(b.x0,j.head[0]-L.HR);b.x1=Math.max(b.x1,j.head[0]+L.HR);b.y1=Math.max(b.y1,j.head[1]+L.HR);
  }
  an.props.forEach(p=>{b.x0=Math.min(b.x0,p.x-15);b.x1=Math.max(b.x1,p.x+15);b.y1=Math.max(b.y1,62);});
  return an.bb=b;
}
function fitCanvas(c){
  const dpr=Math.min(2,window.devicePixelRatio||1),w=c.clientWidth,h=c.clientHeight;
  if(!w||!h) return null;
  if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}
  const ctx=c.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0); return [ctx,w,h];
}
function drawFig(c,an,ms,opt={}){
  const r=fitCanvas(c); if(!r) return; const [ctx,w,h]=r;
  ctx.clearRect(0,0,w,h);
  const b=bbox(an),pad=Math.max(6,Math.min(w,h)*0.07);
  const bw=Math.max(b.x1-b.x0,opt.minW||100),bh=Math.max(b.y1,opt.minH||100)+8;
  const s=Math.min((w-2*pad)/bw,(h-2*pad)/bh,opt.maxS||4.2);
  const cx=(b.x0+b.x1)/2,lw=Math.max(2.2,6.4*s),gy=h-pad;
  const X=x=>w/2+(x-cx)*s,Y=y=>gy-y*s-lw/2;
  // chão
  ctx.fillStyle=COL.mat; const mx0=X(b.x0)-14*s,mw=(b.x1-b.x0+28)*s;
  ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(mx0,gy-1,mw,Math.max(3,4*s),3); else ctx.rect(mx0,gy-1,mw,Math.max(3,4*s)); ctx.fill();
  ctx.lineCap='round';ctx.lineJoin='round';
  // objetos
  an.props.forEach(p=>{
    if(p.type!=='chair') return;
    ctx.strokeStyle=COL.muted;ctx.globalAlpha=.5;ctx.lineWidth=Math.max(1.6,3.4*s);
    const ln=(a,b2,c2,d)=>{ctx.beginPath();ctx.moveTo(X(a),Y(b2)+lw/2);ctx.lineTo(X(c2),Y(d)+lw/2);ctx.stroke();};
    ln(p.x-13,28,p.x+13,28);ln(p.x-11,28,p.x-11,0);ln(p.x+11,28,p.x+11,0);
    const bx=p.back<0?p.x-13:p.x+13; ln(bx,28,bx,62);
    ctx.globalAlpha=1;
  });
  const j=solve(poseAt(an,ms));
  const chain=(pts)=>{ctx.beginPath();ctx.moveTo(X(pts[0][0]),Y(pts[0][1]));for(let i=1;i<pts.length;i++)ctx.lineTo(X(pts[i][0]),Y(pts[i][1]));ctx.stroke();};
  const ink=opt.color||COL.ink;
  ctx.lineWidth=lw;
  ctx.strokeStyle=ink;ctx.globalAlpha=.38;
  chain([j.sh,...j.arms[1]]);chain([j.hip,...j.legs[1]]);
  ctx.globalAlpha=1;
  chain([j.hip,j.sh,j.nk]);
  ctx.fillStyle=ink;ctx.beginPath();ctx.arc(X(j.head[0]),Y(j.head[1]),L.HR*s,0,Math.PI*2);ctx.fill();
  chain([j.hip,...j.legs[0]]);
  ctx.strokeStyle=opt.near||ink; chain([j.sh,...j.arms[0]]);
}

