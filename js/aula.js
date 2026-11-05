'use strict';
/* Casa Forte: aula em câmera lenta.
   O movimento anda devagar, para nos pontos-chave, a câmera gira para mostrar
   o detalhe, aparece a colinha na tela e a voz explica. Depois, tudo junto. */

/* Passos feitos à mão. t = ponto do movimento (0 a 1), yaw = ângulo da câmera
   (0,5 = meio de lado, 1,45 = de frente), cola = colinha curta na tela. */
const AULA={
  squat:[
    {t:0,yaw:1.45,cola:'Pés na largura dos ombros',fala:'Comece em pé, com os pés na largura dos ombros e as pontas um pouco viradas para fora.',guias:[{t:'link',j:['ankle0','ankle1'],label:'Largura dos ombros'}]},
    {t:0.2,yaw:0.5,cola:'Quadril para trás',fala:'Leve o quadril para trás, como se fosse sentar numa cadeira. O peito continua aberto.'},
    {t:0.44,yaw:0.5,cola:'Coxa paralela ao chão',fala:'Desça até a coxa ficar paralela ao chão. O joelho fica perto de 90 graus. Se for confortável, pode descer um pouco mais.',guias:[{t:'ang',j:['hip','knee0','ankle0'],goal:80,tol:22,label:'Joelho'}]},
    {t:0.44,yaw:1.45,cola:'Joelho na direção da ponta do pé',fala:'Agora de frente. O joelho aponta para a ponta do pé, na direção do segundo dedo. Não deixe o joelho cair para dentro.',guias:[{t:'link',j:['knee0','toe0'],label:'Joelho → ponta do pé'},{t:'link',j:['knee1','toe1']}]},
    {t:0.44,yaw:0.5,cola:'Calcanhar no chão',fala:'Os calcanhares ficam no chão o tempo todo. O joelho pode passar um pouquinho da ponta do pé, desde que o calcanhar não levante.',guias:[{t:'dot',j:'ankle0',label:'Calcanhar no chão'},{t:'plumb',j:'toe0',label:'Ponta do pé'}]},
    {t:0.72,yaw:0.5,cola:'Empurre o chão e solte o ar',fala:'Para subir, empurre o chão com o pé inteiro e solte o ar.'},
  ],
  pushFull:[
    {t:0.5,yaw:0.2,cola:'Prancha alta',fala:'Comece em prancha alta: mãos um pouco mais abertas que os ombros e corpo reto da cabeça aos calcanhares.',guias:[{t:'line',j:['sh','hip','ankle0'],tol:5,label:'Corpo reto'}]},
    {t:0.5,yaw:1.2,cola:'Cotovelos a 45 graus',fala:'Os cotovelos vão para trás, uns 45 graus do corpo, como uma seta. Não abra os cotovelos para os lados.',guias:[{t:'dot',j:'elbow0',label:'Cotovelo'}]},
    {t:0.8,yaw:0.2,cola:'Desça com controle',fala:'Desça o peito devagar, com abdômen e glúteo firmes. O quadril desce junto, sem cair.',guias:[{t:'line',j:['sh','hip','ankle0'],tol:5,label:'Corpo reto'}]},
    {t:0.98,yaw:0.2,cola:'Peito perto do chão',fala:'Desça até o peito chegar perto do chão. Se ainda não conseguir, desça só até onde o corpo continua reto, ou apoie os joelhos.',guias:[{t:'ang',j:['shJ0','elbow0','hand0'],goal:70,tol:25,label:'Cotovelo'}]},
    {t:1.25,yaw:0.2,cola:'Empurre o chão e solte o ar',fala:'Empurre o chão e suba o corpo inteiro de uma vez, como uma tábua. Solte o ar na subida.'},
  ],
  highPlank:[
    {t:0,yaw:0.2,cola:'Mãos abaixo dos ombros',fala:'Mãos no chão, exatamente abaixo dos ombros, braços estendidos.',guias:[{t:'plumb',j:'hand0',label:'Mão abaixo do ombro'}]},
    {t:0,yaw:0.2,cola:'Corpo reto',fala:'Corpo em linha reta da cabeça aos calcanhares. O quadril não sobe nem cai.',guias:[{t:'line',j:['sh','hip','ankle0'],tol:5,label:'Corpo reto'}]},
    {t:0,yaw:0.8,cola:'Abdômen e glúteo firmes',fala:'Aperte o abdômen e o glúteo e empurre o chão para longe. Respire normalmente, sem prender o ar.'},
  ],
  bicycle:[
    {t:0,yaw:0.4,cola:'Mãos atrás da cabeça',fala:'Deite de barriga para cima, mãos atrás da cabeça sem puxar o pescoço, ombros um pouco fora do chão.'},
    {t:0.02,yaw:0.4,cola:'Cotovelo em direção ao joelho oposto',fala:'Traga um joelho em direção ao peito e gire o tronco, aproximando o cotovelo do lado oposto. A outra perna estica.'},
    {t:0.45,yaw:0.4,cola:'Troque de lado',fala:'Troque: o outro joelho vem e o tronco gira para o outro lado. O giro vem do abdômen, não do pescoço.'},
    {t:0.5,yaw:0.4,cola:'Lombar no chão',fala:'Mantenha a lombar encostada no chão e faça com controle, sem pressa.',guias:[{t:'dot',j:'hip',label:'Lombar no chão'}]},
  ],
  burpee:[
    {t:0.62,yaw:0.4,cola:'Comece em pé',fala:'Comece em pé, pés na largura do quadril.'},
    {t:0.76,yaw:0.4,cola:'Mãos no chão',fala:'Agache e apoie as mãos no chão, na frente dos pés.'},
    {t:0.88,yaw:0.2,cola:'Pés para trás',fala:'Leve os pés para trás até a prancha, com o abdômen firme.',guias:[{t:'line',j:['sh','hip','ankle0'],tol:6,label:'Corpo reto'}]},
    {t:1.0,yaw:0.2,cola:'Peito ao chão',fala:'Desça o peito até o chão com controle. Se ficar pesado, apoie os joelhos nessa parte.'},
    {t:1.22,yaw:0.3,cola:'Empurre e traga os pés',fala:'Empurre o chão e traga os pés para perto das mãos.'},
    {t:1.48,yaw:0.4,cola:'Salte e aterrisse suave',fala:'Fique em pé e salte com os braços para cima. Aterrisse suave, com os joelhos dobrados.',guias:[{t:'dot',j:'ankle0',label:'Aterrisse suave'}]},
  ],
  jabcross:[
    {t:0,yaw:1.2,cola:'Base de luta',fala:'Base de luta: pé esquerdo à frente, pés afastados, joelhos soltos. Mãos na altura do queixo e cotovelos fechados.',guias:[{t:'link',j:['ankle0','ankle1'],label:'Base'}]},
    {t:0.2,yaw:0.6,cola:'Jab: braço da frente',fala:'Jab: estique rápido o braço da frente e volte para a guarda.',guias:[{t:'dot',j:'hand1',label:'Jab'}]},
    {t:0.35,yaw:0.6,cola:'Direto: gire o pé e o quadril',fala:'Direto: gire o pé de trás e o quadril e estique o braço de trás. A força vem do giro.',guias:[{t:'dot',j:'hand0',label:'Direto'},{t:'dot',j:'ankle0',label:'Gire o pé de trás'}]},
    {t:0.75,yaw:1.2,cola:'Volte para a guarda',fala:'Depois de cada golpe, a mão volta para proteger o rosto. Solte o ar a cada soco.'},
  ],
  shadowbox:[
    {t:0.1,yaw:1.2,cola:'Guarda alta',fala:'Base de luta, mãos na guarda protegendo o queixo.'},
    {t:0.3,yaw:0.6,cola:'Jab',fala:'Solte o jab com o braço da frente.',guias:[{t:'dot',j:'hand1',label:'Jab'}]},
    {t:0.4,yaw:0.6,cola:'Direto',fala:'Em seguida o direto, girando o quadril.',guias:[{t:'dot',j:'hand0',label:'Direto'}]},
    {t:0.62,yaw:0.8,cola:'Vai rápido, volta rápido',fala:'Repita a sequência num ritmo constante. O braço vai rápido e volta rápido para a guarda.'},
  ],
  elbow:[
    {t:0,yaw:1.2,cola:'Base e guarda',fala:'Base de luta, mãos na guarda.'},
    {t:0.3,yaw:0.6,cola:'Passo à frente',fala:'Dê um pequeno passo à frente com o pé da frente para chegar perto.'},
    {t:0.45,yaw:0.6,cola:'Cotovelo na altura do queixo',fala:'Dobre bem o braço de trás e gire o tronco, passando o cotovelo na altura do queixo, como se cortasse na horizontal.',guias:[{t:'dot',j:'elbow0',label:'Cotovelo'}]},
    {t:0.8,yaw:1.2,cola:'A outra mão protege',fala:'A outra mão continua protegendo o rosto. Depois, volte para a base.'},
  ],
  knee:[
    {t:0,yaw:1.2,cola:'Base de luta',fala:'Base de luta, mãos à frente.'},
    {t:0.25,yaw:0.6,cola:'Puxe com as mãos',fala:'Leve as mãos à frente, como se segurasse o adversário, e puxe para baixo.'},
    {t:0.38,yaw:0.6,cola:'Joelho sobe, quadril à frente',fala:'Suba o joelho da frente com força, levando o quadril à frente. Tronco levemente para trás.',guias:[{t:'dot',j:'knee1',label:'Joelho'}]},
    {t:0.62,yaw:1.2,cola:'Volte para a base',fala:'Volte o pé para a base e as mãos para a guarda. Troque de lado na metade do tempo.'},
  ],
  kickMid:[
    {t:0,yaw:1.2,cola:'Base de luta',fala:'Base de luta, mãos na guarda.'},
    {t:0.25,yaw:0.6,cola:'Gire na ponta do pé de apoio',fala:'Gire na ponta do pé da frente, virando o calcanhar para o alvo. Isso libera o quadril.',guias:[{t:'dot',j:'ball1',label:'Ponta do pé de apoio'}]},
    {t:0.4,yaw:0.6,cola:'Chute com a canela',fala:'Gire o quadril e chute com a canela, na altura da cintura. O braço do mesmo lado desce para dar impulso.',guias:[{t:'dot',j:'knee0',label:'Canela'}]},
    {t:0.75,yaw:1.2,cola:'Volte pelo mesmo caminho',fala:'Volte a perna pelo mesmo caminho e retorne para a base, com as mãos na guarda. Troque de lado na metade.'},
  ],
  mtBounce:[
    {t:0,yaw:1.2,cola:'Pés afastados, joelhos soltos',fala:'Pés afastados, um à frente do outro, joelhos soltos e peso na frente dos pés.',guias:[{t:'link',j:['ankle0','ankle1'],label:'Base'}]},
    {t:0.3,yaw:0.7,cola:'Mãos na guarda',fala:'Mãos na altura do queixo e cotovelos fechados, protegendo o corpo.'},
    {t:0.6,yaw:0.7,cola:'Balanço leve',fala:'Faça um balanço leve e solto, respirando pelo nariz.'},
  ],
  jacks:[
    {t:0.5,yaw:1.45,cola:'Pés juntos',fala:'Comece em pé, pés juntos e braços ao lado do corpo.'},
    {t:0.75,yaw:1.45,cola:'Salte abrindo',fala:'Salte abrindo as pernas e subindo os braços pelas laterais.'},
    {t:1.0,yaw:1.45,cola:'Aterrisse suave',fala:'Os braços se encontram no alto. Aterrisse na frente dos pés, com os joelhos levemente dobrados.',guias:[{t:'dot',j:'ankle0',label:'Aterrisse suave'}]},
    {t:1.4,yaw:1.45,cola:'Feche e repita',fala:'Salte fechando pernas e braços, e repita num ritmo constante.'},
  ],
  jog:[
    {t:0,yaw:0.5,cola:'Corra no lugar',fala:'Corra no lugar, pisando leve com a frente dos pés.'},
    {t:0.25,yaw:0.5,cola:'Braços acompanham',fala:'Braços dobrados acompanhando o passo, ombros soltos.'},
    {t:0.5,yaw:1.2,cola:'Ainda dá para falar',fala:'Mantenha um ritmo em que ainda dá para falar. É aquecimento.'},
  ],
  armStretch:[
    {t:0,yaw:1.3,cola:'Ombros relaxados',fala:'Fique em pé com os ombros relaxados.'},
    {t:0.15,yaw:1.3,cola:'Braço cruzado no peito',fala:'Cruze um braço na frente do peito e segure com a outra mão, acima do cotovelo.'},
    {t:0.2,yaw:1.3,cola:'Sem dor',fala:'Ombros longe das orelhas. Segure e respire. Alongamento é sem dor. Depois, troque de lado.'},
  ],
  kickLow:[
    {t:0,yaw:1.2,cola:'Base de luta',fala:'Base de luta, mãos na guarda.'},
    {t:0.25,yaw:0.6,cola:'Gire na ponta do pé de apoio',fala:'Gire na ponta do pé da frente, com o calcanhar virando para o alvo, e comece a girar o quadril.',guias:[{t:'dot',j:'ball1',label:'Ponta do pé de apoio'}]},
    {t:0.42,yaw:0.6,cola:'Canela na altura da coxa',fala:'Chute com a canela na altura da coxa do adversário. O braço do mesmo lado desce para dar impulso.',guias:[{t:'dot',j:'knee0',label:'Canela'}]},
    {t:0.8,yaw:1.2,cola:'Volte para a base',fala:'Volte a perna e as mãos para a guarda. Troque de lado na metade do tempo.'},
  ],
  kickHigh:[
    {t:0,yaw:1.2,cola:'Base de luta',fala:'Base de luta, mãos na guarda. O chute alto só depois de aquecer bem.'},
    {t:0.18,yaw:0.6,cola:'Gire o corpo todo',fala:'Gire na ponta do pé de apoio e leve o quadril para cima e para a frente.',guias:[{t:'dot',j:'ball1',label:'Ponta do pé de apoio'}]},
    {t:0.3,yaw:0.6,cola:'Canela na altura da cabeça',fala:'A canela sobe até a altura da cabeça, só até onde for confortável. O braço do mesmo lado desce, a outra mão protege o rosto.',guias:[{t:'dot',j:'knee0',label:'Canela'}]},
    {t:0.72,yaw:1.2,cola:'Volte com equilíbrio',fala:'Volte a perna com controle e retorne à base. Se perder o equilíbrio, chute mais baixo. Troque de lado na metade.'},
  ],
  hookLead:[
    {t:0,yaw:1.2,cola:'Base e guarda',fala:'Base de luta, mãos na guarda.'},
    {t:0.15,yaw:0.9,cola:'Gire o pé da frente',fala:'Gire o pé da frente e o quadril para dentro. É daí que vem a força do gancho.',guias:[{t:'dot',j:'ankle1',label:'Gire o pé da frente'}]},
    {t:0.25,yaw:0.9,cola:'Cotovelo na altura do punho',fala:'A mão da frente faz um arco, com o cotovelo dobrado e na altura do punho. A outra mão protege o rosto.',guias:[{t:'dot',j:'elbow1',label:'Cotovelo'}]},
    {t:0.65,yaw:1.2,cola:'Volte para a guarda',fala:'Volte rápido para a guarda e solte o ar a cada golpe.'},
  ],
  upperRear:[
    {t:0,yaw:1.2,cola:'Base e guarda',fala:'Base de luta, mãos na guarda.'},
    {t:0.2,yaw:0.7,cola:'Dobre os joelhos',fala:'Dobre um pouco os joelhos, sem baixar a mão.'},
    {t:0.33,yaw:0.7,cola:'De baixo para cima',fala:'Suba o soco de trás de baixo para cima, girando o quadril e o pé de trás, com o cotovelo dobrado.',guias:[{t:'dot',j:'hand0',label:'Uppercut'},{t:'dot',j:'ankle0',label:'Gire o pé de trás'}]},
    {t:0.7,yaw:1.2,cola:'Volte para a guarda',fala:'Volte rápido para a guarda. A mão da frente fica protegendo o rosto o tempo todo.'},
  ],
  hookRear:[
    {t:0,yaw:1.2,cola:'Base e guarda',fala:'Base de luta, mãos na guarda.'},
    {t:0.25,yaw:0.8,cola:'Gire o pé de trás',fala:'Gire o pé de trás e o quadril, levando o peso para a frente.',guias:[{t:'dot',j:'ankle0',label:'Gire o pé de trás'}]},
    {t:0.37,yaw:0.8,cola:'Arco com o cotovelo dobrado',fala:'A mão de trás faz um arco com o cotovelo dobrado. Não abra o braço demais.',guias:[{t:'dot',j:'elbow0',label:'Cotovelo'}]},
    {t:0.7,yaw:1.2,cola:'Volte para a guarda',fala:'Volte para a guarda e solte o ar a cada golpe.'},
  ],
  boxWarm:[
    {t:0,yaw:1.3,cola:'Corpo solto',fala:'Em pé, corpo solto. Vamos aquecer as articulações.'},
    {t:0.2,yaw:1.3,cola:'Solte braços e ombros',fala:'Balance os braços e gire os ombros, sem forçar.'},
    {t:0.75,yaw:1.0,cola:'Solte o tronco',fala:'Gire e incline o tronco devagar, respirando solto.'},
  ],
  pikeWalk:[
    {t:0,yaw:0.2,cola:'Prancha alta',fala:'Comece em prancha alta, mãos abaixo dos ombros e corpo reto.',guias:[{t:'line',j:['sh','hip','ankle0'],tol:6,label:'Corpo reto'}]},
    {t:0.35,yaw:0.2,cola:'Quadril alto',fala:'Caminhe levando o quadril para cima, até formar um V invertido. Pode dobrar os joelhos.'},
    {t:0.85,yaw:0.2,cola:'Volte à prancha',fala:'Caminhe com as mãos de volta até a prancha, com o abdômen firme.'},
  ],
  hiphop:[
    {t:0,yaw:1.3,cola:'Pés afastados, joelhos soltos',fala:'Abra bem os pés e deixe os joelhos soltos, levemente dobrados.',guias:[{t:'link',j:['ankle0','ankle1'],label:'Base larga'}]},
    {t:0.17,yaw:1.3,cola:'Braços em onda',fala:'Os braços passam na frente do peito, um de cada vez, como uma onda.'},
    {t:0.33,yaw:1.0,cola:'Gire o tronco',fala:'O tronco acompanha, girando um pouquinho para cada lado.'},
    {t:0.5,yaw:0.6,cola:'Joelhos como mola',fala:'Os joelhos dobram e esticam no ritmo, como uma mola. Isso dá o balanço.',guias:[{t:'dot',j:'knee0',label:'Joelho solto'}]},
  ],
};

