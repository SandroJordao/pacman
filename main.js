/**
 * JS Document.
 * @author Sandro Jordão.
**/

'use strict';

/**
 * Mapa do labirinto (19 x 21)
 *
 *  #  parede
 *  .  pastilha
 *  o  power pill
 *  -  porta da casa dos fantasmas
 *  S  posição inicial do Pacman
 *     (espaço) área livre sem pastilha
**/
const MAP = [
	"###################",
	"#........#........#",
	"#o##.###.#.###.##o#",
	"#.................#",
	"#.##.#.#####.#.##.#",
	"#....#...#...#....#",
	"####.### # ###.####",
	"   #.#       #.#   ",
	"####.# ##-## #.####",
	".....  #   #  .....",
	"####.# ##### #.####",
	"   #.#       #.#   ",
	"####.# ##### #.####",
	"#........#........#",
	"#.##.###.#.###.##.#",
	"#o.#.....S.....#.o#",
	"##.#.#.#####.#.#.##",
	"#....#...#...#....#",
	"#.######.#.######.#",
	"#.................#",
	"###################"
];

const TILE = 30;
const ROWS = MAP.length;
const COLS = MAP[0].length;

// Atualizações por segundo (a lógica roda em passo fixo, independente do FPS)
const UPDATES = 60;
const DT = 1 / UPDATES;

const DIRS = {
	up:    { x:  0, y: -1 },
	left:  { x: -1, y:  0 },
	down:  { x:  0, y:  1 },
	right: { x:  1, y:  0 }
};

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

const KEYS = {
	ArrowUp: 'up',    w: 'up',    W: 'up',
	ArrowDown: 'down', s: 'down',  S: 'down',
	ArrowLeft: 'left', a: 'left',  A: 'left',
	ArrowRight: 'right', d: 'right', D: 'right'
};

// Casa dos fantasmas: tile logo acima da porta e tile central de dentro
const HOUSE_EXIT = { col: 9, row: 7 };
const HOUSE_INSIDE = { col: 9, row: 9 };

// release: segundos até sair da casa / scatter: canto que o fantasma persegue no modo dispersão
const GHOSTS = [
	{ id: 'blinky', col: 9,  row: 7, release: 0, scatter: { col: COLS - 2, row: -2 } },
	{ id: 'pinky',  col: 9,  row: 9, release: 1, scatter: { col: 1, row: -2 } },
	{ id: 'inky',   col: 10, row: 9, release: 5, scatter: { col: COLS - 1, row: ROWS + 1 } },
	{ id: 'clyde',  col: 8,  row: 9, release: 9, scatter: { col: 0, row: ROWS + 1 } }
];

// Alternância entre dispersão e perseguição (segundos); o último dura para sempre
const MODES = [
	{ mode: 'scatter', time: 7 },
	{ mode: 'chase', time: 20 },
	{ mode: 'scatter', time: 7 },
	{ mode: 'chase', time: 20 },
	{ mode: 'scatter', time: 5 },
	{ mode: 'chase', time: 20 },
	{ mode: 'scatter', time: 5 },
	{ mode: 'chase', time: Infinity }
];

const EXTRA_LIFE_SCORE = 10000;

let board;
let cells;
let grid;
let dotsLeft;
let totalDots;
let message;
let pacman;
let ghosts;
let score;
let highscore;
let lives;
let level;
let extraLifeGiven;
let phase;
let phaseTimer;
let roundTime;
let modeIndex;
let modeTimer;
let frightenedTimer;
let ghostCombo;
let playTime;
let recordAtStart;
let gameOverShown;

// false na tela inicial, na pausa e com janelas abertas: o jogo fica congelado
let running = false;

// Personagem que recebe os comandos do jogador (teclado / toque); null na demonstração
let player;

// 'classic': o jogador controla o Pacman
// 'inverse': o jogador controla um fantasma contra o Pacman da IA (inverse.js)
let gameMode = 'classic';

// IA vs IA (demonstração) nos dois modos: o Pacman é a IA (pacman-ai.js) e,
// no inverso, um robô controla o fantasma (inverse.js). Ignora os comandos.
let demo = false;

/**
 * Cria um sprite em pixel art (14 x 14 divs coloridas pelo CSS)
**/
function createSprite(className, id)
{
	var sprite = document.createElement('div');
	sprite.className = className;

	if (id) {
		sprite.id = id;
	}

	for (var i = 0; i < 14 * 14; i++) {
		sprite.appendChild(document.createElement('div'));
	}

	return sprite;
}

