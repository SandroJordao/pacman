<html lang="pt-br">
	<head>
		<meta charset="utf-8">
		<title>Pacman CSS</title>
		<link rel="stylesheet" type="text/css" href="style.css" media="screen">
		<link rel="stylesheet" type="text/css" href="ghosts.css" media="screen">
		<link rel="stylesheet" type="text/css" href="pacman.css" media="screen">
		<script type="text/javascript" src="jquery.js"></script>
		<script type="text/javascript" src="main.js"></script>
	</head>
	<body>
		<!--
		<div class="ghosts">
			<div class="ghost-red">
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
			</div>
			<div class="ghost-yellow">
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
			</div>
			<div class="ghost-blue">
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
			</div>
			<div class="ghost-pink">
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
			</div>
			<div class="pacman">
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
			</div>
		</div>
		-->
		
		<div class="score">
			<div>1UP</div>
			<div>HIGH SCORE</div>
			<div></div>
			<div id="score">00</div>
			<div id="highscore">16440</div>
			<div></div>
		</div>
		<div class="main">
			<!-- 01 -->
			<div class="T L"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T R"></div>
			<!-- 02 -->
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<!-- 03 -->
			<div class="L R"></div>
			<div class="W"></div>
			<div class="T L B"></div>
			<div class="T R B"></div>
			<div class="P"></div>
			<div class="T L B"></div>
			<div class="T B"></div>
			<div class="T R B"></div>
			<div class="P"></div>
			<div class="L R B"></div>
			<div class="P"></div>
			<div class="T L B"></div>
			<div class="T B"></div>
			<div class="T R B"></div>
			<div class="P"></div>
			<div class="T L B"></div>
			<div class="T R B"></div>
			<div class="W"></div>
			<div class="L R"></div>
			<!-- 04 -->
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<!-- 05 -->
			<div class="L R"></div>
			<div class="P"></div>
			<div class="T L B"></div>
			<div class="T R B"></div>
			<div class="P"></div>
			<div class="T L R"></div>
			<div class="P"></div>
			<div class="T L B"></div>
			<div class="T B"></div>
			<div class="T"></div>
			<div class="T B"></div>
			<div class="T R B"></div>
			<div class="P"></div>
			<div class="T L R"></div>
			<div class="P"></div>
			<div class="T L B"></div>
			<div class="T R B"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<!-- 06 -->
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<!-- 07 -->
			<div class="L B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T R"></div>
			<div class="P"></div>
			<div class="L"></div>
			<div class="T B"></div>
			<div class="T B R"></div>
			<div class=""></div>
			<div class="L R B"></div>
			<div class=""></div>
			<div class="T B L"></div>
			<div class="T B"></div>
			<div class="R"></div>
			<div class="P"></div>
			<div class="T L"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="R B"></div>
			<!-- 08 -->
			<div class=""></div>
			<div class=""></div>
			<div class=""></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class=""></div>
			<div class=""></div>
			<div class=""></div>
			<div class="">
			
				<div class="ghost-red" id="blinky">
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				</div>
				
			</div>
			<div class=""></div>
			<div class=""></div>
			<div class=""></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class=""></div>
			<div class=""></div>
			<div class=""></div>
			<!-- 09  -->
			<div class="T B L"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="R B"></div>
			<div class="P"></div>
			<div class="L R B"></div>
			<div class=""></div>
			<div class="T L"></div>
			<div class="T R B"></div>
			<div class="TW"></div>
			<div class="T L B"></div>
			<div class="T R"></div>
			<div class=""></div>
			<div class="L R B"></div>
			<div class="P"></div>
			<div class="L B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B R"></div>
			<!-- 10 -->
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class=""></div>
			<div class=""></div>
			<div class="L R"></div>
			<div class="">
			
				<div class="ghost-yellow" id="clyde">
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				</div>
		
			</div>
			<div class="">
			
				<div class="ghost-pink" id="pinky">
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				</div>
			
			</div>
			<div class="">
			
				<div class="ghost-blue" id="inky">
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
					<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				</div>

			</div>
			<div class="L R"></div>
			<div class=""></div>
			<div class=""></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<!-- 11 -->
			<div class="T B L"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T R"></div>
			<div class="P"></div>
			<div class="T L R"></div>
			<div class=""></div>
			<div class="L B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="R B"></div>
			<div class=""></div>
			<div class="T L R"></div>
			<div class="P"></div>
			<div class="T L"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B R"></div>
			<!-- 12 -->
			<div class=""></div>
			<div class=""></div>
			<div class=""></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class=""></div>
			<div class=""></div>
			<div class=""></div>
			<div class=""><div class="TEXT" id="ready">READY!</div></div>
			<div class=""></div>
			<div class=""></div>
			<div class=""></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class=""></div>
			<div class=""></div>
			<div class=""></div>
			<!-- 13 -->
			<div class="L T"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="B R"></div>
			<div class="P"></div>
			<div class="L R B"></div>
			<div class=""></div>
			<div class="T B L"></div>
			<div class="T B"></div>
			<div class="T"></div>
			<div class="T B"></div>
			<div class="T B R"></div>
			<div class=""></div>
			<div class="L R B"></div>
			<div class="P"></div>
			<div class="B L"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="R T"></div>
			<!-- 14 -->
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<!-- 15 -->
			<div class="L R"></div>
			<div class="P"></div>
			<div class="L T B"></div>
			<div class="T R"></div>
			<div class="P"></div>
			<div class="L T B"></div>
			<div class="T B"></div>
			<div class="R T B"></div>
			<div class="P"></div>
			<div class="L R B"></div>
			<div class="P"></div>
			<div class="L T B"></div>
			<div class="T B"></div>
			<div class="R T B"></div>
			<div class="P"></div>
			<div class="T L"></div>
			<div class="R T B"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<!-- 16 -->
			<div class="L R"></div>
			<div class="W"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="">
			
			<div class="pacman" id="pacman">
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
				<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
			</div>
			
			</div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="W"></div>
			<div class="L R"></div>
			<!-- 17 -->
			<div class="L"></div>
			<div class="T B R"></div>
			<div class="P"></div>
			<div class="L R B"></div>
			<div class="P"></div>
			<div class="L R T"></div>
			<div class="P"></div>
			<div class="T B L"></div>
			<div class="T B"></div>
			<div class="T"></div>
			<div class="T B"></div>
			<div class="T B R"></div>
			<div class="P"></div>
			<div class="L R T"></div>
			<div class="P"></div>
			<div class="L R B"></div>
			<div class="P"></div>
			<div class="T B L"></div>
			<div class="R"></div>
			<!-- 18 -->
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<!-- 19 -->
			<div class="L R"></div>
			<div class="P"></div>
			<div class="T L B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="B"></div>
			<div class="T B"></div>
			<div class="T R B"></div>
			<div class="P"></div>
			<div class="B L R"></div>
			<div class="P"></div>
			<div class="T B L"></div>
			<div class="T B"></div>
			<div class="B"></div>
			<div class="T B"></div>
			<div class="T B"></div>
			<div class="T B R"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<!-- 20 -->
			<div class="L R"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="P"></div>
			<div class="L R"></div>
			<!-- 21 -->
			<div class="B L"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B T"></div>
			<div class="B R"></div>
		</div>
	</body>
</html>