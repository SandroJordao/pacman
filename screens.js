/**
 * JS Document.
 * Tela inicial, menu e janelas (instruções, pausa, ranking e fim de jogo).
 * @author Sandro Jordão.
**/

'use strict';

const RANKING_URL = 'api/ranking.php';
const STORAGE_NAME = 'pacman.name';
const STORAGE_GHOST = 'pacman.ghost';
const STORAGE_HOME_MODE = 'pacman.mode';

// Duração de uma ida e volta da animação da tela inicial (ms)
const HERO_PERIOD = 9000;

// Fantasmas do modo inverso (as regras ficam no inverse.js)
const GHOST_INFO = {
	blinky: { name: 'BLINKY', nick: 'PERSEGUIDOR', level: 'FÁCIL', text: 'Mais rápido que o Pac-Man.' },
	pinky:  { name: 'PINKY', nick: 'EMBOSCADOR', level: 'MÉDIO', text: 'Teletransporte para a frente do Pac-Man. O destino aparece 2s antes.' },
	inky:   { name: 'INKY', nick: 'IMPREVISÍVEL', level: 'MÉDIO', text: 'Deixa o Pac-Man lento por 2s, de qualquer lugar.' },
	clyde:  { name: 'CLYDE', nick: 'DESPREOCUPADO', level: 'HARDCORE', text: 'Sem habilidade nenhuma. Os pontos valem 5x.' }
};

const dom = {};

const ui = {
	modal: null,      // janela aberta: { escape, pauseKeys, keys }
	selectedGhost: 'blinky',
	homeMode: 'classic', // modo escolhido na tela inicial: 'classic' | 'inverse'
	heroBack: null,      // animação da tela inicial: true na volta
	homeTops: { classic: null, inverse: null }, // 1º lugar de cada ranking
	menuIndex: 0,
	playerName: '',
	savingScore: false
};

function storageGet(key)
{
	try {
		return localStorage.getItem(key);
	} catch (e) {
		return null;
	}
}

function storageSet(key, value)
{
	try {
		localStorage.setItem(key, value);
	} catch (e) {
		// Sem localStorage a informação vale só para esta sessão
	}
}

function escapeHtml(text)
{
	var div = document.createElement('div');

	div.textContent = text;

	return div.innerHTML;
}

function highlight(value)
{
	return '<span class="highlight">' + value + '</span>';
}

function secToTime(num)
{
	var hours = Math.floor(num / 3600);
	var minutes = Math.floor((num % 3600) / 60);
	var seconds = num % 60;
	var pad = function (n) { return n < 10 ? '0' + n : '' + n; };

	return (hours > 0 ? hours + ':' : '') + pad(minutes) + ':' + pad(seconds);
}

/**
 * Janela de mensagens.
 *
 * buttons: [{ label, action, primary, keepOpen }]. O botão primary fica
 *          em destaque e recebe o foco; keepOpen não fecha a janela.
 * options: { escape: ação do Esc, pauseKeys: Espaço/P também fazem o Esc,
 *            focus: seletor do campo que recebe o foco,
 *            keys: função(evento) que trata teclas próprias da janela; true = tratada }
**/
function openModal(title, html, buttons, options)
{
	options = options || {};

	var focus = null;

	dom.modalTitle.textContent = title;
	dom.modalBody.innerHTML = html;
	dom.modalActions.textContent = '';

	buttons.forEach(function (b) {
		var button = document.createElement('button');

		button.type = 'button';
		button.className = 'modal-btn' + (b.primary ? ' primary' : '');
		button.textContent = b.label;
		button.addEventListener('click', function () {
			if (b.keepOpen) {
				b.action();
			} else {
				closeModal(b.action);
			}
		});

		if (b.primary || !focus) {
			focus = button;
		}

		dom.modalActions.appendChild(button);
	});

	ui.modal = { escape: options.escape || null, pauseKeys: !!options.pauseKeys, keys: options.keys || null };
	dom.modal.hidden = false;
	dom.modal.scrollTop = 0;

	if (options.focus) {
		focus = dom.modalBody.querySelector(options.focus);
	}

	// Sem rolar: janelas longas (instruções) abrem pelo topo
	setTimeout(function () { if (focus) focus.focus({ preventScroll: true }); }, 50);
}

function closeModal(action)
{
	dom.modal.hidden = true;
	ui.modal = null;

	if (action) {
		action();
	}
}