/**
 * Retorna o caractere do mapa na posição (as colunas dão a volta pelo túnel)
**/
function tileAt(col, row)
{
	if (row < 0 || row >= ROWS) {
		return '#';
	}

	return grid[row][(col % COLS + COLS) % COLS];
}

function isWall(col, row)
{
	return row >= 0 && row < ROWS && col >= 0 && col < COLS && MAP[row][col] == '#';
}

function canWalk(col, row)
{
	var tile = tileAt(col, row);

	return tile != '#' && tile != '-';
}

/**
 * Monta o labirinto a partir do MAP. As bordas das paredes são calculadas:
 * cada parede ganha borda no lado em que não há outra parede vizinha.
**/
function buildBoard()
{
	cells = [];

	for (var row = 0; row < ROWS; row++) {
		cells.push([]);

		for (var col = 0; col < COLS; col++) {
			var cell = document.createElement('div');
			var tile = MAP[row][col];

			cell.classList.add('cell');

			if (tile == '#') {
				if (!isWall(col, row - 1)) cell.classList.add('T');
				if (!isWall(col + 1, row)) cell.classList.add('R');
				if (!isWall(col, row + 1)) cell.classList.add('B');
				if (!isWall(col - 1, row)) cell.classList.add('L');
			} else if (tile == '-') {
				cell.classList.add('TW');
			}

			board.appendChild(cell);
			cells[row].push(cell);
		}
	}
}

/**
 * Recoloca todas as pastilhas (início de jogo / nova fase)
**/
function resetDots()
{
	grid = MAP.map(function (line) { return line.replace('S', ' ').split(''); });
	dotsLeft = 0;

	for (var row = 0; row < ROWS; row++) {
		for (var col = 0; col < COLS; col++) {
			cells[row][col].classList.toggle('P', grid[row][col] == '.');
			cells[row][col].classList.toggle('W', grid[row][col] == 'o');

			if (grid[row][col] == '.' || grid[row][col] == 'o') {
				dotsLeft++;
			}
		}
	}

	totalDots = dotsLeft;
}

function findStart()
{
	for (var row = 0; row < ROWS; row++) {
		var col = MAP[row].indexOf('S');

		if (col >= 0) {
			return { col: col, row: row };
		}
	}
}

/**
 * Posições: x/y em pixels relativos ao labirinto (canto superior esquerdo do tile)
**/
function tileOf(entity)
{
	return {
		col: (Math.round(entity.x / TILE) % COLS + COLS) % COLS,
		row: Math.round(entity.y / TILE)
	};
}

function isCentered(entity)
{
	return entity.x % TILE == 0 && entity.y % TILE == 0;
}

/**
 * Anda 1 pixel na direção, dando a volta pelo túnel
**/
function step(entity, dir)
{
	entity.x += DIRS[dir].x;
	entity.y += DIRS[dir].y;

	if (entity.x < -TILE / 2) {
		entity.x += COLS * TILE;
	} else if (entity.x > (COLS - 1) * TILE + TILE / 2) {
		entity.x -= COLS * TILE;
	}
}

/**
 * Converte velocidade fracionária (px por atualização) em passos inteiros
**/
function stepsFor(entity, speed)
{
	entity.acc += speed;

	var steps = Math.floor(entity.acc);
	entity.acc -= steps;

	return steps;
}

function pacmanBaseSpeed()
{
	return 2 + Math.min(level - 1, 4) * 0.1;
}

// Com a habilidade do Inky o Pacman fica lento
function pacmanSpeed()
{
	return pacman.slowTimer > 0 ? pacmanBaseSpeed() * SLOW_FACTOR : pacmanBaseSpeed();
}

function ghostSpeed(ghost)
{
	if (ghost.state == 'eaten' || ghost.state == 'entering') return 4;
	if (ghost.state == 'house' || ghost.state == 'leaving') return 1;
	if (ghost.frightened) return 1;

	// Fantasma do jogador acompanha o Pacman (o Blinky é mais rápido)
	if (ghost.controller == 'player') {
		return pacmanBaseSpeed() * (ghost.id == 'blinky' ? BLINKY_BOOST : 1);
	}

	return 1.8 + Math.min(level - 1, 4) * 0.1;
}

