export default class Gameboard {
	#ships = [];
	#shots = [];

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

	#findShip(coords) {
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
				this.#findShip(coords).hit();
			}
			this.#shots.push(coords);
		}
	}

	allSunk() {
		return this.#ships.map(obj => obj.ship.sunk).every(bool => bool);
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