function dismissModal()
{
	if (ui.modal && ui.modal.escape) {
		closeModal(ui.modal.escape);
	}
}

/**
 * Tela inicial
**/
function buildHome()
{
	// Fantasmas atrás do Pac-Man (as classes mudam em renderHero)
	var sprites = document.createElement('div');

	sprites.className = 'hero-sprites';
	dom.heroGhosts = GHOSTS.slice().reverse().map(function (config) {
		var ghost = createSprite('ghost ' + config.id);

		ghost.dataset.ghost = config.id;

		return sprites.appendChild(ghost);
	});
	dom.heroPacman = sprites.appendChild(createSprite('pacman'));
	dom.heroTrack.appendChild(sprites);

	requestAnimationFrame(animateHero);
}

/**
 * Animação da tela inicial
 *  Clássico: os fantasmas perseguem o Pac-Man e, na volta, ele persegue os fantasmas azuis.
 *  Inverso:  os fantasmas perseguem o Pac-Man nas duas direções.
**/
function animateHero(now)
{
	requestAnimationFrame(animateHero);

	if (dom.home.hidden) {
		return;
	}

	var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var t = reduced ? 0.25 : (now % HERO_PERIOD) / HERO_PERIOD;
	var back = t >= 0.5;
	var progress = back ? (t - 0.5) * 2 : t * 2;
	var width = dom.hero.clientWidth;
	var track = dom.heroTrack.offsetWidth;
	var x = back ? width - progress * (width + track) : progress * (width + track) - track;
	var inverse = ui.homeMode == 'inverse';

	// No inverso a volta espelha a fila: o Pac-Man continua na frente
	// Pixel inteiro: em posição fracionária a pixel art fica com riscos
	dom.heroTrack.style.transform = 'translateX(' + Math.round(x) + 'px)' + (back && inverse ? ' scaleX(-1)' : '');

	if (back !== ui.heroBack) {
		ui.heroBack = back;
		renderHero();
	}
}

function renderHero()
{
	var turned = ui.heroBack && ui.homeMode == 'classic';
	var dir = turned ? 'left' : 'right';

	dom.heroPacman.className = 'pacman ' + dir;
	dom.heroGhosts.forEach(function (ghost) {
		ghost.className = 'ghost ' + dir + ' ' + ghost.dataset.ghost + (turned ? ' frightened' : '');
	});
}

/**
 * Tela inicial no modo clássico ou inverso
**/
function setHomeMode(mode)
{
	ui.homeMode = mode;
	storageSet(STORAGE_HOME_MODE, mode);
	renderHome();
}

function toggleHomeMode()
{
	setHomeMode(ui.homeMode == 'inverse' ? 'classic' : 'inverse');
}

function renderHome()
{
	var inverse = ui.homeMode == 'inverse';

	dom.home.classList.toggle('inverse', inverse);
	dom.homeBadge.hidden = !inverse;
	dom.homeTagline.textContent = inverse ? 'Seja o fantasma e cace o Pac-Man!' : 'Coma todas as pastilhas e fuja dos fantasmas!';
	dom.menuMode.textContent = inverse ? 'MODO CLÁSSICO' : 'MODO INVERSO';
	dom.homeRecord.textContent = parseInt(storageGet(inverse ? 'pacman.highscore.inverse' : 'pacman.highscore'), 10) || 0;

	// 1º lugar do ranking do modo
	var top = ui.homeTops[ui.homeMode];

	dom.homeTop.hidden = !top;

	if (top) {
		dom.homeTopName.textContent = top.name;
		dom.homeTopScore.textContent = top.score;
	}

	renderHero();
}

// JOGAR: começa o modo da tela inicial
function playCurrentMode()
{
	if (ui.homeMode == 'inverse') {
		showGhostSelect();
	} else {
		startGame();
	}
}

function showHome()
{
	dom.game.hidden = true;
	dom.home.hidden = false;
	renderHome();

	// 1º lugar do ranking de cada modo no rodapé (se o servidor responder)
	['classic', 'inverse'].forEach(function (mode) {
		fetch(rankingUrl(mode))
			.then(function (response) { return response.json(); })
			.then(function (data) {
				ui.homeTops[mode] = data.ok && data.top[0] || null;
				renderHome();
			})
			.catch(function () {
				ui.homeTops[mode] = null;
				renderHome();
			});
	});

	focusMenu();
}

function focusMenu()
{
	if (dom.home.hidden || !dom.modal.hidden) {
		return;
	}

	var items = dom.menu.querySelectorAll('.menu-item');
	var current = items[ui.menuIndex] || items[0];

	setTimeout(function () { current.focus(); }, 50);
}

