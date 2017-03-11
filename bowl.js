var c = document.getElementById("board");
var ctx = c.getContext("2d");
var width = 600;
var height = 600;
var radius = 14;
var blank = 12;
var turn = 1; // 1 black 2 white


var egg_array = new Array();

function init(){
	for (i = 0; i < 1; i++) {
		for (j = 0; j < 2; j++) {
			egg_array.push(new Egg(200 + (40 * i), 200 + (40 * j), 0));
		}
	}
	
	egg_array[1].addForce(Math.cos(-1), Math.sin(-1), 40);

	runPhysics();
}

function runPhysics(){
	var check_meet;
	for (i = 0; i < egg_array.length; i++) {
		if (egg_array[i].speed > 0) {
			egg_array[i].xPos += egg_array[i].xDir * egg_array[i].speed;
			egg_array[i].yPos += egg_array[i].yDir * egg_array[i].speed;
			egg_array[i].speed-=0.1; //a = /ug -> 50프레임 /50

			
			for (j = 0; j < egg_array.length; j++) {
				check_meet = false;
				if (j != i) {
					while (isMeet(egg_array[i].xPos, egg_array[i].yPos,
							egg_array[j].xPos, egg_array[j].yPos)) {
						if (!check_meet) check_meet = true;
						console.log(egg_array[i].yDir);
						if (egg_array[i].xPos > egg_array[j].xPos) {
							egg_array[i].xPos = egg_array[i].xPos + Math.abs(egg_array[i].xDir);
						} else {
							egg_array[i].xPos = egg_array[i].xPos - Math.abs(egg_array[i].xDir);
						}
						if (egg_array[i].yPos > egg_array[j].yPos) {
							egg_array[i].yPos = egg_array[i].yPos + Math.abs(egg_array[i].yDir);
						} else {
							egg_array[i].yPos = egg_array[i].yPos - Math.abs(egg_array[i].yDir);
						}
					}
					

					if (check_meet) {
						egg_array[j].xDir = (egg_array[j].xPos - egg_array[i].xPos) / (2 * radius);
						egg_array[j].yDir = (egg_array[j].yPos - egg_array[i].yPos) / (2 * radius);

						var cos = egg_array[i].xDir * egg_array[j].xDir +
							egg_array[i].yDir * egg_array[j].yDir;

						egg_array[i].xDir = egg_array[i].xDir - (egg_array[j].xDir) * cos;
						egg_array[i].yDir = egg_array[i].yDir - (egg_array[j].yDir) * cos;

						egg_array[i].speed = 4;
						egg_array[j].speed = 4;
					}
				}
			}
		}
	}

	if (egg_array[0].speed > 0 || egg_array[1].speed > 0) {
		setTimeout(runPhysics, 20);
	}
	
}

function isMeet(x1, y1, x2, y2) {
	var distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	if (distance <= radius * 2) {
		return true;
	}
	return false;
}

function updateBoard(){
	// board fill color
	ctx.fillStyle="#ffcc66";
	ctx.fillRect(0, 0, width, height);

	// board draw line
	ctx.strokeStyle="#333300";
	ctx.fillStyle="#333300";
	for (i = 0; i < 19; i++) { 
		// horizontal line draw
		ctx.beginPath();
		ctx.moveTo(blank + i * 32, blank);
		ctx.lineTo(blank + i * 32, height - blank);
		ctx.stroke();

		// vertical line draw
		ctx.beginPath();
		ctx.moveTo(blank, blank + i * 32);
		ctx.lineTo(height - blank, blank + i * 32);
		ctx.stroke();
	}

	// board draw point
	var circleRadius = 3;
	for (i = 0; i < 3; i++) { 
		for (j = 0; j < 3; j++) { 
			// board circle draw
			ctx.beginPath();
			ctx.arc(blank + 3 * 32 + i * 6 * 32, blank + 3 * 32  + j * 6 * 32, circleRadius, 0, 2*Math.PI);
			ctx.fill();
			ctx.stroke();
		}
	}

	for (i = 0; i < egg_array.length; i++) {
		ctx.beginPath();
		if (egg_array[i].color == 0) {
			ctx.strokeStyle="#000000";
			ctx.fillStyle="#000000";
		} else {
			ctx.strokeStyle="#FFFFFF";
			ctx.fillStyle="#FFFFFF";
		}

		ctx.arc(egg_array[i].xPos, egg_array[i].yPos, radius, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();
	}
	setTimeout(updateBoard, 20);
}

/* Mouse Event */
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
	  x: evt.clientX - rect.left,
	  y: evt.clientY - rect.top
	};
}

c.addEventListener('mousemove', function(evt) {
	var mousePos = getMousePos(c, evt);
}, false);

c.addEventListener('mousedown', function(evt) {
	var mousePos = getMousePos(c, evt);
}, false);


function Egg(xPos, yPos, color) {
	this.xPos = xPos;
	this.yPos = yPos;
	this.color = color;
	this.xDir = 0;
	this.yDir = 0;
	this.speed = 0;
	this.initspeed = 0;
}

Egg.prototype.addForce = function(xDir, yDir, force) {
	this.xDir = xDir;
	this.yDir = yDir;
	this.speed = Math.sqrt(2 * force);
	return true;
};


init();
updateBoard();