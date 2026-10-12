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

function pacmanSpeed()
{
	return 2 + Math.min(level - 1, 4) * 0.1;
}

function ghostSpeed(ghost)
{
	if (ghost.state == 'eaten' || ghost.state == 'entering') return 4;
	if (ghost.state == 'house' || ghost.state == 'leaving') return 1;
	if (ghost.frightened) return 1;

	return 1.8 + Math.min(level - 1, 4) * 0.1;
}

function frightenedDuration()
{
	return Math.max(6 - (level - 1), 2);
}

/**
 * Pacman
**/
function movePacman()
{
	var steps = stepsFor(pacman, pacmanSpeed());

	pacman.moving = steps == 0 ? pacman.moving : false;

	while (steps-- > 0) {
		// Inverter o sentido é permitido a qualquer momento
		if (pacman.next && pacman.next == OPPOSITE[pacman.dir]) {
			pacman.dir = pacman.next;
		}

		if (isCentered(pacman)) {
			var tile = tileOf(pacman);

			eat(tile.col, tile.row);

			// Curva guardada: vira assim que o caminho estiver livre
			if (pacman.next && canWalk(tile.col + DIRS[pacman.next].x, tile.row + DIRS[pacman.next].y)) {
				pacman.dir = pacman.next;
			}

			if (!pacman.dir || !canWalk(tile.col + DIRS[pacman.dir].x, tile.row + DIRS[pacman.dir].y)) {
				pacman.moving = false;
				break;
			}
		}

		step(pacman, pacman.dir);
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

	if (tile == '.') {
		addScore(10);
	} else {
		addScore(50);
		frighten();
	}

	if (dotsLeft == 0) {
		setPhase('levelclear', 2);
	}
}

function addScore(points)
{
	score += points;

	if (!extraLifeGiven && score >= EXTRA_LIFE_SCORE) {
		extraLifeGiven = true;
		lives++;
		renderLives();
		Sound.play('extraLife');
	}

	if (score > highscore) {
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

		if (ghost.state == 'active') {
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

		// Na troca de modo os fantasmas dão meia-volta
		ghosts.forEach(function (ghost) {
			if (ghost.state == 'active') {
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
			addScore(200 * Math.pow(2, ghostCombo));
			ghostCombo++;
			Sound.play('eatGhost');
		} else if (phase == 'playing') {
			setPhase('dying', 2);
			Sound.play('death');
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

	pacman = { x: start.col * TILE, y: start.row * TILE, dir: null, next: null, acc: 0, moving: false };

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
			acc: 0
		};
	});

	roundTime = 0;
	modeIndex = 0;
	modeTimer = 0;
	frightenedTimer = 0;
	pacmanElement.classList.remove('dying');
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

				if (lives == 0) {
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
				showGameOver();
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
	pacmanElement.style.visibility = phase == 'gameover' ? 'hidden' : 'visible';

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

	message.textContent = phase == 'ready' ? 'READY!' : phase == 'gameover' ? 'GAME  OVER' : '';
	message.classList.toggle('gameover', phase == 'gameover');

	scoreElement.textContent = score > 0 ? score : '00';
	highscoreElement.textContent = highscore > 0 ? highscore : '00';
	levelElement.textContent = 'LEVEL ' + level;
}

function renderLives()
{
	livesElement.innerHTML = '';

	// Mostra as vidas de reserva (a atual está em jogo)
	for (var i = 1; i < lives; i++) {
		livesElement.appendChild(createSprite('pacman life'));
	}
}

/**
 * Recorde salvo no navegador
**/
function loadHighscore()
{
	try {
		return parseInt(localStorage.getItem('pacman.highscore'), 10) || 0;
	} catch (e) {
		return 0;
	}
}

function saveHighscore()
{
	try {
		localStorage.setItem('pacman.highscore', highscore);
	} catch (e) {
		// Sem localStorage o recorde vale só para esta sessão
	}
}

/**
 * Comando de direção do jogador (teclado ou toque)
**/
function handleInput(dir)
{
	if (running && phase != 'gameover') {
		pacman.next = dir;
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

	buildBoard();

	// Personagens
	ghostElements = GHOSTS.map(function (config) {
		return board.appendChild(createSprite('ghost ' + config.id, config.id));
	});

	pacmanElement = board.appendChild(createSprite('pacman', 'pacman'));

	message = document.createElement('div');
	message.className = 'message';
	board.appendChild(message);

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
