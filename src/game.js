import Gameboard from "./gameboard";
import Ship from "./ship";
import Player from "./player";

export default class Game {
  #players = [];
  constructor() {
    const player = new Player("player");
    const computer = new Player("computer");
    player.defaultPlayerShips();
    computer.defaultComputerShips();
    this.#players.push(player, computer);
  }

  get players() {
    return this.#players;
  }
}
