'use strict';
/* Casa Forte: coreografias de ritmos brasileiros (no ritmo de uma batida própria, sem direitos autorais)
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
  rebolado:{n:'Rebolado',tip:'Pés afastados, joelhos dobrados e o quadril desenha o movimento.'},
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
/* Coreografias de ritmos brasileiros, como nas aulas de "ritmos" das academias.
   Cada ritmo tem andamento próximo do real, passos com o jeito daquele ritmo e uma batida própria
   com a levada característica (zabumba e triângulo no forró, surdo no axé, tamborzão no funk...).
   nm troca o nome e a dica do passo para o vocabulário daquele ritmo.
   Cada bloco tem 32 tempos (4 vezes 8), como nas aulas de academia. */
const COREOS=[
  {n:'Forró',estilo:'forro',bpm:112,sub:'Dois pra lá, dois pra cá e balanço do xote',
    yt:'aula de forró passo básico iniciante',
    b:['stepTouch','salsa','rumba','shuffle','twist'],
    nm:{stepTouch:['Dois pra lá, dois pra cá','O passo básico do forró: dois passinhos para um lado e dois para o outro, joelhos soltos e corpo leve.'],
        salsa:['Base para frente e para trás','Um passo à frente e volta, um passo atrás e volta, como a base do forró universitário.'],
        rumba:['Balanço do xote','Passos curtos e o quadril balança junto, no "dois pra lá, dois pra cá" mais lento do xote.'],
        shuffle:['Passo lateral arrastado','Os pés arrastam no chão de um lado para o outro, como no forró pé de serra.'],
        twist:['Giro de quadril','Gire o quadril e os pés juntos, sem perder o compasso da zabumba.']}},
  {n:'Axé',estilo:'axe',bpm:130,sub:'Passos de bloco, braços no alto e pulinhos',
    yt:'coreografia axé aula de ritmos',
    b:['stepTouch','armsUp','jacks','bootyStep','armPush'],
    nm:{stepTouch:['Passo de bloco com palmas','Passo para o lado e junta, batendo palmas no tempo, como atrás do trio elétrico.'],
        armsUp:['Mãos para o alto','Braços sobem no ritmo do surdo, como no refrão das músicas de axé.'],
        jacks:['Pulinho do axé','Pulinhos abrindo e fechando as pernas. Aterrisse leve, com os joelhos soltos.'],
        bootyStep:['Rebolado do axé','Joelhos dobrados e o quadril marca o tempo.'],
        armPush:['Braço para o céu','Passo para o lado e um braço sobe esticado, depois o outro.']}},
  {n:'Funk',estilo:'funk',bpm:130,sub:'Rebolado, quadradinho e passinho no tamborzão',
    yt:'Lore Improta coreografia funk',
    b:['rebolado','bootyStep','stepTouch','armCircle','shuffle'],
    nm:{rebolado:['Rebolado','Pés afastados, joelhos dobrados e o quadril desenha o movimento. Abdômen firme protege a lombar.'],
        bootyStep:['Quadradinho de leve','Quadril sobe e desce marcando o tamborzão, joelhos sempre dobrados.'],
        stepTouch:['Passinho de lado','Passo para o lado e junta, com o quadril marcando cada batida do tamborzão.'],
        armCircle:['Braços em volta','Os braços desenham um círculo grande enquanto os pés marcam o tempo.'],
        shuffle:['Passo arrastado','Os pés deslizam de um lado para o outro no ritmo do tamborzão.']}},
  {n:'Samba e pagode',estilo:'samba',bpm:100,sub:'Samba no pé e balanço do pagode',
    yt:'aula de samba no pé iniciante passo a passo',
    b:['samba','rumba','stepTouch','armCircle'],
    nm:{samba:['Samba no pé','Passinhos rápidos trocando o peso de um pé para o outro, na ponta dos pés, três toques por tempo. Cansa mais do que parece.'],
        rumba:['Balanço do pagode','Passos pequenos, quadril solto e ombros relaxados, no balanço do pagode.'],
        stepTouch:['Passo lateral do pagode','Passo para o lado e junta, devagar, no balanço do cavaquinho.'],
        armCircle:['Braços de passista','Braços abertos desenham círculos enquanto os pés continuam no samba.']}},
  {n:'Sertanejo',estilo:'sertanejo',bpm:104,sub:'Passos de dança de salão e giro',
    yt:'coreografia sertanejo universitário aula de ritmos',
    b:['stepTouch','salsa','shuffle','twist','armsUp'],
    nm:{stepTouch:['Dois pra lá, dois pra cá','O passo base do sertanejo universitário, igual ao do forró, mas no balanço do violão.'],
        salsa:['Base para frente e para trás','Um passo à frente e volta, um passo atrás e volta.'],
        shuffle:['Passo lateral','Passos para o lado, arrastando o pé, como no vanerão.'],
        twist:['Giro de quadril','Gire o quadril e os pés juntos, braços acompanhando.'],
        armsUp:['Mãos para o alto','Braços para cima no refrão, como num show.']}},
];
/* Vídeos de coreografias brasileiras no YouTube (abre a busca, o vídeo é escolha sua) */
const VIDS_DANCA=[
  ['Lore Improta','Coreografias de axé, funk e pagode','Lore Improta coreografia'],
  ['Axé','Coreografias de bloco para suar','coreografia axé para dançar em casa'],
  ['Funk','Coreografias de funk para treinar','coreografia funk aula de dança fitness'],
  ['Forró','Passo básico e xote','aula de forró passo básico iniciante'],
  ['Samba no pé','Aula passo a passo','aula de samba no pé iniciante passo a passo'],
  ['Pagode','Coreografias de pagode','coreografia pagode dança'],
  ['Sertanejo','Coreografias de sertanejo','coreografia sertanejo universitário'],
  ['Aula de ritmos completa','Vários ritmos numa aula só','aula de ritmos completa em casa'],
];
function seqPasso(k,bpm,tempos){
  // ajusta a velocidade para cada repetição do movimento caber num número inteiro de tempos
  const bt=60/bpm,D=DUR_PASSO[k]||4,nb=Math.max(2,Math.round(D/bt/2)*2);
  return [{k,t0:0,len:D,rate:D/(nb*bt),ms:Math.round(tempos*bt*1000)}];
}
const DUR_PASSO={rebolado:4.8,stepTouch:7.8,shuffle:5.9,twist:5.43,rumba:2.37,armsUp:1.17,cabbage:3.83,bootyStep:4.9,samba:10.77,salsa:2.6,rainbow:7.33,jacks:1.07,jazzSquare:2.03,runningMan:10.83,rockette:5.43,armPush:2.33,armCircle:2.27,maraschino:3.23};
function nomePasso(k,C){const x=C&&C.nm&&C.nm[k];return x?x[0]:(PASSO[k]||{n:k}).n;}
function itemPasso(k,bpm,tempos,C){
  const p=PASSO[k]||{n:k,tip:''},x=C&&C.nm&&C.nm[k],n=x?x[0]:p.n;
  return {n,a:k,m:['cardio','quadriceps','gluteos','panturrilhas'],tip:x?x[1]:p.tip,k:'aero',q:(C?'aula de '+C.n.toLowerCase()+' ':'aula de dança ')+n,seq:seqPasso(k,bpm,tempos),bpm,danca:1,estilo:C&&C.estilo};
}
function coreoDaSemana(){const d=new Date(),w=Math.floor((d-new Date(d.getFullYear(),0,1))/604800000);return COREOS[w%COREOS.length];}

