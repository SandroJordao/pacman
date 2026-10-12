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

## Tela inicial

Menu com **Jogar**, **Instruções**, **Ranking** (top 10; clique em um jogador para ver os detalhes da partida) e **Som** (liga/desliga). Use o mouse, o toque ou as setas ↑ ↓ e Enter.

## Controles

| Ação                 | Mouse / toque                   | Teclado          |
|----------------------|---------------------------------|------------------|
| Mover                | Deslizar o dedo na tela         | Setas ou `WASD`  |
| Pausar               | ❚❚                              | `Espaço` ou `P`  |
| Sair (pede confirmação e volta à tela inicial) | Pausa → Sair | `Esc`   |
| Ligar/desligar o som | Menu da tela inicial            | `M`              |

O jogo pausa sozinho quando você troca de aba.

## Executando

Rode por um servidor web com PHP (por exemplo o XAMPP, em `http://localhost/pacman/`).
Para jogar no celular, abra `http://IP-DO-PC/pacman/` com o celular no mesmo Wi-Fi.

## Ranking

O ranking é gravado pela `api/ranking.php` no arquivo `data/ranking.json`, criado automaticamente.

- No servidor, a pasta `data/` precisa ter **permissão de escrita** para o PHP.
- O `data/.htaccess` bloqueia o acesso direto ao arquivo (Apache).
- A API confere se a partida é possível (pontos múltiplos de 10, máximo de pontos por fase e tempo mínimo por fase), valida o nome e limita um envio a cada 10 segundos por IP. Isso evita abusos simples, mas como a pontuação vem do navegador, não impede alguém determinado a forjar um resultado.
- Para zerar o ranking, apague `data/ranking.json`.

## Estrutura

```
index.php       página: tela inicial, tela do jogo e janela de mensagens
style.css       layout, tela inicial, janelas e ranking
pacman.css      sprite do Pac-Man (pixel art 14 x 14)
ghosts.css      sprite dos fantasmas (piscar, lençol, assustado, comido)
main.js         lógica do jogo (labirinto, movimento, IA dos fantasmas)
screens.js      tela inicial, menu, pausa, fim de jogo e ranking
sound.js        sons gerados com Web Audio (sem arquivos)
api/ranking.php API do ranking (GET lista, POST grava)
data/           ranking.json (gerado, fora do git)
```
