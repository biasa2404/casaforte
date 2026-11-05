'use strict';
/* Casa Forte: abas (Hoje, Plano, Movimentos, Progresso, Perfil), primeiro acesso, player, voz e progresso */

/* ---------- Estado salvo ---------- */
const KEY='casaforte.v1';
const PREFS0={dur:40,voice:true,musica:true,tier:'auto',tierMin:0,name:'',voiceName:'',explain:'first',guides:true,trat:'n',meta:4,onboarded:false};
let S={hist:[],xp:0,learned:{},prefs:{...PREFS0},quiz:null,plano:null,humor:{},troca:{}};
function carregar(o){
  S={hist:Array.isArray(o.hist)?o.hist:[],xp:+o.xp||0,learned:o.learned||{},prefs:{...PREFS0,...(o.prefs||{})},
     quiz:o.quiz||null,plano:o.plano||null,humor:o.humor||{},troca:o.troca||{}};
}
try{const raw=localStorage.getItem(KEY); if(raw) carregar(JSON.parse(raw));}catch(e){}
// planos antigos punham uma yoga opcional no domingo, que parecia um dia a mais: refaz com as mesmas respostas
try{if(S.quiz&&S.plano&&Object.keys(S.plano.opc||{}).length){S.plano=gerarPlano(S.quiz);localStorage.setItem(KEY,JSON.stringify(S));}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const hoje=()=>ymd(new Date());
const level=xp=>1+Math.floor(xp/XP_LVL);
const autoTier=l=>l>=10?2:(l>=5?1:0);
const baseTier=()=>S.prefs.tier==='auto'?Math.max(S.prefs.tierMin|0,autoTier(level(S.xp))):+S.prefs.tier;
const needLearn=a=>S.prefs.explain==='always'||(S.prefs.explain==='first'&&(S.learned[a]||0)<2&&!!COMO[a]);
let gravados=new Set(); // áudios gravados disponíveis (audio/manifest.json)
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* Plano da semana: o gerado pelas respostas, ou o antigo (um treino por dia) para quem já usava */
function semana(){
  if(S.plano&&S.plano.semana) return S.plano;
  return {semana:{0:0,1:1,2:2,3:3,4:4,5:5,6:6},opc:{0:true},porque:['Este é o plano padrão. Responda às perguntas no Perfil para montar um plano do seu jeito.']};
}
function planoDoDia(d){ // d = Date
  const k=ymd(d);
  if(S.troca[k]!=null) return S.troca[k]==='descanso'?null:+S.troca[k];
  const w=semana().semana[d.getDay()];
  return w==null?null:+w;
}
const opcional=d=>!!semana().opc[d.getDay()]&&S.troca[ymd(d)]==null;
const treinou=k=>S.hist.some(h=>h.day===k);
function streak(){
  // conta treinos seguidos; dias de descanso do plano e dias doente não quebram a sequência
  let d=new Date(),n=0;
  if(!treinou(ymd(d))) d.setDate(d.getDate()-1);
  for(let i=0;i<200;i++){
    const k=ymd(d);
    if(treinou(k)) n++;
    else if(!(planoDoDia(d)==null||opcional(d)||S.humor[k]===3)) break;
    d.setDate(d.getDate()-1);
  }
  return n;
}
function segunda(ref=new Date()){const m=new Date(ref);m.setHours(0,0,0,0);m.setDate(m.getDate()-((m.getDay()+6)%7));return m;}
function weekCount(){const mon=segunda().getTime();return new Set(S.hist.filter(h=>h.ts>=mon).map(h=>h.day)).size;}

/* ---------- Mapa do corpo ---------- */
function bodySVG(lv){
  const c=m=>'bm'+(lv[m]?' l'+lv[m]:'');
  return `<svg viewBox="0 0 200 212" role="img" aria-label="Partes do corpo trabalhadas">
  <g>
    <circle class="bm-base" cx="50" cy="16" r="11"/>
    <ellipse class="${c('ombros')}" cx="32" cy="40" rx="9" ry="7"/><ellipse class="${c('ombros')}" cx="68" cy="40" rx="9" ry="7"/>
    <rect class="${c('peito')}" x="36" y="36" width="13.5" height="22" rx="5"/><rect class="${c('peito')}" x="50.5" y="36" width="13.5" height="22" rx="5"/>
    <ellipse class="${c('biceps')}" cx="26" cy="62" rx="5.5" ry="13"/><ellipse class="${c('biceps')}" cx="74" cy="62" rx="5.5" ry="13"/>
    <ellipse class="bm-base" cx="23" cy="88" rx="4.5" ry="12"/><ellipse class="bm-base" cx="77" cy="88" rx="4.5" ry="12"/>
    <rect class="${c('abdomen')}" x="39" y="60" width="22" height="34" rx="6"/>
    <path class="bm-base" d="M38 96h24l-2 10H40z"/>
    <ellipse class="${c('quadriceps')}" cx="42" cy="130" rx="8.5" ry="23"/><ellipse class="${c('quadriceps')}" cx="58" cy="130" rx="8.5" ry="23"/>
    <ellipse class="bm-base" cx="42.5" cy="176" rx="5.5" ry="18"/><ellipse class="bm-base" cx="57.5" cy="176" rx="5.5" ry="18"/>
  </g>
  <g>
    <circle class="bm-base" cx="150" cy="16" r="11"/>
    <ellipse class="${c('ombros')}" cx="132" cy="40" rx="9" ry="7"/><ellipse class="${c('ombros')}" cx="168" cy="40" rx="9" ry="7"/>
    <path class="${c('costas')}" d="M136 34h28l-3 38h-22z"/>
    <ellipse class="${c('triceps')}" cx="126" cy="62" rx="5.5" ry="13"/><ellipse class="${c('triceps')}" cx="174" cy="62" rx="5.5" ry="13"/>
    <ellipse class="bm-base" cx="123" cy="88" rx="4.5" ry="12"/><ellipse class="bm-base" cx="177" cy="88" rx="4.5" ry="12"/>
    <rect class="${c('lombar')}" x="140" y="74" width="20" height="20" rx="5"/>
    <ellipse class="${c('gluteos')}" cx="143" cy="105" rx="8.5" ry="10"/><ellipse class="${c('gluteos')}" cx="157" cy="105" rx="8.5" ry="10"/>
    <ellipse class="${c('posteriores')}" cx="142" cy="136" rx="7.5" ry="19"/><ellipse class="${c('posteriores')}" cx="158" cy="136" rx="7.5" ry="19"/>
    <ellipse class="${c('panturrilhas')}" cx="142.5" cy="174" rx="5.5" ry="16"/><ellipse class="${c('panturrilhas')}" cx="157.5" cy="174" rx="5.5" ry="16"/>
  </g>
  <text x="50" y="208" text-anchor="middle" font-size="10" fill="var(--muted)">Frente</text>
  <text x="150" y="208" text-anchor="middle" font-size="10" fill="var(--muted)">Costas</text>
  </svg>`;
}

/* ---------- Abas ---------- */
let aba='hoje';
function irPara(t,opt={}){
  aba=t;
  document.querySelectorAll('.view').forEach(v=>v.hidden=v.id!=='v-'+t);
  document.querySelectorAll('.tab').forEach(b=>{const on=b.dataset.tab===t||(t==='treino'&&b.dataset.tab===(sel&&sel.origem||'hoje'));b.classList.toggle('on',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current');});
  render();
  if(!opt.keepScroll) window.scrollTo(0,0);
}
function render(){
  if(aba==='hoje') renderHoje();
  else if(aba==='treino') renderTreino();
  else if(aba==='plano') renderPlano();
  else if(aba==='mov') renderMov();
  else if(aba==='prog') renderProg();
  else if(aba==='perfil') renderPerfil();
}

/* ---------- Hoje ---------- */
const HUMOR=[['Com energia'],['Cansaço leve'],['Muito cansaço ou dor muscular']];
function greeting(){
  const h=new Date().getHours(),nm=S.prefs.name.trim();
  const hi=(h<12?'Bom dia':(h<18?'Boa tarde':'Boa noite'))+(nm?', '+nm:'')+'!';
  const st=streak(),n=S.hist.length,feito=treinou(hoje());
  let txt;
  if(feito) txt='Treino de hoje feito. Agora é descansar, comer bem e se orgulhar.';
  else if(!n) txt='Hoje é o primeiro passo. A Sophie ensina cada movimento com calma antes de você fazer.';
  else if(st>=2) txt=`São ${st} treinos em sequência. Bora manter?`;
  else txt='Que bom te ver. O melhor treino é o que cabe no seu dia.';
  return [hi,txt];
}
function proximoLivre(de){
  // primeiro dia desta semana, depois de hoje, sem treino marcado
  const fim=segunda();fim.setDate(fim.getDate()+6);
  const d=new Date(de);d.setDate(d.getDate()+1);
  while(d<=fim){if(planoDoDia(d)==null||opcional(d)) return new Date(d);d.setDate(d.getDate()+1);}
  return null;
}
/* O que fazer hoje, já considerando a disposição */
function opcaoHoje(){
  const now=new Date(),k=ymd(now),p=planoDoDia(now),h=S.humor[k]??0,t=baseTier(),dur=S.prefs.dur;
  if(h===3) return {tipo:'doente'};
  if(p==null) return {tipo:'descanso'};
  if(h===2&&PLANS[p].flow==null){const livre=proximoLivre(now);return {tipo:'troca',plan:0,tier:0,dur:Math.min(dur,25),original:p,livre};}
  if(h===2) return {tipo:'leve',plan:p,tier:0,dur:Math.min(dur,25)};
  if(h===1) return {tipo:'leve',plan:p,tier:Math.max(0,t-1),dur:Math.max(20,dur-10)};
  return {tipo:'normal',plan:p,tier:t,dur};
}
function renderHoje(){
  const now=new Date(),k=ymd(now);
  const [hi,txt]=greeting();$('hello').textContent=hi;$('helloLine').textContent=txt;
  $('todayDate').textContent=DAYS_L[now.getDay()].replace(/^./,c=>c.toUpperCase())+', '+now.toLocaleDateString('pt-BR',{day:'numeric',month:'long'});
  const st=streak();$('streakPill').hidden=st<1;
  $('streakPill').innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-3 2-4 2-7 2 1 3 3 3 5"/></svg>${st} em sequência`;
  // faixa da semana
  const mon=segunda();
  $('wkStrip').innerHTML=[0,1,2,3,4,5,6].map(i=>{const d=new Date(mon);d.setDate(mon.getDate()+i);const kk=ymd(d),p=planoDoDia(d);
    const cls=treinou(kk)?'done':(kk===k?'today':(kk<k?'past':(p!=null&&!opcional(d)?'plan':'rest')));
    const nome=p!=null?PLANS[p].tipo:'Descanso';
    return `<button class="wd ${cls}" data-dia="${kk}" aria-label="${DAYS_L[d.getDay()]}: ${esc(nome)}${treinou(kk)?', feito':''}"><span>${DAYS[d.getDay()][0]}</span><b>${d.getDate()}</b></button>`;}).join('');
  // disposição
  const feito=treinou(k),p=planoDoDia(now),h=S.humor[k]??0;
  $('checkin').hidden=feito||p==null&&h!==3;
  $('moods').innerHTML=HUMOR.map(([l],i)=>`<button class="mood" data-humor="${i}" aria-pressed="${h===i}">${l}</button>`).join('');
  $('sickBtn').textContent=h===3?'Na verdade, estou bem':'Estou com febre, dor forte ou doente';
  // cartão principal
  const o=opcaoHoje(),c=$('todayCard');
  if(feito){
    const ult=S.hist.filter(x=>x.day===k).pop();
    c.className='hero done';
    c.innerHTML=`<span class="eyebrow">Hoje</span><h2>Treino feito!</h2><p>${esc(ult.nome)}, ${ult.min} min. Hidrate-se e descanse bem.</p><button class="herobtn" data-tab="prog">Ver meu progresso</button>`;
  } else if(o.tipo==='doente'){
    c.className='hero calm';
    c.innerHTML=`<span class="eyebrow">Hoje é descanso</span><h2>Cuide de você primeiro</h2><p>Com febre, dor forte ou doença, o melhor é descansar e, se precisar, procurar atendimento. O plano espera, e a sua sequência não é perdida por isso.</p>`;
  } else if(o.tipo==='descanso'){
    c.className='hero calm';
    c.innerHTML=`<span class="eyebrow">Hoje é descanso</span><h2>Descansar também é treino</h2><p>É no descanso que o músculo se recupera. Se quiser se mexer, faça uma yoga leve de 25 minutos.</p><button class="herobtn ghost" data-abrir="0" data-dur="25">Ver a yoga leve</button>`;
  } else {
    const P=PLANS[o.plan],steps=build(o.plan,o.tier,o.dur,{learn:needLearn}),tt=Math.round(total(steps)/60);
    const works=steps.filter(s=>s.k==='work').length,R=P.flow?0:works/P.ex.length,learns=new Set(steps.filter(s=>s.k==='learn').map(s=>s.it.a)).size;
    const tags=[`${tt} min`];
    if(P.flow) tags.push(`${TP[o.tier].hold}s em cada postura`); else if(P.mt||P.coreo) tags.push(TIERS[o.tier]); else tags.push(`${R} rodadas`,TIERS[o.tier]);
    if(learns) tags.push(learns>1?`${learns} aulas de movimento novo`:'1 aula de movimento novo');
    const eyebrow={normal:'Treino de hoje',leve:'Treino de hoje, versão leve',troca:'Troca sugerida para hoje'}[o.tipo];
    let txt;
    if(o.tipo==='leve') txt=`O mesmo treino com menos tempo${o.tier<baseTier()?' e variações mais simples':''}. Ainda conta para a sua semana.`;
    else if(o.tipo==='troca') txt=`Hoje o corpo pede recuperação. ${esc(PLANS[o.original].nome)} fica para outro dia.`;
    else if(P.mt){const Rr=Math.max(...steps.map(x=>x.R||0));txt=`Aquecimento com corda, técnica de ${P.ex.length} golpes e ${Rr} rounds de sequências de golpes.`;}
    else if(P.coreo){const Rr=Math.max(...steps.map(x=>x.R||0));txt=`Coreografia ${steps.coreo.n}: ${steps.coreo.b.length} passos, primeiro um por um e depois tudo junto ${Rr} vezes, com batida de ${steps.coreo.bpm} BPM.`;}
    else txt=P.flow?'Posturas com respiração, no seu tempo.':`Aquecimento, ${P.ex.length} movimentos em ${R} rodadas e alongamento no final.`;
    c.className='hero '+o.tipo;
    c.innerHTML=`<span class="eyebrow">${eyebrow}</span><h2>${esc(P.nome)}</h2><p>${txt}</p><div class="herotags">${tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`+
      `<button class="herobtn" data-abrir="${o.plan}" data-tier="${o.tier}" data-dur="${o.dur}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor"/></svg>Começar treino</button>`+
      (o.tipo==='troca'&&o.livre?`<button class="herobtn ghost" data-remarcar="${o.original}" data-para="${ymd(o.livre)}">Passar ${esc(PLANS[o.original].tipo.toLowerCase())} para ${DAYS_L[o.livre.getDay()]}</button>`:'');
  }
  // amanhã
  const am=new Date(now);am.setDate(am.getDate()+1);const pa=planoDoDia(am);
  $('nextRow').innerHTML=`<span><small>Amanhã</small><b>${pa!=null?esc(PLANS[pa].nome)+(opcional(am)?' (opcional)':''):'Descanso'}</b></span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`;
  $('nextRow').dataset.tab='plano';
  // cuidados
  const cu=((S.quiz&&S.quiz.cuidado)||[]).filter(x=>CUIDADO_TXT[x]);
  $('cuidadoNote').hidden=!cu.length;
  $('cuidadoNote').innerHTML=cu.length?'<h2 class="h2s">Atenção ao que você marcou</h2><ul>'+cu.map(x=>`<li>${esc(CUIDADO_TXT[x])}</li>`).join('')+'</ul>':'';
}

/* ---------- Detalhe do treino ---------- */
let sel=null,trItems=[]; // {plan,tier,dur,origem}
function abrirTreino(plan,o={}){
  sel={plan:+plan,tier:o.tier!=null&&o.tier!==''?+o.tier:baseTier(),dur:o.dur?+o.dur:S.prefs.dur,origem:o.origem&&o.origem!=='treino'?o.origem:'hoje',coreo:o.coreo!=null&&o.coreo!==''?+o.coreo:null};
  irPara('treino');
}
function renderTreino(){
  if(!sel) return irPara('hoje');
  const P=PLANS[sel.plan],steps=build(sel.plan,sel.tier,sel.dur,{learn:needLearn,coreo:sel.coreo}),tt=Math.round(total(steps)/60);
  $('trName').textContent=P.nome;
  const works=steps.filter(s=>s.k==='work').length,R=P.flow?0:works/P.ex.length;
  $('trTags').innerHTML=[`${tt} min`,P.tipo,TIERS[sel.tier],'Sem equipamento'].map(t=>`<span class="tag">${esc(t)}</span>`).join('');
  const r=P.flow||P.mt||P.coreo?null:(P.ex.map(f=>ritmoDe(resolve(f,sel.tier).a,sel.tier)).find(Boolean));
  $('trRitmo').hidden=!r&&!P.mt&&!P.coreo;
  if(r) $('trRitmo').innerHTML=`Ritmo de hoje: <b>${esc(r.txt)}</b>. A Sophie faz nesse tempo para você acompanhar.`;
  else if(P.mt) $('trRitmo').innerHTML='Como numa aula de Muay Thai: <b>aquecimento, técnica e sequência de golpes</b> em rounds. A voz fala cada sequência e a boneca faz junto.';
  else if(P.coreo) $('trRitmo').innerHTML=`Coreografia <b>${esc(steps.coreo.n)}</b>, com música própria a <b>${steps.coreo.bpm} batidas por minuto</b>. Prefere sua playlist? Desligue a música no treino e procure músicas com cerca de ${steps.coreo.bpm} BPM no Spotify.`;
  if(!P.coreo){const m=musicaDoPasso(sel.plan,steps.find(x=>x.k==='work')||steps[0]),MT={forca:'batida firme e constante, para manter o ritmo das repetições',luta:'percussão de luta, para dar energia nos rounds',calma:'acordes calmos, sem batida, para respirar e soltar o corpo'};
    if(m&&MT[m.estilo]){$('trRitmo').hidden=false;$('trRitmo').innerHTML=($('trRitmo').innerHTML&&r||P.mt?$('trRitmo').innerHTML+'<br>':'')+`Música própria do treino: <b>${MT[m.estilo]}</b>. Dá para desligar no botão Música.`;}}
  $('durChips').innerHTML=[20,30,40,50].map(d=>`<button class="chip" data-trdur="${d}" aria-pressed="${sel.dur===d}">${d} min</button>`).join('');
  // blocos
  const learnSet=new Set(steps.filter(s=>s.k==='learn').map(s=>s.it.a));
  const linha=(it,d)=>{const i=trItems.push(it)-1;return `<button class="exrow" data-tri="${i}"><span class="exic" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="4.5" r="2"/><path d="M12 7v7M12 10l-5 3M12 10l5-3M12 14l-4 7M12 14l4 7"/></svg></span><span class="exnm"><b>${esc(it.n)}</b><small>${esc(d)}</small></span>${learnSet.has(it.a)&&!it.combo&&!semAula?'<span class="badge-aula">Aula antes</span>':''}${MOCAP[it.a]?'<span class="badge-real">Real</span>':''}</button>`;};
  trItems=[];let semAula=false;
  let html='';
  if(P.flow){
    const hold=TP[sel.tier].hold;
    html+=`<section class="block"><div class="bhead"><h2 class="h2s">Sequência de posturas</h2><span class="muted small">${hold}s em cada uma</span></div><div class="blist">${P.flow.map(k=>linha(YOGA[k],YOGA[k].tip)).join('')}</div></section>`;
  } else if(P.mt||P.coreo){
    const fases=[];steps.forEach(st=>{if(!st.fase||!st.it||st.k==='learn') return;let f=fases.find(x=>x.n===st.fase);if(!f){f={n:st.fase,itens:[],s:0,R:0};fases.push(f);}f.s+=st.s;f.R=Math.max(f.R,st.R||0);if(!f.itens.some(x=>x.it.n===st.it.n)) f.itens.push({it:st.it,s:st.s});});
    fases.forEach(f=>{
      semAula=f.n==='Coreografia completa';
      const info=f.R?`${f.R} ${P.mt?'rounds':'vezes'} · ${Math.round(f.s/60)} min`:`${Math.max(1,Math.round(f.s/60))} min`;
      html+=`<section class="block"><div class="bhead"><h2 class="h2s">${esc(f.n)}</h2><span class="muted small">${info}</span></div><div class="blist">${f.itens.map(({it,s:sx})=>linha(it,it.combo?it.g||it.tip:(f.n==='Técnica'?`${sx} s praticando · ${it.tip}`:it.tip))).join('')}</div></section>`;
    });
  } else {
    const tp=TP[sel.tier],warm=WARM[P.warm];
    const wS=steps.filter(s=>s.k==='warm').reduce((a,s)=>a+s.s,0),cS=steps.filter(s=>s.k==='cool').reduce((a,s)=>a+s.s,0);
    html+=`<section class="block"><div class="bhead"><h2 class="h2s">Aquecimento</h2><span class="muted small">${Math.round(wS/60)} min</span></div><div class="blist">${warm.map(it=>linha(it,it.tip)).join('')}</div></section>`;
    html+=`<section class="block"><div class="bhead"><h2 class="h2s">Parte principal</h2><span class="muted small">${R} rodadas</span></div><div class="blist">${P.ex.map(f=>{const it=resolve(f,sel.tier);return linha(it,`${tp.w} s, descanso ${tp.r} s${it.sw?' · troque de lado na metade':''}`);}).join('')}</div></section>`;
    html+=`<section class="block"><div class="bhead"><h2 class="h2s">Volta à calma</h2><span class="muted small">${Math.round(cS/60)} min</span></div><div class="blist">${COOL.map(it=>linha(it,it.tip)).join('')}</div></section>`;
  }
  $('trBlocks').innerHTML=html;
  // mapa do corpo
  const items=P.flow?P.flow.map(k=>YOGA[k]):P.ex.map(f=>resolve(f,sel.tier)),w={};
  items.forEach(it=>it.m.forEach((m,i)=>{w[m]=(w[m]||0)+(i===0?2:1)}));
  const lvMap={};Object.entries(w).forEach(([m,x])=>lvMap[m]=x>=3?2:1);
  $('bodyMap').innerHTML=bodySVG(lvMap);
  $('focusList').innerHTML=Object.entries(w).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([m])=>`<li><span class="dot l${lvMap[m]}"></span><span>${MUS[m]}${lvMap[m]===2?' <small class="muted">principal</small>':''}</span></li>`).join('');
  $('trVoice').setAttribute('aria-pressed',S.prefs.voice);
  preCarregar(items.map(it=>it.a));
}
$('trBack').onclick=()=>irPara(sel&&sel.origem&&sel.origem!=='treino'?sel.origem:'hoje');
$('trVoice').onclick=()=>{S.prefs.voice=!S.prefs.voice;save();$('trVoice').setAttribute('aria-pressed',S.prefs.voice);syncBtns();};

/* ---------- Plano ---------- */
function renderPlano(){
  const pl=semana(),mon=segunda(),k=hoje();
  const n=Object.keys(pl.semana).filter(d=>pl.semana[d]!=null&&!pl.opc[d]).length;
  $('plSub').textContent=`${n} treinos de ${S.prefs.dur} min por semana`+(Object.keys(pl.opc).length?' e 1 leve opcional':'');
  const cor={'Força':'forca','Muay Thai':'luta','Yoga':'yoga','Dança e cardio':'aero','Recuperação':'yoga'};
  $('planList').innerHTML=[0,1,2,3,4,5,6].map(i=>{const d=new Date(mon);d.setDate(mon.getDate()+i);const kk=ymd(d),p=planoDoDia(d),feito=treinou(kk);
    const st=feito?'Feito':(kk===k?'Hoje':(S.troca[kk]!=null?'Remarcado':''));
    const sub=p==null?'Caminhada leve, se quiser':`${PLANS[p].tipo}${opcional(d)?', opcional':''}`;
    return `<button class="pday${kk===k?' today':''}${p==null?' rest':''}" ${p!=null?`data-abrir="${p}"`:'disabled'}><span class="pdate"><small>${DAYS[d.getDay()].toUpperCase()}</small><b>${d.getDate()}</b></span><span class="pbar ${p==null?'desc':cor[PLANS[p].tipo]||'forca'}"></span><span class="pnm"><b>${p==null?'Descanso':esc(PLANS[p].nome)}</b><small>${esc(sub)}</small></span><span class="pst${feito?' ok':''}">${st}</span></button>`;}).join('');
  $('planWhy').innerHTML=pl.porque.map(t=>`<li>${esc(t)}</li>`).join('');
  // todas as aulas, para fazer fora do plano
  const cor2={'Força':'forca','Muay Thai':'luta','Yoga':'yoga','Dança e cardio':'aero','Recuperação':'yoga'};
  const ic=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`;
  const linha=(attrs,nome,sub,tipo)=>`<button class="pday" ${attrs}><span class="pbar ${cor2[tipo]||'forca'}"></span><span class="pnm"><b>${esc(nome)}</b><small>${esc(sub)}</small></span>${ic}</button>`;
  const grupos=[['Força',[1,3,5]],['Muay Thai',[2]],['Yoga e alongamento',[4,0]]];
  let h=grupos.map(([g,ps])=>`<h3 class="aulah">${g}</h3><div class="planlist">${ps.map(p=>linha(`data-abrir="${p}"`,PLANS[p].nome,PLANS[p].flow?'Posturas com respiração':(PLANS[p].mt?'Aquecimento, técnica e sequências de golpes':PLANS[p].ex.length+' movimentos'),PLANS[p].tipo)).join('')}</div>`).join('');
  const sem=coreoDaSemana();
  h+=`<h3 class="aulah">Dança aeróbica: coreografias</h3><div class="planlist">${COREOS.map((c,i)=>linha(`data-abrir="6" data-coreo="${i}"`,'Coreografia '+c.n+(c===sem?' (da semana)':''),`${c.bpm} BPM · ${c.b.map(k=>PASSO[k].n).slice(0,3).join(', ')}…`,'Dança e cardio')).join('')}</div>`;
  $('aulasList').innerHTML=h;
}

/* ---------- Movimentos ---------- */
const CATS=[['forca','Força'],['luta','Muay Thai'],['yoga','Yoga e alongamento'],['aero','Aeróbico e dança']];
let movCat='forca',movItems=[];
function catalogo(){
  if(catalogo.c) return catalogo.c;
  const vistos=new Set(),out=[];
  const push=(it,k)=>{const id=it.n;if(vistos.has(id)||!AN[it.a]) return;vistos.add(id);out.push({...it,cat:k});};
  for(const f in FAM){const F=FAM[f];if(F.k==='reserva') continue;F.v.forEach((x,t)=>push(resolve(f,t),F.k==='forca'?'forca':F.k));}
  Object.values(WARM).flat().forEach(it=>push(it,it.k==='luta'?'luta':'aero'));
  [...COOL,...Object.values(YOGA)].forEach(it=>push(it,'yoga'));
  return catalogo.c=out;
}
function renderMov(){
  $('movCats').innerHTML=CATS.map(([k,l])=>`<button class="chip" data-cat="${k}" aria-pressed="${movCat===k}">${l}</button>`).join('');
  const q=$('movBusca').value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const norm=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  movItems=catalogo().filter(it=>q?norm(it.n).includes(q):it.cat===movCat);
  movItems.sort((a,b)=>(MOCAP[b.a]?1:0)-(MOCAP[a.a]?1:0));
  $('movGrid').innerHTML=movItems.length?movItems.map((it,i)=>`<button class="movcard" data-mvi="${i}"><b>${esc(it.n)}</b><small>${esc(it.m.map(m=>MUS[m]).slice(0,2).join(' · ')||'Relaxamento')}</small>${MOCAP[it.a]?'<span class="badge-real">Movimento real</span>':''}</button>`).join(''):'<p class="muted">Nenhum movimento com esse nome.</p>';
}
$('movBusca').addEventListener('input',renderMov);
const VIDS=[
  ['Muay Thai em casa para iniciantes','Base, guarda e primeiros golpes','muay thai em casa iniciante treino'],
  ['Yoga para iniciantes','Sequências de 20 a 30 minutos','yoga para iniciantes em casa'],
  ['Alongamento completo','Para fazer depois do treino','alongamento completo pós treino'],
  ['Dança aeróbica em casa','Aulas para suar dançando','aula de dança aeróbica em casa'],
  ['Treino de glúteos sem equipamento','Força para pernas e glúteos','treino de glúteos em casa sem equipamento'],
  ['Hipertrofia sem equipamento','O que a ciência diz sobre treinar em casa','hipertrofia em casa sem equipamento ciência explicação'],
];
$('vids').innerHTML=VIDS.map(([t,s,q])=>`<a href="${yt(q)}" target="_blank" rel="noopener">${esc(t)}<small>${esc(s)}</small></a>`).join('');

/* ---------- Progresso ---------- */
function renderProg(){
  const now=new Date(),lv=level(S.xp),mes=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  const noMes=S.hist.filter(h=>h.day.startsWith(mes)).length;
  const mon=segunda().getTime(),forcaSem=new Set(S.hist.filter(h=>h.ts>=mon&&PLANS[h.plan]&&PLANS[h.plan].tipo==='Força').map(h=>h.day)).size;
  $('progTiles').innerHTML=[[noMes,'treinos no mês'],[streak(),'treinos em sequência'],[`${forcaSem}/2`,'dias de força nesta semana'],[S.hist.reduce((a,h)=>a+h.min,0),'minutos no total']].map(([v,l])=>`<div class="tile"><b>${v}</b><span>${l}</span></div>`).join('');
  // minutos por semana (8 semanas)
  const sem=[];for(let i=7;i>=0;i--){const a=segunda();a.setDate(a.getDate()-7*i);const b=new Date(a);b.setDate(a.getDate()+7);
    sem.push({l:i?a.toLocaleDateString('pt-BR',{day:'numeric',month:'numeric'}):'esta',m:S.hist.filter(h=>h.ts>=a.getTime()&&h.ts<b.getTime()).reduce((x,h)=>x+h.min,0)});}
  const top=Math.max(200,...sem.map(s=>s.m));
  $('chart').innerHTML=`<div class="bars" role="img" aria-label="Minutos por semana: ${sem.map(s=>s.l+' '+s.m).join(', ')}"><i class="meta" style="bottom:${150/top*100}%"></i>${sem.map((s,i)=>`<span class="bar${i===7?' cur':''}" style="height:${Math.max(2,s.m/top*100)}%" title="${s.m} min"></span>`).join('')}</div><div class="blabels">${sem.map(s=>`<span>${s.l}</span>`).join('')}</div>`;
  $('lvlNum').textContent=lv;$('tierName').textContent=`Nível ${lv} · ${TIERS[autoTier(lv)]}`;
  const into=S.xp%XP_LVL;$('xpFill').style.width=(into/XP_LVL*100)+'%';
  $('xpText').textContent=`${into} de ${XP_LVL} pontos para o nível ${lv+1}`+(lv<5?'. Intermediário no nível 5':(lv<10?'. Avançado no nível 10':''));
  const doneDays=new Set(S.hist.map(h=>h.day)),start=segunda();start.setDate(start.getDate()-28);
  let html=['S','T','Q','Q','S','S','D'].map(x=>`<div class="h">${x}</div>`).join('');
  for(let i=0;i<35;i++){const dt=new Date(start);dt.setDate(start.getDate()+i);const kk=ymd(dt);
    html+=`<div class="c${doneDays.has(kk)?' on':''}${kk===ymd(now)?' td':''}${dt>now?' fut':''}" title="${dt.toLocaleDateString('pt-BR')}">${dt.getDate()}</div>`;}
  $('cal').innerHTML=html;
  const hum=['Com energia','Cansaço leve','Muito cansaço'];
  $('hist').innerHTML=S.hist.length?S.hist.slice(-6).reverse().map(h=>`<li><span><b>${esc(h.nome)}</b><small>${new Date(h.ts).toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit'})} · ${h.min} min</small></span><span>${S.humor[h.day]!=null&&hum[S.humor[h.day]]?hum[S.humor[h.day]]:'+'+h.xp+' pontos'}</span></li>`).join(''):'<li class="empty">Seu primeiro treino aparece aqui assim que você terminar.</li>';
}

/* ---------- Perfil ---------- */
const TRATS=[['f','No feminino'],['m','No masculino'],['n','De forma neutra']];
function renderPerfil(){
  const nm=S.prefs.name.trim();
  $('pfName').textContent=nm||'Você';$('pfAvatar').textContent=(nm||'C')[0].toUpperCase();
  const lv=level(S.xp),primeiro=S.hist[0];
  $('pfSub').textContent=`Nível ${lv} · ${TIERS[autoTier(lv)]}`+(primeiro?` · treinando desde ${new Date(primeiro.ts).toLocaleDateString('pt-BR',{month:'long',year:'numeric'})}`:'');
  const q=S.quiz;
  $('objChips').innerHTML=q?[
    ...q.obj.map(v=>[NOME_OP('obj',v),1]),[`${diasEscolhidos(q).map(d=>DAYS[d]).join(', ')} · ${S.prefs.dur} min`,0],[q.gosta.map(v=>NOME_OP('gosta',v)).join(', '),0],
    [q.cuidado.includes('nada')||!q.cuidado.length?'Sem restrições':'Cuidado: '+q.cuidado.map(v=>NOME_OP('cuidado',v)).join(', '),0]
  ].filter(x=>x[0]).map(([t,a])=>`<span class="chip${a?' on':''}">${esc(t)}</span>`).join(''):'<span class="muted small">Você ainda não respondeu às perguntas.</span>';
  $('redoQuiz').textContent=q?'Refazer as perguntas':'Responder às perguntas';
  $('pDur').innerHTML=[20,30,40,50].map(d=>`<button class="chip" data-pdur="${d}" aria-pressed="${S.prefs.dur===d}">${d} min</button>`).join('');
  $('tierChips').innerHTML=[['auto','Automática'],['0','Iniciante'],['1','Intermediário'],['2','Avançado']].map(([k,l])=>`<button class="chip" data-tier="${k}" aria-pressed="${String(S.prefs.tier)===k}">${l}</button>`).join('');
  $('explainChips').innerHTML=[['first','Nas primeiras vezes'],['always','Sempre'],['never','Nunca']].map(([k,l])=>`<button class="chip" data-explain="${k}" aria-pressed="${S.prefs.explain===k}">${l}</button>`).join('');
  if(document.activeElement!==$('nameIn')) $('nameIn').value=S.prefs.name;
  $('tratChips').innerHTML=TRATS.map(([k,l])=>`<button class="chip" data-trat="${k}" aria-pressed="${S.prefs.trat===k}">${l}</button>`).join('');
  $('voiceToggle').setAttribute('aria-checked',S.prefs.voice);
}
$('nameIn').addEventListener('input',e=>{S.prefs.name=e.target.value.slice(0,30);save();const nm=S.prefs.name.trim();$('pfName').textContent=nm||'Você';$('pfAvatar').textContent=(nm||'C')[0].toUpperCase();});
$('voiceToggle').onclick=()=>{S.prefs.voice=!S.prefs.voice;save();renderPerfil();syncBtns();};
$('voiceTest').onclick=()=>{unlockAudio();sayQ([nmLine('boasVindas'),line('teste')],true);};
$('redoQuiz').onclick=()=>abrirQuiz(1);
function resetHandler(){
  $('resetBox').innerHTML='<div class="chips"><button class="btn2" id="rsNo">Cancelar</button><button class="btn2 danger" id="rsYes">Apagar tudo</button></div>';
  const restore=()=>{$('resetBox').innerHTML='<button class="btn2 danger" id="resetBtn">Apagar</button>';$('resetBtn').onclick=resetHandler;};
  $('rsNo').onclick=restore;
  $('rsYes').onclick=()=>{S.hist=[];S.xp=0;S.learned={};S.humor={};S.troca={};save();restore();render();};
}
$('resetBtn').onclick=resetHandler;
/* Cópia de segurança em arquivo */
$('bkSave').onclick=()=>{
  const blob=new Blob([JSON.stringify({app:'casa-forte',versao:1,salvoEm:new Date().toISOString(),dados:S},null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`casa-forte-copia-${hoje()}.json`;document.body.append(a);a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
  $('bkMsg').textContent='Cópia salva na pasta de downloads.';
};
$('bkLoad').onclick=()=>$('bkFile').click();
$('bkFile').onchange=async e=>{
  const f=e.target.files[0];e.target.value='';if(!f) return;
  try{
    const o=JSON.parse(await f.text()),d=o&&o.app==='casa-forte'?o.dados:o;
    if(!d||!Array.isArray(d.hist)) throw 0;
    $('bkMsg').innerHTML=`Esta cópia tem ${d.hist.length} treinos${o.salvoEm?' e foi salva em '+new Date(o.salvoEm).toLocaleDateString('pt-BR'):''}. Ela vai substituir o que está neste aparelho. <span class="btnrow"><button class="btn2" id="bkNo">Cancelar</button><button class="btn2 danger" id="bkYes">Restaurar</button></span>`;
    $('bkNo').onclick=()=>{$('bkMsg').textContent='';};
    $('bkYes').onclick=()=>{carregar(d);save();$('bkMsg').textContent='Pronto, seus dados foram restaurados.';render();};
  }catch(err){$('bkMsg').textContent='Não consegui ler esse arquivo. Escolha uma cópia salva pelo Casa Forte.';}
};

/* ---------- Primeiro acesso: boas-vindas e perguntas ---------- */
let qz=null; // {passo, resp}
function abrirQuiz(passo=0,opt={}){
  qz={passo,resp:JSON.parse(JSON.stringify(S.quiz||QUIZ_PADRAO)),nome:S.prefs.name,trat:S.prefs.trat,so:opt.so};
  if(!S.quiz) Object.keys(qz.resp).forEach(k=>qz.resp[k]=[]);
  else if(!qz.resp.dsem) qz.resp.dsem=diasEscolhidos(qz.resp).map(String);
  $('onb').hidden=false;document.body.style.overflow='hidden';renderQuiz();
}
const NQ=QUIZ.length; // passos: 0 boas-vindas, 1 nome, 2..NQ+1 perguntas, NQ+2 resultado
function renderQuiz(manter){
  const p=qz.passo,o=$('onb'),y=o.scrollTop;
  if(p===0){
    o.className='onb hero-onb';
    o.innerHTML=`<div class="onbin"><div class="brand inv"><svg viewBox="0 0 40 40" aria-hidden="true"><rect x="2" y="2" width="36" height="36" rx="9" fill="#fff"/><circle cx="20" cy="11" r="4" fill="var(--accent)"/><path d="M20 15v11M20 18l-8 4M20 18l8-6M20 26l-6 8M20 26l7 8" stroke="var(--accent)" stroke-width="3.2" stroke-linecap="round" fill="none"/></svg><span class="brandname">Casa Forte</span></div>
      <img class="onbimg" src="assets/img/aula-agachamento.png" alt="Personagem 3D fazendo o agachamento, com a colinha do ângulo do joelho">
      <h1>Treine em casa aprendendo cada movimento</h1>
      <ol class="passos"><li>Responda algumas perguntas sobre você</li><li>Receba um plano para a sua semana</li><li>Veja a aula em câmera lenta e treine no ritmo certo</li></ol>
      <button class="go inv" id="qNext">Começar</button><p class="small center">Seus dados ficam só neste aparelho. Leva uns 2 minutos.</p></div>`;
  } else if(p===1){
    o.className='onb';
    o.innerHTML=qHead(p)+`<h1>Como podemos chamar você?</h1><p class="muted">A voz usa esse nome para falar com você durante o treino.</p>
      <input id="qNome" class="field big" type="text" maxlength="30" placeholder="Seu nome ou apelido" autocomplete="nickname" value="${esc(qz.nome)}">
      <h2 class="h2s" style="margin-top:12px">Como prefere que a voz fale com você?</h2>
      <div class="qops">${TRATS.map(([k,l])=>`<button class="qop" data-qtrat="${k}" aria-pressed="${qz.trat===k}"><span>${l}</span><i></i></button>`).join('')}</div>`+qFoot(true);
    $('qNome').oninput=e=>qz.nome=e.target.value.slice(0,30);
  } else if(p<=NQ+1){
    const Q=QUIZ[p-2],cur=qz.resp[Q.id]||[];
    o.className='onb';
    o.innerHTML=qHead(p)+`<h1>${esc(Q.titulo)}</h1><p class="muted">${esc(Q.dica)}</p>
      <div class="qops">${Q.op.map(([k,l])=>`<button class="qop" data-qop="${k}" aria-pressed="${cur.includes(k)}"><span>${esc(l)}</span><i></i></button>`).join('')}</div>`+(Q.min&&cur.length&&cur.length<Q.min?`<p class="muted small">Escolha pelo menos ${Q.min}.</p>`:'')+qFoot(cur.length>=(Q.min||1));
  } else {
    const pl=gerarPlano(qz.resp);
    o.className='onb';
    o.innerHTML=qHead(p)+`<h1>Seu plano está pronto</h1><p class="muted">Dá para mudar quando quiser, na aba Perfil.</p>
      <div class="planlist small">${[1,2,3,4,5,6,0].map(d=>{const x=pl.semana[d];return `<div class="pday${x==null?' rest':''}"><span class="pdate"><small>${DAYS[d].toUpperCase()}</small></span><span class="pnm"><b>${x==null?'Descanso':esc(PLANS[x].nome)}</b><small>${x==null?'':esc(PLANS[x].tipo)+(pl.opc[d]?', opcional':'')}</small></span></div>`;}).join('')}</div>
      <ul class="why">${pl.porque.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>`+
      `<div class="qfoot"><button class="go" id="qFim">Ver meu dia</button></div></div>`;
  }
  const nx=$('qNext');if(nx) nx.onclick=()=>{if(nx.disabled) return;qz.passo=qz.so?NQ+2:qz.passo+1;renderQuiz();};
  const bk=$('qBack');if(bk) bk.onclick=()=>{if((qz.passo<=1||qz.so)&&S.prefs.onboarded){fecharQuiz();return;}qz.passo=Math.max(0,qz.passo-1);renderQuiz();};
  const fim=$('qFim');if(fim) fim.onclick=concluirQuiz;
  if(manter){o.scrollTop=y;return;}
  const foco=o.querySelector('h1');foco&&foco.setAttribute('tabindex','-1');foco&&foco.focus({preventScroll:true});o.scrollTop=0;
}
function qHead(p){const tot=NQ+2;return `<div class="onbin"><div class="qtop"><button class="back" id="qBack" aria-label="Voltar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><span class="muted small">${p<=NQ+1?`Passo ${p} de ${NQ+1}`:'Pronto'}</span><span style="width:44px"></span></div><div class="qbar"><i style="width:${Math.min(100,p/tot*100)}%"></i></div>`;}
function qFoot(ok){return `<div class="qfoot"><button class="go" id="qNext"${ok?'':' disabled'}>Continuar</button></div></div>`;}
function fecharQuiz(){$('onb').hidden=true;document.body.style.overflow='';qz=null;}
function concluirQuiz(){
  const r=qz.resp;
  S.quiz=r;S.plano=gerarPlano(r);
  S.prefs.name=qz.nome.trim().slice(0,30);S.prefs.trat=qz.trat;
  S.prefs.dur=+r.tempo[0]||40;S.prefs.meta=diasEscolhidos(r).length;r.dias=[String(S.prefs.meta)];
  S.prefs.tierMin=r.exp[0]==='2'?1:0;
  if(!S.prefs.onboarded){S.prefs.onboarded=true;unlockAudio();setTimeout(()=>say(nmLine('boasVindas')),300);}
  save();fecharQuiz();irPara('hoje');
}
$('onb').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||!qz) return;
  if(b.dataset.qtrat){qz.trat=b.dataset.qtrat;renderQuiz(1);}
  else if(b.dataset.qop){
    const Q=QUIZ[qz.passo-2],v=b.dataset.qop;let cur=(qz.resp[Q.id]||[]).slice();
    if(Q.max===1) cur=[v];
    else if(cur.includes(v)) cur=cur.filter(x=>x!==v);
    else{
      if(Q.id==='cuidado') cur=v==='nada'?['nada']:cur.filter(x=>x!=='nada');
      cur.push(v);if(cur.length>Q.max) cur.shift();
      if(Q.id==='cuidado'&&v==='nada') cur=['nada'];
    }
    qz.resp[Q.id]=cur;renderQuiz(1);
  }
});

/* ---------- Cliques gerais ---------- */
document.addEventListener('click',e=>{
  const t=e.target.closest('button'); if(!t||t.closest('#onb')) return;
  const d=t.dataset;
  if(d.tab){irPara(d.tab);}
  else if(d.abrir!=null){abrirTreino(d.abrir,{tier:d.tier,dur:d.dur,origem:aba,coreo:d.coreo});}
  else if(d.mudardias!=null){abrirQuiz(2+QUIZ.findIndex(q=>q.id==='dsem'),{so:1});}
  else if(d.humor!=null){const k=hoje();S.humor[k]=+d.humor;save();renderHoje();}
  else if(d.remarcar!=null){S.troca[d.para]=+d.remarcar;save();renderHoje();}
  else if(d.trdur){sel.dur=+d.trdur;renderTreino();}
  else if(d.tri!=null){openPreview(trItems[+d.tri]);}
  else if(d.mvi!=null){openPreview(movItems[+d.mvi]);}
  else if(d.cat){movCat=d.cat;$('movBusca').value='';renderMov();}
  else if(d.pdur){S.prefs.dur=+d.pdur;save();renderPerfil();}
  else if(d.tier){S.prefs.tier=d.tier;save();renderPerfil();}
  else if(d.explain){S.prefs.explain=d.explain;save();renderPerfil();}
  else if(d.trat){S.prefs.trat=d.trat;save();renderPerfil();}
  else if(d.dia){const dt=new Date(d.dia+'T12:00');const p=planoDoDia(dt);if(p!=null) abrirTreino(p,{origem:'hoje'});}
  else if(d.ver){verMov(d.ver);}
});
$('sickBtn').onclick=()=>{const k=hoje();S.humor[k]=S.humor[k]===3?0:3;save();renderHoje();};
/* ---------- Palco (3D com reserva em 2D) ---------- */
function makeStage(canvas,overlay,opt){
  if(HAS3D){try{return new Stage(canvas,overlay,opt);}catch(e){}}
  return {an:null,key2:null,guides:false,setAnim(an,k){this.an=an;this.key2=k;},frame(ms){if(this.an) drawFig(canvas,this.an,ms);},applyColors(){}};
}
let plStage=null,pvStage=null;

/* ---------- Prévia / Como fazer ---------- */
let pvItem=null,pvT0=0;
function howHTML(it){
  const c=como(it.a);let h=c?`<ol class="how"><li><b>Posição inicial</b>${esc(c[0])}</li><li><b>Movimento</b>${esc(c[1])}</li><li><b>Atenção</b>${esc(c[2])}</li></ol>`:`<p>${esc(it.tip)}</p>`;
  // explicação completa: os passos da aula em câmera lenta, por escrito
  const A=AULA[it.a];
  if(A&&A.length) h+=`<details class="full"><summary>Explicação completa, passo a passo</summary><ol class="steps">${A.map(x=>`<li><b>${esc(x.cola)}</b> ${esc(x.fala)}</li>`).join('')}</ol></details>`;
  if(it.combo&&it.g) h=`<p><b>Sequência:</b> ${esc(it.g)}.</p>`+h;
  return h;
}
function openPreview(it){
  pvItem=it;pvT0=performance.now();
  $('pvName').textContent=it.n;$('pvMus').textContent=it.m.map(m=>MUS[m]).join(' · ')||'Relaxamento';
  $('pvHow').innerHTML=howHTML(it);$('pvVideo').href=yt(it.q);
  $('preview').hidden=false;
  if(!pvStage) pvStage=makeStage($('pvCanvas'),$('pvOverlay'),{yaw:0.5});
  pvStage.guides=S.prefs.guides;pvStage.applyColors();pvStage.setAnim(AN[it.a],it.a);
  $('pvClose').focus();
}
function closePreview(){$('preview').hidden=true;pvItem=null;pararFala();pararAulaPv();}
let pvAula=null,pvLast=0;
function pararAulaPv(){if(pvAula){pvAula.parar();pvAula=null;}$('pvListen').textContent='Aula em câmera lenta';}
$('pvClose').onclick=closePreview;
$('pvListen').onclick=()=>{
  unlockAudio();if(!pvItem) return;
  if(pvAula){pararFala();pararAulaPv();pvT0=performance.now();return;}
  pvAula=new Aula(pvStage,pvItem.a,AN[pvItem.a],(l,cb)=>sayQ(l,true,cb),true);pvAula.intro=line('aprender',{ex:pvItem.n});
  pvLast=performance.now();$('pvListen').textContent='Parar aula';
};
$('preview').addEventListener('click',e=>{if(e.target.id==='preview') closePreview();});

/* ---------- Voz e som ---------- */
let actx=null,voice=null,voices=[];
const hasTTS='speechSynthesis' in window;
function scoreVoice(v){
  let s=0;const n=v.name||'';
  if(/pt[-_]BR/i.test(v.lang)) s+=50; else if(/^pt/i.test(v.lang)) s+=20; else return -1;
  if(/natural|neural|online|premium|enhanced|aprimorad/i.test(n)) s+=40;
  if(/google/i.test(n)) s+=25;
  if(/francisca|thalita|luciana|leila|camila|vit[oó]ria|fernanda|antonio|ant[oô]nio|donato|brenda|elza|giovanna|yara/i.test(n)) s+=8;
  if(!v.localService) s+=4;
  return s;
}
function loadVoices(){
  if(!hasTTS) return;
  voices=speechSynthesis.getVoices().filter(v=>scoreVoice(v)>=0).sort((a,b)=>scoreVoice(b)-scoreVoice(a));
  voice=voices.find(v=>v.name===S.prefs.voiceName)||voices[0]||null;
  const sel=$('voiceSel');
  if(voices.length){
    sel.innerHTML=voices.map(v=>`<option value="${esc(v.name)}"${voice&&v.name===voice.name?' selected':''}>${esc(v.name.replace(/Microsoft |Google /,''))}${scoreVoice(v)>=90?' · natural':''}</option>`).join('');
    sel.disabled=false;
  } else {sel.innerHTML='<option>Nenhuma voz em português encontrada</option>';sel.disabled=true;}
  const best=voices[0]&&scoreVoice(voices[0])>=90;
  if(gravados.size){syncVoiceInfo();return;}
  $('voiceInfo').textContent=best?'Encontramos uma voz natural neste aparelho.':'Para uma voz mais humana, abra o site no Microsoft Edge (vozes Francisca e Thalita “Natural”) ou no Google Chrome.';
}
if(hasTTS){loadVoices();try{speechSynthesis.addEventListener('voiceschanged',loadVoices);}catch(e){}setTimeout(loadVoices,800);}
else {$('voiceInfo').textContent='Este navegador não tem voz. Os bipes de contagem continuam funcionando.';$('voiceSel').disabled=true;}
$('voiceSel').onchange=e=>{S.prefs.voiceName=e.target.value;save();loadVoices();unlockAudio();say(line('teste'),true);};
function utter(t){const u=new SpeechSynthesisUtterance(t);u.lang='pt-BR';if(voice)u.voice=voice;u.rate=voice&&scoreVoice(voice)>=90?1.0:0.98;u.pitch=1.0;return u;}
/* Áudios gravados (gerados na Azure por tools/gerar-audios.mjs); sem áudio, usa a voz do navegador */
fetch('audio/manifest.json').then(r=>r.ok?r.json():{arquivos:[]}).then(m=>{gravados=new Set(m.arquivos||[]);syncVoiceInfo();}).catch(()=>{});
const audioEl=new Audio();audioEl.preload='auto';
let falaJob=0;
function pararFala(){falaJob++;try{audioEl.pause();}catch(e){}try{hasTTS&&speechSynthesis.cancel()}catch(e){}}
function tts(t,done){if(!hasTTS){done();return;}try{const u=utter(t);u.onend=done;u.onerror=done;speechSynthesis.speak(u);}catch(e){done();}}
function sayQ(list,force,done){
  if(!S.prefs.voice&&!force){done&&done();return;}
  pararFala();const job=falaJob;
  Batida.fala(true);const fim=done;done=()=>{if(job===falaJob) Batida.fala(false);fim&&fim();};
  const next=i=>{
    if(job!==falaJob) return;
    if(i>=list.length){done&&done();return;}
    const t=list[i],h=hashFala(t),go=()=>next(i+1);
    if(gravados.has(h)){
      audioEl.onended=go;audioEl.onerror=()=>{if(job===falaJob)tts(t,go);};
      audioEl.src='audio/'+h+'.mp3';audioEl.play().catch(()=>{if(job===falaJob)tts(t,go);});
    } else tts(t,go);
  };
  next(0);
}
const say=(t,force)=>sayQ([t],force);
const line=(cat,vars={})=>fala(pick(ROTEIRO[cat]),{trat:S.prefs.trat,...vars});
const nmLine=(cat,vars={})=>{const nm=S.prefs.name.trim();return nm?line(cat,{nome:nm,...vars}):line(cat+'SemNome',vars);};
function syncVoiceInfo(){if(gravados.size) $('voiceInfo').textContent='Voz gravada ativa. A voz do navegador só entra se faltar algum áudio.';}
function unlockAudio(){try{if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==='suspended') actx.resume();}catch(e){}}
function beep(f=880,d=.12,vol=.16){
  if(!actx) return; try{const t=actx.currentTime,o=actx.createOscillator(),g=actx.createGain();
  o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+d+.02);}catch(e){}
}
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- Player ---------- */
let P=null,wake=null;
async function keepAwake(){try{wake=await navigator.wakeLock?.request('screen');}catch(e){wake=null;}}
function startWorkout(){
  unlockAudio();
  const tier=sel.tier,steps=build(sel.plan,tier,sel.dur,{learn:needLearn,coreo:sel.coreo});
  preCarregar(steps.map(x=>(x.it||x.nx||{}).a).filter(Boolean));
  P={steps,i:0,rem:steps[0].s*1000,run:true,last:performance.now(),lastSec:null,anim0:performance.now(),day:sel.plan,tier,doneMs:0,frozen:null,showHow:false};
  $('player').hidden=false;$('quitBox').hidden=true;document.body.style.overflow='hidden';
  if(!plStage) plStage=makeStage($('plCanvas'),$('plOverlay'),{yaw:0.5});
  plStage.applyColors();
  keepAwake();enterStep(true);
}
$('startBtn').onclick=startWorkout;
const cur=()=>P.steps[P.i];
function setHow(show){
  P.showHow=show;const s=cur(),it=s.it||s.nx;
  $('plHow').hidden=!show||!it;$('plHow').innerHTML=it?howHTML(it)+'<button class="btn2" id="plAula">Ver a aula em câmera lenta</button>':'';
  const b=$('plAula');if(b) b.onclick=()=>{if(P.run) setPause(false);openPreview(it);};
  const d=$('plHow').querySelector('details');if(d) d.open=true;
  $('howBtn').setAttribute('aria-pressed',show);
}
function enterStep(announce){
  const s=cur();P.rem=s.s*1000;P.lastSec=null;P.anim0=performance.now();P.frozen=null;
  if(P.aula){P.aula.parar();P.aula=null;}
  const it=s.it||s.nx,isRest=!s.it,isLearn=s.k==='learn';
  const rit=s.k==='work'&&s.it&&!s.it.seq?ritmoDe(s.it.a,P.tier):null;
  if(it){if(it.seq&&!isRest) plStage.setSeq(it.seq,AN[it.a]||AN.danceMarch);else plStage.setAnim(rit?ritmoAnim(AN[it.a],it.a,P.tier):AN[it.a],it.a);}
  // batida própria nas coreografias
  const bpm=s.it&&s.it.danca&&s.k==='work'?s.it.bpm:0;
  tocarMusica();
  plStage.tempo=rit;
  $('plTempo').hidden=!rit&&!bpm;$('plTempo').textContent=rit?'Ritmo: '+rit.txt:(bpm?`Música: ${bpm} batidas por minuto`:'');
  $('plMusic').hidden=false;
  plStage.guides=S.prefs.guides&&(isLearn||s.k==='work'||isRest);
  $('plLabel').textContent=s.label;
  $('plBadge').textContent=s.k==='prep'?'Prepare-se':(isLearn?'Aprenda':(isRest?(s.soft?'Próxima postura':'Descanso'):(s.k==='warm'?'Aquecimento':(s.k==='cool'?'Volta à calma':'Agora é com você'))));
  $('plBadge').className='badge'+(isRest?' rest':(isLearn?' learn':''));
  $('plRing').className='ring'+(isRest?' rest':(isLearn?' learn':''));
  $('plName').textContent=isRest?(it?'Próximo: '+it.n:'Descanso'):s.it.n;
  $('plTip').textContent=it?it.tip:'';
  $('plMus').innerHTML=it?it.m.map(m=>`<span class="tag">${MUS[m]}</span>`).join(''):'';
  $('plVideo').href=yt(it?it.q:'treino em casa');
  const nx=P.steps.slice(P.i+1).find(x=>x.it&&x.k!=='learn');
  $('plNext').innerHTML=isLearn?'Assista e imite junto, sem pressa. Depois é a sua vez.':(isRest?'Respire e beba água se precisar.':(nx?'Depois: <b>'+esc(nx.it.n)+'</b>':'Último exercício!'));
  setHow(isLearn||P.showHow&&!isRest);
  if(!announce) return;
  const ex=it?it.n:'';
  if(s.k==='prep') sayQ([nmLine('boasVindas'),line(PLANS[P.day].flow?'primeiroYoga':'primeiro',{ex})]);
  else if(isLearn){
    P.aula=new Aula(plStage,s.it.a,AN[s.it.a],(l,cb)=>sayQ(l,false,cb),S.prefs.voice);
    if(P.aula.done){P.aula=null;const c=explicacao(s.it.a);sayQ([line('aprender',{ex:s.it.n}),...(c||[s.it.tip])]);}
    else P.aula.intro=line('aprender',{ex:s.it.n});
  }
  else if(isRest){
    if(s.round) sayQ([s.R-s.r===1?line('penultimaRodada'):line('fimRodada',{n:s.R-s.r}),line('descanso',{ex})]);
    else if(s.soft) say(line('proximaPostura',{ex}));
    else if(s.label==='Volta à calma') say(line('calma',{ex}));
    else say(line('descanso',{ex}));
  } else if(s.it&&s.it.seq){
    if(s.it.combo) say(s.seguido?s.it.n+'!':line('inicio',{ex:'a sequência '+s.it.n,seg:s.s}));
    else say(s.seguido?'Agora, '+s.it.n+'!':line('inicio',{ex:s.it.n,seg:s.s}));
  } else {
    const learnedBefore=P.steps[P.i-1]&&P.steps[P.i-1].k==='learn';
    const l1=learnedBefore?line('depoisDeAprender',{ex:s.it.n}):line('inicio',{ex:s.it.n,seg:s.s});
    // explica o ritmo na primeira vez que ele aparece no treino
    if(rit&&!P.ritmoDito){P.ritmoDito=true;sayQ([l1,RITMO_FALA[Math.max(0,Math.min(2,P.tier|0))]]);}
    else say(l1);
  }
}
function go(delta){
  const ni=P.i+delta; if(ni<0) return;
  const s=cur();
  if(delta>0&&s.k==='work'&&s.it){S.learned[s.it.a]=(S.learned[s.it.a]||0)+(P.rem<s.s*500?1:0);}
  if(ni>=P.steps.length){finish(true);return;}
  P.i=ni;enterStep(true);
}
function tick(now){
  if(P&&!$('player').hidden){
    const dt=Math.min(250,now-P.last);P.last=now;
    const s=cur();
    const emAula=P.aula&&!P.aula.done;
    if(P.run&&emAula){P.aulaMs=P.aula.update(dt);}
    else if(P.run){
      P.rem-=dt;P.doneMs+=dt;
      const sec=Math.ceil(P.rem/1000);
      if(sec!==P.lastSec){
        P.lastSec=sec;
        if(sec<=3&&sec>=1&&s.k!=='learn'&&!(s.it&&s.it.seq)) beep(sec===1?990:780,.11);
        if(s.it&&s.k==='work'&&s.s>=30&&!s.it.seq){
          if(sec===Math.floor(s.s/2)) say(s.it.sw?line('trocaLado'):pick(ROTEIRO.incentivo[s.it.k]||ROTEIRO.incentivo.forca));
          else if(sec===10&&!s.it.sw) say(pick(ROTEIRO.incentivo[s.it.k]||ROTEIRO.incentivo.forca));
        }
      }
      if(P.rem<=0){beep(1320,.22,.2);go(1);if(!P){requestAnimationFrame(tick);return;}}
    }
    const st=cur();
    if(!P.run&&P.frozen==null) P.frozen=now-P.anim0;
    const speed=st.k==='learn'?0.7:1;
    if(P.aula) plStage.frame(P.aula.done&&P.run?P.aula.update(dt):(P.aulaMs||0));
    else plStage.frame(P.run?(now-P.anim0)*speed:(P.frozen||0)*speed);
    const frac=Math.max(0,P.rem)/(st.s*1000);
    $('plArc').style.strokeDashoffset=String(326.7*(1-frac));
    $('plTime').style.fontSize=emAula?'60%':'';$('plTime').textContent=emAula?'Aula':st.s>=60||P.rem>59000?mmss(P.rem/1000):Math.max(0,Math.ceil(P.rem/1000));
    const tt=total(P.steps)*1000,done=P.steps.slice(0,P.i).reduce((a,x)=>a+x.s*1000,0)+(st.s*1000-Math.max(0,P.rem));
    $('plProg').style.width=(done/tt*100)+'%';
    $('plTotal').textContent=mmss((tt-done)/1000)+' restantes';
  }
  if(pvItem&&!$('preview').hidden&&pvStage){
    if(pvAula){const dt=Math.min(100,now-pvLast);pvLast=now;pvStage.frame(pvAula.update(dt));if(pvAula.done&&pvAula.reps>=4){pararAulaPv();pvT0=now;}}
    else pvStage.frame(performance.now()-pvT0);
  }
  if(!$('done').hidden) confettiFrame(now);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
function setPause(run){
  P.run=run;P.last=performance.now();
  if(run){P.anim0=performance.now()-(P.frozen||0);P.frozen=null;}
  $('pauseBtn').setAttribute('aria-label',run?'Pausar':'Continuar');
  $('pauseIco').innerHTML=run?'<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>':'<path d="M7 4.5v15l13-7.5z" fill="currentColor"/>';
  if(!run){pararFala();Batida.stop();}
  else{tocarMusica();if(P.aula) P.aula.falou=true;}
}
$('pauseBtn').onclick=()=>{unlockAudio();setPause(!P.run);say(line(P.run?'volta':'pausa'));};
$('nextBtn').onclick=()=>go(1);
$('prevBtn').onclick=()=>{if(P.rem<(cur().s*1000-3000)) enterStep(true); else go(-1);};
$('plVoice').onclick=()=>{S.prefs.voice=!S.prefs.voice;save();syncBtns();if(!S.prefs.voice){pararFala();}};
$('guideBtn').onclick=()=>{S.prefs.guides=!S.prefs.guides;save();syncBtns();if(plStage)plStage.guides=S.prefs.guides;};
$('howBtn').onclick=()=>setHow(!P.showHow);
$('plMusic').onclick=()=>{S.prefs.musica=!S.prefs.musica;save();syncBtns();tocarMusica();};
/* Música própria do tipo de treino; na aula de um movimento ela fica bem baixinha */
function tocarMusica(){
  if(!P||!P.run||!S.prefs.musica){Batida.stop();return;}
  const m=musicaDoPasso(P.day,cur());if(!m){Batida.stop();return;}
  if(!Batida.on||Batida.bpm!==m.bpm||Batida.estilo!==m.estilo) Batida.start(actx,m.bpm,m.estilo);
}
function syncBtns(){
  $('plVoice').setAttribute('aria-pressed',S.prefs.voice);$('plVoice').setAttribute('aria-label',S.prefs.voice?'Desligar voz':'Ligar voz');
  $('guideBtn').setAttribute('aria-pressed',S.prefs.guides);
  $('plMusic').setAttribute('aria-pressed',S.prefs.musica);
}
syncBtns();
$('quitBtn').onclick=()=>{
  setPause(false);
  const pct=Math.round(P.doneMs/(total(P.steps)*1000)*100),keep=pct>=60;
  $('quitBox').hidden=false;
  $('quitBox').innerHTML=`<div class="confirm"><b>Quer parar por hoje?</b><span>${keep?`Você já fez ${pct}% do treino, então ele conta como concluído.`:`Você fez ${pct}% do treino. Abaixo de 60% ele não entra no histórico, mas o esforço valeu.`}</span><div><button class="btn2" id="qNo">Continuar treinando</button><button class="btn2 danger" id="qYes">Encerrar</button></div></div>`;
  $('qNo').onclick=()=>{$('quitBox').hidden=true;setPause(true);};
  $('qYes').onclick=()=>finish(keep);
};
const DONE_LINES=['Você apareceu para você hoje. Isso é o que transforma.','Mais forte que ontem. Hidrate-se e descanse bem.','Cada treino é um presente para o seu corpo.','Disciplina é carinho com o seu futuro.'];
function finish(record){
  const p=P;P=null;Batida.stop();
  try{wake&&wake.release();}catch(e){}
  $('player').hidden=true;document.body.style.overflow='';
  if(!record){pararFala(); render();return;}
  const min=Math.max(1,Math.round(p.doneMs/60000));
  const today=ymd(new Date()),firstToday=!S.hist.some(h=>h.day===today);
  const lvBefore=level(S.xp);
  S.hist.push({ts:Date.now(),day:today,plan:p.day,nome:PLANS[p.day].nome,min,tier:p.tier,xp:0});
  const st=streak(),gain=min*2+10+(firstToday?Math.min(st,7)*3:0);
  S.hist[S.hist.length-1].xp=gain;S.xp+=gain;save();
  const lv=level(S.xp),up=lv>lvBefore,nm=S.prefs.name.trim();
  $('dnTitle').textContent=up?'Subiu de nível!':(nm?`Mandou bem, ${nm}!`:'Mandou bem!');
  $('dnText').textContent=up?`Agora você está no nível ${lv}. ${autoTier(lv)>autoTier(lvBefore)?'Os exercícios vão ficar mais desafiadores, e seu corpo já está preparado para eles.':'Continue assim.'}`:pick(DONE_LINES);
  $('dnLvl').textContent=lv;$('dnTier').textContent=TIERS[autoTier(lv)];
  $('dnFill').style.width=((S.xp%XP_LVL)/XP_LVL*100)+'%';$('dnXp').textContent=`${S.xp%XP_LVL} de ${XP_LVL} pontos para o nível ${lv+1}`;
  $('dnMin').textContent=min;$('dnGain').textContent='+'+gain;$('dnStreak').textContent=st;
  $('done').hidden=false;startConfetti();
  say(up?nmLine('nivel',{n:lv}):nmLine('fim'));
}
$('dnBack').onclick=()=>{$('done').hidden=true;irPara('hoje');};

/* ---------- Confete ---------- */
let conf=[];
function startConfetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){conf=[];return;}
  const cs=getComputedStyle(document.documentElement),cols=[cs.getPropertyValue('--accent').trim(),cs.getPropertyValue('--warm').trim(),'#F2C14E','#6EA8FE'];
  conf=Array.from({length:120},()=>({x:Math.random(),y:-Math.random()*0.6,vx:(Math.random()-.5)*0.004,vy:0.003+Math.random()*0.005,r:Math.random()*6.28,vr:(Math.random()-.5)*0.2,c:pick(cols),s:5+Math.random()*6}));
}
function confettiFrame(){
  const c=$('confetti');if(!conf.length) return;
  const w=c.clientWidth,h=c.clientHeight,d=Math.min(2,devicePixelRatio||1);
  if(c.width!==w*d){c.width=w*d;c.height=h*d;}
  const ctx=c.getContext('2d');ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);
  conf.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;ctx.save();ctx.translate(p.x*w,p.y*h);ctx.rotate(p.r);ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);ctx.restore();});
  conf=conf.filter(p=>p.y<1.1);
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('preview').hidden) closePreview();
  if(P&&!$('player').hidden&&e.code==='Space'){e.preventDefault();$('pauseBtn').click();}
});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&P&&!wake) keepAwake();});
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{readCol();plStage&&plStage.applyColors();pvStage&&pvStage.applyColors();});}catch(e){}
/* Já começa a baixar o personagem e os movimentos do treino de hoje, para não esperar depois */
function preCarregar(keys){try{realLoad();keys.forEach(k=>{if(MOCAP[k]) realClip(k);});}catch(e){}}
setTimeout(()=>{const o=opcaoHoje();if(o.plan!=null){const P=PLANS[o.plan];preCarregar((P.flow?P.flow.map(k=>YOGA[k]):P.ex.map(f=>resolve(f,o.tier))).map(it=>it.a));}},600);
/* Link direto para ver um movimento: #ver=squat */
function verPorLink(){return verMov((location.hash.match(/^#ver=(\w+)/)||[])[1]);}
function verMov(k){
  if(!k||!AN[k]) return false;
  for(const f in FAM){const t=FAM[f].v.findIndex(x=>x.a===k);if(t>=0){openPreview(resolve(f,t));return true;}}
  const outros=[...Object.values(WARM).flat(),...COOL,...Object.values(YOGA)].find(x=>x.a===k);
  if(outros){openPreview(outros);return true;}
  return false;
}
irPara('hoje');
if(!verPorLink()&&!S.prefs.onboarded) abrirQuiz(0);
window.addEventListener('hashchange',verPorLink);
/* Instalar no celular e funcionar sem internet */
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol)){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
}
$('plName').onclick=()=>setHow(true);