// Setas para cima/baixo percorrem o menu, como num fliperama
function moveMenu(step)
{
	var items = Array.prototype.slice.call(dom.menu.querySelectorAll('.menu-item'));
	var index = items.indexOf(document.activeElement);

	index = index < 0 ? 0 : (index + step + items.length) % items.length;
	items[index].focus();
}

function startGame()
{
	gameMode = 'classic';
	demo = false;
	setHomeMode('classic');
	highscore = loadHighscore();
	dom.home.hidden = true;
	dom.game.hidden = false;

	fitToScreen();
	restart();
}

function restart()
{
	Sound.unlock();
	setRunning(true);
	newGame();
}

// IA vs IA. No inverso, com o fantasma escolhido (ghostId); sem ele, o último
// escolhido. Também abre com index.php?demo (ou ?demo=inverse)
function startDemo(mode, ghostId)
{
	gameMode = mode;
	demo = true;

	if (mode == 'inverse') {
		var stored = storageGet(STORAGE_GHOST);

		playerGhost = ghostId in GHOST_INFO ? ghostId : stored in GHOST_INFO ? stored : 'blinky';
	}

	highscore = loadHighscore();
	dom.home.hidden = true;
	dom.game.hidden = false;

	fitToScreen();
	restart();
}

// Modo inverso com o fantasma escolhido. Por enquanto abre com index.php?inverse=pinky
function startInverse(ghostId)
{
	gameMode = 'inverse';
	demo = false;
	playerGhost = ghostId;
	storageSet(STORAGE_GHOST, ghostId);
	setHomeMode('inverse');
	highscore = loadHighscore();
	dom.home.hidden = true;
	dom.game.hidden = false;

	fitToScreen();
	restart();
}

// Sai da partida (já confirmado) e volta para a tela inicial
function goHome()
{
	setRunning(false);
	gameMode = 'classic';
	demo = false;
	highscore = loadHighscore();
	showHome();
}

/**
 * Som
**/
function toggleSound()
{
	Sound.unlock();
	Sound.toggleMute();
	renderSound();
}

function renderSound()
{
	var on = !Sound.isMuted();

	dom.soundState.textContent = on ? 'LIGADO' : 'DESLIGADO';
	dom.menuSound.setAttribute('aria-pressed', on ? 'true' : 'false');
}

/**
 * Escolha do fantasma (modo inverso)
**/
// watch: escolha para a IA vs IA (o robô controla o fantasma escolhido)
function showGhostSelect(watch)
{
	var start = watch
		? function (id) { startDemo('inverse', id); }
		: startInverse;
	var html = '<div class="ghost-select" role="radiogroup" aria-label="Fantasmas">';

	Object.keys(GHOST_INFO).forEach(function (id) {
		var info = GHOST_INFO[id];

		html += '<button type="button" class="ghost-card ' + id + '" data-ghost="' + id + '" role="radio" aria-checked="false">' +
			'<span class="ghost-card-sprite"></span>' +
			'<span class="ghost-card-name">' + info.name + '</span>' +
			'<span class="ghost-card-nick">' + info.nick + '</span>' +
			'<span class="ghost-card-ability">' + abilityIcon(id) + ABILITIES[id].name + '</span>' +
			'<span class="ghost-card-text">' + info.text + '</span>' +
			'<span class="ghost-card-level">' + info.level + '</span>' +
		'</button>';
	});

	html += '</div><p class="stats">' + (watch
		? 'Escolha o fantasma que a IA vai controlar contra o Pac-Man.'
		: 'Capture o Pac-Man ' + highlight('3 vezes') + ' antes que ele coma todas as pastilhas.') + '</p>';

	var selected = storageGet(STORAGE_GHOST);

	if (!(selected in GHOST_INFO)) {
		selected = 'blinky';
	}

	openModal(
		watch ? 'IA VS IA' : 'ESCOLHA SEU FANTASMA',
		html,
		[
			{ label: 'VOLTAR', action: focusMenu },
			{ label: watch ? 'ASSISTIR' : 'JOGAR', action: function () { start(ui.selectedGhost); }, primary: true }
		],
		{ escape: focusMenu, keys: ghostSelectKeys, focus: '[data-ghost="' + selected + '"]' }
	);

	dom.modalBody.querySelectorAll('.ghost-card').forEach(function (card) {
		var id = card.getAttribute('data-ghost');

		card.querySelector('.ghost-card-sprite').appendChild(createSprite('ghost down ' + id));

		card.addEventListener('click', function () {
			selectGhost(id);
		});

		// Enter num cartão já começa com ele
		card.addEventListener('keydown', function (e) {
			if (e.key === 'Enter') {
				e.preventDefault();
				closeModal(function () { start(id); });
			}
		});
	});

	selectGhost(selected);
}

