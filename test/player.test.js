import Player from "../src/player";

test("SOMething", () => {
  const player = new Player();
  player.defaultComputerShips();
  console.log(player.gameboard.ships[4]);
});
