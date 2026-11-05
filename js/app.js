'use strict';
/* Casa Forte: telas, player, voz e progresso */

/* ---------- Estado salvo ---------- */
const KEY='casaforte.v1';
let S={hist:[],xp:0,learned:{},prefs:{dur:40,voice:true,tier:'auto',name:'',voiceName:'',explain:'first',guides:true}};
try{const raw=localStorage.getItem(KEY); if(raw){const o=JSON.parse(raw); S={...S,...o,learned:o.learned||{},prefs:{...S.prefs,...(o.prefs||{})}};}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const level=xp=>1+Math.floor(xp/XP_LVL);
const autoTier=l=>l>=10?2:(l>=5?1:0);
let energy=0; // -1 pouca, 0 normal, 1 muita (só para hoje)
const baseTier=()=>S.prefs.tier==='auto'?autoTier(level(S.xp)):+S.prefs.tier;
const curTier=()=>Math.max(0,Math.min(2,baseTier()+energy));
const needLearn=a=>S.prefs.explain==='always'||(S.prefs.explain==='first'&&(S.learned[a]||0)<2&&!!COMO[a]);
function streak(){
  const days=new Set(S.hist.map(h=>h.day)); let d=new Date(); let n=0;
  if(!days.has(ymd(d))) d.setDate(d.getDate()-1);
  while(days.has(ymd(d))){n++;d.setDate(d.getDate()-1);}
  return n;
}
let selDay=new Date().getDay();
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

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

/* ---------- Boas-vindas ---------- */
function greeting(){
  const h=new Date().getHours(),nm=S.prefs.name.trim();
  const hi=(h<12?'Bom dia':(h<18?'Boa tarde':'Boa noite'))+(nm?', '+nm:'')+'!';
  const st=streak(),n=S.hist.length,today=S.hist.some(x=>x.day===ymd(new Date()));
  let line;
  if(today) line='Treino de hoje feito. Agora é descansar, comer bem e se orgulhar.';
  else if(!n) line='Que bom ter você aqui. Hoje é o primeiro passo, e o boneco vai te ensinar cada movimento com calma.';
  else if(st>=2) line=`São ${st} dias seguidos cuidando de você. Bora manter essa sequência?`;
  else if(st===1) line='Ontem você treinou. Hoje é dia de mostrar que virou hábito.';
  else line='Que bom te ver de volta. Não importa quanto tempo passou: o melhor treino é o de hoje.';
  return [hi,line];
}

/* ---------- Tela inicial ---------- */
let homeItems=[];
function planItems(day,tier){const P=PLANS[day];return P.flow?P.flow.map(k=>YOGA[k]):P.ex.map(f=>resolve(f,tier));}
function renderHome(){
  const now=new Date(),lv=level(S.xp),tier=curTier();
  const [hi,line]=greeting();$('hello').textContent=hi;$('helloLine').textContent=line;
  $('todayDate').textContent=DAYS_L[now.getDay()]+', '+now.toLocaleDateString('pt-BR',{day:'numeric',month:'long'});
  $('lvlNum').textContent=lv;$('tierName').textContent=TIERS[autoTier(lv)];
  const into=S.xp%XP_LVL; $('xpFill').style.width=(into/XP_LVL*100)+'%';
  $('xpText').textContent=`${into} de ${XP_LVL} pontos para o nível ${lv+1}`+(lv<5?' · Intermediário no nível 5':(lv<10?' · Avançado no nível 10':''));
  $('stStreak').textContent=streak();$('stCount').textContent=S.hist.length;$('stMin').textContent=S.hist.reduce((a,h)=>a+h.min,0);
  const P=PLANS[selDay],steps=build(selDay,tier,S.prefs.dur,{learn:needLearn}),tt=total(steps);
  $('planEyebrow').textContent=(selDay===now.getDay()?'Treino de hoje · ':'Treino escolhido · ')+DAYS_L[selDay];
  $('planName').textContent=P.nome;
  const tp=TP[tier],works=steps.filter(s=>s.k==='work').length,rounds=P.flow?null:works/P.ex.length,learns=steps.filter(s=>s.k==='learn').length;
  const tags=[`<span class="tag kind">${esc(P.tipo)}</span>`,`<span class="tag">≈ ${Math.round(tt/60)} min</span>`,`<span class="tag">${TIERS[tier]}${S.prefs.tier==='auto'&&!energy?' (automático)':''}</span>`];
  if(P.flow) tags.push(`<span class="tag">${tp.hold}s em cada postura</span>`);
  else tags.push(`<span class="tag">${rounds} rodadas</span>`,`<span class="tag">${tp.w}s de exercício · ${tp.r}s de descanso</span>`);
  if(learns) tags.push(`<span class="tag learn">${learns} ${learns>1?'movimentos novos com explicação':'movimento novo com explicação'}</span>`);
  $('planTags').innerHTML=tags.join('');
  $('durChips').innerHTML=[20,30,40,50].map(d=>`<button class="chip" data-dur="${d}" aria-pressed="${S.prefs.dur===d}">${d} min</button>`).join('');
  $('energyChips').innerHTML=[[-1,'Pouca energia'],[0,'Normal'],[1,'Muita energia']].map(([k,l])=>`<button class="chip" data-energy="${k}" aria-pressed="${energy===k}">${l}</button>`).join('');
  $('energyNote').textContent=energy<0?'Tudo bem ter dias assim. Hoje o treino fica um nível mais leve.':(energy>0?'Que ótimo! Hoje o treino sobe um nível.':'');
  const items=planItems(selDay,tier),w={};
  items.forEach(it=>it.m.forEach((m,i)=>{w[m]=(w[m]||0)+(i===0?2:1)}));
  const lvMap={};Object.entries(w).forEach(([m,x])=>lvMap[m]=x>=3?2:1);
  $('bodyMap').innerHTML=bodySVG(lvMap);
  const sorted=Object.entries(w).sort((a,b)=>b[1]-a[1]);
  $('focusList').innerHTML=sorted.slice(0,6).map(([m])=>`<li><span class="dot l${lvMap[m]}"></span><span>${MUS[m]}${lvMap[m]===2?' <small class="muted">principal</small>':''}</span></li>`).join('');
  $('exHead').textContent=P.flow?'Posturas':'Exercícios de cada rodada';
  $('exList').innerHTML=items.map((it,i)=>`<div class="ex"><button class="thumb" data-pv="${i}" aria-label="Ver demonstração de ${esc(it.n)}"><img alt="" data-ti="${i}"><canvas data-ci="${i}" hidden></canvas></button><div style="min-width:0"><div class="nm">${esc(it.n)}</div><div class="mm">${it.m.map(m=>MUS[m]).join(' · ')||'Relaxamento'}</div></div><div class="acts"><button class="lnk" data-pv="${i}">Como fazer</button><a class="lnk ghost" href="${yt(it.q)}" target="_blank" rel="noopener" aria-label="Vídeo de ${esc(it.n)} no YouTube">Vídeo</a></div></div>`).join('');
  homeItems=items;
  const monday=new Date(now);monday.setDate(now.getDate()-((now.getDay()+6)%7));
  const doneDays=new Set(S.hist.map(h=>h.day));
  $('week').innerHTML=[1,2,3,4,5,6,0].map((d,i)=>{const dt=new Date(monday);dt.setDate(monday.getDate()+i);const on=doneDays.has(ymd(dt));
    return `<button class="day${d===selDay?' sel':''}${d===now.getDay()?' today':''}" data-day="${d}" aria-pressed="${d===selDay}"><b>${DAYS[d]}</b><span>${esc(PLANS[d].tipo)}</span><i class="ck${on?' on':''}" aria-label="${on?'feito':'não feito'}"></i></button>`}).join('');
  const start=new Date(monday);start.setDate(monday.getDate()-28);
  let html=['S','T','Q','Q','S','S','D'].map(x=>`<div class="h">${x}</div>`).join('');
  for(let i=0;i<35;i++){const dt=new Date(start);dt.setDate(start.getDate()+i);const k=ymd(dt);
    html+=`<div class="c${doneDays.has(k)?' on':''}${k===ymd(now)?' td':''}${dt>now?' fut':''}" title="${dt.toLocaleDateString('pt-BR')}">${dt.getDate()}</div>`;}
  $('cal').innerHTML=html;
  $('hist').innerHTML=S.hist.length?S.hist.slice(-6).reverse().map(h=>`<li><span>${esc(h.nome)}</span><span>${new Date(h.ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})} · ${h.min} min · +${h.xp}</span></li>`).join(''):'<li class="empty" style="border:0">Seu primeiro treino aparece aqui assim que você terminar.</li>';
  $('voiceToggle').setAttribute('aria-pressed',S.prefs.voice);$('voiceToggle').textContent=S.prefs.voice?'Ligada':'Desligada';
  $('tierChips').innerHTML=[['auto','Automática'],['0','Iniciante'],['1','Intermediário'],['2','Avançado']].map(([k,l])=>`<button class="chip" data-tier="${k}" aria-pressed="${String(S.prefs.tier)===k}">${l}</button>`).join('');
  $('explainChips').innerHTML=[['first','Nas primeiras vezes'],['always','Sempre'],['never','Nunca']].map(([k,l])=>`<button class="chip" data-explain="${k}" aria-pressed="${S.prefs.explain===k}">${l}</button>`).join('');
  if(document.activeElement!==$('nameIn')) $('nameIn').value=S.prefs.name;
  queueThumbs();
}
let thumbJob=0;
function queueThumbs(){
  const job=++thumbJob,items=homeItems.slice();let i=0;
  const step=()=>{
    if(job!==thumbJob||i>=items.length) return;
    const it=items[i],an=AN[it.a],img=document.querySelector(`img[data-ti="${i}"]`),cv=document.querySelector(`canvas[data-ci="${i}"]`);
    const ms=an.f[0].d+1,url=thumbURL(an,ms);
    if(url&&img){img.src=url;}
    else if(cv){img&&(img.hidden=true);cv.hidden=false;drawFig(cv,an,ms,{minW:90,minH:90});}
    i++;requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const VIDS=[
  ['Muay Thai em casa para iniciantes','Base, guarda e primeiros golpes','muay thai em casa iniciante treino'],
  ['Yoga para iniciantes','Sequências de 20 a 30 minutos','yoga para iniciantes em casa'],
  ['Alongamento completo','Para fazer depois do treino','alongamento completo pós treino'],
  ['Dança aeróbica em casa','Aulas para suar dançando','aula de dança aeróbica em casa'],
  ['Treino de glúteos sem equipamento','Força para pernas e glúteos','treino de glúteos em casa sem equipamento'],
  ['Hipertrofia sem equipamento','Como ganhar massa em casa','hipertrofia em casa sem equipamento explicação'],
];
$('vids').innerHTML=VIDS.map(([t,s,q])=>`<a href="${yt(q)}" target="_blank" rel="noopener">${esc(t)}<small>${esc(s)}</small></a>`).join('');

document.addEventListener('click',e=>{
  const t=e.target.closest('button'); if(!t) return;
  if(t.dataset.dur){S.prefs.dur=+t.dataset.dur;save();renderHome();}
  else if(t.dataset.day){selDay=+t.dataset.day;renderHome();}
  else if(t.dataset.tier){S.prefs.tier=t.dataset.tier;save();renderHome();}
  else if(t.dataset.energy!=null&&t.dataset.energy!==''){energy=+t.dataset.energy;renderHome();}
  else if(t.dataset.explain){S.prefs.explain=t.dataset.explain;save();renderHome();}
  else if(t.dataset.pv){openPreview(homeItems[+t.dataset.pv]);}
});
$('nameIn').addEventListener('input',e=>{S.prefs.name=e.target.value.slice(0,30);save();const [hi]=greeting();$('hello').textContent=hi;});
$('voiceToggle').onclick=()=>{S.prefs.voice=!S.prefs.voice;save();renderHome();};
$('voiceTest').onclick=()=>{unlockAudio();say(`Oi${S.prefs.name?', '+S.prefs.name:''}! Eu vou te acompanhar em cada treino. Vamos juntos?`,true);};
function resetHandler(){
  $('resetBox').innerHTML='<div class="chips"><button class="btn2" id="rsNo">Cancelar</button><button class="btn2 danger" id="rsYes">Apagar tudo</button></div>';
  const restore=()=>{$('resetBox').innerHTML='<button class="btn2 danger" id="resetBtn">Apagar</button>';$('resetBtn').onclick=resetHandler;};
  $('rsNo').onclick=restore;
  $('rsYes').onclick=()=>{S.hist=[];S.xp=0;S.learned={};save();restore();renderHome();};
}
$('resetBtn').onclick=resetHandler;

/* ---------- Palco (3D com reserva em 2D) ---------- */
function makeStage(canvas,overlay,opt){
  if(HAS3D){try{return new Stage(canvas,overlay,opt);}catch(e){}}
  return {an:null,key2:null,guides:false,setAnim(an,k){this.an=an;this.key2=k;},frame(ms){if(this.an) drawFig(canvas,this.an,ms);},applyColors(){}};
}
let plStage=null,pvStage=null;

/* ---------- Prévia / Como fazer ---------- */
let pvItem=null,pvT0=0;
function howHTML(it){
  const c=como(it.a);if(!c) return `<p>${esc(it.tip)}</p>`;
  return `<ol class="how"><li><b>Posição inicial</b>${esc(c[0])}</li><li><b>Movimento</b>${esc(c[1])}</li><li><b>Atenção</b>${esc(c[2])}</li></ol>`;
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
function closePreview(){$('preview').hidden=true;pvItem=null;try{speechSynthesis.cancel()}catch(e){}}
$('pvClose').onclick=closePreview;
$('pvListen').onclick=()=>{unlockAudio();if(pvItem){const c=como(pvItem.a);sayQ(c?[pvItem.n+'.', 'Posição inicial. '+c[0],'Movimento. '+c[1],'Atenção. '+c[2]]:[pvItem.tip],true);}};
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
  $('voiceInfo').textContent=best?'Encontramos uma voz natural neste aparelho.':'Para uma voz mais humana, abra o site no Microsoft Edge (vozes Francisca e Thalita “Natural”) ou no Google Chrome.';
}
if(hasTTS){loadVoices();try{speechSynthesis.addEventListener('voiceschanged',loadVoices);}catch(e){}setTimeout(loadVoices,800);}
else {$('voiceInfo').textContent='Este navegador não tem voz. Os bipes de contagem continuam funcionando.';$('voiceSel').disabled=true;}
$('voiceSel').onchange=e=>{S.prefs.voiceName=e.target.value;save();loadVoices();unlockAudio();say('Oi! Essa vai ser a minha voz nos seus treinos.',true);};
function utter(t){const u=new SpeechSynthesisUtterance(t);u.lang='pt-BR';if(voice)u.voice=voice;u.rate=voice&&scoreVoice(voice)>=90?1.0:0.98;u.pitch=1.0;return u;}
function say(t,force){
  if(!hasTTS||(!S.prefs.voice&&!force)) return;
  try{speechSynthesis.cancel();speechSynthesis.speak(utter(t));}catch(e){}
}
function sayQ(list,force){
  if(!hasTTS||(!S.prefs.voice&&!force)) return;
  try{speechSynthesis.cancel();list.forEach(t=>speechSynthesis.speak(utter(t)));}catch(e){}
}
function unlockAudio(){try{if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==='suspended') actx.resume();}catch(e){}}
function beep(f=880,d=.12,vol=.16){
  if(!actx) return; try{const t=actx.currentTime,o=actx.createOscillator(),g=actx.createGain();
  o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g).connect(actx.destination);o.start(t);o.stop(t+d+.02);}catch(e){}
}
const CHEER={
  forca:['Falta pouco, continua!','Mantém a postura, está ficando lindo.','Respira e segue.','Você é mais forte do que imagina.','Cada repetição conta.','Isso, com controle.','Seu corpo está ficando mais forte agora.'],
  luta:['Mãos na guarda!','Gira o quadril!','Solta o golpe e volta.','Mais forte!','Solta o ar no golpe.','Isso, com técnica!'],
  aero:['Isso, no ritmo!','Solta o corpo!','Não para agora, está quase.','Mais energia!','Sorria, você está indo muito bem.'],
  yoga:['Respire fundo.','Solte os ombros.','Relaxe o rosto.','Sinta o alongamento, sem dor.','Devagar, com carinho pelo seu corpo.'],
};
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ---------- Player ---------- */
let P=null,wake=null;
async function keepAwake(){try{wake=await navigator.wakeLock?.request('screen');}catch(e){wake=null;}}
function startWorkout(){
  unlockAudio();
  const tier=curTier(),steps=build(selDay,tier,S.prefs.dur,{learn:needLearn});
  P={steps,i:0,rem:steps[0].s*1000,run:true,last:performance.now(),lastSec:null,anim0:performance.now(),day:selDay,tier,doneMs:0,frozen:null,showHow:false};
  $('player').hidden=false;$('quitBox').hidden=true;document.body.style.overflow='hidden';
  if(!plStage) plStage=makeStage($('plCanvas'),$('plOverlay'),{yaw:0.5});
  plStage.applyColors();
  keepAwake();enterStep(true);
}
$('startBtn').onclick=startWorkout;
const cur=()=>P.steps[P.i];
function setHow(show){
  P.showHow=show;const s=cur(),it=s.it||s.nx;
  $('plHow').hidden=!show||!it;$('plHow').innerHTML=it?howHTML(it):'';
  $('howBtn').setAttribute('aria-pressed',show);
}
function enterStep(announce){
  const s=cur();P.rem=s.s*1000;P.lastSec=null;P.anim0=performance.now();P.frozen=null;
  const it=s.it||s.nx,isRest=!s.it,isLearn=s.k==='learn';
  if(it){plStage.setAnim(AN[it.a],it.a);}
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
  const nm=S.prefs.name.trim();
  if(s.k==='prep') say(`Vamos começar${nm?', '+nm:''}! Hoje é ${PLANS[P.day].nome}. Primeiro: ${it?it.n:''}.`);
  else if(isLearn){
    const c=como(s.it.a);
    sayQ(c?[`Vamos aprender: ${s.it.n}.`,'Posição inicial. '+c[0],'Movimento. '+c[1],'Atenção. '+c[2]]:[s.it.n+'. '+s.it.tip]);
  }
  else if(isRest){
    if(s.round) say(`Fim da rodada ${s.r} de ${s.R}. Você está indo muito bem. Respire. Próximo: ${it?it.n:''}.`);
    else if(s.soft) say('Próxima postura: '+(it?it.n:'')+'.');
    else say((s.label==='Volta à calma'?'Muito bem! Agora vamos desacelerar com carinho. ':'Descanse. ')+'Próximo: '+(it?it.n:'')+'.');
  } else {
    let t=`${s.it.n}. ${s.s} segundos.`;
    const learnedBefore=P.steps[P.i-1]&&P.steps[P.i-1].k==='learn';
    if(learnedBefore) t='Sua vez! '+t;
    else if(s.first||s.k!=='work') t+=' '+s.it.tip+'.';
    say(t);
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
    if(P.run){
      P.rem-=dt;P.doneMs+=dt;
      const sec=Math.ceil(P.rem/1000);
      if(sec!==P.lastSec){
        P.lastSec=sec;
        if(sec<=3&&sec>=1&&s.k!=='learn') beep(sec===1?990:780,.11);
        if(s.it&&s.k==='work'&&s.s>=30){
          if(sec===Math.floor(s.s/2)) say(s.it.sw?'Troque de lado!':'Metade! '+pick(CHEER[s.it.k]||CHEER.forca));
          else if(sec===10&&!s.it.sw) say(pick(CHEER[s.it.k]||CHEER.forca));
        }
      }
      if(P.rem<=0){beep(1320,.22,.2);go(1);if(!P){requestAnimationFrame(tick);return;}}
    }
    const st=cur();
    if(!P.run&&P.frozen==null) P.frozen=now-P.anim0;
    const speed=st.k==='learn'?0.7:1;
    plStage.frame(P.run?(now-P.anim0)*speed:(P.frozen||0)*speed);
    const frac=Math.max(0,P.rem)/(st.s*1000);
    $('plArc').style.strokeDashoffset=String(326.7*(1-frac));
    $('plTime').textContent=st.s>=60||P.rem>59000?mmss(P.rem/1000):Math.max(0,Math.ceil(P.rem/1000));
    const tt=total(P.steps)*1000,done=P.steps.slice(0,P.i).reduce((a,x)=>a+x.s*1000,0)+(st.s*1000-Math.max(0,P.rem));
    $('plProg').style.width=(done/tt*100)+'%';
    $('plTotal').textContent=mmss((tt-done)/1000)+' restantes';
  }
  if(pvItem&&!$('preview').hidden&&pvStage) pvStage.frame(performance.now()-pvT0);
  if(!$('done').hidden) confettiFrame(now);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
function setPause(run){
  P.run=run;P.last=performance.now();
  if(run){P.anim0=performance.now()-(P.frozen||0);P.frozen=null;}
  $('pauseBtn').setAttribute('aria-label',run?'Pausar':'Continuar');
  $('pauseIco').innerHTML=run?'<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>':'<path d="M7 4.5v15l13-7.5z" fill="currentColor"/>';
  if(!run){try{speechSynthesis.cancel()}catch(e){}}
}
$('pauseBtn').onclick=()=>{unlockAudio();setPause(!P.run);if(P.run)say('Vamos lá!');};
$('nextBtn').onclick=()=>go(1);
$('prevBtn').onclick=()=>{if(P.rem<(cur().s*1000-3000)) enterStep(true); else go(-1);};
$('plVoice').onclick=()=>{S.prefs.voice=!S.prefs.voice;save();syncBtns();if(!S.prefs.voice){try{speechSynthesis.cancel()}catch(e){}}};
$('guideBtn').onclick=()=>{S.prefs.guides=!S.prefs.guides;save();syncBtns();if(plStage)plStage.guides=S.prefs.guides;};
$('howBtn').onclick=()=>setHow(!P.showHow);
function syncBtns(){
  $('plVoice').setAttribute('aria-pressed',S.prefs.voice);$('plVoice').setAttribute('aria-label',S.prefs.voice?'Desligar voz':'Ligar voz');
  $('guideBtn').setAttribute('aria-pressed',S.prefs.guides);
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
  const p=P;P=null;
  try{wake&&wake.release();}catch(e){}
  $('player').hidden=true;document.body.style.overflow='';
  if(!record){try{speechSynthesis.cancel()}catch(e){} renderHome();return;}
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
  say(up?`Parabéns${nm?', '+nm:''}! Você subiu para o nível ${lv}!`:`Treino concluído${nm?', '+nm:''}! Você mandou muito bem. Hidrate-se e descanse.`);
}
$('dnBack').onclick=()=>{$('done').hidden=true;renderHome();window.scrollTo(0,0);};

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
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{readCol();plStage&&plStage.applyColors();pvStage&&pvStage.applyColors();setTimeout(queueThumbs,50);});}catch(e){}
renderHome();