function selectGhost(id)
{
	ui.selectedGhost = id;

	dom.modalBody.querySelectorAll('.ghost-card').forEach(function (card) {
		var on = card.getAttribute('data-ghost') == id;

		card.classList.toggle('selected', on);
		card.setAttribute('aria-checked', on ? 'true' : 'false');
	});
}

// Setas trocam o fantasma escolhido
function ghostSelectKeys(e)
{
	var step = { ArrowLeft: -1, ArrowUp: -2, ArrowRight: 1, ArrowDown: 2 }[e.key];

	if (!step) {
		return false;
	}

	var ids = Object.keys(GHOST_INFO);
	var index = (ids.indexOf(ui.selectedGhost) + step + ids.length) % ids.length;

	e.preventDefault();
	selectGhost(ids[index]);
	dom.modalBody.querySelector('[data-ghost="' + ids[index] + '"]').focus();

	return true;
}

// Fim de jogo no modo inverso: vai direto para a escolha
function changeGhost()
{
	goHome();
	showGhostSelect();
}

/**
 * Instruções
**/
function showHelp()
{
	var classic =
		'<ul>' +
			'<li>Coma <span class="highlight">todas as pastilhas</span> do labirinto para passar de fase.</li>' +
			'<li>Encostar em um fantasma custa uma vida. São 3 vidas, e você ganha <span class="highlight">uma extra aos 10.000</span> pontos.</li>' +
			'<li>As <span class="highlight">pastilhas grandes</span> deixam os fantasmas azuis por alguns segundos: aí é você quem caça! Cada fantasma comido em sequência vale mais: 200, 400, 800 e 1600.</li>' +
			'<li>Use o <span class="highlight">túnel</span> nas laterais para escapar para o outro lado.</li>' +
			'<li>Cada fantasma tem um jeito: Blinky persegue, Pinky tenta cortar pela frente, Inky cerca junto com o Blinky e Clyde é imprevisível.</li>' +
			'<li>A cada fase todos ficam mais rápidos e o efeito das pastilhas grandes dura menos.</li>' +
			'<li>Teclado: <span class="highlight">setas</span> ou <span class="highlight">WASD</span> movem, <span class="highlight">Espaço</span> pausa, <span class="highlight">Esc</span> sai e <span class="highlight">M</span> liga/desliga o som.</li>' +
			'<li>Celular: <span class="highlight">deslize o dedo</span> em qualquer lugar da tela.</li>' +
		'</ul>';

	var inverse =
		'<ul>' +
			'<li>Agora você é <span class="highlight">um fantasma</span> e o Pac-Man joga sozinho.</li>' +
			'<li>Capture o Pac-Man <span class="highlight">3 vezes</span> para vencer a fase. Se ele comer todas as pastilhas, você perde.</li>' +
			'<li>Cada captura vale 1000 pontos, e ao vencer a fase cada pastilha que sobrou vale 10.</li>' +
			'<li>Cuidado com as <span class="highlight">pastilhas grandes</span>: você fica azul e o Pac-Man pode te comer.</li>' +
			'<li>Cada fantasma tem uma habilidade. Quando ela estiver pronta, o botão no rodapé pisca: toque nele ou aperte <span class="highlight">E</span>.</li>' +
			'<li>O Clyde não tem habilidade nenhuma, mas os pontos dele valem <span class="highlight">5x</span>.</li>' +
			'<li>Teclado: <span class="highlight">setas</span> ou <span class="highlight">WASD</span> movem, <span class="highlight">E</span> usa a habilidade, <span class="highlight">Espaço</span> pausa e <span class="highlight">Esc</span> sai. No celular, <span class="highlight">deslize o dedo</span>.</li>' +
		'</ul>';

	// Só as regras do modo escolhido na tela inicial
	openModal(
		ui.homeMode == 'inverse' ? 'MODO INVERSO' : 'COMO JOGAR',
		ui.homeMode == 'inverse' ? inverse : classic,
		[
			{ label: 'VOLTAR', action: focusMenu },
			{ label: 'JOGAR', action: playCurrentMode, primary: true }
		],
		{ escape: focusMenu }
	);
}

