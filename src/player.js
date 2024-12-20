import Gameboard from "./gameboard";
import Ship from "./ship";

export default class Player {
	#gameboard = new Gameboard();
	#fleet = [
		new Ship("carrier", 5),
		new Ship("battleship", 4),
		new Ship("cruiser", 3),
		new Ship("submarine", 3),
		new Ship("destroyer", 2),
	];

	constructor(name) {
		this.name = name;
	}

	addShipsRandomly() {
		this.#fleet.forEach(ship => {
			const [start, end] = this.#gameboard.randomCoords(ship);
			this.#gameboard.addShip(ship, start, end);
		});
	}

	addDefaultShips() {
		this.#gameboard.addShip(new Ship("carrier", 5), [0, 4], [0, 0]);
		this.#gameboard.addShip(new Ship("battleship", 4), [6, 0], [9, 0]);
		this.#gameboard.addShip(new Ship("cruiser", 3), [3, 4], [5, 4]);
		this.#gameboard.addShip(new Ship("submarine", 3), [2, 3], [2, 5]);
		this.#gameboard.addShip(new Ship("destroyer", 2), [7, 8], [7, 9]);
	}

	defaultComputerShips() {
		this.#gameboard.addShip(new Ship("carrier", 5), [9, 9], [5, 9]);
		this.#gameboard.addShip(new Ship("battleship", 4), [9, 8], [6, 8]);
		this.#gameboard.addShip(new Ship("cruiser", 3), [9, 7], [7, 7]);
		this.#gameboard.addShip(new Ship("submarine", 3), [9, 6], [7, 6]);
		this.#gameboard.addShip(new Ship("destroyer", 2), [9, 5], [8, 5]);
	}

	resetGameboard() {
		this.#gameboard = new Gameboard();
	}

	get gameboard() {
		return this.#gameboard;
	}
}
