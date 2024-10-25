import Gameboard from "./gameboard";
import Ship from "./ship";

export default class Player {
  #gameboard = new Gameboard();

  constructor(name) {
    this.name = name;
  }

  defaultPlayerShips() {
    this.#gameboard.addShip(new Ship("Carrier", 5), [0, 0], [0, 4]);
    this.#gameboard.addShip(new Ship("Battleship", 4), [2, 0], [2, 3]);
    this.#gameboard.addShip(new Ship("Cruiser", 3), [4, 0], [4, 2]);
    this.#gameboard.addShip(new Ship("Submarine", 3), [6, 0], [6, 2]);
    this.#gameboard.addShip(new Ship("Destroyer", 2), [8, 0], [8, 1]);
  }

  defaultComputerShips() {
    this.#gameboard.addShip(new Ship("Carrier", 5), [9, 9], [5, 9]);
    this.#gameboard.addShip(new Ship("Battleship", 4), [9, 8], [6, 8]);
    this.#gameboard.addShip(new Ship("Cruiser", 3), [9, 7], [7, 7]);
    this.#gameboard.addShip(new Ship("Submarine", 3), [9, 6], [7, 6]);
    this.#gameboard.addShip(new Ship("Destroyer", 2), [9, 5], [8, 5]);
  }

  get gameboard() {
    return this.#gameboard;
  }
}
