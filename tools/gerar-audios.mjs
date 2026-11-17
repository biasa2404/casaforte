// Gera os áudios das falas do Casa Forte com a voz neural da Azure.
// Uso (Node 18 ou mais novo):
//   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=brazilsouth NOME="Seu nome" node tools/gerar-audios.mjs
// Opções:
//   --contar            só mostra quantas falas e caracteres seriam gerados
//   --amostra           gera audio/amostra-francisca.mp3 e audio/amostra-thalita.mp3 para escolher a voz
//   --voz=pt-BR-ThalitaNeural   troca a voz (padrão: a definida em js/lines.js)
// Só gera o que ainda não existe; rodar de novo depois de mudar o roteiro gera apenas as frases novas.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const raiz=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ctx={console};vm.createContext(ctx);
const codigo=['js/teach.js','js/catalog.js','js/ritmo.js','js/aula.js','js/lines.js'].map(f=>fs.readFileSync(path.join(raiz,f),'utf8').replace(/^'use strict';/,'')).join('\n;\n')
  +'\n;globalThis.__api={VOZ,todasAsFalas,hashFala};';
vm.runInContext(codigo,ctx);
const {VOZ,todasAsFalas,hashFala}=ctx.__api;

const args=new Set(process.argv.slice(2));
const vozArg=[...args].find(a=>a.startsWith('--voz='));
const voz=vozArg?vozArg.slice(6):VOZ.nome;
const nome=(process.env.NOME||'').trim();
const pasta=path.join(raiz,'audio');fs.mkdirSync(pasta,{recursive:true});

const falas=todasAsFalas(nome);
const chars=[...falas.keys()].reduce((a,t)=>a+t.length,0);
console.log(`${falas.size} falas, ${chars} caracteres${nome?` (com o nome "${nome}")`:''}.`);
if(args.has('--contar')) process.exit(0);

const key=process.env.AZURE_SPEECH_KEY,region=process.env.AZURE_SPEECH_REGION;
if(!key||!region){console.error('Defina AZURE_SPEECH_KEY e AZURE_SPEECH_REGION.');process.exit(1);}
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
async function sintetizar(texto,estilo,v=voz){
  const p=estilo==='calma'?VOZ.calma:VOZ;
  const ssml=`<speak version="1.0" xml:lang="pt-BR"><voice name="${v}"><prosody rate="${p.rate}" pitch="${p.pitch}">${esc(texto)}</prosody></voice></speak>`;
  for(let tentativa=1;;tentativa++){
    const r=await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,{method:'POST',headers:{
      'Ocp-Apim-Subscription-Key':key,'Content-Type':'application/ssml+xml',
      'X-Microsoft-OutputFormat':'audio-24khz-48kbitrate-mono-mp3','User-Agent':'casa-forte'},body:ssml});
    if(r.ok) return Buffer.from(await r.arrayBuffer());
    if(r.status===429&&tentativa<6){const w=Number(r.headers.get('retry-after')||10)*1000;await new Promise(s=>setTimeout(s,w));continue;}
    throw new Error(`Azure respondeu ${r.status}: ${await r.text()}`);
  }
}
const pausa=ms=>new Promise(s=>setTimeout(s,ms));
const intervalo=Number(process.env.INTERVALO_MS||3200); // o plano gratuito (F0) aceita cerca de 20 pedidos por minuto

if(args.has('--amostra')){
  const t='Oi! Essa vai ser a minha voz nos seus treinos. Agachamento livre, trinta segundos. Vai! Mantém a postura, está lindo.';
  for(const [arq,v] of [['amostra-francisca.mp3','pt-BR-FranciscaNeural'],['amostra-thalita.mp3','pt-BR-ThalitaNeural']]){
    fs.writeFileSync(path.join(pasta,arq),await sintetizar(t,'animada',v));console.log('ok',arq);await pausa(intervalo);
  }
  process.exit(0);
}

let feitos=0,pulados=0;
const total=falas.size;
for(const [texto,estilo] of falas){
  const arq=path.join(pasta,hashFala(texto)+'.mp3');
  if(fs.existsSync(arq)){pulados++;continue;}
  fs.writeFileSync(arq,await sintetizar(texto,estilo));
  feitos++;
  if(feitos%20===0) console.log(`${feitos+pulados}/${total}`);
  await pausa(intervalo);
}
const arquivos=[...falas.keys()].map(hashFala).filter(h=>fs.existsSync(path.join(pasta,h+'.mp3')));
fs.writeFileSync(path.join(pasta,'manifest.json'),JSON.stringify({voz,nome,gerado:new Date().toISOString(),arquivos}));
console.log(`Pronto: ${feitos} novos, ${pulados} já existiam. manifest.json atualizado.`);