/**
 * Pausa
**/
const PAUSE_MESSAGES = [
	{
		title: 'PAUSA PRO LANCHE',
		body: 'O Pac-Man parou para digerir umas pastilhas. Os fantasmas estão congelados esperando você.',
		no: 'VOLTAR A COMER'
	},
	{
		title: 'TEMPO!',
		body: 'Blinky, Pinky, Inky e Clyde prometeram <span class="highlight">não sair do lugar</span>.',
		no: 'CONTINUAR'
	},
	{
		title: 'LABIRINTO PARADO',
		body: 'Nenhuma pastilha vai fugir. Respire fundo e volte quando quiser.',
		no: 'BORA!'
	}
];

// Pausa automática ao trocar de aba
const AWAY_MESSAGE = {
	title: 'SAIU DO LABIRINTO?',
	body: 'Você saiu e a gente pausou o jogo. <span class="highlight">Nenhum fantasma se mexeu.</span>',
	no: 'VOLTEI!'
};

function pause(away)
{
	if (!running) {
		return;
	}

	setRunning(false);
	pauseModal(away);
}

function pauseModal(away)
{
	var msg = away === true ? AWAY_MESSAGE : PAUSE_MESSAGES[Math.floor(Math.random() * PAUSE_MESSAGES.length)];

	openModal(
		msg.title,
		'<p>' + msg.body + '</p>' +
		'<p class="stats">PONTOS ' + highlight(score) + ' &middot; FASE ' + highlight(level) + ' &middot; ' +
			(isInverse() ? 'CAPTURAS ' + highlight((3 - lives) + '/3') : 'VIDAS ' + highlight(lives)) + '</p>',
		[
			{ label: 'SAIR', action: requestExit },
			{ label: msg.no, action: resume, primary: true }
		],
		{ escape: resume, pauseKeys: true }
	);
}

function resume()
{
	setRunning(true);
}

/**
 * Sair da partida: pede confirmação
**/
const EXIT_MESSAGES = [
	{
		title: 'DESISTIR?',
		body: 'Os fantasmas vão adorar. Se sair agora, adeus a {perda}.',
		yes: 'SAIR',
		no: 'CONTINUAR'
	},
	{
		title: 'FUGINDO?',
		body: 'Ainda tem pastilha no labirinto! Quer mesmo largar {perda}?',
		yes: 'VOU EMBORA',
		no: 'VOLTAR AO LABIRINTO'
	}
];

function requestExit()
{
	if (dom.game.hidden) {
		return;
	}

	// Fim de jogo ou demonstração: não há o que perder
	if (phase == 'gameover' || demo) {
		goHome();
		return;
	}

	var wasRunning = running;
	var msg = EXIT_MESSAGES[Math.floor(Math.random() * EXIT_MESSAGES.length)];
	var lost = score > 0 ? score + ' pontos na fase ' + level : 'uma partida que mal começou';

	// Desistiu de sair: volta ao jogo, ou à tela de pausa se veio dela
	var cancel = wasRunning ? resume : function () { pauseModal(); };

	setRunning(false);

	openModal(
		msg.title,
		'<p>' + msg.body.replace('{perda}', highlight(lost)) + '</p>',
		[
			{ label: msg.yes, action: goHome },
			{ label: msg.no, action: cancel, primary: true }
		],
		{ escape: cancel }
	);
}

