'use strict';
/* Casa Forte: roteiro de falas.
   Fonte única do que a voz fala. O mesmo arquivo é usado pelo site (para montar a frase
   e achar o áudio gravado) e pelo script tools/gerar-audios.mjs (para gerar os áudios na Azure).
   Cada frase final vira um arquivo audio/<hash>.mp3; se o texto mudar, o hash muda e o áudio é refeito. */

const VOZ={nome:'pt-BR-FranciscaNeural',rate:'+5%',pitch:'+3%',calma:{rate:'+0%',pitch:'+0%'}};

const ROTEIRO={
  boasVindas:['Oi, {nome}! Que bom te ver. Bora cuidar de você hoje?','{nome}, chegou a sua hora. {vamosJuntas}','Oi, {nome}! Hoje o treino é leve no começo e forte no final. Vamos lá?'],
  boasVindasSemNome:['Oi! Que bom te ver. Bora cuidar de você hoje?','Chegou a sua hora. {vamosJuntas}','Oi! Hoje o treino é leve no começo e forte no final. Vamos lá?'],
  primeiro:['Vamos começar aquecendo o corpo. Primeiro: {ex}.','Respira fundo e solta. Começamos com {ex}.'],
  primeiroYoga:['Vamos começar com calma. Primeira postura: {ex}.'],
  inicio:['{ex}. Vamos lá, vai!','Agora é {ex}. No seu ritmo, com capricho.','Sua vez: {ex}. Bora!'],
  depoisDeAprender:['Agora é com você: {ex}. Vai!','Sua vez! {ex}, no seu ritmo.'],
  aprender:['Vamos aprender: {ex}.'],
  descanso:['Descansa. Respira fundo. O próximo é {ex}.','Boa! Pausa para recuperar. Depois vem {ex}.','Isso! Bebe uma água se precisar. Já já tem {ex}.'],
  proximaPostura:['Próxima postura: {ex}.'],
  calma:['Muito bem! Agora vamos desacelerar com carinho. Próximo: {ex}.'],
  fimRodada:['Rodada completa! Faltam {n} rodadas.','Mais uma rodada no bolso. Você está indo muito bem.'],
  penultimaRodada:['Última rodada chegando. Guarda energia para ela!'],
  fim:['Treino concluído, {nome}! Você apareceu para você hoje, e isso muda tudo.','Acabou! Que orgulho. Agora é água, comida boa e descanso.','Mais um dia cuidando de você. Amanhã tem mais!'],
  fimSemNome:['Treino concluído! Você apareceu para você hoje, e isso muda tudo.','Acabou! Que orgulho. Agora é água, comida boa e descanso.','Mais um dia cuidando de você. Amanhã tem mais!'],
  nivel:['Parabéns, {nome}! Você chegou ao nível {n}. Seu corpo está ficando mais forte.','Nível {n}! Os próximos treinos vão ficar um pouco mais desafiadores, {pronta}.'],
  nivelSemNome:['Parabéns! Você chegou ao nível {n}. Seu corpo está ficando mais forte.','Nível {n}! Os próximos treinos vão ficar um pouco mais desafiadores, {pronta}.'],
  trocaLado:['Troca de lado!'],
  pausa:['Pausa feita. Respira, eu te espero.'],
  volta:['Bora voltar? Vamos lá!'],
  teste:['Oi! Essa vai ser a minha voz nos seus treinos. Bora começar?'],
  incentivo:{
    forca:['Metade! Mantém a postura, está lindo.','Cada repetição conta. Continua!','Seu corpo está ficando mais forte agora.','Falta pouco. Capricha nessas últimas!','Desce com controle, sobe com força.'],
    luta:['Mãos na guarda!','Gira o quadril, a força vem daí.','Solta o golpe e volta rápido.','Solta o ar a cada golpe!','Mais forte, você consegue!'],
    aero:['Isso, no ritmo!','Solta o corpo e sorri!','Não para agora, está quase!','Que energia boa!','Mexe esse corpo!'],
    yoga:['Respira fundo... e solta devagar.','Solta os ombros, relaxa o rosto.','Sinta o alongamento, sem dor.','Cada respiração te leva um pouquinho mais longe.','Fica aí, com calma. Você está indo muito bem.'],
  },
};
// Palavras que mudam conforme a forma de tratamento escolhida (f, m ou neutro)
const TRATAMENTO={
  f:{vamosJuntas:'Vamos juntas nessa?',pronta:'e você está pronta'},
  m:{vamosJuntas:'Vamos juntos nessa?',pronta:'e você está pronto'},
  n:{vamosJuntas:'Vamos nessa?',pronta:'e o seu corpo já está preparado'},
};
// Categorias faladas em tom calmo
const CALMAS=new Set(['aprender','explica','primeiroYoga','proximaPostura','calma']);

