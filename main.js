var debug = true;
var direction = "none";

// This code needs cleaning.
//
// Do I really want to write it like this? I can write it without state, I think. 
// And I think it would be easier to follow.
//
// I'm now thinking that I really should rewrite this more functional. This is messy AF.

var definitions = () => {
	var Ball = function (x, y, grid) {
		this.movable = true;
		this.moving = false;
		this.x = x;
		this.y = y;
		this.pixelPos = grid.getScreenCoord(x, y);
		this.nextPixelPos = grid.getScreenCoord(x, y);
		this.deacceleration = 18;
		this.acceleration = 18;
		this.speed = 0;
		this.maxSpeed = 
		this.grid = grid;

		grid.cells[x][y] = this;
		
		this.draw = () => {
			fill(32, 123, 125);
			strokeWeight(1);
			ellipse(
				this.pixelPos.x, this.pixelPos.y,
				grid.gridSize * 0.5);

		};
		
		this.move = (dir) => {
			var hit = this.grid.getNewPos(this.x, this.y, dir);
			if (hit.x == this.x && hit.y == this.y) {
				// Might wanna make this apparent with some visuals.
				return;
			}

			this.moving = true;
			this.speed = 0;
			
			this.nextPixelPos = this.grid.getScreenCoord(hit.x, hit.y);

			this.grid.cells[hit.x][hit.y] = this;
			this.grid.cells[this.x][this.y] = null;
			this.x = hit.x;
			this.y = hit.y;

		};

		this.update = (delta) => {
			if (!this.moving) return;

			this.speed += this.acceleration * delta + this.deacceleration * (this.speed * this.maxSpeed) * delta;

			var deltaSpeed = this.speed * delta;
			var deltaX = this.nextPixelPos.x - this.pixelPos.x;//) * deltaSpeed;
			var deltaY = this.nextPixelPos.y - this.pixelPos.y;//) * deltaSpeed;

			var bothEqual = 0;
			if (Math.abs(deltaX) < deltaSpeed) {
				this.pixelPos.x = this.nextPixelPos.x;
				bothEqual++;
			} else {
				this.pixelPos.x += Math.sign(deltaX) * deltaSpeed;
			}

			if (Math.abs(deltaY) < deltaSpeed) {
				this.pixelPos.y = this.nextPixelPos.y;
				bothEqual++;
			} else {
				this.pixelPos.y += Math.sign(deltaY) * deltaSpeed;
			}

			if (bothEqual == 2) {
				this.moving = false;
			}
		};
	};
	window["Ball"] = Ball;

	var Wall = function (x, y, grid) {
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

	var Grid = function(w, h, gridSize) {
		this.w = w;
		this.h = h;
		this.wTot = 0;
		this.hTot = 0;
		this.gridSize = gridSize;


		this.cells = new Array(w);
		for (var i = 0; i < w; i++) {
			this.cells[i] = new Array(h);
			for (var j = 0; j < h; j++) {
				if (i === j) {
					this.cells[i][j] = new Wall (i, j, this);

				}
			}
		}

		this.calculateSize = function() {
			this.wTot = this.w * this.gridSize;
			this.hTot = this.h * this.gridSize;
		}

		// Might export this to procedure for screen rotation.
		this.calculateSize();
		// Makesure the grid fits on screen. Else shrink it.
		let margin = 10;
		if (width - 2 * margin < this.wTot) {
			this.gridSize = (width - 2 * margin) / this.w; 
			this.calculateSize();
		}
		if (height - 2 * margin < this.hTot) {
			this.gridSize = (height - 2 * margin) / this.h; 
			this.calculateSize();
		}

		this.xMargin = (width  - this.wTot) / 2;
		this.yMargin = (height - this.hTot) / 2;

		this.getScreenCoord = (x, y) => {
			return {
				x: this.xMargin + (x + 0.5) * this.gridSize,
				y: this.yMargin + (y + 0.5) * this.gridSize,
			}
		};

		this.set = function(x, y, what) {
			this.cells[x][y] = what;
		}

		this.getNewPos = function(x, y, dir) {
			// TODO: Export into a cleaner function and make it less. 
			// There has to be a more clever way to do this.
			var moveableHits = 0;
			if (dir === "down") {
				for (var i = y + 1; i < this.cells[0].length; i++) {
					var cell = this.cells[x][i];
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
					y: this.cells[0].length - moveableHits - 1,
				};
			} else if (dir === "up") {
				for (var i = y - 1; 0 <= i; i--) {
					var cell = this.cells[x][i];
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
				for (var i = x - 1; 0 <= i; i--) {
					var cell = this.cells[i][y];
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
				for (var i = x + 1; i < this.cells.length; i++) {
					var cell = this.cells[i][y];
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
					x: this.cells.length - moveableHits - 1,
					y: y,
				};
			}
			llog("Invalid direction");
			return {
				x: x,
				y: y
			};
		}
		
		this.draw = function() {

			strokeWeight(3);
			let y0 = this.yMargin;
			let y1 = y0 + this.h * this.gridSize;
			for (var x = 0; x < this.w + 1; x++) {
				var xP = this.xMargin + x * this.gridSize;
				line(xP, y0, xP, y1);
			}
			let x0 = this.xMargin;
			let x1 = x0 + this.w * this.gridSize;
			for (var y = 0; y < this.h + 1; y++) {
				var yP = this.yMargin + y * this.gridSize;
				line(x0, yP, x1, yP);

			}

			for (var x = 0; x < this.w; x++) {
				for (var y = 0; y < this.h; y++) {
					if (this.cells[x][y] != null) {
						this.cells[x][y].draw();
					}
				}
			}
		}
	}
	window["Grid"] = Grid;


};

(() => {
	var g;
	var balls = new Array();
	function setup() {
		createCanvas(window.innerWidth, window.innerHeight);
		var el = document.getElementsByTagName("canvas")[0];
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
				// This can probs be made smarter...
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

			var moving = false;
			for (var i = 0; i < balls.length; i++) {	
				if (balls[i].moving) {
					moving = true;
					break;
				}
			}


			if (!moving) {
				for (var i = 0; i < balls.length; i++) {
					balls[i].move(direction);
				}
			}
			direction = "none";
		}

		for (var i = 0; i < balls.length; i++) {
			balls[i].update(0.16);
		}
		// Rendering
		clear();
		g.draw();
	}
	window["draw"] = update; // Crazy hack for my sane-ness

	function llog(msg) {
		var l = document.getElementById("log");
		l.innerHTML = msg + "<br>" + l.innerHTML;
	}
	window["llog"] = llog;


})();
