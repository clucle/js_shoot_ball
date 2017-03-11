// bowling (physics test)
// Made by clucle 2017

/* Canvas Setting */
var c = document.getElementById("board");
var ctx = c.getContext("2d");
var width = 600;
var height = 600;

/* Board Setting */

// Egg's radius
var radius = 14;
// Board Line distance (horizontal, vertical)
var blank = 12;
// Egg's Array
var egg_array = new Array();

function init(){
	// Init Eggs (Spawn)
	for (i = 0; i < 5; i++) {
		for (j = 0; j < 5; j++) {
			egg_array.push(new Egg(200 + (80 * i), 200 + (80 * j), 0));
		}
	}
	// Mouse Event Init
	c.addEventListener("mousedown", mouseDownListener, false);

	// push using addForce
	egg_array[0].addForce(Math.cos(1), Math.sin(1), 40);

	// when push call runPhysics
	runPhysics();
}

function runPhysics(){
	// check_meet use for checking kiss Eggs
	var check_meet;

	for (i = 0; i < egg_array.length; i++) {
		if (egg_array[i].speed > 0) {
			// Egg Move
			egg_array[i].x_pos += egg_array[i].x_dir * egg_array[i].speed;
			egg_array[i].y_pos += egg_array[i].y_dir * egg_array[i].speed;
			egg_array[i].speed -= 0.1; // accelate = ㎍ (friction) -> 50 Frame /50

			
			for (j = 0; j < egg_array.length; j++) {
				check_meet = false;
				if (j != i) {
					while (isMeet(egg_array[i].x_pos, egg_array[i].y_pos,
							egg_array[j].x_pos, egg_array[j].y_pos)) {
						if (!check_meet) check_meet = true;
						if (egg_array[i].x_pos > egg_array[j].x_pos) {
							egg_array[i].x_pos = egg_array[i].x_pos + Math.abs(egg_array[i].x_dir);
						} else {
							egg_array[i].x_pos = egg_array[i].x_pos - Math.abs(egg_array[i].x_dir);
						}
						if (egg_array[i].y_pos > egg_array[j].y_pos) {
							egg_array[i].y_pos = egg_array[i].y_pos + Math.abs(egg_array[i].y_dir);
						} else {
							egg_array[i].y_pos = egg_array[i].y_pos - Math.abs(egg_array[i].y_dir);
						}
					}
					

					if (check_meet) {
						// When Kiss Break direction Degree = A
						// When Kiss Other Egg's direction between origin Degree = B
						// Calculate Two Egg's direction and speed

						egg_array[j].x_dir = (egg_array[j].x_pos - egg_array[i].x_pos) / (2 * radius);
						egg_array[j].y_dir = (egg_array[j].y_pos - egg_array[i].y_pos) / (2 * radius);

						var cosB = egg_array[i].x_dir * egg_array[j].x_dir +
							egg_array[i].y_dir * egg_array[j].y_dir;
						var cosA = Math.sqrt(1 - Math.abs(cosB));

						egg_array[i].x_dir = egg_array[i].x_dir - (egg_array[j].x_dir) * cosB;
						egg_array[i].y_dir = egg_array[i].y_dir - (egg_array[j].y_dir) * cosB;

						egg_array[j].speed = egg_array[i].speed * (1 / (cosA * cosA / cosB + cosB));
						egg_array[i].speed = egg_array[i].speed * (1 / (cosB * cosB / cosA + cosA));
						
					}
				}
			}
		}
	}

	// If Egg have Energy Run Again
	var check_remain_energy = false;
	for (i = 0; i < egg_array.length; i++) {
		if (egg_array[i].speed > 0) {
			check_remain_energy = true;
			break;
		}
	}
	if (check_remain_energy) {
		setTimeout(runPhysics, 20);
	}
	
}

// Check is Meet
function isMeet(x1, y1, x2, y2) {
	var distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
	if (distance <= radius * 2) {
		return true;
	}
	return false;
}

// Canvas Loop
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
	var circle_radius = 3;
	for (i = 0; i < 3; i++) { 
		for (j = 0; j < 3; j++) { 
			// board circle draw
			ctx.beginPath();
			ctx.arc(blank + 3 * 32 + i * 6 * 32, blank + 3 * 32  + j * 6 * 32, circle_radius, 0, 2*Math.PI);
			ctx.fill();
			ctx.stroke();
		}
	}

	// Draw Shooting Range
	if (dragging == true)
	{
		ctx.beginPath();
		ctx.strokeStyle="rgba(255, 255, 255, 0.9)"
		ctx.fillStyle="rgba(255, 255, 255, 0.6)"
		ctx.arc(egg_array[drag_index].x_pos, egg_array[drag_index].y_pos, radius * 3, 0, 2*Math.PI);
		ctx.fill();
		ctx.stroke();
	}

	// Draw Egg
	for (i = 0; i < egg_array.length; i++) {
		ctx.beginPath();
		if (egg_array[i].color == 0) {
			ctx.strokeStyle="#000000";
			ctx.fillStyle="#000000";
		} else {
			ctx.strokeStyle="#FFFFFF";
			ctx.fillStyle="#FFFFFF";
		}

		ctx.arc(egg_array[i].x_pos, egg_array[i].y_pos, radius, 0, 2*Math.PI);
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

/* Drag and Drop */
var dragging = false;
var drag_index;
var drag_x;
var drag_y;

function mouseDownListener(evt) {
    var canvas_blank = c.getBoundingClientRect();
    var canvas_x = (evt.clientX - canvas_blank.left) * (c.width / canvas_blank.width);
    var canvas_y = (evt.clientY - canvas_blank.top) * (c.height / canvas_blank.height);
    var i;

    for (i = 0; i < egg_array.length; i++) {
        if (egg_array[i].HitTest(canvas_x, canvas_y)) {
            dragging = true;
            drag_index = i;
        }
    }
    if (dragging) {
        window.addEventListener("mousemove", mouseMoveListener, false);
        window.addEventListener("mouseup", mouseUpListener, false);
    }
}

function mouseMoveListener(evt) {
    var canvas_blank = c.getBoundingClientRect();
    var canvas_x = (evt.clientX - canvas_blank.left) * (c.width / canvas_blank.width);
    var canvas_y = (evt.clientY - canvas_blank.top) * (c.height / canvas_blank.height);
    drag_x = egg_array[drag_index].x_pos - canvas_x;
    drag_y = egg_array[drag_index].y_pos - canvas_y;
}
function mouseUpListener(evt) {
    window.removeEventListener("mousemove", mouseMoveListener, false);
    window.removeEventListener("mouseup", mouseUpListener, false);
    dragging = false;
}

/* Drag and Drop End */
// Egg Class
function Egg(x_pos, y_pos, color) {
	this.x_pos = x_pos;
	this.y_pos = y_pos;
	this.color = color;
	this.x_dir = 0;
	this.y_dir = 0;
	this.speed = 0;
	this.initspeed = 0;
}

Egg.prototype.addForce = function(x_dir, y_dir, force) {
	this.x_dir = x_dir;
	this.y_dir = y_dir;
	this.speed = Math.sqrt(2 * force);
	return true;
};

Egg.prototype.HitTest = function(cx, cy) {
    return ((cx > this.x_pos - radius) && (cx < this.x_pos + radius)
        && (cy > this.y_pos - radius) && (cy < this.y_pos + radius));
}

init();
updateBoard();