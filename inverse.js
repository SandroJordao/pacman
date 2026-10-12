/**
 * JS Document.
 * Modo inverso: o jogador controla um fantasma e o Pacman é a IA (pacman-ai.js).
 *
 * Vence a fase quem capturar o Pacman 3 vezes antes de ele comer tudo.
 * Cada fantasma tem uma diferença:
 *  Blinky: mais rápido que o Pacman (passiva)
 *  Pinky:  teletransporte à frente do Pacman, marcado 2s antes (recarga de 10s)
 *  Inky:   deixa o Pacman lento de qualquer lugar (recarga de 10s)
 *  Clyde:  nenhuma, mas os pontos valem 5x
 *
 * @author Sandro Jordão.
**/

'use strict';

const ABILITY_COOLDOWN = 10;
const TELEPORT_DELAY = 2;
const TELEPORT_AHEAD = 5;
const TELEPORT_MIN_DISTANCE = 3;
const SLOW_TIME = 2;
const SLOW_FACTOR = 0.8;
const BLINKY_BOOST = 1.10;

const CAPTURE_POINTS = 1000;
const DOT_BONUS = 10;
const SCORE_MULTIPLIER = { blinky: 1, pinky: 1, inky: 1, clyde: 5 };

// Ícones em pixel art 12 x 12 (raio, portal, ampulheta e o "x5" do Clyde)
const ABILITY_ICONS = {
	blinky: 'M5 0h5v1h-5zM4 1h5v1h-5zM3 2h5v1h-5zM2 3h5v1h-5zM1 4h9v1h-9zM6 5h4v1h-4zM5 6h4v1h-4zM4 7h4v1h-4zM3 8h3v1h-3zM2 9h2v1h-2zM1 10h1v1h-1z',
	pinky: 'M4 0h4v1h-4zM2 1h2v1h-2zM8 1h2v1h-2zM1 2h1v1h-1zM10 2h1v1h-1zM1 3h1v1h-1zM4 3h4v1h-4zM10 3h1v1h-1zM0 4h1v1h-1zM3 4h1v1h-1zM8 4h1v1h-1zM11 4h1v1h-1zM0 5h1v1h-1zM3 5h1v1h-1zM5 5h2v1h-2zM8 5h1v1h-1zM11 5h1v1h-1zM0 6h1v1h-1zM3 6h1v1h-1zM5 6h2v1h-2zM8 6h1v1h-1zM11 6h1v1h-1zM0 7h1v1h-1zM3 7h1v1h-1zM8 7h1v1h-1zM11 7h1v1h-1zM1 8h1v1h-1zM4 8h4v1h-4zM10 8h1v1h-1zM1 9h1v1h-1zM10 9h1v1h-1zM2 10h2v1h-2zM8 10h2v1h-2zM4 11h4v1h-4z',
	inky: 'M0 0h12v1h-12zM1 1h1v1h-1zM10 1h1v1h-1zM1 2h1v1h-1zM10 2h1v1h-1zM2 3h1v1h-1zM9 3h1v1h-1zM3 4h1v1h-1zM8 4h1v1h-1zM4 5h1v1h-1zM7 5h1v1h-1zM4 6h1v1h-1zM7 6h1v1h-1zM3 7h1v1h-1zM5 7h2v1h-2zM8 7h1v1h-1zM2 8h1v1h-1zM4 8h4v1h-4zM9 8h1v1h-1zM1 9h1v1h-1zM3 9h6v1h-6zM10 9h1v1h-1zM1 10h10v1h-10zM0 11h12v1h-12z',
	clyde: 'M6 1h5v1h-5zM6 2h1v1h-1zM0 3h1v1h-1zM4 3h1v1h-1zM6 3h1v1h-1zM1 4h1v1h-1zM3 4h1v1h-1zM6 4h4v1h-4zM2 5h1v1h-1zM10 5h1v1h-1zM1 6h1v1h-1zM3 6h1v1h-1zM10 6h1v1h-1zM0 7h1v1h-1zM4 7h1v1h-1zM6 7h1v1h-1zM10 7h1v1h-1zM6 8h4v1h-4z'
};

