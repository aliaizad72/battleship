import "./global.css";
import Game from "./game";

const game = new Game();
const player = game.players[0];
createBoard(player);
createShip(player);

//create gameboard element and assign an id of player
function createBoard(player) {
  const gridContainer = document.createElement("div");
  gridContainer.className = "w-[450px] mx-auto my-4 relative container";
  const grid = document.createElement("div");
  grid.id = player.name;
  grid.className = "grid grid-cols-10 grid-rows-10";

  for (let i = 0; i < 100; i++) {
    const square = document.createElement("div");
    square.dataset.coords = `${strCoords(i)}`.split("");
    //h-10 === 40px
    square.className = `border border-blue-300 h-[45px] square`;

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
    "w-[225px] border-2 bg-gray-50 border-black h-[45px] absolute top-[45px] hover:cursor-move";
  shipDiv.draggable = true;
  shipDiv.id = `${player.name}-ship-0`;
  shipDiv.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("draggable", event.target.id);
    event.dataTransfer.setData("x", event.clientX);
    event.dataTransfer.setData("y", event.clientY);
    event.dataTransfer.setData("startSquare", getSquareFromDrag(event));
  });
  document.getElementById(player.name).parentElement.appendChild(shipDiv);
}

document.querySelector(".container").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.querySelector(".container").addEventListener("drop", (event) => {
  event.preventDefault();
  const startSquare = event.dataTransfer.getData("startSquare");
  const endSquare = getSquareFromDrag(event);
  const squaresMoved = moveVector(startSquare, endSquare);
  const ship = document.getElementById(event.dataTransfer.getData("draggable"));
  translateShip(ship, squaresMoved);
});

function getTranslateVals(element) {
  const style = window.getComputedStyle(element);
  const matrix = new DOMMatrixReadOnly(style.transform);
  return {
    x: matrix.m41,
    y: matrix.m42,
  };
}

function getSquareFromDrag(event) {
  return document
    .elementsFromPoint(event.clientX, event.clientY)
    .find((e) => e.classList.contains("square")).dataset.coords;
}

function strToCoords(str) {
  return str.split(",").map((coord) => Number(coord));
}

function moveVector(startSquare, endSquare) {
  const [x1, y1] = strToCoords(startSquare);
  const [x2, y2] = strToCoords(endSquare);
  return [x2 - x1, y2 - y1];
}

function translateShip(ship, moveVector) {
  const shipPos = getTranslateVals(ship);
  const [dy, dx] = moveVector;
  ship.style.transform = `translate(${shipPos.x + dx * 45}px, ${
    shipPos.y + dy * 45
  }px)`;
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
