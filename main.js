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
	
	positionX = parseInt(positionX) + parseInt(leapX);
	
//	positionY = parseInt(positionY) + parseInt(leapY);
	
	draw();
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
	// setInterval(loop, parseInt(1000 / updates));
}

/**
 *
**/
function init() 
{
	config_init();
	
	// Pixes de Atualizações
	leapX = 2;
	leapY = 2;

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
	
	positionX = pacman.offset().left;
	positionY = pacman.offset().top;	
	
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
	
//	draw();
	
//	loop();
}

$(document).ready(init);