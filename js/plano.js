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
  {id:'dsem',titulo:'Em quais dias você vai treinar?',dica:'Escolha de 2 a 6 dias que cabem na sua rotina. A OMS recomenda exercícios de força em 2 dias ou mais por semana.',max:6,min:2,
    op:[['1','Segunda'],['2','Terça'],['3','Quarta'],['4','Quinta'],['5','Sexta'],['6','Sábado'],['0','Domingo']]},
  {id:'tempo',titulo:'Quanto tempo por treino?',dica:'Já inclui aquecimento e volta à calma.',max:1,
    op:[['20','20 min'],['30','30 min'],['40','40 min'],['50','50 min']]},
  {id:'gosta',titulo:'Do que você gosta?',dica:'Marque quantos quiser. Vamos misturar no plano.',max:6,
    op:[['forca','Força'],['luta','Muay Thai'],['yoga','Yoga'],['along','Alongamento'],['aero','Aeróbico'],['danca','Dança']]},
  {id:'cuidado',titulo:'Algo pede cuidado?',dica:'Em caso de dor, lesão ou gestação, converse com um profissional de saúde antes de começar.',max:6,
    op:[['joelho','Joelho'],['lombar','Lombar'],['ombro','Ombro'],['punho','Punho'],['gestacao','Gestação'],['nada','Nada disso']]},
];
const QUIZ_PADRAO={obj:['forca','disposicao'],exp:['0'],dsem:['1','2','4','6'],tempo:['40'],gosta:['forca','luta','yoga','danca'],cuidado:['nada']};
const NOME_OP=(id,v)=>{const q=QUIZ.find(x=>x.id===id);const o=q&&q.op.find(x=>x[0]===v);return o?o[1]:v;};

/* Dias da semana usados para cada quantidade de treinos (0 = domingo) */
const DIAS_POR_N={2:[1,4],3:[1,3,5],4:[1,2,4,6],5:[1,2,3,5,6]};

/* Dias escolhidos, em ordem de segunda a domingo (respostas antigas guardavam só a quantidade) */
function diasEscolhidos(q){
  let d=(q.dsem||[]).map(Number).filter(x=>x>=0&&x<=6);
  if(d.length<2){const n=Math.max(2,Math.min(5,+(q.dias||['4'])[0]||4));d=DIAS_POR_N[n].slice();}
  return [...new Set(d)].sort((a,b)=>((a+6)%7)-((b+6)%7));
}
/* Escolhe, entre os dias marcados, os de força mais espaçados entre si (semana em ciclo) */
function diasDeForca(dias,k){
  let best=null,bs=-1;
  const comb=(i,acc)=>{
    if(acc.length===k){const o=acc.map(d=>(d+6)%7).sort((a,b)=>a-b);let g=7;
      for(let x=0;x<o.length;x++){const nx=x+1<o.length?o[x+1]:o[0]+7;g=Math.min(g,nx-o[x]);}
      if(k===1) g=7; if(g>bs){bs=g;best=acc.slice();} return;}
    for(let j=i;j<dias.length;j++){acc.push(dias[j]);comb(j+1,acc);acc.pop();}
  };
  comb(0,[]);return {dias:best||dias.slice(0,k),gap:bs};
}
function gerarPlano(q){
  const dias=diasEscolhidos(q),n=dias.length,obj=q.obj||[],gosta=q.gosta||[];
  const porque=[];
  // quantos treinos de força
  let nForca=2;
  if(obj.includes('forca')&&n>=4) nForca=3;
  if(n>=6) nForca=3;
  if(n===2&&(obj.includes('luta')||(!obj.includes('forca')&&!gosta.includes('forca')))) nForca=1;
  const fz=diasDeForca(dias,nForca),forcaSet=new Set(fz.dias);
  // outros treinos, na ordem de preferência
  const outros=[];
  const add=p=>{if(!outros.includes(p)) outros.push(p);};
  if(obj.includes('luta')||gosta.includes('luta')) add(2);
  if(gosta.includes('aero')||gosta.includes('danca')||obj.includes('disposicao')) add(6);
  if(gosta.includes('yoga')||gosta.includes('along')||obj.includes('sono')||obj.includes('flex')) add(4);
  if(!outros.length) add(6),add(4);
  const forcaPl=[1,3,5],semana={};let a=0,b=0;
  [0,1,2,3,4,5,6].forEach(d=>semana[d]=null);
  dias.forEach(d=>{semana[d]=forcaSet.has(d)?forcaPl[a++%3]:outros[b++%outros.length];});
  // explicações em linguagem simples
  const NOMES=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
  porque.push(`Você treina ${n} dias: ${dias.map(d=>NOMES[d]).join(', ')}.`);
  if(nForca>=2) porque.push(fz.gap>=2?`Força em ${nForca} dias, como a OMS recomenda, sempre com um dia de intervalo entre eles para o músculo se recuperar.`
    :`Força em ${nForca} dias, como a OMS recomenda. Com os dias escolhidos, dois treinos de força ficam seguidos: eles trabalham partes diferentes do corpo, mas se puder, espace mais os dias.`);
  else porque.push('Com 2 dias por semana, um fica para a força e outro para o que você mais quer aprender. Se der, aumente para 3 dias e coloque mais um de força, que é o mínimo recomendado pela OMS.');
  const usados=new Set(Object.values(semana));
  if(usados.has(2)) porque.push('Muay Thai ensina técnica e ainda conta como exercício aeróbico.');
  if(usados.has(6)) porque.push('O dia de dança aeróbica ajuda o fôlego e a disposição.');
  if(usados.has(4)) porque.push('Yoga e alongamento trabalham mobilidade e ajudam a desacelerar.');
  const min=n*(+((q.tempo||['40'])[0])||40);
  if(min<150) porque.push(`São ${min} minutos de treino por semana. A OMS recomenda pelo menos 150 minutos de atividade moderada: caminhadas de 10 minutos ou mais nos outros dias completam a conta.`);
  porque.push('Nos dias livres, se quiser se mexer, a tela Hoje oferece uma yoga leve. Não é obrigatória.');
  return {semana,opc:{},porque};
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