function fala(tpl,vars={}){
  const tr=TRATAMENTO[vars.trat||'n']||TRATAMENTO.n;
  return tpl.replace(/\{(\w+)\}/g,(m,k)=>k in vars?String(vars[k]):(k in tr?tr[k]:m)).replace(/\s+/g,' ').trim();
}
// Explicação falada de um movimento, a partir de COMO (teach.js)
function explicacao(a){
  const c=typeof COMO!=='undefined'&&COMO[a];if(!c) return null;
  return [c[0],c[1],'Atenção: '+c[2]];
}
// Hash curto e estável do texto (FNV-1a 32 bits) para nomear o arquivo de áudio
function hashFala(t){let h=0x811c9dc5;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}return h.toString(36);}

// Todas as frases possíveis (usado pelo gerador de áudios)
function todasAsFalas(nome){
  const out=new Map(),add=(t,cat)=>{t=fala(t);if(t&&!t.includes('{')) out.set(t,CALMAS.has(cat)?'calma':'animada');};
  const nomes=new Set();
  Object.values(FAM).forEach(F=>F.v.forEach(v=>nomes.add(v.n)));
  Object.values(YOGA).forEach(it=>nomes.add(it.n));
  Object.values(WARM).forEach(l=>l.forEach(it=>nomes.add(it.n)));
  COOL.forEach(it=>nomes.add(it.n));
  const N=a=>[...new Set(a.map(it=>it.n))];
  const yoga=N(Object.values(YOGA)),warm=N(Object.values(WARM).flat()),cool=N(COOL),todos=[...nomes];
  const dom={primeiro:warm,primeiroYoga:yoga,proximaPostura:yoga,calma:cool,descanso:todos,inicio:todos,depoisDeAprender:todos,aprender:todos};
  for(const trat of ['f','m','n']){
    const base={trat};
    const each=(cat,list,extra=[{}])=>list.forEach(t=>extra.forEach(e=>add(fala(t,{...base,...e}),cat)));
    Object.entries(dom).forEach(([cat,names])=>each(cat,ROTEIRO[cat],names.map(ex=>({ex}))));
    if(nome){each('boasVindas',ROTEIRO.boasVindas,[{nome}]);each('fim',ROTEIRO.fim,[{nome}]);}
    each('boasVindas',ROTEIRO.boasVindasSemNome);each('fim',ROTEIRO.fimSemNome);
    each('fimRodada',ROTEIRO.fimRodada,[2,3,4,5,6,7].map(n=>({n})));
    each('penultimaRodada',ROTEIRO.penultimaRodada);
    const niveis=Array.from({length:29},(_,i)=>({n:i+2}));
    if(nome) each('nivel',ROTEIRO.nivel,niveis.map(x=>({...x,nome})));
    each('nivel',ROTEIRO.nivelSemNome,niveis);
    ['trocaLado','pausa','volta','teste'].forEach(c=>each(c,ROTEIRO[c]));
    Object.values(ROTEIRO.incentivo).forEach(l=>each('incentivo',l));
  }
  Object.keys(COMO).forEach(a=>explicacao(a).forEach(t=>add(t,'explica')));
  if(typeof AULA!=='undefined'){Object.values(AULA).forEach(l=>l.forEach(p=>add(p.fala,'explica')));add(AULA_FIM,'explica');}
  return out; // Map texto -> estilo
}
if(typeof module!=='undefined') module.exports={VOZ,ROTEIRO,fala,hashFala,todasAsFalas,explicacao,CALMAS};
