import "./global.css";
import Game from "./game";

const game = new Game();
game.players.forEach((player) => {
  createBoard(player);
  // addShipsToBoard(player);
});

//create gameboard element and assign an id of player
function createBoard(player) {
  const grid = document.createElement("div");
  grid.id = player.name;
  grid.className = "w-[450px] grid grid-cols-10 grid-rows-10 mx-auto my-4";

  for (let i = 0; i < 100; i++) {
    const square = document.createElement("div");
    square.dataset.coords = `${strCoords(i)}`.split("");
    square.className = "border border-blue-300 h-10";

    if (i % 10 !== 0) {
      square.classList.add("border-l-0");
    }

    if (100 - i > 10) {
      square.classList.add("border-b-0");
    }

    grid.appendChild(square);
  }
  document.body.appendChild(grid);
}

function strCoords(num) {
  if (num < 10) {
    return "0" + num;
  }

  return num;
}

function addShipsToBoard(player) {
  player.gameboard.ships.forEach((ship) => {
    for (let i = 0; i < ship.coords.length; i++) {
      const [x, y] = ship.coords[i];
      const shipDiv = square(player, x, y);
      // shipDiv.classList.remove("border-r");
      // shipDiv.classList.add("bg-blue-50");
      console.log(shipDiv.parentElement);
      console.log(shipDiv);
    }
  });
}

function square(player, x, y) {
  const boardArr = [...document.getElementById(player.name).children];
  return [...boardArr[x].children][y];
}