/**
 * Fim de jogo (chamado pelo main.js depois do GAME OVER no labirinto)
**/
function showGameOver()
{
	setRunning(false);

	var inverse = isInverse();
	var newRecord = score > recordAtStart;
	var html =
		(inverse ? '<p>O Pac-Man limpou o labirinto!</p>' : '') +
		'<p>PONTOS: ' + highlight(score) + '</p>' +
		'<p>FASE: ' + level + ' &middot; TEMPO: ' + secToTime(Math.floor(playTime)) + '</p>' +
		(inverse ? '<p>FANTASMA: ' + ghostLabel(playerGhost) + '</p>' : '') +
		(newRecord ? '<p class="highlight">NOVO RECORDE!</p>' : '<p>RECORDE: ' + highscore + '</p>');

	// No modo inverso também dá para trocar de fantasma
	var buttons = [{ label: 'INÍCIO', action: goHome }];

	if (inverse) {
		buttons.push({ label: 'TROCAR FANTASMA', action: changeGhost });
	}

	// Sem pontos não há o que gravar no ranking
	if (score == 0) {
		buttons.push({ label: 'JOGAR DE NOVO', action: restart, primary: true });
		openModal('GAME OVER', html, buttons, { escape: goHome });

		return;
	}

	buttons.push({ label: 'JOGAR DE NOVO', action: restart });
	buttons.push({ label: 'SALVAR', action: submitScore, primary: true, keepOpen: true });

	openModal(
		'GAME OVER',
		html +
		'<form class="rank-form" id="rank-form" novalidate>' +
			'<label for="rank-name">COLOQUE SEU NOME NO RANKING' + (inverse ? ' INVERSO' : '') + '</label>' +
			'<input id="rank-name" maxlength="16" autocomplete="nickname" spellcheck="false" placeholder="SEU NOME">' +
			'<p class="rank-msg" id="rank-msg" role="status"></p>' +
		'</form>',
		buttons,
		{ focus: '#rank-name' }
	);

	var input = document.getElementById('rank-name');

	input.value = ui.playerName;
	input.select();

	document.getElementById('rank-form').addEventListener('submit', function (e) {
		e.preventDefault();
		submitScore();
	});
}

// Nome do fantasma, com o multiplicador quando houver (Clyde)
function ghostLabel(id)
{
	return GHOST_INFO[id].name + (SCORE_MULTIPLIER[id] > 1 ? ' (PONTOS x' + SCORE_MULTIPLIER[id] + ')' : '');
}

/**
 * Ranking (api/ranking.php): um para cada modo ('classic' ou 'inverse')
**/
function rankingUrl(mode)
{
	return RANKING_URL + (mode == 'inverse' ? '?mode=inverse' : '');
}

function submitScore()
{
	if (ui.savingScore) {
		return;
	}

	var input = document.getElementById('rank-name');
	var msg = document.getElementById('rank-msg');
	var name = input.value.replace(/\s+/g, ' ').trim();
	var mode = isInverse() ? 'inverse' : 'classic';

	if (!/^[\p{L}\p{N} ._-]{2,16}$/u.test(name)) {
		msg.textContent = 'Use de 2 a 16 letras ou números.';
		input.focus();
		return;
	}

	ui.savingScore = true;
	msg.textContent = 'SALVANDO...';

	fetch(RANKING_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			name: name,
			score: score,
			level: level,
			time: Math.max(1, Math.floor(playTime)),
			mode: mode,
			ghost: mode == 'inverse' ? playerGhost : undefined
		})
	})
	.then(function (response) { return response.json(); })
	.then(function (data) {
		ui.savingScore = false;

		if (!data.ok) {
			var error = new Error(data.error);
			error.fromServer = true;
			throw error;
		}

		ui.playerName = name;
		storageSet(STORAGE_NAME, name);

		showRankingTable(data, null, true, mode);
	})
	.catch(function (error) {
		ui.savingScore = false;

		// A janela pode ter sido fechada enquanto salvava
		if (!document.getElementById('rank-msg')) {
			return;
		}

		msg.textContent = error.fromServer ? error.message : 'Não foi possível salvar agora. Tente de novo.';
	});
}

// Busca o ranking do modo e mostra. back: ação do botão VOLTAR
function showRanking(back, mode)
{
	fetch(rankingUrl(mode))
		.then(function (response) { return response.json(); })
		.then(function (result) {
			if (!result.ok) {
				throw new Error();
			}

			showRankingTable(result, back, false, mode);
		})
		.catch(function () {
			showRankingTable(null, back, false, mode);
		});
}

