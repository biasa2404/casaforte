'use strict';
/* Casa Forte: exercícios, planos e montagem dos treinos */
/* ---------- Catálogo ---------- */
const MUS={ombros:'Ombros',peito:'Peito',triceps:'Tríceps',biceps:'Braços',abdomen:'Abdômen',costas:'Costas',lombar:'Lombar',gluteos:'Glúteos',quadriceps:'Quadríceps',posteriores:'Posterior da coxa',panturrilhas:'Panturrilhas',cardio:'Coração e fôlego'};
const v=(n,a,tip,o={})=>({n,a,tip,...o});
const FAM={
  agach:{m:['quadriceps','gluteos'],k:'forca',v:[v('Agachamento livre','squat','Joelhos na direção dos pés e peito aberto'),v('Agachamento com pausa','squatPause','Segure dois segundos lá embaixo'),v('Agachamento com salto','squatJump','Aterrisse suave, com os joelhos flexionados')]},
  afundo:{m:['quadriceps','gluteos','posteriores'],k:'forca',v:[v('Afundo alternado','lunge','Desça o joelho de trás perto do chão e alterne as pernas'),v('Agachamento búlgaro','bulgarian','Pé de trás na cadeira. Troque de perna na metade do tempo',{sw:1}),v('Afundo com salto','lungeJump','Troque as pernas no ar e aterrisse com controle')]},
  ponte:{m:['gluteos','posteriores','lombar'],k:'forca',v:[v('Ponte de glúteo','bridge','Aperte o glúteo lá no alto'),v('Ponte unilateral','bridge1','Uma perna estendida. Troque na metade do tempo',{sw:1}),v('Ponte unilateral com pausa','bridge1Pause','Segure dois segundos no alto. Troque na metade',{sw:1})]},
  pant:{m:['panturrilhas'],k:'forca',v:[v('Elevação de panturrilha','calf','Suba e desça devagar'),v('Panturrilha no degrau','calf','Use um degrau para o calcanhar descer mais',{q:'elevação de panturrilha no degrau'}),v('Panturrilha unilateral','calf','Uma perna por vez, mão apoiada na parede',{sw:1,q:'elevação de panturrilha unilateral'})]},
  bomdia:{m:['posteriores','lombar','gluteos'],k:'forca',v:[v('Bom dia','goodmorning','Leve o quadril para trás com as costas retas',{q:'exercício good morning peso corporal'}),v('Bom dia lento','goodmorningSlow','Três segundos para descer, pausa embaixo',{q:'exercício good morning peso corporal'}),v('Bom dia com pausa','goodmorningSlow','Segure embaixo e sinta a parte de trás da coxa',{q:'exercício good morning peso corporal'})]},
  flexao:{m:['peito','triceps','ombros'],k:'forca',v:[v('Flexão com joelhos','pushKnee','Corpo reto dos joelhos à cabeça'),v('Flexão tradicional','pushFull','Cotovelos a 45 graus do corpo e abdômen firme'),v('Flexão declinada','pushDecl','Pés na cadeira. Desça o peito com controle')]},
  triceps:{m:['triceps','ombros','peito'],k:'forca',v:[v('Mergulho na cadeira','dip1','Cadeira firme contra a parede, joelhos dobrados',{q:'tríceps banco na cadeira'}),v('Mergulho na cadeira','dip2','Desça até os cotovelos formarem 90 graus',{q:'tríceps banco na cadeira'}),v('Mergulho com pernas estendidas','dip3','Pernas retas deixam o exercício mais pesado',{q:'tríceps banco pernas estendidas'})]},
  ombro:{m:['ombros','triceps','abdomen'],k:'forca',v:[v('Prancha alta','highPlank','Mãos abaixo dos ombros, empurre o chão'),v('Flexão pike','pike','Quadril alto, leve a cabeça em direção ao chão'),v('Flexão pike com pés na cadeira','pikeElev','Mais peso nos ombros. Vá devagar')]},
  superman:{m:['costas','lombar','gluteos'],k:'forca',v:[v('Superman de tronco','supermanTop','Olhe para o chão e eleve peito e braços'),v('Superman','superman','Eleve braços e pernas juntos e segure um instante'),v('Superman nadador','swimmer','Alterne braço e perna opostos sem encostar no chão')]},
  passaro:{m:['lombar','abdomen','gluteos'],k:'forca',v:[v('Perdigueiro','birddog','Braço e perna opostos. Troque de lado na metade',{sw:1,q:'exercício perdigueiro bird dog'}),v('Perdigueiro com pausa','birddogSlow','Segure três segundos esticado. Troque na metade',{sw:1,q:'exercício perdigueiro bird dog'}),v('Perdigueiro com pausa longa','birddogSlow','Quadril parado, sem girar. Troque na metade',{sw:1,q:'exercício perdigueiro bird dog'})]},
  prancha:{m:['abdomen','ombros'],k:'forca',v:[v('Prancha alta','highPlank','Mãos abaixo dos ombros e corpo reto'),v('Prancha no antebraço','plank','Aperte glúteo e abdômen, sem subir o quadril'),v('Prancha no antebraço','plank','Afaste os cotovelos um pouco à frente para dificultar')]},
  abd:{m:['abdomen'],k:'forca',v:[v('Abdominal curto','crunch','Suba só as escápulas, sem puxar o pescoço'),v('Abdominal bicicleta','bicycle','Cotovelo em direção ao joelho oposto, sem puxar o pescoço'),v('Abdominal canivete','vup','Braços e pernas se encontram no alto')]},
  escal:{m:['abdomen','ombros','cardio'],k:'aero',v:[v('Escalador lento','climberSlow','Joelho em direção ao peito, um de cada vez',{q:'exercício escalador mountain climber'}),v('Escalador','climber','Quadril baixo e ritmo constante',{q:'exercício escalador mountain climber'}),v('Escalador rápido','climberFast','Acelere sem perder a postura',{q:'exercício escalador mountain climber'})]},
  burpee:{m:['cardio','quadriceps','peito'],k:'aero',v:[v('Burpee sem salto','burpee0','Agache, leve os pés para trás e volte'),v('Burpee','burpee','Termine com um salto e braços para cima'),v('Burpee','burpee','Se conseguir, inclua uma flexão no chão')]},
  mt_jab:{m:['ombros','abdomen','cardio'],k:'luta',v:[v('Jab e direto','jabcross','Mãos voltam sempre para a guarda',{q:'muay thai jab direto iniciante'}),v('Jab e direto rápido','shadowbox','Gire o pé de trás no direto',{q:'muay thai jab direto'}),v('Jab, direto e joelhada','combo','Solte o combo e volte para a base',{q:'muay thai combo jab direto joelhada'})]},
  mt_joelho:{m:['abdomen','quadriceps','gluteos'],k:'luta',v:[v('Joelhada','knee','Puxe com as mãos e suba o joelho de trás. Troque na metade',{sw:1,q:'muay thai joelhada como fazer'}),v('Joelhada com clinch','knee','Mãos no clinch, quadril para a frente. Troque na metade',{sw:1,q:'muay thai joelhada clinch'}),v('Joelhada explosiva','knee','Máxima velocidade. Troque na metade',{sw:1,q:'muay thai joelhada'})]},
  mt_teep:{m:['abdomen','quadriceps','gluteos'],k:'luta',v:[v('Teep (chute frontal)','teep','Empurre com a sola do pé. Troque na metade',{sw:1,q:'muay thai teep chute frontal'}),v('Teep (chute frontal)','teep','Suba o joelho antes de estender. Troque na metade',{sw:1,q:'muay thai teep chute frontal'}),v('Teep com salto','teep','Dê um pequeno salto para avançar. Troque na metade',{sw:1,q:'muay thai teep'})]},
  mt_gancho:{m:['ombros','abdomen','costas'],k:'luta',v:[v('Gancho de frente','hookLead','Cotovelo na altura do punho, gire o quadril e o pé da frente',{q:'muay thai gancho como fazer'}),v('Uppercut de trás','upperRear','Dobre os joelhos e suba o soco girando o quadril',{q:'uppercut como fazer boxe'}),v('Gancho de trás','hookRear','Gire o pé de trás e o quadril, mão da frente na guarda',{q:'gancho de trás boxe como fazer'})]},
  mt_chute:{m:['gluteos','abdomen','posteriores'],k:'luta',v:[v('Chute circular baixo','kickLow','Gire o pé de apoio e chute com a canela. Troque na metade',{sw:1,q:'muay thai chute circular iniciante'}),v('Chute circular médio','kickMid','Braço do mesmo lado desce para dar impulso. Troque na metade',{sw:1,q:'muay thai chute circular'}),v('Chute circular alto','kickHigh','Gire todo o quadril. Troque na metade',{sw:1,q:'muay thai chute alto'})]},
  mt_cotovelo:{m:['ombros','abdomen','costas'],k:'luta',v:[v('Cotovelada','elbow','Cotovelo na altura do queixo, gire o tronco',{q:'muay thai cotovelada'}),v('Cotovelada alternada','elbow','Alterne os lados mantendo a guarda',{q:'muay thai cotovelada'}),v('Cotovelada rápida','elbow','Rápido e curto, sempre voltando à guarda',{q:'muay thai cotovelada'})]},
  d_marcha:{m:['cardio','quadriceps'],k:'aero',v:[v('Marcha com braços','danceMarch','Siga o ritmo e solte o corpo',{q:'aula de dança aeróbica em casa iniciante'}),v('Marcha com braços','danceMarch','Joelhos mais altos',{q:'aula de dança aeróbica em casa'}),v('Marcha com braços','danceMarch','Acelere o ritmo',{q:'aula de dança aeróbica em casa'})]},
  // reservado para a futura aula de dança com música (não entra nos treinos por enquanto)
  d_hiphop:{m:['cardio','quadriceps','gluteos'],k:'aero',v:[v('Hip hop','hiphop','Siga o balanço, passos pequenos',{q:'aula de hip hop iniciante em casa'}),v('Hip hop','hiphop','Mais balanço no quadril e nos braços',{q:'aula de hip hop em casa'}),v('Hip hop','hiphop','Passos mais amplos e com energia',{q:'aula de hip hop dança cardio'})]},
  d_soco:{m:['cardio','ombros','quadriceps'],k:'aero',v:[v('Socos para cima no agachamento','dancePunch','Desça um pouco e solte os braços no alto',{q:'dança aeróbica socos para cima'}),v('Socos para cima no agachamento','dancePunch','Agache mais fundo',{q:'dança aeróbica socos para cima'}),v('Socos para cima no agachamento','dancePunch','Rápido, sem perder o ritmo',{q:'dança aeróbica socos para cima'})]},
  d_chute:{m:['cardio','abdomen','quadriceps'],k:'aero',v:[v('Chute de dança alternado','danceKick','Chute para a frente e bata palma',{q:'dança aeróbica chute alternado'}),v('Chute de dança alternado','danceKick','Chute mais alto',{q:'dança aeróbica chute alternado'}),v('Chute de dança alternado','danceKick','Pequeno salto a cada troca',{q:'dança aeróbica chute alternado'})]},
  d_boxe:{m:['cardio','ombros','abdomen'],k:'aero',v:[v('Boxe aeróbico','shadowbox','Socos soltos, pés sempre se mexendo',{q:'boxe aeróbico em casa'}),v('Boxe aeróbico','shadowbox','Mais rápido',{q:'boxe aeróbico em casa'}),v('Boxe aeróbico','combo','Inclua a joelhada',{q:'boxe aeróbico em casa'})]},
  d_bumbum:{m:['cardio','posteriores'],k:'aero',v:[v('Calcanhar no bumbum','buttkicks','Calcanhar sobe atrás, ritmo leve',{q:'exercício calcanhar no bumbum'}),v('Calcanhar no bumbum','buttkicks','Mais rápido',{q:'exercício calcanhar no bumbum'}),v('Calcanhar no bumbum','buttkicks','O mais rápido que conseguir',{q:'exercício calcanhar no bumbum'})]},
};
const IT=(n,a,m,tip,k,o={})=>({n,a,m,tip,k,q:o.q||n,sw:o.sw});
const YOGA={
  catcow:IT('Gato e vaca','catcow',['costas','lombar'],'Inspire olhando para cima, solte o ar arredondando as costas','yoga',{q:'yoga gato vaca'}),
  dog:IT('Cachorro olhando para baixo','dog',['ombros','posteriores','panturrilhas'],'Calcanhares em direção ao chão, joelhos podem dobrar','yoga',{q:'yoga cachorro olhando para baixo'}),
  warrior:IT('Guerreiro I','warrior',['quadriceps','gluteos','ombros'],'Joelho da frente sobre o tornozelo. Troque na metade','yoga',{sw:1,q:'yoga guerreiro 1'}),
  chair:IT('Postura da cadeira','chair',['quadriceps','gluteos'],'Sente numa cadeira imaginária, braços para o alto','yoga',{q:'yoga postura da cadeira utkatasana'}),
  tree:IT('Árvore','tree',['panturrilhas','abdomen'],'Olhe para um ponto fixo. Troque na metade','yoga',{sw:1,q:'yoga postura da árvore'}),
  cobra:IT('Cobra','cobra',['lombar','peito'],'Ombros longe das orelhas, quadril no chão','yoga',{q:'yoga postura da cobra'}),
  child:IT('Postura da criança','child',['lombar','costas'],'Solte o peso e respire devagar','yoga',{q:'yoga postura da criança'}),
  seatfold:IT('Pinça sentada','seatfold',['posteriores','lombar'],'Alongue a coluna antes de descer','yoga',{q:'yoga pinça sentada alongamento'}),
  quad:IT('Alongamento de quadríceps','quadStretch',['quadriceps'],'Joelhos juntos. Troque na metade','yoga',{sw:1,q:'alongamento de quadríceps em pé'}),
  bridgeY:IT('Ponte (postura de yoga)','bridgeHold',['gluteos','lombar'],'Respire mantendo o quadril alto','yoga',{q:'yoga postura da ponte'}),
  breathY:IT('Respiração profunda','breath',[],'Inspire subindo os braços, solte o ar descendo','yoga',{q:'respiração diafragmática relaxamento'}),
};
const WARM={
  forca:[IT('Corrida no lugar','jog',['cardio'],'Passos leves e braços acompanhando','aero'),IT('Lagarta','pikeWalk',['posteriores','ombros'],'Caminhe com as mãos até a prancha e volte','aero',{q:'exercício lagarta inchworm como fazer'}),IT('Agachamento leve','squatLight',['quadriceps'],'Meio agachamento para aquecer os joelhos','aero')],
  luta:[IT('Balanço na base','mtBounce',['cardio'],'Balanço leve, mãos na guarda','luta',{q:'muay thai base e guarda iniciante'}),IT('Aquecimento de luta','boxWarm',['ombros','cardio'],'Solte braços, ombros e tronco','aero',{q:'aquecimento muay thai em casa'}),IT('Corrida no lugar','jog',['cardio'],'Passos leves','aero')],
  aero:[IT('Marcha com braços','danceMarch',['cardio'],'Comece leve e vá soltando o corpo','aero'),IT('Rotação de braços','circles',['ombros'],'Círculos grandes e soltos','aero'),IT('Polichinelo','jacks',['cardio'],'Aterrisse leve, joelhos soltos','aero',{q:'polichinelo como fazer'})],
};
const COOL=[IT('Alongamento de braço cruzado','armStretch',['ombros'],'Ombros longe das orelhas','yoga',{sw:1,q:'alongamento de ombro braço cruzado'}),IT('Respiração profunda','breath',[],'Inspire subindo os braços, solte o ar descendo','yoga'),IT('Alongamento posterior','fold',['posteriores'],'Joelhos levemente dobrados, sem forçar','yoga',{q:'alongamento posterior de coxa em pé'}),IT('Alongamento de quadríceps','quadStretch',['quadriceps'],'Troque de perna na metade','yoga',{sw:1})];
const PLANS={
  1:{nome:'Pernas e glúteos',tipo:'Força',warm:'forca',ex:['agach','afundo','ponte','bomdia','pant']},
  2:{nome:'Muay Thai em casa',tipo:'Muay Thai',warm:'luta',ex:['mt_jab','mt_gancho','mt_joelho','mt_teep','mt_chute','mt_cotovelo','escal']},
  3:{nome:'Peito, ombros e tríceps',tipo:'Força',warm:'forca',ex:['flexao','ombro','triceps','prancha','abd']},
  4:{nome:'Yoga e alongamento',tipo:'Yoga',flow:['catcow','dog','warrior','chair','tree','cobra','child','seatfold','quad']},
  5:{nome:'Glúteos, lombar, abdômen e peito',tipo:'Força',warm:'forca',ex:['superman','flexao','passaro','ponte','bomdia','abd']},
  6:{nome:'Aeróbico e dança',tipo:'Dança e cardio',warm:'aero',ex:['d_marcha','d_soco','d_chute','d_boxe','d_bumbum','burpee']},
  0:{nome:'Yoga leve e mobilidade',tipo:'Recuperação',flow:['breathY','catcow','child','cobra','dog','bridgeY','seatfold']},
};
const DAYS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const DAYS_L=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'];
const TIERS=['Iniciante','Intermediário','Avançado'];
const TP=[{w:30,r:30,rr:60,hold:40},{w:40,r:20,rr:60,hold:50},{w:45,r:15,rr:45,hold:60}];
const XP_LVL=200;
const yt=q=>'https://www.youtube.com/results?search_query='+encodeURIComponent(q);

