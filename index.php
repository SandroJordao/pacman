<!DOCTYPE html>
<html lang="pt-br">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
		<meta name="theme-color" content="#000000">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<title>Pacman</title>
		<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Cpath d=%27M8 8 L15 4 A7.5 7.5 0 1 0 15 12 Z%27 fill=%27%23FFC100%27/%3E%3C/svg%3E">
		<link rel="stylesheet" type="text/css" href="style.css" media="screen">
		<link rel="stylesheet" type="text/css" href="ghosts.css" media="screen">
		<link rel="stylesheet" type="text/css" href="pacman.css" media="screen">
		<script type="text/javascript" src="sound.js" defer></script>
		<script type="text/javascript" src="main.js" defer></script>
		<script type="text/javascript" src="screens.js" defer></script>
	</head>
	<body>
		<section class="home" id="home" aria-labelledby="home-title">
			<h1 class="home-title" id="home-title">PAC-MAN</h1>
			<p class="home-tagline">Coma todas as pastilhas e fuja dos fantasmas!</p>
			<div class="hero" aria-hidden="true">
				<div class="hero-track" id="hero-track"></div>
			</div>
			<nav class="menu" id="menu" aria-label="Menu">
				<button type="button" class="menu-item" id="menu-play">JOGAR</button>
				<button type="button" class="menu-item" id="menu-help">INSTRUÇÕES</button>
				<button type="button" class="menu-item" id="menu-ranking">RANKING</button>
				<button type="button" class="menu-item" id="menu-sound" aria-pressed="true">SOM: <span id="sound-state">LIGADO</span></button>
			</nav>
			<p class="home-footer">
				<span>RECORDE <span class="highlight" id="home-record">0</span></span>
				<span id="home-top" hidden>1º LUGAR <span class="highlight" id="home-top-name"></span> <span id="home-top-score"></span></span>
			</p>
		</section>

		<div class="screen-game" id="screen-game" hidden>
			<div class="game" id="game">
				<div class="score">
					<div>1UP</div>
					<div>HIGH SCORE</div>
					<div>
						<button type="button" class="pause-btn" id="btn-pause" aria-label="Pausar (Espaço)" title="Pausar (Espaço)">
							<svg viewBox="0 0 12 12" aria-hidden="true">
								<path fill="currentColor" d="M2 1H5V11H2ZM7 1H10V11H7Z"/>
							</svg>
						</button>
					</div>
					<div id="score">00</div>
					<div id="highscore">00</div>
					<div></div>
				</div>

				<!-- O labirinto, o Pacman e os fantasmas são gerados pelo main.js -->
				<div class="main" id="board"></div>

				<div class="footer">
					<div id="lives"></div>
					<div id="level"></div>
				</div>
			</div>
		</div>

		<div class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
			<div class="modal-box">
				<h2 id="modal-title"></h2>
				<div class="modal-body" id="modal-body"></div>
				<div class="modal-actions" id="modal-actions"></div>
			</div>
		</div>
	</body>
</html>
