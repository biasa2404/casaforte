// Analisa os movimentos gravados: janela ativa (para emendar golpes) e batida (para dança no ritmo).
// Uso: node tools/analisar-mov.mjs chave1 chave2 ...
import fs from 'fs';
for(const k of process.argv.slice(2)){
  const j=JSON.parse(fs.readFileSync(`assets/mixamo/${k}.json`,'utf8')),K=j.keys,n=j.frames.length,fps=j.fps;
  const g=(f,a,c)=>j.frames[f][K.indexOf(a)*3+c];
  const ends=['hand0','hand1','ankle0','ankle1','top'];
  const sp=[];for(let f=1;f<n;f++){let s=0;for(const a of ends){let d=0;for(let c=0;c<3;c++)d+=(g(f,a,c)-g(f-1,a,c))**2;s+=Math.sqrt(d);}sp.push(s*fps);}
  const mx=Math.max(...sp);let a=sp.findIndex(x=>x>mx*0.2),b=sp.length-1-[...sp].reverse().findIndex(x=>x>mx*0.2);
  const hy=[];for(let f=0;f<n;f++)hy.push(g(f,'hip',1));const m=hy.reduce((x,y)=>x+y)/n;const z=hy.map(x=>x-m);
  // autocorrelação do sobe e desce do quadril (batida)
  let best=0,bl=0;for(let l=Math.round(fps*0.3);l<Math.min(n/2,fps*1.2);l++){let s=0;for(let i=0;i+l<n;i++)s+=z[i]*z[i+l];s/=(n-l);if(s>best){best=s;bl=l;}}
  // primeira batida = ponto mais baixo do quadril no primeiro ciclo
  let lo=0;for(let f=0;f<Math.min(n,bl||n);f++) if(hy[f]<hy[lo]) lo=f;
  console.log(k.padEnd(14),'dur',(n/fps).toFixed(2),'ativo',(a/fps).toFixed(2),'-',(b/fps).toFixed(2),'batida',(bl/fps).toFixed(3),'bpm',bl?(60*fps/bl).toFixed(0):'-','desce',(lo/fps).toFixed(2),'amp',(Math.max(...hy)-Math.min(...hy)).toFixed(1));
}