/**
 * Mostra o ranking.
 *
 * data:      resposta da API ({ top, position, entry }), ou null se falhou.
 * back:      ação do VOLTAR.
 * afterGame: aberto depois de salvar a partida (botões INÍCIO e JOGAR DE NOVO).
 * mode:      'classic' ou 'inverse' (no inverso mostra o fantasma de cada um).
**/
function showRankingTable(data, back, afterGame, mode)
{
	var inverse = mode == 'inverse';
	var html = '';

	if (!data) {
		html = '<p>O ranking está indisponível agora.</p>';
	} else if (!data.top.length) {
		html = inverse
			? '<p>Ninguém no ranking ainda. Seja o primeiro a caçar o Pac-Man!</p>'
			: '<p>Ninguém no ranking ainda. Seja o primeiro a encarar os fantasmas!</p>';
	} else {
		var mine = data.position || 0;

		html = '<table class="ranking' + (inverse ? ' inverse' : '') + '">';

		data.top.forEach(function (entry, i) {
			html += rankingRow(i + 1, entry, i + 1 === mine, inverse);
		});

		// Fora do top 10: mostra a posição do jogador embaixo
		if (mine > data.top.length && data.entry) {
			html += '<tr class="gap"><td colspan="' + (inverse ? 4 : 3) + '">...</td></tr>' + rankingRow(mine, data.entry, true, inverse);
		}

		html += '</table>';

		if (data.position && data.improved === false) {
			html += '<p class="stats">Seu melhor continua sendo ' + data.entry.score + ' pontos.</p>';
		}

		html += '<p class="stats">Clique em um jogador para ver os detalhes.</p>';
	}

	var buttons = [{ label: 'VOLTAR', action: back, primary: true }];

	if (afterGame) {
		buttons = [{ label: 'INÍCIO', action: goHome }];

		if (inverse) {
			buttons.push({ label: 'TROCAR FANTASMA', action: changeGhost });
		}

		buttons.push({ label: 'JOGAR DE NOVO', action: restart, primary: true });
	}

	openModal(inverse ? 'RANKING INVERSO' : 'RANKING', html, buttons, { escape: afterGame ? goHome : back });

	// Fantasma de cada jogador (modo inverso)
	dom.modalBody.querySelectorAll('[data-sprite]').forEach(function (cell) {
		cell.appendChild(createSprite('ghost down ' + cell.getAttribute('data-sprite')));
	});

	// Linhas clicáveis: abrem os detalhes do jogador
	dom.modalBody.querySelectorAll('tr[data-position]').forEach(function (row) {
		var open = function () {
			var position = parseInt(row.getAttribute('data-position'), 10);
			var entry = position <= data.top.length ? data.top[position - 1] : data.entry;

			closeModal(function () {
				showRankingDetail(entry, position, function () { showRankingTable(data, back, afterGame, mode); }, mode);
			});
		};

		row.addEventListener('click', open);
		row.addEventListener('keydown', function (e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				open();
			}
		});
	});
}

function rankingRow(position, entry, mine, inverse)
{
	var ghost = inverse && entry.ghost in GHOST_INFO ? entry.ghost : null;

	return '<tr tabindex="0" data-position="' + position + '"' + (mine ? ' class="mine"' : '') + '>' +
		'<td>' + position + 'º</td>' +
		(inverse ? '<td class="rank-ghost"' + (ghost ? ' data-sprite="' + ghost + '" title="' + GHOST_INFO[ghost].name + '"' : '') + '></td>' : '') +
		'<td>' + escapeHtml(entry.name) + '</td>' +
		'<td>' + entry.score + '</td>' +
	'</tr>';
}

const RANK_TITLES = {
	classic: ['REI DO LABIRINTO', 'CAÇA-FANTASMAS', 'COMILÃO'],
	inverse: ['TERROR DO PAC-MAN', 'ASSOMBRAÇÃO', 'ALMA PENADA']
};

function showRankingDetail(entry, position, back, mode)
{
	var inverse = mode == 'inverse';
	var date = new Date(entry.date);
	var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
	var when = isNaN(date)
		? '-'
		: pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
	var row = function (label, value) { return '<tr><td>' + label + '</td><td>' + value + '</td></tr>'; };
	var title = RANK_TITLES[inverse ? 'inverse' : 'classic'][position - 1] || (inverse ? 'APRENDIZ DE FANTASMA' : 'APRENDIZ DE COMILÃO');

	openModal(
		entry.name,
		'<p class="highlight">' + position + 'º LUGAR &middot; ' + title + '</p>' +
		'<table class="ranking detail">' +
			(inverse && entry.ghost in GHOST_INFO ? row('FANTASMA', ghostLabel(entry.ghost)) : '') +
			row('PONTOS', entry.score) +
			row('FASE', entry.level) +
			row('TEMPO', secToTime(entry.time)) +
			row('DATA', when) +
		'</table>',
		[{ label: 'VOLTAR', action: back, primary: true }],
		{ escape: back }
	);
}

