/**
 * JS Document. 
 * @author Sandro Jordão.
**/

/**
 *
**/
function collision(element1, element2)
{
//	e1X = element1.offset().left;
//	e1Y = element1.offset().top;
//	e1W = element1.width();
//	e1H = element1.height();
//	
//	e2X = element2.offset().left;
//	e2Y = element2.offset().top;
//	e2W = element2.width();
//	e2H = element2.height();
//	
//	$("#ballX").val(e2X);
//	$("#ballY").val(e2Y);
//	$("#ballW").val(e2W);
//	$("#ballH").val(e2H);
//	
//	if(e1X <= e2X && (e1X + e1W) >= e2X)
//	{
//		return true;
//	}
//	else
//	{
//		return false;
//	}
	
//	if(e1X <= e2X && (e1X + e1W) >= e2X && e1Y <= e2Y && (parseInt(e1Y) + parseInt(e1H)) >= e2Y)
//	{
//		return true;
//	}
//	else
//	{
//		return false;
//	}
}

/**
 *
**/
function draw()
{
	// alert(positionX);
	
	// Remove todas as classes de direção e adiciona a atual
	pacman.removeClass("up down left right");
	
	if (state != 'stop') {
		pacman.addClass(state);
	}
	
	// Atualiza a posição
	pacman.css({ "left" : positionX + "px" , "top" : positionY + "px" });
	
//	scoreLeft.html(scoreP1);
//	
//	scoreRight.html(scoreP2);
}

/**
 *
**/
function loop() 
{
//	if(positionX <= (parseInt(campX) - parseInt(ballW)))
//	{
//		puloX = puloX * -1;
//		
//		scoreP1++;
//	}
//	
//	if(positionX >= (parseInt(campW) - parseInt(campX)))
//	{
//		puloX = puloX * -1;
//		
//		scoreP2++;
//	}
//		
//	if(positionY >= (parseInt(campH) - parseInt(ballH)) || positionY <= (parseInt(campY) - parseInt(ballH * 2)))
//	{
//		puloY = puloY * -1;
//	}
	
	// Calcula a nova posição
	var newPositionX = parseInt(positionX) + parseInt(leapX);
	var newPositionY = parseInt(positionY) + parseInt(leapY);
	
	// Verifica se a nova posição está totalmente dentro de divs com class="M"
	if (leapX != 0 || leapY != 0) { // Só verifica se há movimento
		if (isPacmanInsideValidArea(newPositionX, newPositionY)) {
			// Se estiver dentro de área válida, atualiza a posição
			positionX = newPositionX;
			positionY = newPositionY;
		} else {
			// Se não estiver, para o movimento
			/*
			leapX = 0;
			leapY = 0;
			state = 'stop';
			*/
			console.log("Movimento bloqueado: Pacman deve ficar dentro das áreas com class='M'");
		}
	} else {
		// Se não há movimento, apenas atualiza a posição atual
		positionX = newPositionX;
		positionY = newPositionY;
	}
	
	draw();
	
	// Exemplo de uso das funções de detecção de posição
	// Verifica em qual elemento o Pacman está em cima
	if (positionX % 20 == 0) { // Só mostra a cada 10 pixels para não lotar o console
		var currentClass = checkPacmanPosition();
		if (currentClass) {
			console.log("Pacman está sobre elemento com classe:", currentClass);
		}
	}
	
	// Exemplo: verifica se está colidindo com elementos de classe específica
	// var wallCollisions = checkCollisionWithClass('wall');
	// if (wallCollisions.length > 0) {
	//     console.log("Pacman colidiu com parede!");
	// }
	
//	
//	if(collision(scoreLeft, ball))
//	{
//		scoreLeft.hide();
//	}
//	else
//	{
//		scoreLeft.show();
//	}
//	
//	if(collision(scoreRight, ball))
//	{
//		scoreRight.hide();
//	}
//	else
//	{
//		scoreRight.show();
//	}
	
	// setTimeout(loop, parseInt(1000 / frameRate));
}

/**
 *
**/
function config_init()
{
	// Quantidade de Atualizações por Segundo
	var updates = 30;
	
	// Loop
	setInterval(loop, parseInt(1000 / updates));
}

let leapX;
let leapY;
let state;
let positionX;
let positionY;
let pacman;
let blinky;
let clyde;
let pinky;
let inky;
let score;
let ready;

