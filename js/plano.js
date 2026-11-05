'use strict';
/* Casa Forte: perguntas do primeiro acesso e montagem do plano da semana.
   Regras (ver doc de base científica):
   - OMS 2020: fortalecimento muscular em 2 dias ou mais por semana, e 150 min ou mais de atividade moderada.
   - Músculo precisa de recuperação: os treinos de força ficam separados por outro tipo de treino sempre que possível.
   - O nível inicial vem da experiência, mas só sobe com os treinos feitos (nada de pular etapas). */

const QUIZ=[
  {id:'obj',titulo:'O que você quer conquistar?',dica:'Escolha até 2. Isso define o tipo de treino que mais aparece no seu plano.',max:2,
    op:[['forca','Ganhar força e músculo'],['disposicao','Mais disposição no dia a dia'],['sono','Dormir e relaxar melhor'],['luta','Aprender Muay Thai'],['flex','Mais flexibilidade']]},
  {id:'exp',titulo:'Como está sua experiência com treino?',dica:'Sem julgamento: serve para escolher a variação e o ritmo certos.',max:1,
    op:[['0','Nunca treinei ou parei há muito tempo'],['1','Treino às vezes'],['2','Treino com frequência há meses']]},
  {id:'dias',titulo:'Quantos dias por semana dá para treinar?',dica:'Melhor um número que você consegue manter. A OMS recomenda exercícios de força em 2 dias ou mais.',max:1,
    op:[['2','2 dias'],['3','3 dias'],['4','4 dias'],['5','5 dias']]},
  {id:'tempo',titulo:'Quanto tempo por treino?',dica:'Já inclui aquecimento e volta à calma.',max:1,
    op:[['20','20 min'],['30','30 min'],['40','40 min'],['50','50 min']]},
  {id:'gosta',titulo:'Do que você gosta?',dica:'Marque quantos quiser. Vamos misturar no plano.',max:6,
    op:[['forca','Força'],['luta','Muay Thai'],['yoga','Yoga'],['along','Alongamento'],['aero','Aeróbico'],['danca','Dança']]},
  {id:'cuidado',titulo:'Algo pede cuidado?',dica:'Em caso de dor, lesão ou gestação, converse com um profissional de saúde antes de começar.',max:6,
    op:[['joelho','Joelho'],['lombar','Lombar'],['ombro','Ombro'],['punho','Punho'],['gestacao','Gestação'],['nada','Nada disso']]},
];
const QUIZ_PADRAO={obj:['forca','disposicao'],exp:['0'],dias:['4'],tempo:['40'],gosta:['forca','luta','yoga','danca'],cuidado:['nada']};
const NOME_OP=(id,v)=>{const q=QUIZ.find(x=>x.id===id);const o=q&&q.op.find(x=>x[0]===v);return o?o[1]:v;};

/* Dias da semana usados para cada quantidade de treinos (0 = domingo) */
const DIAS_POR_N={2:[1,4],3:[1,3,5],4:[1,2,4,6],5:[1,2,3,5,6]};

function gerarPlano(q){
  const n=Math.max(2,Math.min(5,+(q.dias||['4'])[0]||4)),obj=q.obj||[],gosta=q.gosta||[];
  const porque=[];
  // quantos treinos de força
  let nForca=2;
  if(obj.includes('forca')&&n>=4) nForca=3;
  if(n===2&&(obj.includes('luta')||(!obj.includes('forca')&&!gosta.includes('forca')))) nForca=1;
  const forca=[1,3,5].slice(0,nForca);
  // outros treinos, na ordem de preferência
  const outros=[];
  const add=p=>{if(!outros.includes(p)) outros.push(p);};
  if(obj.includes('luta')||gosta.includes('luta')) add(2);
  if(gosta.includes('aero')||gosta.includes('danca')||obj.includes('disposicao')) add(6);
  if(gosta.includes('yoga')||gosta.includes('along')||obj.includes('sono')||obj.includes('flex')) add(4);
  if(!outros.length) add(6),add(4);
  const nOutros=n-nForca,lista=[];
  for(let i=0;i<nOutros;i++) lista.push(outros[i%outros.length]);
  // intercala força e outros para dar tempo de recuperação
  const seq=[];let a=0,b=0;
  while(a<forca.length||b<lista.length){
    if(a<forca.length) seq.push(forca[a++]);
    if(b<lista.length) seq.push(lista[b++]);
  }
  const dias=DIAS_POR_N[n],semana={},opc={};
  [0,1,2,3,4,5,6].forEach(d=>semana[d]=null);
  dias.forEach((d,i)=>semana[d]=seq[i]);
  // domingo leve e opcional para quem quer relaxar ou alongar
  if(semana[0]==null&&(outros.includes(4)||obj.includes('sono'))){semana[0]=0;opc[0]=true;}
  // explicações em linguagem simples
  if(nForca>=2) porque.push(`Força em ${nForca} dias, como a OMS recomenda, com pelo menos um dia de intervalo entre eles para o músculo se recuperar.`);
  else porque.push('Com 2 dias por semana, um fica para a força e outro para o que você mais quer aprender. Se der, aumente para 3 dias e coloque mais um de força, que é o mínimo recomendado pela OMS.');
  if(lista.includes(2)) porque.push('Muay Thai ensina técnica e ainda conta como exercício aeróbico.');
  if(lista.includes(6)) porque.push('O dia de aeróbico e dança ajuda o fôlego e a disposição.');
  if(lista.includes(4)) porque.push('Yoga e alongamento trabalham mobilidade e ajudam a desacelerar.');
  if(opc[0]) porque.push('O domingo tem uma yoga leve opcional, para quando quiser se mexer sem cansar.');
  return {semana,opc,porque};
}

/* Partes do corpo que pedem cuidado e o que elas pesam em cada movimento */
const CUIDADO_MUS={joelho:['quadriceps'],lombar:['lombar'],ombro:['ombros'],punho:['peito','triceps']};
const CUIDADO_TXT={
  joelho:'Joelho: prefira a variação mais simples, desça só até onde não incomoda e pare se doer.',
  lombar:'Lombar: mantenha o abdômen firme e as costas retas. Se doer, troque por um movimento parecido sem dor.',
  ombro:'Ombro: braços só até a altura que não incomoda. Nada de forçar acima da cabeça se doer.',
  punho:'Punho: na flexão e na prancha, apoie nos punhos fechados ou nos antebraços se doer.',
  gestacao:'Gestação: o app ainda não adapta os treinos para a gestação. Antes de usar, converse com a equipe do seu pré-natal.',
};
