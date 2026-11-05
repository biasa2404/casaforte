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
    this.passos=aulaPassos(key,an)||[];this.i=-1;this.fase='espera';this.f=0;this.ms=0;this.t0=performance.now();this.reps=0;this.done=!this.passos.length;
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
