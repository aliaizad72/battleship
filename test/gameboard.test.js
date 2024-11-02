import Gameboard from "../src/gameboard";
import Ship from "../src/ship";

const gameboard = new Gameboard();
const submarine = new Ship("Submarine", 3);

const algoBoard = new Gameboard();
algoBoard.addShip(new Ship("carrier", 5), [0, 4], [0, 0]);
algoBoard.addShip(new Ship("battleship", 4), [6, 0], [9, 0]);
algoBoard.addShip(new Ship("cruiser", 3), [3, 4], [5, 4]);
algoBoard.addShip(new Ship("submarine", 3), [2, 3], [2, 5]);
algoBoard.addShip(new Ship("destroyer", 2), [7, 8], [7, 9]);
algoBoard.calculateDensity();

test("addShip will add to the grid array an object of ship and coords occupied", () => {
	gameboard.addShip(submarine, [0, 0], [0, 2]);
	expect(gameboard.ships).toStrictEqual([
		{
			ship: submarine,
			coords: [
				[0, 0],
				[0, 1],
				[0, 2],
			],
		},
	]);
});

test("isValid return whether the start and end coordinates are valid", () => {
	const cruiser = new Ship("Cruiser", 3);
	expect(gameboard.isValid(cruiser, [0, 0], [0, 2])).toBe(false);
	expect(gameboard.isValid(cruiser, [0, 1], [1, 3])).toBe(false);
	expect(gameboard.isValid(cruiser, [1, 0], [1, 2])).toBe(true);
});

test("receiveAttack will alter #shots", () => {
	gameboard.receiveAttack([0, 0]);
	expect(gameboard.shots).toStrictEqual([[0, 0]]);
});

test("missed will return missed shots", () => {
	gameboard.receiveAttack([1, 1]);
	gameboard.receiveAttack([2, 2]);
	expect(gameboard.missed).toStrictEqual([
		[1, 1],
		[2, 2],
	]);
});

test("allSunk will return true if all ships are sunk", () => {
	gameboard.receiveAttack([0, 1]);
	gameboard.receiveAttack([0, 2]);
	expect(gameboard.allSunk()).toBe(true);
});
