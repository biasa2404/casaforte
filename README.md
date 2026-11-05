# Casa Forte

Site de treinos em casa, sem equipamento: força, Muay Thai, yoga, alongamento, aeróbico e dança.

- Rotina para cada dia da semana (20 a 50 minutos)
- Boneco 3D que demonstra cada movimento, com guias de postura (ângulo do joelho, corpo reto etc.)
- Modo "aprender": antes de um exercício novo, o boneco mostra devagar e a voz explica posição inicial, movimento e cuidados
- Voz de incentivo em português (usa as vozes do navegador; no Microsoft Edge as vozes "Natural" soam bem humanas)
- Níveis, pontos, sequência de dias, calendário e histórico (salvos no navegador)

## Como abrir

Abra o `index.html` no navegador. Não precisa instalar nada.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (por exemplo `casa-forte`).
2. Envie todos os arquivos desta pasta para a branch `main`.
3. No repositório, vá em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve.
4. Em alguns minutos o site fica disponível em `https://SEU-USUARIO.github.io/casa-forte/`.

## Instalar no celular

Abra o site publicado no navegador do celular e use "Adicionar à tela inicial". Ele passa a abrir como aplicativo e funciona sem internet depois da primeira visita.

## Gerar a voz gravada (Azure)

As falas ficam em `js/lines.js`. Para gerar os áudios com a voz neural da Azure (plano gratuito F0):

```
AZURE_SPEECH_KEY=sua-chave AZURE_SPEECH_REGION=brazilsouth NOME="Seu nome" node tools/gerar-audios.mjs --amostra
AZURE_SPEECH_KEY=sua-chave AZURE_SPEECH_REGION=brazilsouth NOME="Seu nome" node tools/gerar-audios.mjs
```

O primeiro comando gera duas amostras em `audio/` para escolher entre Francisca e Thalita. O segundo gera todas as falas (cerca de mil, leva perto de uma hora no plano gratuito) e atualiza `audio/manifest.json`. Se parar no meio, é só rodar de novo: ele continua de onde parou. Sem os áudios, o site usa a voz do navegador.

## Estrutura

```
index.html          página
css/style.css       visual (tema claro e escuro)
js/engine.js        esqueleto, cinemática e biblioteca de movimentos
js/teach.js         explicações de cada movimento
js/catalog.js       exercícios, planos da semana e montagem do treino
js/lines.js         roteiro de falas da voz
js/mannequin.js     boneco 3D (three.js) e guias de postura
js/app.js           telas, player, voz e progresso
js/vendor/three.min.js  three.js r128 (licença MIT)
audio/              falas gravadas (geradas pelo tools/gerar-audios.mjs)
sw.js, manifest.webmanifest, icons/  instalação no celular e uso sem internet
```

Aviso: o conteúdo é educativo e não substitui orientação de profissional de educação física ou de saúde.