// O Clyde não tem habilidade: o painel só lembra que os pontos dele valem 5x
const ABILITIES = {
	blinky: { name: 'VELOZ', passive: true },
	pinky:  { name: 'TELEPORTE' },
	inky:   { name: 'LENTIDÃO' },
	clyde:  { name: 'PONTOS X5', passive: true }
};

function abilityIcon(ghostId)
{
	return '<svg class="ability-icon" viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="' + ABILITY_ICONS[ghostId] + '"/></svg>';
}

// Fantasma escolhido pelo jogador
let playerGhost = 'blinky';

// Segundos de recarga acumulados (pronta em ABILITY_COOLDOWN)
let abilityCharge = 0;

// Teletransporte do Pinky marcado: { col, row, timer }
let teleport = null;

let abilityElement;
let markerElement;

function isInverse()
{
	return gameMode == 'inverse';
}

function addInverseScore(points)
{
	addScore(points * SCORE_MULTIPLIER[playerGhost]);
}

/**
 * Habilidades
**/
function abilityReady()
{
	return ABILITIES[playerGhost] && !ABILITIES[playerGhost].passive && abilityCharge >= ABILITY_COOLDOWN;
}

function resetAbility()
{
	abilityCharge = 0;
	teleport = null;
}

function useAbility()
{
	var ghost = player;

	if (!isInverse() || !running || phase != 'playing' || !abilityReady() || ghost.state != 'active') {
		return;
	}

	abilityCharge = 0;

	if (playerGhost == 'pinky') {
		var target = ghost.frightened ? farthestFromPacman() : aheadOfPacman();

		teleport = { col: target.col, row: target.row, timer: TELEPORT_DELAY };
		Sound.play('teleport');
	} else if (playerGhost == 'inky') {
		pacman.slowTimer = SLOW_TIME;
		Sound.play('slow');
	}
}

function updateAbilities()
{
	if (abilityCharge < ABILITY_COOLDOWN) {
		abilityCharge = Math.min(abilityCharge + DT, ABILITY_COOLDOWN);
	}

	if (pacman.slowTimer > 0) {
		pacman.slowTimer = Math.max(pacman.slowTimer - DT, 0);
	}

	if (teleport) {
		teleport.timer -= DT;

		// Comido durante a marcação: o teletransporte é perdido
		if (player.state != 'active') {
			teleport = null;
		} else if (teleport.timer <= 0) {
			finishTeleport();
		}
	}
}

function finishTeleport()
{
	var ghost = player;
	var col = teleport.col;
	var row = teleport.row;

	ghost.x = col * TILE;
	ghost.y = row * TILE;

	// Mantém a direção se der para seguir; senão pega a primeira saída
	if (!canWalk(col + DIRS[ghost.dir].x, row + DIRS[ghost.dir].y)) {
		ghost.dir = ['up', 'left', 'down', 'right'].filter(function (dir) {
			return canWalk(col + DIRS[dir].x, row + DIRS[dir].y);
		})[0];
	}

	teleport = null;
	Sound.play('appear');
}

/**
 * IA vs IA: robô que controla o fantasma. Persegue o Pacman pelo menor caminho,
 * foge quando está azul e usa a habilidade quando fica pronta (o Pinky só se
 * estiver longe, para o teletransporte valer a pena).
**/
function driveGhostBot()
{
	var ghost = player;

	if (ghost.state != 'active') {
		return;
	}

	if (isCentered(ghost)) {
		var dist = distancesFromPacman().dist;
		var tile = tileOf(ghost);
		var best = null;
		var bestDist = ghost.frightened ? -1 : Infinity;

		['up', 'left', 'down', 'right'].forEach(function (dir) {
			var key = ((tile.col + DIRS[dir].x) % COLS + COLS) % COLS + ',' + (tile.row + DIRS[dir].y);

			if (!(key in dist)) return;

			if (ghost.frightened ? dist[key] > bestDist : dist[key] < bestDist) {
				bestDist = dist[key];
				best = dir;
			}
		});

		if (best) {
			ghost.next = best;
		}
	}

	if (abilityReady()) {
		var here = tileOf(ghost);
		var far = distancesFromPacman().dist[here.col + ',' + here.row] > 5;

		if (playerGhost != 'pinky' || far || ghost.frightened) {
			useAbility();
		}
	}
}

