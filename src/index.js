import "./global.css";
import Game from "./game";

const game = new Game();
const player = game.players[0];
createBoard(player);
createShip(player);

//create gameboard element and assign an id of player
function createBoard(player) {
  const gridContainer = document.createElement("div");
  gridContainer.className = "w-[450px] mx-auto my-4 relative";
  const grid = document.createElement("div");
  grid.id = player.name;
  grid.className = "grid grid-cols-10 grid-rows-10";

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
  gridContainer.appendChild(grid);
  document.body.appendChild(gridContainer);
}

function strCoords(num) {
  if (num < 10) {
    return "0" + num;
  }

  return num;
}

function createShip(player) {
  const shipDiv = document.createElement("div");
  shipDiv.className =
    "w-1/2 border-2 bg-gray-50 border-black h-10 absolute top-10 hover:cursor-move";
  shipDiv.draggable = true;
  document.getElementById(player.name).parentElement.appendChild(shipDiv);
}

// function addShipsToBoard(player) {
//   player.gameboard.ships.forEach((ship) => {
//     for (let i = 0; i < ship.coords.length; i++) {
//       const [x, y] = ship.coords[i];
//       const shipDiv = square(player, x, y);
//       if (ship.direction === "horizontal") {
//         shipDiv.classList.add("bg-blue-100", "border-2");
//         if (i != ship.coords.length - 1) {
//           shipDiv.classList.add("border-r-blue-100");
//         }
//       }
//     }
//   });
// }

function square(player, x, y) {
  const boardArr = document.getElementById(player.name).children;
  const index = Number(x.toString() + y.toString());
  console.log(index);
  return boardArr[index];
}