function frightenedDuration()
{
	return Math.max(6 - (level - 1), 2);
}

/**
 * Movimento por comando (entity.next): usado por quem o jogador controla.
 * Anda 1 pixel; retorna false se ficou parado contra a parede.
 * onCenter(tile) é chamado ao passar pelo centro de um tile.
**/
function stepControlled(entity, onCenter)
{
	// Inverter o sentido é permitido a qualquer momento
	if (entity.next && entity.next == OPPOSITE[entity.dir]) {
		entity.dir = entity.next;
	}

	if (isCentered(entity)) {
		var tile = tileOf(entity);

		if (onCenter) {
			onCenter(tile);
		}

		// Curva guardada: vira assim que o caminho estiver livre
		if (entity.next && canWalk(tile.col + DIRS[entity.next].x, tile.row + DIRS[entity.next].y)) {
			entity.dir = entity.next;
		}

		if (!entity.dir || !canWalk(tile.col + DIRS[entity.dir].x, tile.row + DIRS[entity.dir].y)) {
			return false;
		}
	}

	step(entity, entity.dir);

	return true;
}

/**
 * Pacman
**/
function pacmanCenter(tile)
{
	eat(tile.col, tile.row);

	if (pacman.controller == 'ai') {
		pacman.next = PacmanAI.decide(tile);
	}
}

function movePacman()
{
	var steps = stepsFor(pacman, pacmanSpeed());

	pacman.moving = steps == 0 ? pacman.moving : false;

	while (steps-- > 0) {
		if (!stepControlled(pacman, pacmanCenter)) {
			pacman.moving = false;
			break;
		}

		pacman.moving = true;
	}
}

function eat(col, row)
{
	var tile = grid[row][col];

	if (tile != '.' && tile != 'o') {
		return;
	}

	grid[row][col] = ' ';
	cells[row][col].classList.remove('P', 'W');
	dotsLeft--;

	Sound.play('chomp');

	// No modo inverso os pontos são do fantasma, não do Pacman
	if (!isInverse()) {
		addScore(tile == '.' ? 10 : 50);
	}

	if (tile == 'o') {
		frighten();
	}

	// Labirinto limpo: no modo inverso é a derrota do jogador
	if (dotsLeft == 0) {
		setPhase(isInverse() ? 'gameover' : 'levelclear', 2);
	}
}

function addScore(points)
{
	score += points;

	if (!extraLifeGiven && score >= EXTRA_LIFE_SCORE && !isInverse()) {
		extraLifeGiven = true;
		lives++;
		renderLives();
		Sound.play('extraLife');
	}

	// Recorde só vale para partidas do jogador
	if (score > highscore && !demo) {
		highscore = score;
		saveHighscore();
	}
}

/**
 * Fantasmas
**/
function frighten()
{
	frightenedTimer = frightenedDuration();
	ghostCombo = 0;

	ghosts.forEach(function (ghost) {
		if (ghost.state == 'eaten' || ghost.state == 'entering') {
			return;
		}

		ghost.frightened = true;

		// Os da IA dão meia-volta; o do jogador segue o comando
		if (ghost.state == 'active' && ghost.controller == 'ai') {
			ghost.dir = OPPOSITE[ghost.dir];
		}
	});
}

function ghostTarget(ghost)
{
	if (ghost.state == 'eaten') {
		return HOUSE_EXIT;
	}

	if (MODES[modeIndex].mode == 'scatter') {
		return ghost.scatter;
	}

	var p = tileOf(pacman);
	var d = DIRS[pacman.dir] || { x: 0, y: 0 };

	switch (ghost.id) {
		case 'blinky': // Persegue o Pacman diretamente
			return p;
		case 'pinky': // Mira 4 tiles à frente do Pacman
			return { col: p.col + d.x * 4, row: p.row + d.y * 4 };
		case 'inky': // Usa o Blinky como referência para cercar
			var blinky = tileOf(ghosts[0]);
			var ahead = { col: p.col + d.x * 2, row: p.row + d.y * 2 };
			return { col: ahead.col * 2 - blinky.col, row: ahead.row * 2 - blinky.row };
		case 'clyde': // Persegue de longe, foge quando chega perto
			var g = tileOf(ghost);
			var dist = Math.pow(g.col - p.col, 2) + Math.pow(g.row - p.row, 2);
			return dist > 64 ? p : ghost.scatter;
	}
}

