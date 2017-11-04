(() => {
	//
	// File scope, shouldn't be used outside the file.
	//
	let ongoingTouches = [];
	let lastDir = [];

	function copyTouch(touch) {
		return {
			identifier: touch.identifier,
			clientX: touch.clientX,
			clientY: touch.clientY
		};
	}

	function ongoingTouchIndexById(idToFind) {
		for (let i = 0; i < ongoingTouches.length; i++) {
			let id = ongoingTouches[i].identifier;

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


	// Variables used in "generateDirectionEvent".
	let halfNumSegments = 4; // Controls how accurate the you have to be when draging a direction.
	let low  = Math.floor(halfNumSegments / 2);
	let high = Math.ceil(halfNumSegments / 2);

	function generateDirectionEvent(id) {
		let angle = Math.atan2(lastDir[id].x, lastDir[id].y);
		// Maybe rename dir to something more descriptive, sure it's a direction, but what kind of direction?
		let dir = Math.round((angle / PI) * halfNumSegments);

		direction = "none";
		if (dir === 0) {
			direction = "down";
		} else if (dir === -low || dir === -high) {
			direction = "left";
		} else if (Math.abs(dir) === halfNumSegments) {
			direction = "up";
		} else if (dir === low || dir === high) {
			direction = "right";
		}
	}

	//
	// Exported functions.
	//

	function handleStart(evt) {
		// I dont want to disable this since it disables all clicks, right?
		// evt.preventDefault();
		let touches = evt.changedTouches;

		for (let i = 0; i < touches.length; i++) {
			ongoingTouches.push(copyTouch(touches[i]));
			lastDir.push({x: 0, y: 0});
		}
	}
	// Export
	window["handleStart"] = handleStart;

	function handleEnd(evt) {
		evt.preventDefault();
		let touches = evt.changedTouches;


		for (let i = 0; i < touches.length; i++) {
			let idx = ongoingTouchIndexById(touches[i].identifier);

			if (idx >= 0) {
				generateDirectionEvent(idx);
				removeOngoingTouche(i);
			}
		}
	}
	// Export
	window["handleEnd"] = handleEnd;

	function handleCancel(evt) {
		evt.preventDefault();
		let touches = evt.changedTouches;

		for (let i = 0; i < touches.length; i++) {
			removeOngoingTouche(i);
		}
	}
	// Export
	window["handleCancel"] = handleCancel;

	function handleMove(evt) {
		evt.preventDefault();
		let touches = evt.changedTouches;

		for (let i = 0; i < touches.length; i++) {
			let idx = ongoingTouchIndexById(touches[i].identifier);
			strokeWeight(10);

			if (debug) {
				line(
					ongoingTouches[idx].clientX, ongoingTouches[idx].clientY, 
					touches[i].clientX, touches[i].clientY);
			}

			lastDir[idx].x += touches[i].clientX - ongoingTouches[idx].clientX;
			lastDir[idx].y += touches[i].clientY - ongoingTouches[idx].clientY;
			lastDir[idx].x /= 2;
			lastDir[idx].y /= 2;
			ongoingTouches.splice(idx, 1, copyTouch(touches[i]));
		}
	}
	// Export
	window["handleMove"] = handleMove;

	function setupTouch(element) {
		element.addEventListener("touchstart", handleStart, false);
		element.addEventListener("touchend", handleEnd, false);
		element.addEventListener("touchcancel", handleCancel, false);
		element.addEventListener("touchmove", handleMove, false);	
	}
	// Export
	window["setupTouch"] = setupTouch;
})();
