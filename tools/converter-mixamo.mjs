// Converte animações do Mixamo (.fbx) em .json leves para o site.
// Uso: node tools/converter-mixamo.mjs arquivo.fbx chaveDoMovimento [mais pares...]
// Ex.: node tools/converter-mixamo.mjs ~/Downloads/Air_Squat.fbx squat
// Grava assets/mixamo/<chave>.json. Depois, acrescente a chave em MOCAP (js/mocap.js).
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright'); // npm i playwright && npx playwright install chromium
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const raiz=join(dirname(fileURLToPath(import.meta.url)),'..');
const args=process.argv.slice(2);
if(args.length<2||args.length%2){console.log('Uso: node tools/converter-mixamo.mjs arquivo.fbx chave [arquivo2.fbx chave2 ...]');process.exit(1);}
const b=await chromium.launch();const p=await b.newPage();
await p.setContent('<html><body></body></html>');
for(const f of ['js/vendor/three.min.js','js/vendor/fflate.min.js','js/vendor/FBXLoader.js','js/engine.js','tools/mixamo-bake.js'])
  await p.addScriptTag({content:readFileSync(join(raiz,f),'utf8')});
mkdirSync(join(raiz,'assets/mixamo'),{recursive:true});
for(let i=0;i<args.length;i+=2){
  const [arq,chave]=[args[i],args[i+1]];
  const b64=readFileSync(arq).toString('base64');
  const d=await p.evaluate(async b64=>{const s=atob(b64),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return await assar(u.buffer);},b64);
  const out=join(raiz,'assets/mixamo',chave+'.json');
  writeFileSync(out,JSON.stringify(d));
  console.log(`${chave}: ${d.frames.length} quadros, ${d.dur.toFixed(2)} s -> ${out}`);
}
await b.close();
