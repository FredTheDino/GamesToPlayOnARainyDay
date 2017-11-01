function copyTouch(touch) {
	return {
		identifier: touch.identifier,
		clientX: touch.clientX,
		clientY: touch.clientY
	};
}

function ongoingTouchIndexById(idToFind) {
	for (var i = 0; i < ongoingTouches.length; i++) {
		var id = ongoingTouches[i].identifier;

		if (id == idToFind) {
			return i;
		}
	}
	return -1; // not found
}

function removeOngoingTouche(id) {
	ongoingTouches.splice(id, 1);
	lastDir.splice(id, 1);
}


function generateDirectionEvent(id) {
	var angle = Math.atan2(lastDir[id].x, lastDir[id].y);
	// Maybe rename dir to something more descriptive, sure it's a direction, but what kind of direction?
	var dir = Math.round((angle / PI) * 5);

	direction = "none";
	if (dir === 0) {
		direction = "down";
	} else if (dir === -2 || dir === -3) {
		direction = "left";
	} else if (dir === 5 || dir === -5) {
		direction = "up";
	} else if (dir === 2 || dir === 3) {
		direction = "right";
	}
}


var direction = "none";
var ongoingTouches = [];
var lastDir = [];

function handleStart(evt) {
	// I dont want to disable this since it disables all clicks, right?
	// evt.preventDefault();
	var touches = evt.changedTouches;

	for (var i = 0; i < touches.length; i++) {
		ongoingTouches.push(copyTouch(touches[i]));
		lastDir.push({x: 0, y: 0});
	}
}

function handleEnd(evt) {
	evt.preventDefault();
	var touches = evt.changedTouches;


	for (var i = 0; i < touches.length; i++) {
		var idx = ongoingTouchIndexById(touches[i].identifier);

		if (idx >= 0) {
			generateDirectionEvent(idx);
			removeOngoingTouche(i);
		}
	}
}

function handleCancel(evt) {
	evt.preventDefault();
	var touches = evt.changedTouches;

	for (var i = 0; i < touches.length; i++) {
		removeOngoingTouche(i);
	}
}

function handleMove(evt) {
	evt.preventDefault();
	var touches = evt.changedTouches;

	for (var i = 0; i < touches.length; i++) {
		var idx = ongoingTouchIndexById(touches[i].identifier);
		strokeWeight(10);

		line(
			ongoingTouches[idx].clientX, ongoingTouches[idx].clientY, 
			touches[i].clientX, touches[i].clientY);
		lastDir[idx].x += touches[i].clientX - ongoingTouches[idx].clientX;
		lastDir[idx].y += touches[i].clientY - ongoingTouches[idx].clientY;
		lastDir[idx].x /= 2;
		lastDir[idx].y /= 2;
		ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
	}
}


function setup() {
	createCanvas(window.innerWidth, window.innerHeight);
	var el = document.getElementsByTagName("canvas")[0];
	el.addEventListener("touchstart", handleStart, false);
	el.addEventListener("touchend", handleEnd, false);
	el.addEventListener("touchcancel", handleCancel, false);
	el.addEventListener("touchmove", handleMove, false);	

	background(51);

	line(0, 0, width, height);

	frameRate(30);
}

function draw() {
	clear();
}

function llog(msg) {
	var l = document.getElementById("log");
	l.innerHTML = msg + "<br>" + l.innerHTML;
}