/**
 * Função que atualiza as variáveis leapX e leapY baseado nas setas do teclado
**/
function handleKeyPress(event)
{
	switch(event.keyCode)
	{
		case 37: // Seta para esquerda
			leapX = -2;
			leapY = 0;
			state = 'left';
			break;
		case 38: // Seta para cima
			leapX = 0;
			leapY = -2;
			state = 'up';
			break;
		case 39: // Seta para direita
			leapX = 2;
			leapY = 0;
			state = 'right';
			break;
		case 40: // Seta para baixo
			leapX = 0;
			leapY = 2;
			state = 'down';
			break;
	}
}

/**
 * Função para verificar em qual div com classe específica o Pacman está em cima
**/
function checkPacmanPosition()
{
	var pacmanX = pacman.offset().left;
	var pacmanY = pacman.offset().top;
	var pacmanW = pacman.width();
	var pacmanH = pacman.height();
	
	// Centro do Pacman
	var pacmanCenterX = pacmanX + (pacmanW / 2);
	var pacmanCenterY = pacmanY + (pacmanH / 2);
	
	console.log("Pacman posição:", pacmanX, pacmanY, "Centro:", pacmanCenterX, pacmanCenterY);
	
	// Método alternativo: verifica colisão com todas as divs na página
	var foundClasses = [];
	
	$('div').each(function() {
		var element = $(this);
		var elementX = element.offset().left;
		var elementY = element.offset().top;
		var elementW = element.width();
		var elementH = element.height();
		
		// Verifica se o centro do Pacman está dentro desta div
		if (pacmanCenterX >= elementX && 
			pacmanCenterX <= (elementX + elementW) &&
			pacmanCenterY >= elementY && 
			pacmanCenterY <= (elementY + elementH)) {
			
			var classes = element.attr('class');
			if (classes) {
				foundClasses.push(classes);
			}
		}
	});
	
	console.log("Classes encontradas:", foundClasses);
	
	// Retorna a primeira classe encontrada ou todas separadas por espaço
	return foundClasses.length > 0 ? foundClasses.join(' ') : null;
}

/**
 * Função específica para verificar se o Pacman está sobre uma classe específica
**/
function isPacmanOnClass(className)
{
	var pacmanX = pacman.offset().left;
	var pacmanY = pacman.offset().top;
	var pacmanW = pacman.width();
	var pacmanH = pacman.height();
	
	// Centro do Pacman
	var pacmanCenterX = pacmanX + (pacmanW / 2);
	var pacmanCenterY = pacmanY + (pacmanH / 2);
	
	// Verifica se existe alguma div com a classe específica onde o Pacman está
	var isOnClass = false;
	
	$('.' + className).each(function() {
		var element = $(this);
		var elementX = element.offset().left;
		var elementY = element.offset().top;
		var elementW = element.width();
		var elementH = element.height();
		
		// Verifica se o centro do Pacman está dentro desta div
		if (pacmanCenterX >= elementX && 
			pacmanCenterX <= (elementX + elementW) &&
			pacmanCenterY >= elementY && 
			pacmanCenterY <= (elementY + elementH)) {
			
			isOnClass = true;
			return false; // Para o loop each()
		}
	});
	
	return isOnClass;
}

/**
 * Função alternativa para verificar colisão com divs de classes específicas
**/
function checkCollisionWithClass(className)
{
	var pacmanX = pacman.offset().left;
	var pacmanY = pacman.offset().top;
	var pacmanW = pacman.width();
	var pacmanH = pacman.height();
	
	var collisions = [];
	
	// Verifica colisão com todos os elementos da classe especificada
	$('.' + className).each(function() {
		var element = $(this);
		var elementX = element.offset().left;
		var elementY = element.offset().top;
		var elementW = element.width();
		var elementH = element.height();
		
		// Verifica se há sobreposição
		if (pacmanX < elementX + elementW &&
			pacmanX + pacmanW > elementX &&
			pacmanY < elementY + elementH &&
			pacmanY + pacmanH > elementY) {
			collisions.push(element);
		}
	});
	
	return collisions;
}

