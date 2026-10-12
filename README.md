# Pacman

Clone do Pac-Man feito em HTML, CSS e JavaScript puro, sem dependências.

## Como jogar

- Coma **todas as pastilhas** do labirinto para passar de fase.
- Encostar em um fantasma custa uma vida. São 3 vidas, com uma **vida extra aos 10.000** pontos.
- As **pastilhas grandes** deixam os fantasmas azuis por alguns segundos e aí é você quem caça. Fantasmas comidos em sequência valem 200, 400, 800 e 1600.
- O **túnel** nas laterais leva para o outro lado do labirinto.
- Cada fantasma tem um jeito: Blinky persegue, Pinky tenta cortar pela frente, Inky cerca junto com o Blinky e Clyde é imprevisível.
- A cada fase todos ficam mais rápidos e o efeito das pastilhas grandes dura menos.
- O recorde (HIGH SCORE) fica salvo no navegador.
- Ao perder as 3 vidas, você pode colocar seu nome no **ranking**. Cada nome aparece uma vez, com a melhor pontuação.

## Modo inverso

Você controla **um fantasma**, escolhido antes da partida, e o Pac-Man joga sozinho (IA).

- Capture o Pac-Man **3 vezes** para vencer a fase. Se ele comer todas as pastilhas, você perde.
- Cada captura vale 1000 pontos; ao vencer a fase, cada pastilha que sobrou vale 10.
- Com as pastilhas grandes você fica azul e o Pac-Man pode te comer: os olhos voltam para casa e você fica alguns segundos sem controle.
- A cada fase o Pac-Man fica mais rápido e mais esperto.

| Fantasma | Habilidade |
|----------|------------|
| Blinky (perseguidor)   | Mais rápido que o Pac-Man (passiva) |
| Pinky (emboscador)     | Teletransporte para a frente do Pac-Man; o destino aparece 2s antes. Azul, foge para o ponto mais distante. Recarga de 10s |
| Inky (imprevisível)    | Deixa o Pac-Man 20% mais lento por 2s, de qualquer lugar (também quando está azul). Recarga de 10s |
| Clyde (despreocupado)  | Nenhuma: modo hardcore, pontos valem 5x |

A habilidade fica no rodapé: o botão enche com a recarga e pisca quando está pronta (clique/toque ou `E`).
O modo inverso tem recorde e ranking próprios; o ranking mostra o fantasma de cada jogador.

## Tela inicial

Menu com **Jogar**, **Modo inverso / Modo clássico** (troca o modo da tela inicial: no inverso o título ganha o selo "INVERSO", o Jogar abre a escolha do fantasma e as instruções e o recorde passam a ser do modo inverso; a escolha fica salva), **IA vs IA** (assiste a IA jogando o modo atual: no clássico o Pac-Man contra os 4 fantasmas; no inverso você escolhe o fantasma e assiste a IA controlando ele contra o Pac-Man; não conta recorde nem ranking), **Instruções** (do modo atual), **Ranking** (top 10; clique em um jogador para ver os detalhes da partida) e **Som** (liga/desliga). Use o mouse, o toque ou as setas ↑ ↓ e Enter.

## Controles

| Ação                 | Mouse / toque                   | Teclado          |
|----------------------|---------------------------------|------------------|
| Mover                | Deslizar o dedo na tela         | Setas ou `WASD`  |
| Habilidade (modo inverso) | Botão no rodapé            | `E`              |
| Pausar               | ❚❚                              | `Espaço` ou `P`  |
| Sair (pede confirmação e volta à tela inicial) | Pausa → Sair | `Esc`   |
| Ligar/desligar o som | Menu da tela inicial            | `M`              |

O jogo pausa sozinho quando você troca de aba.

## Executando

Rode por um servidor web com PHP (por exemplo o XAMPP, em `http://localhost/pacman/`).
Para jogar no celular, abra `http://IP-DO-PC/pacman/` com o celular no mesmo Wi-Fi.

Atalhos para testes: `?demo` e `?demo=inverse` (IA vs IA) e `?inverse=pinky` (começa direto o modo inverso com o fantasma indicado).

## Ranking

O ranking é gravado pela `api/ranking.php` nos arquivos `data/ranking.json` (clássico) e `data/ranking-inverse.json` (modo inverso), criados automaticamente.

- No servidor, a pasta `data/` precisa ter **permissão de escrita** para o PHP.
- O `data/.htaccess` bloqueia o acesso direto ao arquivo (Apache).
- A API confere se a partida é possível (pontos múltiplos de 10, máximo de pontos por fase e tempo mínimo por fase; no modo inverso também o fantasma e o multiplicador do Clyde), valida o nome e limita um envio a cada 10 segundos por IP. Isso evita abusos simples, mas como a pontuação vem do navegador, não impede alguém determinado a forjar um resultado.
- Para zerar um ranking, apague o arquivo dele em `data/`.

## Estrutura

```
index.php       página: tela inicial, tela do jogo e janela de mensagens
style.css       layout, tela inicial, janelas e ranking
pacman.css      sprite do Pac-Man (pixel art 14 x 14)
ghosts.css      sprite dos fantasmas (piscar, lençol, assustado, comido)
main.js         lógica do jogo (labirinto, movimento, IA dos fantasmas)
pacman-ai.js    IA do Pac-Man (modo inverso e demonstração)
inverse.js      modo inverso: habilidades, pontuação e painel
screens.js      tela inicial, menu, pausa, fim de jogo e ranking
sound.js        sons gerados com Web Audio (sem arquivos)
api/ranking.php API do ranking (GET lista, POST grava; ?mode=inverse para o modo inverso)
data/           ranking.json e ranking-inverse.json (gerados, fora do git)
```
