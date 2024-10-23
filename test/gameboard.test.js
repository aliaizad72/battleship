import Gameboard from "../src/gameboard";
import Ship from "../src/ship";

const ship = new Ship("Patrol Car", 2);
const gameboard = new Gameboard();

test("addShip will add to the grid array an object of ship and coords occupied", () => {
  const submarine = new Ship("Submarine", 3);
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