/**
 * Teclado
**/
function onKeyDown(e)
{
	if (e.ctrlKey || e.altKey || e.metaKey) {
		return;
	}

	var key = e.key.toLowerCase();

	if (!dom.modal.hidden) {
		if (ui.modal && ui.modal.keys && ui.modal.keys(e)) {
			return;
		}

		if (e.key === 'Escape') {
			dismissModal();
		} else if ((e.key === ' ' || key === 'p') && ui.modal && ui.modal.pauseKeys) {
			// Espaço/P na pausa: volta ao jogo
			e.preventDefault();

			if (document.activeElement) {
				document.activeElement.blur();
			}

			dismissModal();
		}
		return;
	}

	if (!dom.home.hidden) {
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
			moveMenu(e.key === 'ArrowDown' ? 1 : -1);
		} else if (key === 'm') {
			toggleSound();
		}
		return;
	}

	var dir = KEYS[e.key];

	if (dir) {
		e.preventDefault();
		handleInput(dir);
	} else if (e.key === ' ' || key === 'p') {
		// Evita que o Espaço também "clique" no botão que estiver em foco
		e.preventDefault();

		if (document.activeElement) {
			document.activeElement.blur();
		}

		pause();
	} else if (e.key === 'Escape') {
		requestExit();
	} else if (key === 'e' && !demo) {
		useAbility();
	} else if (key === 'm') {
		toggleSound();
	}
}

function initScreens()
{
	dom.home = document.getElementById('home');
	dom.game = document.getElementById('screen-game');
	dom.heroTrack = document.getElementById('hero-track');
	dom.menu = document.getElementById('menu');
	dom.menuSound = document.getElementById('menu-sound');
	dom.soundState = document.getElementById('sound-state');
	dom.homeRecord = document.getElementById('home-record');
	dom.homeBadge = document.getElementById('home-badge');
	dom.homeTagline = document.getElementById('home-tagline');
	dom.hero = document.getElementById('hero');
	dom.menuMode = document.getElementById('menu-inverse');
	dom.homeTop = document.getElementById('home-top');
	dom.homeTopName = document.getElementById('home-top-name');
	dom.homeTopScore = document.getElementById('home-top-score');
	dom.modal = document.getElementById('modal');
	dom.modalTitle = document.getElementById('modal-title');
	dom.modalBody = document.getElementById('modal-body');
	dom.modalActions = document.getElementById('modal-actions');

	ui.playerName = storageGet(STORAGE_NAME) || '';
	ui.homeMode = storageGet(STORAGE_HOME_MODE) == 'inverse' ? 'inverse' : 'classic';

	buildHome();
	renderSound();

	document.getElementById('menu-play').addEventListener('click', playCurrentMode);
	dom.menuMode.addEventListener('click', toggleHomeMode);
	document.getElementById('menu-help').addEventListener('click', showHelp);
	// IA vs IA: no inverso escolhe antes o fantasma que o robô vai controlar
	document.getElementById('menu-demo').addEventListener('click', function () {
		if (ui.homeMode == 'inverse') {
			showGhostSelect(true);
		} else {
			startDemo('classic');
		}
	});
	document.getElementById('menu-ranking').addEventListener('click', function () {
		showRanking(focusMenu, ui.homeMode);
	});
	dom.menuSound.addEventListener('click', toggleSound);

	// Clique/toque tira o foco do botão, para o contorno não ficar aparecendo
	document.getElementById('btn-pause').addEventListener('click', function (e) {
		if (e.detail > 0) {
			e.currentTarget.blur();
		}

		pause();
	});

	// Habilidade do fantasma (modo inverso)
	document.getElementById('ability').addEventListener('click', function (e) {
		if (e.detail > 0) {
			e.currentTarget.blur();
		}

		// Na IA vs IA quem usa é o robô
		if (!demo) {
			useAbility();
		}
	});

	// Lembra o item do menu em foco, para devolver o foco ao voltar
	dom.menu.addEventListener('focusin', function (e) {
		ui.menuIndex = Array.prototype.indexOf.call(dom.menu.children, e.target);
	});

	document.addEventListener('keydown', onKeyDown);

	// O navegador só libera o som depois de uma interação
	document.addEventListener('pointerdown', Sound.unlock);
	document.addEventListener('keydown', Sound.unlock);

	// Pausa sozinho ao trocar de aba
	document.addEventListener('visibilitychange', function () {
		if (document.hidden) {
			pause(true);
		}
	});

	var params = new URLSearchParams(location.search);

	if (params.has('demo')) {
		startDemo(params.get('demo') == 'inverse' ? 'inverse' : 'classic');
	} else if (params.get('inverse') in SCORE_MULTIPLIER) {
		startInverse(params.get('inverse'));
	} else {
		showHome();
	}
}
