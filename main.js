'use strict';
// Global state
let debug = true;
let direction = "none";

// This code needs cleaning.
//
// Do I really want to write it like this? I can write it without state, I think. 
// And I think it would be easier to follow.
//
// I'm now thinking that I really should rewrite this more functional. This is messy AF.

let definitions = () => {
	let drawBall = (ball, grid) => {
		fill(32, 123, 125);
		strokeWeight(1);
		ellipse(
			ball.pixelPos.x, ball.pixelPos.y,
			grid.gridSize * 0.5);
	};

	let moveBall = (ball, grid, dir) => {
		let hit = slideInGrid(grid, ball.x, ball.y, dir);
		if (hit.x == ball.x && hit.y == ball.y) {
			// Might wanna make this apparent with some visuals.
			return;
		}

		ball.moving = true;
		ball.speed = 0;

		ball.nextPixelPos = getScreenCoordFromTile(grid, hit.x, hit.y);

		grid.cells[hit.x][hit.y] = ball;
		grid.cells[ball.x][ball.y] = null;
		ball.x = hit.x;
		ball.y = hit.y;
	};
	window["moveBall"] = moveBall;

	let updateBall = (ball, delta) => {
		// This can probable be made more intelegently.
		if (!ball.moving) return;

		ball.speed += ball.acceleration * delta + ball.deacceleration * (ball.speed * ball.maxSpeed) * delta;

		let deltaSpeed = ball.speed * delta;
		let deltaX = ball.nextPixelPos.x - ball.pixelPos.x;
		let deltaY = ball.nextPixelPos.y - ball.pixelPos.y;

		let bothEqual = 0;
		if (Math.abs(deltaX) < deltaSpeed) {
			ball.pixelPos.x = ball.nextPixelPos.x;
			bothEqual++;
		} else {
			ball.pixelPos.x += Math.sign(deltaX) * deltaSpeed;
		}

		if (Math.abs(deltaY) < deltaSpeed) {
			ball.pixelPos.y = ball.nextPixelPos.y;
			bothEqual++;
		} else {
			ball.pixelPos.y += Math.sign(deltaY) * deltaSpeed;
		}

		if (bothEqual == 2) {
			ball.moving = false;
		}
	}
	window["updateBall"] = updateBall;

	let Ball = function (x, y, grid) {
		this.movable = true;
		this.moving = false;
		this.x = x;
		this.y = y;

		// Graphics
		this.pixelPos = getScreenCoordFromTile(grid, x, y);
		this.nextPixelPos = getScreenCoordFromTile(grid, x, y);
		
		// Simulation
		this.deacceleration = 18;
		this.acceleration = 18;
		this.speed = 0;
		this.maxSpeed = 10;

		grid.cells[x][y] = this;

		this.draw = () => {
			drawBall(this, grid);
		};
	};
	window["Ball"] = Ball;

	let Wall = function (x, y, grid) {
		this.grid = grid;
		this.x = x;
		this.y = y;
		this.movable = false;
		this.draw = () => {
			fill(133, 23, 125);
			strokeWeight(1);
			ellipse(
				grid.xMargin + (this.x + 0.5) * this.grid.gridSize, 
				grid.yMargin + (this.y + 0.5) * this.grid.gridSize, 
				this.grid.gridSize * 0.66);
		};

	};
	window["Wall"] = Wall;

	let calculateTotalSize = (grid) => {
		grid.wTot = grid.w * grid.gridSize;
		grid.hTot = grid.h * grid.gridSize;
	};

	let calculateGridSize = (grid) => {
		calculateTotalSize(grid);
		let margin = 10;
		if (width - 2 * margin < grid.wTot) {
			grid.gridSize = (width - 2 * margin) / grid.w; 
			grid.calculateSize();
		}
		if (height - 2 * margin < grid.hTot) {
			grid.gridSize = (height - 2 * margin) / grid.h; 
			grid.calculateSize();
		}

		grid.xMargin = (width  - grid.wTot) / 2;
		grid.yMargin = (height - grid.hTot) / 2;
	};

	let getScreenCoordFromTile = (grid, x, y) => {
		return {
			x: grid.xMargin + (x + 0.5) * grid.gridSize,
			y: grid.yMargin + (y + 0.5) * grid.gridSize,
		}
	};

	let drawGrid = (grid) => {
		strokeWeight(3);
		let y0 = grid.yMargin;
		let y1 = y0 + grid.h * grid.gridSize;
		for (let x = 0; x < grid.w + 1; x++) {
			let xP = grid.xMargin + x * grid.gridSize;
			line(xP, y0, xP, y1);
		}
		let x0 = grid.xMargin;
		let x1 = x0 + grid.w * grid.gridSize;
		for (let y = 0; y < grid.h + 1; y++) {
			let yP = grid.yMargin + y * grid.gridSize;
			line(x0, yP, x1, yP);

		}

		for (let x = 0; x < grid.w; x++) {
			for (let y = 0; y < grid.h; y++) {
				if (grid.cells[x][y] != null) {
					grid.cells[x][y].draw();
				}
			}
		}
	};
	window["drawGrid"] = drawGrid;

	let slideInGrid = (grid, x, y, dir) => {
		// TODO: Export into a cleaner function and make it less. 
		// There has to be a more clever way to do this.
		let moveableHits = 0;
		if (dir === "down") {
			for (let i = y + 1; i < grid.cells[0].length; i++) {
				let cell = grid.cells[x][i];
				if (cell == null) continue;
				if (cell.movable) {
					moveableHits++;
				} else {
					return {
						x: x,
						y: i - moveableHits - 1,
					};
				}
			}
			return {
				x: x,
				y: grid.cells[0].length - moveableHits - 1,
			};
		} else if (dir === "up") {
			for (let i = y - 1; 0 <= i; i--) {
				let cell = grid.cells[x][i];
				if (cell == null) continue;
				if (cell.movable) {
					moveableHits++;
				} else {
					return {
						x: x,
						y: i + moveableHits + 1,
					};
				}
			}
			return {
				x: x,
				y: 0 + moveableHits,
			};
		} else if (dir === "left") {
			for (let i = x - 1; 0 <= i; i--) {
				let cell = grid.cells[i][y];
				if (cell == null) continue;
				if (cell.movable) {
					moveableHits++;
				} else {
					return {
						x: i + moveableHits + 1,
						y: y,
					};
				}
			}
			return {
				x: 0 + moveableHits,
				y: y,
			};
		} else if (dir === "right") {
			for (let i = x + 1; i < grid.cells.length; i++) {
				let cell = grid.cells[i][y];
				if (cell == null) continue;
				if (cell.movable) {
					moveableHits++;
				} else {
					return {
						x: i - moveableHits - 1,
						y: y,
					};
				}
			}
			return {
				x: grid.cells.length - moveableHits - 1,
				y: y,
			};
		}
		llog("Invalid direction");
		return {
			x: x,
			y: y
		};
	}
	window["slideInGrid"] = slideInGrid;

	let Grid = function(w, h, gridSize) {
		this.w = w;
		this.h = h;
		this.wTot = 0;
		this.hTotthis = 0;
		this.xMargin = 0;
		this.yMargin = 0;
		this.gridSize = gridSize;

		// Fill in the cells
		this.cells = new Array(w);
		for (let i = 0; i < w; i++) {
			this.cells[i] = new Array(h);
			for (let j = 0; j < h; j++) {
				if (random() < 0.3) {
					this.cells[i][j] = new Wall (i, j, this);
				}
			}
		}
		
		calculateGridSize(this);

	}
	window["Grid"] = Grid;

};