/**
 * Distância (em tiles) do Pacman até cada tile andável: { "col,row": dist }
**/
function distancesFromPacman()
{
	var start = tileOf(pacman);
	var dist = {};
	var queue = [start];

	dist[start.col + ',' + start.row] = 0;

	for (var q = 0; q < queue.length; q++) {
		var current = queue[q];

		['up', 'left', 'down', 'right'].forEach(function (dir) {
			var col = ((current.col + DIRS[dir].x) % COLS + COLS) % COLS;
			var row = current.row + DIRS[dir].y;
			var key = col + ',' + row;

			if (!canWalk(col, row) || key in dist) return;

			dist[key] = dist[current.col + ',' + current.row] + 1;
			queue.push({ col: col, row: row });
		});
	}

	return { dist: dist, order: queue };
}

/**
 * Destino do Pinky: alguns tiles à frente seguindo os corredores do Pacman
**/
function aheadOfPacman()
{
	var tile = tileOf(pacman);
	var dir = pacman.dir || 'left';
	var dist = distancesFromPacman().dist;
	var col = tile.col;
	var row = tile.row;

	for (var i = 0; i < TELEPORT_AHEAD * 2; i++) {
		// Segue reto se puder; nas curvas pega a única saída sem voltar
		var options = ['up', 'left', 'down', 'right'].filter(function (d) {
			return d != OPPOSITE[dir] && canWalk(col + DIRS[d].x, row + DIRS[d].y);
		});

		if (options.length == 0) {
			break;
		}

		dir = options.indexOf(dir) >= 0 ? dir : options[0];
		col = ((col + DIRS[dir].x) % COLS + COLS) % COLS;
		row += DIRS[dir].y;

		if (i + 1 >= TELEPORT_AHEAD && dist[col + ',' + row] >= TELEPORT_MIN_DISTANCE) {
			break;
		}
	}

	return { col: col, row: row };
}

// Pinky assustado: foge para o ponto mais distante do Pacman
function farthestFromPacman()
{
	var order = distancesFromPacman().order;

	return order[order.length - 1];
}

/**
 * Painel da habilidade (rodapé) e marcador do teletransporte
**/
function renderAbility()
{
	var ability = isInverse() ? ABILITIES[playerGhost] : null;

	abilityElement.hidden = !ability;
	markerElement.hidden = !teleport;
	pacmanElement.classList.toggle('slowed', pacman.slowTimer > 0);

	if (teleport) {
		place(markerElement, teleport.col * TILE, teleport.row * TILE);
	}

	if (!ability) {
		return;
	}

	// Monta o ícone só quando troca de fantasma
	if (abilityElement.dataset.ghost != playerGhost) {
		abilityElement.dataset.ghost = playerGhost;
		abilityElement.innerHTML = '<span class="ability-ring">' + abilityIcon(playerGhost) + '</span><span class="ability-name">' + ability.name + '</span>';
		abilityElement.disabled = !!ability.passive;
		abilityElement.title = ability.passive ? ability.name : ability.name + ' (E)';
	}

	// O anel enche com a recarga; em uso, esvazia com o tempo que falta do efeito
	var state = 'charging';
	var charge = abilityCharge / ABILITY_COOLDOWN;

	if (ability.passive) {
		state = 'passive';
		charge = 1;
	} else if (teleport) {
		state = 'active';
		charge = teleport.timer / TELEPORT_DELAY;
	} else if (pacman.slowTimer > 0) {
		state = 'active';
		charge = pacman.slowTimer / SLOW_TIME;
	} else if (abilityReady()) {
		state = 'ready';
	}

	abilityElement.className = 'ability ' + playerGhost + ' ' + state;
	abilityElement.style.setProperty('--charge', Math.max(0, Math.min(charge, 1)).toFixed(3));
}

function initInverse()
{
	abilityElement = document.getElementById('ability');

	markerElement = document.createElement('div');
	markerElement.className = 'teleport-marker';
	markerElement.hidden = true;
	board.appendChild(markerElement);
}