/**
 * Escolhe a direção no cruzamento: não volta para trás e vai para o tile mais
 * perto do alvo (assustado escolhe aleatoriamente)
**/
function chooseDirection(ghost)
{
	var tile = tileOf(ghost);
	var options = ['up', 'left', 'down', 'right'].filter(function (dir) {
		return dir != OPPOSITE[ghost.dir] && canWalk(tile.col + DIRS[dir].x, tile.row + DIRS[dir].y);
	});

	if (options.length == 0) {
		return OPPOSITE[ghost.dir];
	}

	if (ghost.frightened && ghost.state == 'active') {
		return options[Math.floor(Math.random() * options.length)];
	}

	var target = ghostTarget(ghost);
	var best = options[0];
	var bestDist = Infinity;

	options.forEach(function (dir) {
		var dist = Math.pow(tile.col + DIRS[dir].x - target.col, 2) + Math.pow(tile.row + DIRS[dir].y - target.row, 2);

		if (dist < bestDist) {
			bestDist = dist;
			best = dir;
		}
	});

	return best;
}

/**
 * Move em linha reta até (x, y); retorna true ao chegar
**/
function moveTowards(ghost, x, y)
{
	// Guarda a direção para os olhos olharem para onde está indo
	if (ghost.x != x) {
		ghost.dir = ghost.x < x ? 'right' : 'left';
		step(ghost, ghost.dir);
	} else if (ghost.y != y) {
		ghost.dir = ghost.y < y ? 'down' : 'up';
		step(ghost, ghost.dir);
	}

	return ghost.x == x && ghost.y == y;
}

function moveGhost(ghost)
{
	var steps = stepsFor(ghost, ghostSpeed(ghost));

	while (steps-- > 0) {
		switch (ghost.state) {
			case 'house': // Fica balançando dentro da casa
				if (roundTime >= ghost.release) {
					ghost.state = 'leaving';
					break;
				}

				if (Math.abs(ghost.y + DIRS[ghost.dir].y - ghost.homeY) > 5) {
					ghost.dir = OPPOSITE[ghost.dir];
				}

				step(ghost, ghost.dir);
				break;

			case 'leaving': // Vai até a coluna da porta e sobe
				moveTowards(ghost, HOUSE_EXIT.col * TILE, ghost.x == HOUSE_EXIT.col * TILE ? HOUSE_EXIT.row * TILE : ghost.y);

				if (ghost.y == HOUSE_EXIT.row * TILE) {
					ghost.state = 'active';
					ghost.dir = 'left';
				}
				break;

			case 'entering': // Olhos descem pela porta até o centro da casa
				if (moveTowards(ghost, HOUSE_INSIDE.col * TILE, HOUSE_INSIDE.row * TILE)) {
					ghost.state = 'leaving';
				}
				break;

			default: // active / eaten
				// Fantasma do jogador (vivo): anda por comando, como o Pacman
				if (ghost.controller == 'player' && ghost.state == 'active') {
					stepControlled(ghost);
					break;
				}

				if (isCentered(ghost)) {
					var tile = tileOf(ghost);

					if (ghost.state == 'eaten' && tile.col == HOUSE_EXIT.col && tile.row == HOUSE_EXIT.row) {
						ghost.state = 'entering';
						break;
					}

					ghost.dir = chooseDirection(ghost);
				}

				step(ghost, ghost.dir);
		}
	}
}

function updateModes()
{
	if (frightenedTimer > 0) {
		frightenedTimer -= DT;

		if (frightenedTimer <= 0) {
			ghosts.forEach(function (ghost) { ghost.frightened = false; });
		}

		// O relógio de dispersão/perseguição pausa enquanto estão assustados
		return;
	}

	modeTimer += DT;

	if (modeTimer >= MODES[modeIndex].time) {
		modeTimer = 0;
		modeIndex++;

		// Na troca de modo os fantasmas da IA dão meia-volta
		ghosts.forEach(function (ghost) {
			if (ghost.state == 'active' && ghost.controller == 'ai') {
				ghost.dir = OPPOSITE[ghost.dir];
			}
		});
	}
}