/* ---------- Montagem do treino ---------- */
function resolve(f,tier){const F=FAM[f],x=F.v[tier];return {n:x.n,a:x.a,m:F.m,tip:x.tip,k:F.k,q:x.q||x.n,sw:x.sw};}
function build(dayIdx,tier,dur,opt={}){
  const learn=opt.learn||(()=>false);
  const P=PLANS[dayIdx],tp=TP[tier],target=dur*60,steps=[];
  if(P.flow){
    const poses=P.flow.map(k=>YOGA[k]);
    steps.push({k:'prep',s:8,label:'Prepare-se'});
    const hold=tp.hold,tr=8; let used=8,i=0,cycle=1;
    const coolS=60;
    while(used+hold+tr<=target-coolS||i<poses.length){
      const it=poses[i%poses.length];
      if(cycle===1&&learn(it.a)){steps.push({k:'learn',s:10,it,label:'Aprenda a postura'});used+=10;}
      steps.push({k:'work',s:hold,it,label:'Sequência '+cycle,ph:'yoga'});
      used+=hold;
      steps.push({k:'rest',s:tr,label:'Transição',soft:1}); used+=tr;
      i++; if(i%poses.length===0) cycle++;
      if(i>60) break;
    }
    steps.pop();
    steps.push({k:'rest',s:tr,label:'Transição',soft:1});
    steps.push({k:'cool',s:60,it:YOGA.breathY,label:'Relaxamento final'});
  } else {
    const warm=WARM[P.warm],ex=P.ex.map(f=>resolve(f,tier));
    const warmS=[45,30,30],coolS=[40,40,40];
    const base=8+warmS.reduce((a,b)=>a+b)+15+10+coolS.reduce((a,b)=>a+b);
    const per=ex.length*tp.w+(ex.length-1)*tp.r;
    const R=Math.max(2,Math.min(8,Math.round((target-base+tp.rr)/(per+tp.rr))));
    steps.push({k:'prep',s:8,label:'Prepare-se'});
    warm.forEach((it,i)=>steps.push({k:'warm',s:warmS[i],it,label:'Aquecimento'}));
    steps.push({k:'rest',s:15,label:'Prepare-se'});
    for(let r=1;r<=R;r++){
      ex.forEach((it,i)=>{
        if(r===1&&learn(it.a)) steps.push({k:'learn',s:10,it,label:'Aprenda o movimento'});
        steps.push({k:'work',s:tp.w,it,r,R,label:'Rodada '+r+' de '+R,first:r===1});
        if(i<ex.length-1) steps.push({k:'rest',s:tp.r,label:'Descanso',r,R});
        else if(r<R) steps.push({k:'rest',s:tp.rr,label:'Fim da rodada '+r,r,R,round:1});
      });
    }
    steps.push({k:'rest',s:10,label:'Volta à calma'});
    COOL.forEach((it,i)=>steps.push({k:'cool',s:coolS[i],it,label:'Volta à calma'}));
  }
  steps.forEach((s,i)=>{if(!s.it){const n=steps.slice(i+1).find(x=>x.it);s.nx=n?n.it:null;}});
  return steps;
}
const total=st=>st.reduce((a,s)=>a+s.s,0);
const mmss=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};

