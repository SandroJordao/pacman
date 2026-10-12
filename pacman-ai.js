/**
 * JS Document.
 * IA do Pacman: usada no modo demonstração (e no modo inverso).
 *
 * Decide no centro de cada tile:
 *  1. mapa de perigo: em quanto tempo cada fantasma chega a cada tile (BFS);
 *  2. região segura: tiles aonde o Pacman chega antes, com folga;
 *  3. objetivo: caçar fantasma assustado > power pill se ameaçado >
 *     pastilha mais próxima > fugir pelo caminho com mais folga.
 *
 * @author Sandro Jordão.
**/

'use strict';

const PacmanAI = (function ()
{
	/**
	 * Dificuldade por fase (a última vale para as seguintes)
	 *  margin:   folga (em atualizações) para considerar um tile seguro
	 *  vision:   até quantos tiles de distância enxerga os fantasmas
	 *  reaction: atraso (em atualizações) com que percebe os fantasmas
	 *  mistake:  chance de escolher uma direção qualquer num cruzamento
	**/
	const LEVELS = [
		{ margin: 4,  vision: 7,  reaction: 20, mistake: 0.10 },
		{ margin: 6,  vision: 9,  reaction: 16, mistake: 0.07 },
		{ margin: 8,  vision: 12, reaction: 12, mistake: 0.05 },
		{ margin: 10, vision: 16, reaction: 9,  mistake: 0.03 },
		{ margin: 12, vision: 24, reaction: 6,  mistake: 0.02 },
		{ margin: 14, vision: 99, reaction: 4,  mistake: 0.01 }
	];

	const ORDER = ['up', 'left', 'down', 'right'];

	// Abaixo disso (em atualizações) um fantasma assustado já conta como perigo
	const FRIGHT_ENDING = 90;

	// Modo inverso: com a lentidão do Inky pronta, guarda mais distância (em atualizações)
	const INKY_CAUTION = 30;
	
	// Ameaçado: algum fantasma chega ao tile do Pacman em menos de X tiles
	const THREAT_TILES = 6;

	// Sem comer por esse tempo, escolhe uma pastilha distante e vai até ela
	const STUCK_TICKS = 6 * UPDATES;
	const COMMIT_TICKS = 10 * UPDATES;

	let graph = null;
	let snapshots = [];
	let lastDots = 0;
	let stuckTicks = 0;
	let commit = null;

	function settings()
	{
		return LEVELS[Math.min(level, LEVELS.length) - 1];
	}

	function index(col, row)
	{
		return row * COLS + (col % COLS + COLS) % COLS;
	}

	/**
	 * Vizinhos de cada tile andável (o labirinto não muda, só as pastilhas)
	**/
	function buildGraph()
	{
		graph = [];

		for (let row = 0; row < ROWS; row++) {
			for (let col = 0; col < COLS; col++) {
				const edges = [];

				if (canWalk(col, row)) {
					ORDER.forEach(function (dir) {
						const c = col + DIRS[dir].x;
						const r = row + DIRS[dir].y;

						if (canWalk(c, r)) {
							edges.push({ dir: dir, idx: index(c, r) });
						}
					});
				}

				graph.push(edges);
			}
		}
	}

	/**
	 * Busca em largura a partir de start.
	 *  blockedFirst: direção proibida no primeiro passo (fantasma não dá meia-volta)
	 *  allowed(idx, dist): pode entrar neste tile a esta distância?
	 * Retorna a distância de cada tile, a primeira direção do caminho e a ordem de visita.
	**/
	function bfs(start, blockedFirst, allowed)
	{
		const dist = new Array(ROWS * COLS).fill(Infinity);
		const first = new Array(ROWS * COLS).fill(null);
		const queue = [start];

		dist[start] = 0;

		for (let q = 0; q < queue.length; q++) {
			const current = queue[q];

			graph[current].forEach(function (edge) {
				if (current == start && edge.dir == blockedFirst) return;
				if (dist[edge.idx] != Infinity) return;

				const d = dist[current] + 1;

				if (allowed && !allowed(edge.idx, d)) return;

				dist[edge.idx] = d;
				first[edge.idx] = current == start ? edge.dir : first[current];
				queue.push(edge.idx);
			});
		}

		return { dist: dist, first: first, order: queue };
	}

	/**
	 * Guarda onde os fantasmas estão a cada atualização (para o atraso de reação)
	**/
	function observe()
	{
		snapshots.push(ghosts.map(function (ghost) {
			return {
				tile: tileOf(ghost),
				dir: ghost.dir,
				state: ghost.state,
				frightened: ghost.frightened,
				controller: ghost.controller,
				release: ghost.release,
				ghost: ghost
			};
		}));

		if (snapshots.length > 60) {
			snapshots.shift();
		}

		// Tempo sem comer
		if (dotsLeft != lastDots) {
			lastDots = dotsLeft;
			stuckTicks = 0;
		} else {
			stuckTicks++;
		}
	}

	/**
	 * Em quantas atualizações o fantasma mais rápido chega a cada tile
	**/
	function dangerMap(pacDist)
	{
		const config = settings();
		const snapshot = snapshots[Math.max(0, snapshots.length - 1 - config.reaction)] || [];
		const danger = new Array(ROWS * COLS).fill(Infinity);
		const frightLeft = frightenedTimer * UPDATES;

		snapshot.forEach(function (g) {
			if (g.state == 'eaten' || g.state == 'entering') return;

			// Assustado só preocupa quando o efeito está acabando
			if (g.frightened && frightLeft > FRIGHT_ENDING) return;

			const speed = ghostSpeed({ id: g.ghost.id, controller: g.controller, state: 'active', frightened: false });
			let delay = g.frightened ? frightLeft : 0;
			let from = g.tile;
			let blocked = g.controller == 'ai' ? OPPOSITE[g.dir] : null;

			// Ainda na casa: vai sair pela porta
			if (g.state == 'house' || g.state == 'leaving') {
				from = HOUSE_EXIT;
				blocked = null;
				delay += (g.state == 'house' ? Math.max(0, g.release - roundTime) * UPDATES : 0) + UPDATES;
			}

			const start = index(from.col, from.row);

			// Fora do alcance da visão: o Pacman não vê este fantasma
			if (!(pacDist[start] <= config.vision)) return;

			const result = bfs(start, blocked);

			result.order.forEach(function (idx) {
				danger[idx] = Math.min(danger[idx], delay + result.dist[idx] * TILE / speed);
			});
		});

		// Marca do teletransporte do Pinky (modo inverso): ele vai aparecer ali
		if (teleport && player && !(player.frightened && frightLeft > FRIGHT_ENDING)) {
			const start = index(teleport.col, teleport.row);

			if (pacDist[start] <= config.vision) {
				const speed = ghostSpeed({ id: player.id, controller: 'player', state: 'active', frightened: false });
				const delay = Math.max(teleport.timer * UPDATES, player.frightened ? frightLeft : 0);
				const result = bfs(start, null);

				result.order.forEach(function (idx) {
					danger[idx] = Math.min(danger[idx], delay + result.dist[idx] * TILE / speed);
				});
			}
		}

		return danger;
	}

	function hasDot(idx)
	{
		const tile = grid[Math.floor(idx / COLS)][idx % COLS];

		return tile == '.' || tile == 'o';
	}

	/**
	 * Sem caminho seguro: escolhe a saída com mais folga em relação aos fantasmas
	**/
	function flee(start, danger, pacTime)
	{
		let best = null;
		let bestScore = -Infinity;

		graph[start].forEach(function (edge) {
			let score = danger[edge.idx] - pacTime(1);

			// Dá para entrar: procura até 10 tiles adiante, só por onde chega vivo
			if (score > 0) {
				const ahead = bfs(edge.idx, null, function (idx, d) {
					return idx != start && d <= 10 && pacTime(d + 1) < danger[idx];
				});

				ahead.order.forEach(function (idx) {
					score = Math.max(score, danger[idx] - pacTime(ahead.dist[idx] + 1));
				});
			}

			if (score > bestScore) {
				bestScore = score;
				best = edge.dir;
			}
		});

		return best;
	}

	/**
	 * Decide a direção do Pacman no centro do tile
	**/
	function decide(tile)
	{
		if (!graph) {
			buildGraph();
		}

		const config = settings();
		const start = index(tile.col, tile.row);
		const speed = pacmanSpeed();
		const pacTime = function (d) { return d * TILE / speed; };

		if (graph[start].length == 0) {
			return pacman.dir;
		}

		// Erro de propósito: num cruzamento, às vezes vai para qualquer lado
		if (graph[start].length >= 3 && Math.random() < config.mistake) {
			const options = graph[start].filter(function (edge) { return edge.dir != OPPOSITE[pacman.dir]; });

			return options[Math.floor(Math.random() * options.length)].dir;
		}

		const free = bfs(start);
		const danger = dangerMap(free.dist);

		// Região segura: chega antes de qualquer fantasma, com folga
		const margin = config.margin + (isInverse() && playerGhost == 'inky' && abilityReady() ? INKY_CAUTION : 0);
		const safe = bfs(start, null, function (idx, d) {
			return pacTime(d) + margin < danger[idx];
		});

		// 1. Caçar fantasma assustado que dá para alcançar antes do efeito acabar
		if (frightenedTimer > 0) {
			let target = null;

			ghosts.forEach(function (ghost) {
				if (!ghost.frightened || ghost.state != 'active') return;

				const g = tileOf(ghost);
				const idx = index(g.col, g.row);
				const d = safe.dist[idx];

				if (d > 0 && pacTime(d) < frightenedTimer * UPDATES - FRIGHT_ENDING / 2 && (!target || d < safe.dist[target])) {
					target = idx;
				}
			});

			if (target !== null) {
				return safe.first[target];
			}
		}

		// 2. Pastilha combinada (estava travado) ainda segura
		if (commit && (!hasDot(commit.idx) || commit.until < roundTime * UPDATES || safe.dist[commit.idx] == Infinity)) {
			commit = null;
		}

		if (!commit && stuckTicks > STUCK_TICKS) {
			const dots = safe.order.filter(hasDot);

			if (dots.length) {
				commit = { idx: dots[Math.floor(Math.random() * dots.length)], until: roundTime * UPDATES + COMMIT_TICKS };
				stuckTicks = 0;
			}
		}

		if (commit && safe.dist[commit.idx] > 0) {
			return safe.first[commit.idx];
		}

		// 3. Pastilha mais próxima; power pill quando está ameaçado (ou só sobrou ela)
		const threatened = danger[start] < THREAT_TILES * TILE / ghostSpeed({ state: 'active', frightened: false });
		let dot = null;
		let pill = null;

		safe.order.forEach(function (idx) {
			if (idx == start) return;

			const t = grid[Math.floor(idx / COLS)][idx % COLS];

			if (t == '.' && dot === null) dot = idx;
			if (t == 'o' && pill === null) pill = idx;
		});

		const target = threatened && pill !== null ? pill : dot !== null ? dot : pill;

		if (target !== null) {
			return safe.first[target];
		}

		// 4. Sem nada seguro: foge
		return flee(start, danger, pacTime) || pacman.dir;
	}

	function reset()
	{
		snapshots = [];
		lastDots = dotsLeft;
		stuckTicks = 0;
		commit = null;
	}

	return {
		LEVELS: LEVELS,
		observe: observe,
		decide: decide,
		reset: reset
	};
})();