/**
 * Função para verificar se o Pacman está totalmente dentro de divs com class="M"
**/
function isPacmanInsideValidArea(newX, newY)
{
	// Posição que o Pacman teria após o movimento
	var pacmanW = pacman.width();
	var pacmanH = pacman.height();
	
	// Verifica os 4 cantos do Pacman na nova posição
	var corners = [
		{x: newX, y: newY}, // Canto superior esquerdo
		{x: newX + pacmanW - 1, y: newY}, // Canto superior direito
		{x: newX, y: newY + pacmanH - 1}, // Canto inferior esquerdo
		{x: newX + pacmanW - 1, y: newY + pacmanH - 1} // Canto inferior direito
	];
	
	console.log("Verificando posição:", newX, newY, "Cantos:", corners);
	
	// Verifica se todos os cantos estão sobre elementos com class="M"
	for (var i = 0; i < corners.length; i++) {
		var corner = corners[i];
		var isOnValidArea = false;
		
		// Verifica manualmente se este canto está sobre alguma div com class="M"
		$('.M').each(function() {
			var element = $(this);
			var elementX = element.offset().left;
			var elementY = element.offset().top;
			var elementW = element.width();
			var elementH = element.height();
			
			// Verifica se o canto está dentro desta div com class="M"
			if (corner.x >= elementX && 
				corner.x <= (elementX + elementW) &&
				corner.y >= elementY && 
				corner.y <= (elementY + elementH)) {
				
				isOnValidArea = true;
				return false; // Para o loop each()
			}
		});
		
		if (!isOnValidArea) {
			console.log("Canto", i, "não está sobre class='M':", corner);
			return false; // Se algum canto não estiver sobre class="M", retorna false
		}
	}
	
	console.log("Todos os cantos estão sobre class='M'");
	return true; // Todos os cantos estão sobre class="M"
}

/**
 * Função simplificada para verificar se o Pacman pode se mover para uma nova posição
**/
function canPacmanMoveTo(newX, newY, className)
{
	var pacmanW = pacman.width();
	var pacmanH = pacman.height();
	
	// Centro do Pacman na nova posição
	var centerX = newX + (pacmanW / 2);
	var centerY = newY + (pacmanH / 2);
	
	// Verifica se o centro estará sobre alguma div com a classe especificada
	var canMove = false;
	
	$('.' + className).each(function() {
		var element = $(this);
		var elementX = element.offset().left;
		var elementY = element.offset().top;
		var elementW = element.width();
		var elementH = element.height();
		
		// Verifica se o centro do Pacman estará dentro desta div
		if (centerX >= elementX && 
			centerX <= (elementX + elementW) &&
			centerY >= elementY && 
			centerY <= (elementY + elementH)) {
			
			canMove = true;
			return false; // Para o loop each()
		}
	});
	
	return canMove;
}

/**
 *
**/
function init() 
{
	config_init();
	
	// Pixes de Atualizações
	leapX = 0;
	leapY = 0;

	// Estado do PacMan
	state = 'stop';

	// Personagens
	pacman = $("#pacman");
	blinky = $("#blinky");
	clyde = $("#clyde");
	pinky = $("#pinky");
	inky = $("#inky");
	score = $("#score");
	ready = $("#ready");

	// Posições Iniciais
	positionX =  $(".PI").offset().left;
	positionY =  $(".PI").offset().top;

	draw();
	
	
	// Exemplo de uso das funções de detecção de posição
	// Verifica em qual elemento o Pacman está em cima
	console.log("=== TESTE INICIAL ===");
	var currentClass = checkPacmanPosition();
	console.log("Pacman está sobre elemento com classe:", currentClass);
	
	// Testa classes específicas
	console.log("Está sobre classe 'PI'?", isPacmanOnClass('PI'));
	console.log("Está sobre classe 'M'?", isPacmanOnClass('M'));
	console.log("Está sobre classe 'P'?", isPacmanOnClass('P'));
	console.log("=== FIM TESTE ===");
	
	
	// Adiciona event listener para capturar teclas direcionais
	$(document).keydown(handleKeyPress);
	
//	pacman.css({ "left" : positionX + "px" , "top" : positionY + "px" });
	
//	up, down, left, right, stop
	
//	camp = $("#camp");
//	campX = camp.offset().left;
//	campY = camp.offset().top;
//	campW = camp.width();
//	campH = camp.height();
//	
//	ball = $("#ball");
//	ballX = ball.offset().left;
//	ballY = ball.offset().top;
//	ballW = ball.width();
//	ballH = ball.height();
//	
//	racketLeft = $("#racketLeft");
//	racketRight = $("#racketRight");
//	scoreLeft = $("#scoreLeft");
//	scoreRight = $("#scoreRight");
//	
//	scoreP1 = 0;
//	scoreP2 = 0;
//	
//	puloX = 6;
//	puloY = 6;
//	
//	positionX = parseInt(campW / 2) - parseInt(ballW / 2);
//	positionY = parseInt(campH / 2) - parseInt(ballH / 2);
	
//	alert(pacman.offset().left);
//	alert(pacman.offset().top);
	
//	loop();
}

$(document).ready(init);