(() => {
	let g;
	let balls = new Array();
	window["balls"] = balls;
	function setup() {
		createCanvas(window.innerWidth, window.innerHeight);
		let el = document.getElementsByTagName("canvas")[0];
		setupTouch(el);

		background(51);

		frameRate(30);

		definitions();

		g = new Grid(10, 10, 50);
		balls.push(new Ball(5, 1, g));
		balls.push(new Ball(5, 3, g));
		balls.push(new Ball(5, 4, g));
	}
	window["setup"] = setup;

	function update() {
		// Logic
		if (direction !== "none") {
			balls.sort((a, b) => {
				// TODO: This should be restructured to be less branchy...
				// This can probs be made smarter... It is reling on global state... But then again... It kinda has to...
				if (direction === "up") {
					if (a.y < b.y) {
						return -1;
					}
					if (b.y < a.y) {
						return 1;
					}
					return 0;
				}

				if (direction === "down") {
					if (a.y < b.y) {
						return 1;
					}
					if (b.y < a.y) {
						return -1;
					}
					return 0;
				}

				if (direction === "left") {
					if (a.x < b.x) {
						return -1;
					}
					if (b.x < a.x) {
						return 1;
					}
					return 0;
				}

				if (direction === "right") {
					if (a.x < b.x) {
						return 1;
					}
					if (b.x < a.x) {
						return -1;
					}
					return 0;
				}

				return 0;
			});

			let moving = false;
			for (let i = 0; i < balls.length; i++) {	
				if (balls[i].moving) {
					moving = true;
					break;
				}
			}


			if (!moving) {
				for (let i = 0; i < balls.length; i++) {
					moveBall(balls[i], g, direction);
				}
			}
			direction = "none";
		}

		for (let i = 0; i < balls.length; i++) {
			updateBall(balls[i], 0.16);
		}
		
		// Rendering
		clear();
		drawGrid(g);
	}
	window["draw"] = update;

	function llog(msg) {
		let l = document.getElementById("log");
		l.innerHTML = msg + "<br>" + l.innerHTML;
	}
	window["llog"] = llog;


})();
