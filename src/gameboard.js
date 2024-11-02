export default class Gameboard {
	#ships = [];
	#shots = [];
	#probabilityMap = {};

	#endCoords(ship, startR, startC) {
		const coords = [startR, startC];
		const addVal = ship.length - 1;
		const addVectors = [
			[0, addVal],
			[addVal, 0],
			[0, -addVal],
			[-addVal, 0],
		];
		return addVectors.map(vector => vector.map((val, i) => val + coords[i]));
	}

	#withinRange(r, c) {
		return r >= 0 && r < 10 && c >= 0 && c < 10;
	}

	#withinRangeEndCoords(ship, startR, startC) {
		return this.#endCoords(ship, startR, startC).filter(coords =>
			this.#withinRange(coords[0], coords[1]),
		);
	}

	#withinRangePath(ship, startR, startC) {
		const result = {};
		this.#withinRangeEndCoords(ship, startR, startC).forEach(end => {
			result[end] = this.#coordsPath([startR, startC], end);
		});
		return result;
	}

	#validEnd(ship, startR, startC) {
		const paths = this.#withinRangePath(ship, startR, startC);
		const valid = [];
		for (const end in paths) {
			if (!this.#pathOccupied(paths[end])) {
				valid.push(end.split(",").map(char => Number(char)));
			}
		}
		return valid;
	}

	#endCoordsValid(ship, startCoords, endCoords) {
		return this.#coordsInArray(
			this.#validEnd(ship, startCoords[0], startCoords[1]),
			endCoords,
		);
	}

	#squareOccupied(coords) {
		return this.#coordsInArray(this.#occupiedCoords(), coords);
	}

	#pathOccupied(path) {
		let result = false;
		path.forEach(coords => {
			if (this.#coordsInArray(this.#occupiedCoords(), coords)) {
				result = true;
			}
		});
		return result;
	}

	#coordsInArray(arr, coords) {
		return JSON.stringify(arr).includes(JSON.stringify(coords));
	}

	#occupiedCoords() {
		return this.#ships.map(ship => ship.coords).flat(1);
	}

	#coordsPath(startCoords, endCoords) {
		const path = [];

		const [r1, c1] = startCoords;
		const [r2, c2] = endCoords;

		// Handle vertical line (same r-coordinates)
		if (r1 === r2) {
			const minC = Math.min(c1, c2);
			const maxC = Math.max(c1, c2);
			for (let c = minC; c <= maxC; c++) {
				path.push([r1, c]);
			}
		}
		// Handle horizontal line (same y-coordinates)
		else if (c1 === c2) {
			const minR = Math.min(r1, r2);
			const maxR = Math.max(r1, r2);
			for (let r = minR; r <= maxR; r++) {
				path.push([r, c1]);
			}
		}

		return path;
	}

	#horizontalEnd(ship, startCoords) {
		return [startCoords[0], startCoords[1] + ship.length - 1];
	}

	#verticalEnd(ship, startCoords) {
		return [startCoords[0] + ship.length - 1, startCoords[1]];
	}

	#allCoords() {
		const coords = [];
		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 10; j++) {
				coords.push([i, j]);
			}
		}
		return coords;
	}

	#horizontalStartEnd(ship) {
		return this.#allCoords()
			.map(coords => {
				const end = this.#horizontalEnd(ship, coords);
				if (this.#withinRange(end[0], end[1])) {
					return {
						start: coords,
						end,
					};
				}
			})
			.filter(obj => obj);
	}

	#verticalStartEnd(ship) {
		return this.#allCoords()
			.map(coords => {
				const end = this.#verticalEnd(ship, coords);
				if (this.#withinRange(end[0], end[1])) {
					return {
						start: coords,
						end,
					};
				}
			})
			.filter(obj => obj);
	}

	#allHorizontalPaths(ship) {
		return this.#horizontalStartEnd(ship).map(obj =>
			this.#coordsPath(obj.start, obj.end),
		);
	}

	#allVerticalPaths(ship) {
		return this.#verticalStartEnd(ship).map(obj =>
			this.#coordsPath(obj.start, obj.end),
		);
	}

	calculateDensity() {
		this.activeShips.forEach(ship => {
			const horizontal = this.#allHorizontalPaths(ship);
			const vertical = this.#allVerticalPaths(ship);
		});
	}

	get activeShips() {
		return this.#ships.map(obj => obj.ship).filter(ship => !ship.sunk);
	}

	findShip(coords) {
		return this.#ships.find(ship => {
			return this.#coordsInArray(ship.coords, coords);
		}).ship;
	}

	isValid(ship, startCoords, endCoords) {
		if (
			this.#squareOccupied(startCoords) ||
			!this.#endCoordsValid(ship, startCoords, endCoords)
		) {
			return false;
		}

		return true;
	}

	#randomStartCoords() {
		const r = Math.floor(Math.random() * 9);
		const c = Math.floor(Math.random() * 9);
		const startCoords = [r, c];
		if (this.#squareOccupied(startCoords)) {
			return this.#randomStartCoords();
		}

		return startCoords;
	}

	randomCoords(ship) {
		const start = this.#randomStartCoords();
		const end = this.#validEnd(ship, start[0], start[1]);
		const random = Math.floor(Math.random() * end.length);
		return [start, end[random]];
	}

	addShip(ship, startCoords, endCoords) {
		if (this.isValid(ship, startCoords, endCoords)) {
			ship.horizontal = startCoords[0] === endCoords[0];
			this.#ships.push({
				ship,
				coords: this.#coordsPath(startCoords, endCoords),
			});
		}
	}

	receiveAttack(coords) {
		// coords not shot yet
		if (!this.#coordsInArray(this.#shots, coords)) {
			if (this.#squareOccupied(coords)) {
				this.findShip(coords).hit();
			}
			this.#shots.push(coords);
		}
	}

	allSunk() {
		return this.#ships.map(obj => obj.ship.sunk).every(bool => bool);
	}

	adjacentCoords(coords) {
		const addVal = 1;
		const addVectors = [
			[0, addVal],
			[addVal, 0],
			[0, -addVal],
			[-addVal, 0],
		];

		return addVectors
			.map(vector => vector.map((val, i) => val + coords[i]))
			.filter(vector => this.#withinRange(vector[0], vector[1]));
	}

	get sunkShips() {
		return this.#ships.filter(obj => obj.ship.sunk);
	}

	get shipCoords() {
		return this.#ships.map(obj => obj.coords).flat(1);
	}

	get ships() {
		return this.#ships;
	}

	get shots() {
		return this.#shots;
	}

	get missed() {
		return this.#shots.filter(shot => {
			return !this.#coordsInArray(this.#occupiedCoords(), shot);
		});
	}
}
