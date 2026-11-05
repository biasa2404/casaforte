'use strict';
/* Casa Forte: coreografias de dança aeróbica (no ritmo de uma batida própria, sem direitos autorais)
   e sequências de golpes de Muay Thai, montadas emendando os movimentos gravados. */

/* ---------- Muay Thai: trecho útil de cada golpe gravado (segundos) ---------- */
const GOLPE={
  jabcross:{t0:0.03,t1:1.67,n:'jab e direto'},
  hookLead:{t0:0.2,t1:1.63,n:'gancho'},
  hookRear:{t0:0.2,t1:1.67,n:'gancho de trás'},
  upperRear:{t0:0.13,t1:1.7,n:'uppercut'},
  teep:{t0:0.13,t1:1.67,n:'teep'},
  kickMid:{t0:0.4,t1:1.8,n:'chute'},
  kickLow:{t0:0.03,t1:1.33,n:'chute baixo'},
  kickHigh:{t0:0.03,t1:1.5,n:'chute alto'},
  knee:{t0:0.07,t1:1.67,n:'joelhada'},
  elbow:{t0:0,t1:1.67,n:'cotovelada'},
  dodge:{t0:0,t1:2.17,n:'esquiva'},
  bodyJab:{t0:0,t1:1.3,n:'golpes no corpo'},
};
/* Sequências por nível (t = nível mínimo) */
const COMBOS=[
  {t:0,n:'Jab e direto',g:['jabcross']},
  {t:0,n:'Jab, direto e gancho',g:['jabcross','hookLead']},
  {t:0,n:'Jab, direto e chute baixo',g:['jabcross','kickLow']},
  {t:0,n:'Teep, jab e direto',g:['teep','jabcross']},
  {t:0,n:'Joelhada e cotovelada',g:['knee','elbow']},
  {t:0,n:'Esquiva, jab e direto',g:['dodge','jabcross']},
  {t:1,n:'Jab, direto, gancho e chute',g:['jabcross','hookLead','kickMid']},
  {t:1,n:'Esquiva e golpes no corpo',g:['dodge','bodyJab']},
  {t:1,n:'Uppercut, gancho e joelhada',g:['upperRear','hookLead','knee']},
  {t:1,n:'Jab, direto e gancho de trás',g:['jabcross','hookRear']},
  {t:2,n:'Jab, direto e chute alto',g:['jabcross','kickHigh']},
  {t:2,n:'Teep, jab, direto, gancho e chute',g:['teep','jabcross','hookLead','kickMid']},
  {t:2,n:'Golpes no corpo, uppercut e cotovelada',g:['bodyJab','upperRear','elbow']},
];
const COMBO_RATE=[1,1.1,1.25];
function seqCombo(g,tier){
  const r=COMBO_RATE[tier]||1,seq=[];
  g.forEach(k=>{const x=GOLPE[k];seq.push({k,t0:x.t0,rate:r,ms:Math.round((x.t1-x.t0)/r*1000)});});
  const u=g[g.length-1];seq.push({k:u,t0:GOLPE[u].t1,rate:0,ms:500}); // pausa curta na guarda
  return seq;
}
function itemCombo(c,tier){
  const mus=new Set(['ombros','abdomen','cardio']);
  c.g.forEach(k=>{if(/kick|teep|knee/.test(k)){mus.add('quadriceps');mus.add('gluteos');}if(k==='dodge')mus.add('quadriceps');});
  return {n:c.n,a:c.g[0],g:c.g.map(k=>GOLPE[k].n).join(', ').replace(/^./,x=>x.toUpperCase()),m:[...mus],tip:'Repita a sequência e volte sempre para a guarda.',k:'luta',q:'muay thai combinação '+c.n,seq:seqCombo(c.g,tier),combo:1};
}

