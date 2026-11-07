// Casa Forte: guarda o site no aparelho para abrir sem internet.
// Ao publicar mudanças, aumente a VERSAO para os aparelhos baixarem a nova versão.
const VERSAO='casa-forte-v14';
const BASE=['./','index.html','manifest.webmanifest','css/style.css','js/vendor/three.min.js','js/engine.js','js/teach.js','js/catalog.js','js/lines.js','js/vendor/GLTFLoader.js','js/vendor/SkeletonUtils.js','js/vendor/meshopt_decoder.js','js/mocap.js','js/real.js','js/mannequin.js','js/ritmo.js','js/aula.js','js/coreo.js','js/plano.js','js/app.js','assets/img/aula-agachamento.png','audio/manifest.json','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSAO).then(c=>c.addAll(BASE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==location.origin){ // fontes do Google: usa a cópia guardada se houver
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{const cp=res.clone();caches.open(VERSAO).then(c=>c.put(req,cp));return res;}).catch(()=>r)));
    return;
  }
  // Rede primeiro para o site e o manifesto de áudio (pega atualizações), cache como reserva.
  // Áudios e o three.js: cache primeiro (não mudam).
  const cacheFirst=/\/audio\/[^/]+\.mp3$|\/assets\/mixamo\/|vendor\//.test(url.pathname);
  if(cacheFirst){
    e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSAO).then(c=>c.put(req,cp));}return res;})));
  } else {
    e.respondWith(fetch(req).then(res=>{if(res.ok){const cp=res.clone();caches.open(VERSAO).then(c=>c.put(req,cp));}return res;}).catch(()=>caches.match(req).then(r=>r||caches.match('index.html'))));
  }
});
