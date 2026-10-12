/**
 * JS Document.
 * Tela inicial, menu e janelas (instruções, pausa, ranking e fim de jogo).
 * @author Sandro Jordão.
**/

'use strict';

const RANKING_URL = 'api/ranking.php';
const STORAGE_NAME = 'pacman.name';

const dom = {};

const ui = {
	modal: null,      // janela aberta: { escape, pauseKeys }
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
 *            focus: seletor do campo que recebe o foco }
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

	ui.modal = { escape: options.escape || null, pauseKeys: !!options.pauseKeys };
	dom.modal.hidden = false;
	dom.modal.scrollTop = 0;

	if (options.focus) {
		focus = dom.modalBody.querySelector(options.focus);
	}

	setTimeout(function () { if (focus) focus.focus(); }, 50);
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
	// Pac-Man fugindo dos fantasmas
	var sprites = document.createElement('div');

	sprites.className = 'hero-sprites';

	GHOSTS.slice().reverse().forEach(function (config) {
		sprites.appendChild(createSprite('ghost right ' + config.id));
	});

	sprites.appendChild(createSprite('pacman right'));
	dom.heroTrack.appendChild(sprites);
}

function showHome()
{
	dom.game.hidden = true;
	dom.home.hidden = false;
	dom.homeRecord.textContent = highscore;

	// 1º lugar do ranking no rodapé (se o servidor responder)
	fetch(RANKING_URL)
		.then(function (response) { return response.json(); })
		.then(function (data) {
			var first = data.ok && data.top[0];

			dom.homeTop.hidden = !first;

			if (first) {
				dom.homeTopName.textContent = first.name;
				dom.homeTopScore.textContent = first.score;
			}
		})
		.catch(function () { dom.homeTop.hidden = true; });

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

// Sai da partida (já confirmado) e volta para a tela inicial
function goHome()
{
	setRunning(false);
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
 * Instruções
**/
function showHelp()
{
	openModal(
		'COMO JOGAR',
		'<ul>' +
			'<li>Coma <span class="highlight">todas as pastilhas</span> do labirinto para passar de fase.</li>' +
			'<li>Encostar em um fantasma custa uma vida. São 3 vidas, e você ganha <span class="highlight">uma extra aos 10.000</span> pontos.</li>' +
			'<li>As <span class="highlight">pastilhas grandes</span> deixam os fantasmas azuis por alguns segundos: aí é você quem caça! Cada fantasma comido em sequência vale mais: 200, 400, 800 e 1600.</li>' +
			'<li>Use o <span class="highlight">túnel</span> nas laterais para escapar para o outro lado.</li>' +
			'<li>Cada fantasma tem um jeito: Blinky persegue, Pinky tenta cortar pela frente, Inky cerca junto com o Blinky e Clyde é imprevisível.</li>' +
			'<li>A cada fase todos ficam mais rápidos e o efeito das pastilhas grandes dura menos.</li>' +
			'<li>Teclado: <span class="highlight">setas</span> ou <span class="highlight">WASD</span> movem, <span class="highlight">Espaço</span> pausa, <span class="highlight">Esc</span> sai e <span class="highlight">M</span> liga/desliga o som.</li>' +
			'<li>Celular: <span class="highlight">deslize o dedo</span> em qualquer lugar da tela.</li>' +
		'</ul>',
		[
			{ label: 'VOLTAR', action: focusMenu },
			{ label: 'JOGAR', action: startGame, primary: true }
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
		'<p class="stats">PONTOS ' + highlight(score) + ' &middot; FASE ' + highlight(level) + ' &middot; VIDAS ' + highlight(lives) + '</p>',
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

	if (phase == 'gameover') {
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

	var newRecord = score > recordAtStart;
	var html =
		'<p>PONTOS: ' + highlight(score) + '</p>' +
		'<p>FASE: ' + level + ' &middot; TEMPO: ' + secToTime(Math.floor(playTime)) + '</p>' +
		(newRecord ? '<p class="highlight">NOVO RECORDE!</p>' : '<p>RECORDE: ' + highscore + '</p>');

	// Sem pontos não há o que gravar no ranking
	if (score == 0) {
		openModal('GAME OVER', html, [
			{ label: 'INÍCIO', action: goHome },
			{ label: 'JOGAR DE NOVO', action: restart, primary: true }
		], { escape: goHome });

		return;
	}

	openModal(
		'GAME OVER',
		html +
		'<form class="rank-form" id="rank-form" novalidate>' +
			'<label for="rank-name">COLOQUE SEU NOME NO RANKING</label>' +
			'<input id="rank-name" maxlength="16" autocomplete="nickname" spellcheck="false" placeholder="SEU NOME">' +
			'<p class="rank-msg" id="rank-msg" role="status"></p>' +
		'</form>',
		[
			{ label: 'INÍCIO', action: goHome },
			{ label: 'JOGAR DE NOVO', action: restart },
			{ label: 'SALVAR', action: submitScore, primary: true, keepOpen: true }
		],
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

/**
 * Ranking (api/ranking.php)
**/
function submitScore()
{
	if (ui.savingScore) {
		return;
	}

	var input = document.getElementById('rank-name');
	var msg = document.getElementById('rank-msg');
	var name = input.value.replace(/\s+/g, ' ').trim();

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
			time: Math.max(1, Math.floor(playTime))
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

		showRankingTable(data, null, true);
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

// Busca o ranking e mostra. back: ação do botão VOLTAR
function showRanking(back)
{
	fetch(RANKING_URL)
		.then(function (response) { return response.json(); })
		.then(function (result) {
			if (!result.ok) {
				throw new Error();
			}

			showRankingTable(result, back);
		})
		.catch(function () {
			showRankingTable(null, back);
		});
}

/**
 * Mostra o ranking.
 *
 * data:      resposta da API ({ top, position, entry }), ou null se falhou.
 * back:      ação do VOLTAR.
 * afterGame: aberto depois de salvar a partida (botões INÍCIO e JOGAR DE NOVO).
**/
function showRankingTable(data, back, afterGame)
{
	var html = '';

	if (!data) {
		html = '<p>O ranking está indisponível agora.</p>';
	} else if (!data.top.length) {
		html = '<p>Ninguém no ranking ainda. Seja o primeiro a encarar os fantasmas!</p>';
	} else {
		var mine = data.position || 0;

		html = '<table class="ranking">';

		data.top.forEach(function (entry, i) {
			html += rankingRow(i + 1, entry, i + 1 === mine);
		});

		// Fora do top 10: mostra a posição do jogador embaixo
		if (mine > data.top.length && data.entry) {
			html += '<tr class="gap"><td colspan="3">...</td></tr>' + rankingRow(mine, data.entry, true);
		}

		html += '</table>';

		if (data.position && data.improved === false) {
			html += '<p class="stats">Seu melhor continua sendo ' + data.entry.score + ' pontos.</p>';
		}

		html += '<p class="stats">Clique em um jogador para ver os detalhes.</p>';
	}

	var buttons = afterGame
		? [{ label: 'INÍCIO', action: goHome }, { label: 'JOGAR DE NOVO', action: restart, primary: true }]
		: [{ label: 'VOLTAR', action: back, primary: true }];

	openModal('RANKING', html, buttons, { escape: afterGame ? goHome : back });

	// Linhas clicáveis: abrem os detalhes do jogador
	dom.modalBody.querySelectorAll('tr[data-position]').forEach(function (row) {
		var open = function () {
			var position = parseInt(row.getAttribute('data-position'), 10);
			var entry = position <= data.top.length ? data.top[position - 1] : data.entry;

			closeModal(function () {
				showRankingDetail(entry, position, function () { showRankingTable(data, back, afterGame); });
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

function rankingRow(position, entry, mine)
{
	return '<tr tabindex="0" data-position="' + position + '"' + (mine ? ' class="mine"' : '') + '>' +
		'<td>' + position + 'º</td>' +
		'<td>' + escapeHtml(entry.name) + '</td>' +
		'<td>' + entry.score + '</td>' +
	'</tr>';
}

const RANK_TITLES = ['REI DO LABIRINTO', 'CAÇA-FANTASMAS', 'COMILÃO'];

function showRankingDetail(entry, position, back)
{
	var date = new Date(entry.date);
	var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
	var when = isNaN(date)
		? '-'
		: pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes());
	var row = function (label, value) { return '<tr><td>' + label + '</td><td>' + value + '</td></tr>'; };

	openModal(
		entry.name,
		'<p class="highlight">' + position + 'º LUGAR &middot; ' + (RANK_TITLES[position - 1] || 'APRENDIZ DE COMILÃO') + '</p>' +
		'<table class="ranking detail">' +
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
	dom.homeTop = document.getElementById('home-top');
	dom.homeTopName = document.getElementById('home-top-name');
	dom.homeTopScore = document.getElementById('home-top-score');
	dom.modal = document.getElementById('modal');
	dom.modalTitle = document.getElementById('modal-title');
	dom.modalBody = document.getElementById('modal-body');
	dom.modalActions = document.getElementById('modal-actions');

	ui.playerName = storageGet(STORAGE_NAME) || '';

	buildHome();
	renderSound();

	document.getElementById('menu-play').addEventListener('click', startGame);
	document.getElementById('menu-help').addEventListener('click', showHelp);
	document.getElementById('menu-ranking').addEventListener('click', function () { showRanking(focusMenu); });
	dom.menuSound.addEventListener('click', toggleSound);

	// Clique/toque tira o foco do botão, para o contorno não ficar aparecendo
	document.getElementById('btn-pause').addEventListener('click', function (e) {
		if (e.detail > 0) {
			e.currentTarget.blur();
		}

		pause();
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

	showHome();
}