/* ---------- Música própria (Web Audio), uma para cada tipo de treino ----------
   Feita aqui, por código, sem direitos autorais. Estilos:
   danca  = pop de academia (bumbo, palma, chimbal e baixo), no BPM da coreografia
   forca  = batida firme e constante, bumbo em todo tempo, para ritmo de repetição
   luta   = percussão de luta: tambores graves, címbalo curto e marcação seca
   calma  = acordes longos e suaves, sem batida, para yoga e volta à calma */
const ESTILOS={danca:{n:'Dança',vol:0.5},forca:{n:'Força',vol:0.45},luta:{n:'Luta',vol:0.5},calma:{n:'Calma',vol:0.55},
  forro:{n:'Forró',vol:0.5},axe:{n:'Axé',vol:0.5},funk:{n:'Funk',vol:0.5},samba:{n:'Samba',vol:0.5},sertanejo:{n:'Sertanejo',vol:0.5}};
/* forro     = levada de baião: zabumba grave no 1 e no "a" do 1, triângulo em semicolcheias aberto no contratempo
   axe       = samba-reggae: surdos no 1 e no 3, repique nos contratempos e palmas
   funk      = tamborzão: bumbo em 3-3-2 e palma no 2 e no 4
   samba     = surdo de marcação forte no 2 e no 4, tamborim e pandeiro com acento no último tempinho
   sertanejo = bumbo e caixa com o violão batendo no contratempo */