/* ---------- Dança aeróbica ---------- */
const PASSO={
  stepTouch:{n:'Passo e toque',tip:'Um passo para o lado e o outro pé vem encostar. Joelhos soltos.'},
  shuffle:{n:'Passo arrastado',tip:'Pés deslizam de um lado para o outro, no ritmo da batida.'},
  twist:{n:'Twist',tip:'Gire o quadril e os pés juntos, braços acompanhando.'},
  rumba:{n:'Passo de rumba',tip:'Passos pequenos, quadril solto.'},
  armsUp:{n:'Braços no alto',tip:'Braços para cima, acompanhando a batida.'},
  cabbage:{n:'Braços em círculo',tip:'Braços fazem círculos na frente do peito e os joelhos marcam o tempo.'},
  bootyStep:{n:'Passo com quadril',tip:'Joelhos dobrados, marque o tempo com o quadril.'},
  samba:{n:'Samba no pé',tip:'Passinhos rápidos na ponta dos pés.'},
  salsa:{n:'Básico de salsa',tip:'Um passo à frente, volta, um passo atrás, volta.'},
  rainbow:{n:'Passo lateral com braços',tip:'Passo para o lado com os braços em arco.'},
  jacks:{n:'Polichinelo',tip:'Aterrisse leve, joelhos soltos.'},
  jazzSquare:{n:'Quadrado do jazz',tip:'Cruze um pé na frente, passo atrás, passo ao lado e junte: um quadrado no chão.'},
  runningMan:{n:'Running man',tip:'Um joelho sobe enquanto o outro pé desliza para trás. Exige mais fôlego.'},
  rockette:{n:'Chutinho à frente',tip:'Chutes baixos alternados, braços abertos e abdômen firme.'},
  armPush:{n:'Braço para o alto',tip:'Passo para o lado e um braço sobe esticado, depois o outro.'},
  armCircle:{n:'Braços em volta',tip:'Os braços desenham um grande círculo enquanto os pés marcam o tempo.'},
  maraschino:{n:'Passo cruzado',tip:'Passos cruzados, com os braços acompanhando.'},
};
/* Cada bloco tem 32 tempos (4 vezes 8), como nas aulas de academia */
const COREOS=[
  {n:'Balanço',bpm:120,b:['stepTouch','jazzSquare','twist','rumba','armCircle']},
  {n:'Festa',bpm:124,b:['stepTouch','cabbage','bootyStep','samba','armPush']},
  {n:'Clássica',bpm:126,b:['stepTouch','jazzSquare','maraschino','shuffle','armsUp']},
  {n:'Mistura',bpm:128,b:['rainbow','salsa','runningMan','rockette','jacks']},
];
function seqPasso(k,bpm,tempos){
  // ajusta a velocidade para cada repetição do movimento caber num número inteiro de tempos
  const bt=60/bpm,D=DUR_PASSO[k]||4,nb=Math.max(2,Math.round(D/bt/2)*2);
  return [{k,t0:0,len:D,rate:D/(nb*bt),ms:Math.round(tempos*bt*1000)}];
}
const DUR_PASSO={stepTouch:7.8,shuffle:5.9,twist:5.43,rumba:2.37,armsUp:1.17,cabbage:3.83,bootyStep:4.9,samba:10.77,salsa:2.6,rainbow:7.33,jacks:1.07,jazzSquare:2.03,runningMan:10.83,rockette:5.43,armPush:2.33,armCircle:2.27,maraschino:3.23};
function itemPasso(k,bpm,tempos){
  const p=PASSO[k];return {n:p.n,a:k,m:['cardio','quadriceps','panturrilhas'],tip:p.tip,k:'aero',q:'aula de dança aeróbica '+p.n,seq:seqPasso(k,bpm,tempos),bpm,danca:1};
}
function coreoDaSemana(){const d=new Date(),w=Math.floor((d-new Date(d.getFullYear(),0,1))/604800000);return COREOS[w%COREOS.length];}

/* ---------- Batida própria (Web Audio): bumbo, palma, chimbal e baixo ---------- */
const Batida={
  ctx:null,on:false,bpm:120,next:0,n:0,timer:null,vol:null,
  start(ctx,bpm){
    if(!ctx) return;this.stop();this.ctx=ctx;this.bpm=bpm;this.on=true;this.n=0;this.next=ctx.currentTime+0.06;
    this.vol=ctx.createGain();this.vol.gain.value=0.5;this.vol.connect(ctx.destination);
    this.timer=setInterval(()=>this.agenda(),25);
  },
  stop(){this.on=false;clearInterval(this.timer);this.timer=null;if(this.vol){const v=this.vol;try{v.gain.setTargetAtTime(0,this.ctx.currentTime,0.05);setTimeout(()=>v.disconnect(),400);}catch(e){}this.vol=null;}},
  duck(x){if(this.vol&&this.ctx) try{this.vol.gain.setTargetAtTime(x,this.ctx.currentTime,0.08);}catch(e){}},
  agenda(){
    if(!this.on) return;const c=this.ctx,step=60/this.bpm/2; // colcheias
    while(this.next<c.currentTime+0.12){
      const t=this.next,i=this.n%16,beat=i%2===0,b4=(i/2)%4;
      if(beat&&(b4===0||b4===2)) this.kick(t);
      if(beat&&(b4===1||b4===3)) this.clap(t);
      this.hat(t,beat?0.05:0.09);
      if(beat) this.bass(t,[55,55,65.4,49][Math.floor(i/4)%4]);
      this.next+=step;this.n++;
    }
  },
  kick(t){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(45,t+0.12);g.gain.setValueAtTime(0.9,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.25);o.connect(g).connect(this.vol);o.start(t);o.stop(t+0.26);},
  ruido(t,d,f,v,type){const c=this.ctx,b=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=Math.random()*2-1;
    const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=b;fl.type=type;fl.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.001,t+d);s.connect(fl).connect(g).connect(this.vol);s.start(t);},
  clap(t){this.ruido(t,0.18,1500,0.45,'bandpass');},
  hat(t,v){this.ruido(t,0.04,8000,v,'highpass');},
  bass(t,f){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.22,t+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+0.22);o.connect(g).connect(this.vol);o.start(t);o.stop(t+0.24);},
};