function checkCollisions()
{
	ghosts.forEach(function (ghost) {
		if (ghost.state != 'active') {
			return;
		}

		if (Math.abs(ghost.x - pacman.x) >= TILE / 2 || Math.abs(ghost.y - pacman.y) >= TILE / 2) {
			return;
		}

		if (ghost.frightened) {
			ghost.frightened = false;
			ghost.state = 'eaten';
			Sound.play('eatGhost');

			if (!isInverse()) {
				addScore(200 * Math.pow(2, ghostCombo));
				ghostCombo++;
			}
		} else if (phase == 'playing') {
			setPhase('dying', 2);
			Sound.play('death');

			// Modo inverso: o fantasma do jogador capturou o Pacman
			if (isInverse()) {
				addInverseScore(CAPTURE_POINTS);
			}
		}
	});
}

/**
 * Fluxo do jogo: ready -> playing -> (dying | levelclear) -> ready ... -> gameover
**/
function setPhase(newPhase, duration)
{
	phase = newPhase;
	phaseTimer = duration;
}

function resetRound()
{
	var start = findStart();

	pacman = { x: start.col * TILE, y: start.row * TILE, dir: null, next: null, acc: 0, moving: false, slowTimer: 0, controller: gameMode == 'classic' && !demo ? 'player' : 'ai' };

	ghosts = GHOSTS.map(function (config, i) {
		var inside = config.row == HOUSE_INSIDE.row;

		return {
			id: config.id,
			el: ghostElements[i],
			x: config.col * TILE,
			y: config.row * TILE,
			homeY: config.row * TILE,
			dir: inside ? 'up' : 'left',
			state: inside ? 'house' : 'active',
			release: Math.max(config.release - (level - 1), 0),
			scatter: config.scatter,
			frightened: false,
			controller: 'ai',
			next: null,
			acc: 0
		};
	});

	// Modo inverso: só o fantasma escolhido, controlado pelo jogador, começando fora da casa
	if (isInverse()) {
		var chosen = ghosts.filter(function (ghost) { return ghost.id == playerGhost; })[0];

		chosen.x = HOUSE_EXIT.col * TILE;
		chosen.y = HOUSE_EXIT.row * TILE;
		chosen.dir = 'left';
		chosen.state = 'active';
		chosen.controller = 'player';
		ghosts = [chosen];
	}

	// O jogador controla o Pacman (clássico), o fantasma (inverso) ou ninguém (demo)
	player = isInverse() ? ghosts[0] : pacman.controller == 'player' ? pacman : null;
	teleport = null;

	roundTime = 0;
	modeIndex = 0;
	modeTimer = 0;
	frightenedTimer = 0;
	pacmanElement.classList.remove('dying');

	PacmanAI.reset();
}

function newGame()
{
	score = 0;
	lives = 3;
	level = 1;
	extraLifeGiven = false;
	playTime = 0;
	recordAtStart = highscore;
	gameOverShown = false;

	resetDots();
	resetRound();
	resetAbility();
	renderLives();

	setPhase('ready', 2);
	Sound.play('start');
}

function update()
{
	playTime += DT;

	switch (phase) {
		case 'ready':
			phaseTimer -= DT;

			if (phaseTimer <= 0) {
				setPhase('playing', 0);
			}
			break;

		case 'playing':
			roundTime += DT;

			if (pacman.controller == 'ai') {
				PacmanAI.observe();
			}

			if (isInverse()) {
				updateAbilities();

				if (demo) {
					driveGhostBot();
				}
			}

			updateModes();
			movePacman();
			ghosts.forEach(moveGhost);
			checkCollisions();
			break;

		case 'dying':
			phaseTimer -= DT;

			if (phaseTimer <= 0) {
				lives--;
				renderLives();

				if (lives == 0 && isInverse()) {
					// Modo inverso: Pacman sem vidas é a vitória do jogador, com bônus pelas pastilhas que sobraram
					addInverseScore(dotsLeft * DOT_BONUS);
					setPhase('levelclear', 2);
				} else if (lives == 0) {
					setPhase('gameover', 2);
				} else {
					resetRound();
					setPhase('ready', 2);
				}
			}
			break;

		case 'levelclear':
			phaseTimer -= DT;

			if (phaseTimer <= 0) {
				level++;

				// Modo inverso: o Pacman volta com todas as vidas
				if (isInverse()) {
					lives = 3;
				}

				resetDots();
				resetRound();
				renderLives();
				setPhase('ready', 2);
			}
			break;

		case 'gameover':
			// Mostra o GAME OVER no labirinto e depois abre a janela de fim de jogo
			phaseTimer -= DT;

			if (phaseTimer <= 0 && !gameOverShown) {
				gameOverShown = true;

				// Na demonstração recomeça sozinho
				if (demo) {
					newGame();
				} else {
					showGameOver();
				}
			}
			break;
	}

	updateSiren();
}