const Batida={
  ctx:null,on:false,bpm:120,estilo:'danca',next:0,n:0,timer:null,vol:null,base:0.5,
  start(ctx,bpm,estilo='danca'){
    if(!ctx) return;this.stop();this.ctx=ctx;this.bpm=bpm;this.estilo=estilo;this.on=true;this.n=0;this.next=ctx.currentTime+0.06;
    this.base=(ESTILOS[estilo]||ESTILOS.danca).vol;
    this.vol=ctx.createGain();this.vol.gain.value=this.falando?this.base*0.3:this.base;this.vol.connect(ctx.destination);
    this.timer=setInterval(()=>this.agenda(),25);
  },
  stop(){this.on=false;clearInterval(this.timer);this.timer=null;if(this.vol){const v=this.vol;try{v.gain.setTargetAtTime(0,this.ctx.currentTime,0.05);setTimeout(()=>v.disconnect(),400);}catch(e){}this.vol=null;}},
  duck(x){if(this.vol&&this.ctx) try{this.vol.gain.setTargetAtTime(x,this.ctx.currentTime,0.08);}catch(e){}},
  fala(on){this.falando=on;this.duck(on?this.base*0.3:this.base);}, // abaixa enquanto a voz fala
  agenda(){
    if(!this.on) return;const c=this.ctx,step=60/this.bpm/4; // semicolcheias
    while(this.next<c.currentTime+0.12){
      const t=this.next,s16=this.n%16,bar=Math.floor(this.n/16),E=this.estilo;
      if(E==='forro'){
        if(s16===0||s16===8) this.tom(t,70,0.8);
        if(s16===3||s16===11) this.tom(t,80,0.55);
        if(s16===4||s16===12) this.tom(t,180,0.25); // bacalhau
        this.triangulo(t,s16%4===2);
        if(s16===0||s16===8) this.bass(t,[49,49,55,41.2][bar%4]*(s16===8?1.5:1),'triangle',0.2);
        if(s16===6||s16===14) this.acorde(t,[[196,246.9,293.7],[196,246.9,293.7],[220,277.2,329.6],[164.8,207.7,246.9]][bar%4],0.12,0.035);
      } else if(E==='axe'){
        if(s16===0) this.tom(t,95,0.6);
        if(s16===8) this.tom(t,65,0.85);
        if(s16===6||s16===10||s16===14) this.tom(t,170,0.35);
        if(s16===4||s16===12) this.clap(t);
        if(s16%4===2) this.hat(t,0.08);
        if(s16===0||s16===8) this.bass(t,[55,49,41.2,49][bar%4],'triangle',0.2);
      } else if(E==='funk'){
        if([0,3,6,8,11,14].includes(s16)) this.kick(t,s16%8===0?0.95:0.7);
        if(s16===4||s16===12) this.clap(t);
        if([2,10].includes(s16)) this.tom(t,140,0.3);
        this.hat(t,s16%2?0.025:0.05);
        if(s16===0||s16===6||s16===11) this.bass(t,[43.7,43.7,49,41.2][bar%4],'sawtooth',0.14);
      } else if(E==='samba'){
        if(s16===0||s16===8) this.tom(t,85,0.4);
        if(s16===4||s16===12) this.tom(t,62,0.85); // surdo de marcação
        if([0,3,6,8,10,13].includes(s16)) this.tom(t,420,0.16); // tamborim
        this.hat(t,s16%4===3?0.09:0.035); // pandeiro, acento no último tempinho
        if(s16===2||s16===10) this.acorde(t,[[261.6,329.6,392],[220,261.6,329.6],[293.7,349.2,440],[196,246.9,293.7]][bar%4],0.1,0.03);
      } else if(E==='sertanejo'){
        if(s16===0||s16===8||s16===10) this.kick(t,s16===10?0.6:0.85);
        if(s16===4||s16===12) this.clap(t);
        if(s16%2===0) this.hat(t,s16%4?0.07:0.04);
        if(s16%4===2) this.acorde(t,[[196,246.9,293.7],[293.7,370,440],[329.6,392,493.9],[261.6,329.6,392]][bar%4],0.14,0.04);
        if(s16%4===0) this.bass(t,[[49,73.4],[73.4,55],[82.4,61.7],[65.4,49]][bar%4][(s16/4)%2],'triangle',0.2);
      } else if(this.n%2===0){
        // estilos antigos, em colcheias
        const m=this.n>>1,i=m%16,beat=i%2===0,b4=(i/2)%4,bar8=Math.floor(m/16),st8=step*2;
        if(E==='forca'){
          if(beat) this.kick(t,1);
          if(beat&&(b4===1||b4===3)) this.clap(t);
          if(!beat) this.hat(t,0.1);
          if(!beat) this.bass(t,[55,55,49,41.2][bar8%4],'sawtooth',0.1);
        } else if(E==='luta'){
          // tambor grave no 1 e no "e" do 2; tambor agudo nos contratempos; címbalo alternando aberto e fechado
          if(i===0||i===5||i===8) this.tom(t,i===8?90:70,0.7);
          if(i===3||i===11||i===14) this.tom(t,150,0.45);
          if(beat) this.ching(t,b4%2===0);
          if(i===12&&bar8%2===1) this.tom(t,120,0.5);
        } else if(E==='calma'){
          if(i===0){const ac=[[261.6,329.6,392,493.9],[220,261.6,329.6,392],[174.6,220,261.6,329.6],[196,246.9,293.7,392]][bar8%4];this.pad(t,ac,st8*16);}
          if(i===10&&bar8%2===0) this.sino(t,[784,659.3,587.3,523.3][bar8%4]);
        } else {
          if(beat&&(b4===0||b4===2)) this.kick(t);
          if(beat&&(b4===1||b4===3)) this.clap(t);
          this.hat(t,beat?0.05:0.09);
          if(beat) this.bass(t,[55,55,65.4,49][Math.floor(i/4)%4]);
        }
      }
      this.next+=step;this.n++;
    }
  },
  triangulo(t,aberto){const c=this.ctx,g=c.createGain(),d=aberto?0.3:0.04;g.gain.setValueAtTime(aberto?0.06:0.03,t);g.gain.exponentialRampToValueAtTime(0.001,t+d);g.connect(this.vol);
    [1850,4400,6900].forEach(f=>{const o=c.createOscillator();o.type='sine';o.frequency.value=f;o.connect(g);o.start(t);o.stop(t+d+0.02);});},
  acorde(t,notas,d,v){const c=this.ctx;notas.forEach(f=>{const o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;fl.type='lowpass';fl.frequency.value=2200;
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.15);o.connect(fl).connect(g).connect(this.vol);o.start(t);o.stop(t+d+0.2);});},
  kick(t,v=0.9){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(45,t+0.12);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.25);o.connect(g).connect(this.vol);o.start(t);o.stop(t+0.26);},
  ruido(t,d,f,v,type){const c=this.ctx,b=c.createBuffer(1,Math.ceil(c.sampleRate*d),c.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=Math.random()*2-1;
    const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=b;fl.type=type;fl.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.001,t+d);s.connect(fl).connect(g).connect(this.vol);s.start(t);},
  clap(t){this.ruido(t,0.18,1500,0.45,'bandpass');},
  hat(t,v){this.ruido(t,0.04,8000,v,'highpass');},
  bass(t,f,type='triangle',v=0.22){const c=this.ctx,o=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o.type=type;o.frequency.value=f;fl.type='lowpass';fl.frequency.value=600;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(v,t+0.01);g.gain.exponentialRampToValueAtTime(0.001,t+0.22);o.connect(fl).connect(g).connect(this.vol);o.start(t);o.stop(t+0.24);},
  tom(t,f,v){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.6,t);o.frequency.exponentialRampToValueAtTime(f,t+0.08);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.35);o.connect(g).connect(this.vol);o.start(t);o.stop(t+0.36);this.ruido(t,0.03,2000,v*0.25,'bandpass');},
  ching(t,aberto){const c=this.ctx,g=c.createGain(),d=aberto?0.45:0.06;g.gain.setValueAtTime(0.09,t);g.gain.exponentialRampToValueAtTime(0.001,t+d);g.connect(this.vol);
    [2637,3951,5274].forEach(f=>{const o=c.createOscillator();o.type='sine';o.frequency.value=f;o.connect(g);o.start(t);o.stop(t+d+0.02);});},
  pad(t,notas,d){const c=this.ctx;notas.forEach((f,k)=>{const o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain();o.type='sine';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f*1.003;
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.05,t+d*0.3);g.gain.linearRampToValueAtTime(0.035,t+d*0.8);g.gain.linearRampToValueAtTime(0.0001,t+d*1.15);
    o.connect(g);o2.connect(g);g.connect(this.vol);o.start(t);o2.start(t);o.stop(t+d*1.2);o2.stop(t+d*1.2);});},
  sino(t,f){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.06,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+2.5);o.connect(g).connect(this.vol);o.start(t);o.stop(t+2.6);},
};
/* Qual música combina com cada parte do treino */
function musicaDoPasso(plan,s,C){
  const P=PLANS[plan];if(!P||!s) return null;
  if(s.k==='cool'||P.flow) return {estilo:'calma',bpm:60};
  if(s.it&&s.it.danca&&(s.k==='work'||s.k==='learn')) return {estilo:s.it.estilo||'danca',bpm:s.it.bpm};
  if(P.coreo) return C?{estilo:C.estilo,bpm:C.bpm}:{estilo:'danca',bpm:120};
  if(P.mt) return {estilo:'luta',bpm:126};
  return {estilo:'forca',bpm:s.k==='warm'?110:118};
}