/* Para os outros movimentos, monta a aula com a explicação de teach.js */
function aulaPassos(key,an){
  if(AULA[key]) return AULA[key];
  const c=typeof COMO!=='undefined'&&COMO[key];if(!c||!an) return null;
  // ponto-chave: o quadro mais diferente da posição inicial
  const J0=solve(poseAt(an,0)),pts=j=>[j.hip,j.sh,j.head,...j.arms.flat(),...j.legs.flat()];
  const p0=pts(J0);let best=0.5,bd=-1;
  for(let i=1;i<40;i++){const p=pts(solve(poseAt(an,an.total*i/40)));const d=p.reduce((s,q,k)=>s+Math.hypot(q[0]-p0[k][0],q[1]-p0[k][1]),0);if(d>bd){bd=d;best=i/40;}}
  const g=typeof GUIDES!=='undefined'?GUIDES[key]:null;
  return [
    {t:0,yaw:0.5,cola:'Posição inicial',fala:c[0]},
    {t:best,yaw:0.5,cola:'Movimento',fala:c[1],guias:g},
    {t:best,yaw:0.9,cola:'Atenção',fala:'Atenção: '+c[2],guias:g},
  ];
}
const AULA_FIM='Agora o movimento completo, devagar. Imite junto comigo.';

class Aula{
  /* stage: o palco; falar(texto, aoTerminar); comVoz: se a voz está ligada */
  constructor(stage,key,an,falar,comVoz){
    this.st=stage;this.key=key;this.an=an;this.falar=falar;this.voz=comVoz;
    this.passos=aulaPassos(key,an)||[];this.i=-1;this.fase='espera';this.f=this.passos[0]?this.passos[0].t:0;this.ms=0;this.t0=performance.now();this.reps=0;this.done=!this.passos.length;
    this.yaw0=stage.yaw;
  }
  ciclo(){return this.st.cycleMs?this.st.cycleMs():(this.an?this.an.total:2000);}
  pronto(){ // espera o movimento gravado carregar (até 8 s)
    if(!MOCAP[this.key]||this.st.mcOn) return true;
    return performance.now()-this.t0>8000;
  }
  segurar(p){
    this.fase='segura';this.h0=performance.now();this.falou=false;
    this.st.cola=p.cola;this.st.guideList=p.guias||[];if(p.yaw!=null) this.st.yawTarget=p.yaw;
    const min=Math.max(2200,p.fala.length*(this.voz?45:65));this.min=min;
    if(this.voz) this.falar(this.i===0&&this.intro?[this.intro,p.fala]:[p.fala],()=>{this.falou=true;});else this.falou=true;
  }
  /* avança a aula e devolve o tempo da animação (ms) para o palco */
  update(dt){
    const C=this.ciclo();
    if(this.fase==='espera'){if(this.pronto()){this.fase='anda';this.i=0;} return 0;}
    if(this.fase==='anda'){
      const alvo=this.passos[this.i].t;
      this.st.cola=null;this.st.guideList=[];
      if(this.f>=alvo-1e-4){this.f=alvo;this.segurar(this.passos[this.i]);}
      else this.f=Math.min(alvo,this.f+dt/(C/0.3)); // 30% da velocidade
      return this.f*C;
    }
    if(this.fase==='segura'){
      if(this.falou&&performance.now()-this.h0>=this.min+500){
        this.i++;
        if(this.i<this.passos.length) this.fase='anda';
        else {this.fase='junto';this.st.cola='Agora tudo junto, devagar';this.st.guideList=null;this.st.yawTarget=this.yaw0;this.ms=this.f*C;
          if(this.voz) this.falar([AULA_FIM],()=>{});}
      }
      return this.f*C;
    }
    // tudo junto: duas repetições a 50% e segue normal
    this.ms+=dt*(this.reps<2?0.5:1);
    const r=Math.floor(this.ms/C);if(r>this.reps){this.reps=r;if(this.reps>=2&&!this.done){this.done=true;this.st.cola=null;}}
    return this.ms;
  }
  parar(){this.st.cola=null;this.st.guideList=null;this.st.yawTarget=null;}
}
