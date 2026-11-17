// Converte arquivos do Mixamo (.fbx) para o site.
// Movimentos:   node tools/converter-mixamo.mjs arquivo.fbx chave [arquivo2.fbx chave2 ...]
//   grava assets/mixamo/<chave>.json (juntas, para o boneco simples e as guias)
//   e assets/mixamo/<chave>.anim.json (para o personagem realista). Depois, acrescente a chave em MOCAP (js/mocap.js).
// Personagem:   node tools/converter-mixamo.mjs --personagem arquivo-com-pele.fbx
//   grava assets/mixamo/personagem.glb e compacta com gltf-transform (weld + meshopt).
// Requer: npm i playwright && npx playwright install chromium
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {execSync} from 'node:child_process';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const raiz=join(dirname(fileURLToPath(import.meta.url)),'..'),dest=join(raiz,'assets/mixamo');
const args=process.argv.slice(2),pers=args[0]==='--personagem';
if(pers?args.length!==2:(args.length<2||args.length%2)){console.log('Uso: node tools/converter-mixamo.mjs arquivo.fbx chave [...]  |  --personagem arquivo.fbx');process.exit(1);}
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
await p.setContent('<html><body></body></html>');
for(const f of ['js/vendor/three.min.js','js/vendor/fflate.min.js','js/vendor/FBXLoader.js','tools/GLTFExporter.js','js/engine.js','tools/mixamo-bake.js'])
  await p.addScriptTag({content:readFileSync(join(raiz,f),'utf8')});
mkdirSync(dest,{recursive:true});
const b64=f=>readFileSync(f).toString('base64');
const BUF='s=>{const a=atob(s),u=new Uint8Array(a.length);for(let i=0;i<a.length;i++)u[i]=a.charCodeAt(i);return u.buffer;}';
if(pers){
  const out=join(dest,'personagem.glb'),tmp=out+'.tmp.glb';
  const g=await p.evaluate(`(async()=>personagemGLB((${BUF})(${JSON.stringify(b64(args[1]))})))()`);
  writeFileSync(tmp,Buffer.from(g,'base64'));
  execSync(`npx -y @gltf-transform/cli@4 weld "${tmp}" "${tmp}" && npx -y @gltf-transform/cli@4 meshopt "${tmp}" "${out}"`,{stdio:'inherit'});
  execSync(`rm -f "${tmp}"`);console.log('personagem ->',out);
} else for(let i=0;i<args.length;i+=2){
  const [arq,chave]=[args[i],args[i+1]],s=JSON.stringify(b64(arq));
  const d=await p.evaluate(`(async()=>assar((${BUF})(${s})))()`);
  writeFileSync(join(dest,chave+'.json'),JSON.stringify(d));
  const c=await p.evaluate(`clipJSON((${BUF})(${s}))`);c.name=chave;
  writeFileSync(join(dest,chave+'.anim.json'),JSON.stringify(c));
  console.log(`${chave}: ${d.frames.length} quadros, ${d.dur.toFixed(2)} s`);
}
await b.close();