/**
 * Sirene de fundo: olhos voltando > fantasmas assustados > normal
**/
function updateSiren()
{
	if (phase != 'playing') {
		Sound.setSiren('off');
	} else if (ghosts.some(function (ghost) { return ghost.state == 'eaten' || ghost.state == 'entering'; })) {
		Sound.setSiren('eyes');
	} else if (frightenedTimer > 0) {
		Sound.setSiren('frightened');
	} else {
		Sound.setSiren('normal', 1 - dotsLeft / totalDots);
	}
}

/**
 * Desenho
**/
let pacmanElement;
let ghostElements;
let scoreElement;
let highscoreElement;
let levelElement;
let livesElement;
let labelElement;

function place(element, x, y)
{
	element.style.left = x + 'px';
	element.style.top = y + 'px';
}

function draw()
{
	place(pacmanElement, pacman.x, pacman.y);

	// Remove todas as classes de direção e adiciona a atual
	pacmanElement.classList.remove('up', 'down', 'left', 'right');

	if (pacman.dir) {
		pacmanElement.classList.add(pacman.dir);
	}

	pacmanElement.classList.toggle('stopped', !pacman.moving);
	pacmanElement.classList.toggle('dying', phase == 'dying' && phaseTimer < 1);
	// Some no fim de jogo e, no modo inverso, depois de capturado na última vida
	pacmanElement.style.visibility = phase == 'gameover' || (phase == 'levelclear' && isInverse()) ? 'hidden' : 'visible';

	var flash = frightenedTimer < 2 && Math.floor(frightenedTimer * 4) % 2 == 0;

	ghosts.forEach(function (ghost) {
		place(ghost.el, ghost.x + 1, ghost.y + 1);

		// Olhos na direção do movimento
		ghost.el.classList.remove('up', 'down', 'left', 'right');
		ghost.el.classList.add(ghost.dir);
		ghost.el.classList.toggle('frightened', ghost.frightened);
		ghost.el.classList.toggle('flash', ghost.frightened && flash);
		ghost.el.classList.toggle('eaten', ghost.state == 'eaten' || ghost.state == 'entering');
		ghost.el.style.visibility = (phase == 'dying' && phaseTimer < 1.5) || phase == 'levelclear' ? 'hidden' : 'visible';
	});

	board.classList.toggle('flash', phase == 'levelclear');

	// Fantasmas fora da partida (modo inverso) ficam escondidos
	ghostElements.forEach(function (element) {
		if (!ghosts.some(function (ghost) { return ghost.el == element; })) {
			element.style.visibility = 'hidden';
		}
	});

	renderAbility();

	message.textContent = phase == 'ready' ? 'READY!' : phase == 'gameover' ? 'GAME  OVER' : phase == 'levelclear' && isInverse() ? 'VITÓRIA!' : '';
	message.classList.toggle('gameover', phase == 'gameover');

	scoreElement.textContent = score > 0 ? score : '00';
	labelElement.textContent = isInverse() ? playerGhost.toUpperCase() : '1UP';
	highscoreElement.textContent = highscore > 0 ? highscore : '00';
	levelElement.textContent = (demo ? 'DEMO  ' : '') + 'LEVEL ' + level;
}

function renderLives()
{
	livesElement.innerHTML = '';

	// Modo inverso: as 3 vidas do Pacman são os alvos; cada captura apaga uma
	if (isInverse()) {
		for (var j = 0; j < 3; j++) {
			livesElement.appendChild(createSprite('pacman life' + (j >= lives ? ' captured' : '')));
		}

		return;
	}

	// Mostra as vidas de reserva (a atual está em jogo)
	for (var i = 1; i < lives; i++) {
		livesElement.appendChild(createSprite('pacman life'));
	}
}

/**
 * Recorde salvo no navegador
**/
// Cada modo tem o seu recorde
function highscoreKey()
{
	return isInverse() ? 'pacman.highscore.inverse' : 'pacman.highscore';
}

function loadHighscore()
{
	try {
		return parseInt(localStorage.getItem(highscoreKey()), 10) || 0;
	} catch (e) {
		return 0;
	}
}

function saveHighscore()
{
	try {
		localStorage.setItem(highscoreKey(), highscore);
	} catch (e) {
		// Sem localStorage o recorde vale só para esta sessão
	}
}

/**
 * Comando de direção do jogador (teclado ou toque)
**/
function handleInput(dir)
{
	if (running && player && !demo && phase != 'gameover') {
		player.next = dir;
	}
}

/**
 * Celular: deslizar o dedo em qualquer lugar da tela muda a direção
**/
const SWIPE_DISTANCE = 20;

let touchStart = null;

function handleTouchStart(event)
{
	if (!running || event.target.closest('button')) {
		return;
	}

	var touch = event.changedTouches[0];

	touchStart = { x: touch.clientX, y: touch.clientY };
}

function handleTouchMove(event)
{
	if (!touchStart) {
		return;
	}

	// Impede a rolagem e o "puxar para atualizar"
	event.preventDefault();

	var touch = event.changedTouches[0];
	var dx = touch.clientX - touchStart.x;
	var dy = touch.clientY - touchStart.y;

	if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_DISTANCE) {
		return;
	}

	if (Math.abs(dx) > Math.abs(dy)) {
		handleInput(dx > 0 ? 'right' : 'left');
	} else {
		handleInput(dy > 0 ? 'down' : 'up');
	}

	// Permite emendar curvas sem tirar o dedo da tela
	touchStart = { x: touch.clientX, y: touch.clientY };
}

function handleTouchEnd()
{
	touchStart = null;
}

/**
 * Liga/congela o jogo (usado pela pausa, janelas e tela inicial)
**/
function setRunning(value)
{
	running = value;

	// Congela também as animações dos sprites e os sons já agendados
	board.classList.toggle('paused', !running);
	Sound.hold(!running);

	if (!running) {
		touchStart = null;
	}
}

/**
 * Ajusta o tamanho do jogo para caber na tela (celular / janela pequena)
**/
const GAME_WIDTH = 570;
const GAME_HEIGHT = 730;

function fitToScreen()
{
	var root = document.documentElement;
	var scale = Math.min((root.clientWidth - 16) / GAME_WIDTH, (root.clientHeight - 16) / GAME_HEIGHT, 1);

	document.getElementById('game').style.zoom = scale;
}

/**
 * Loop com passo fixo: a velocidade do jogo não depende do FPS do monitor
**/
function config_init()
{
	var last = performance.now();
	var lag = 0;

	function loop(now)
	{
		lag += Math.min(now - last, 250);
		last = now;

		if (running) {
			while (lag >= 1000 / UPDATES) {
				update();
				lag -= 1000 / UPDATES;
			}
		} else {
			lag = 0;
		}

		draw();
		requestAnimationFrame(loop);
	}

	requestAnimationFrame(loop);
}

function init()
{
	board = document.getElementById('board');
	scoreElement = document.getElementById('score');
	highscoreElement = document.getElementById('highscore');
	levelElement = document.getElementById('level');
	livesElement = document.getElementById('lives');
	labelElement = document.getElementById('label-1up');

	buildBoard();

	// Personagens
	ghostElements = GHOSTS.map(function (config) {
		return board.appendChild(createSprite('ghost ' + config.id, config.id));
	});

	pacmanElement = board.appendChild(createSprite('pacman', 'pacman'));

	message = document.createElement('div');
	message.className = 'message';
	board.appendChild(message);

	initInverse();

	highscore = loadHighscore();

	document.addEventListener('touchstart', handleTouchStart, { passive: true });
	document.addEventListener('touchmove', handleTouchMove, { passive: false });
	document.addEventListener('touchend', handleTouchEnd);
	document.addEventListener('touchcancel', handleTouchEnd);

	fitToScreen();
	window.addEventListener('resize', fitToScreen);

	// Prepara um jogo (congelado) para o labirinto já aparecer montado
	resetDots();
	level = 1;
	lives = 3;
	score = 0;
	resetRound();
	renderLives();
	setPhase('ready', 0);
	setRunning(false);

	config_init();

	// Tela inicial, menu, janelas e ranking (screens.js)
	initScreens();
}

document.addEventListener('DOMContentLoaded', init);
