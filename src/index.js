import "./global.css";
import Game from "./game";

const game = new Game();
const player = game.players[0];
const gridW = 400;
const squareW = gridW / 10;
createBoard(player);
addShipsToBoard(player);

//create gameboard element and assign an id of player
// w and h of each grid squares = 45px
function createBoard(player) {
  const gridContainer = document.createElement("div");
  gridContainer.className = `mx-auto relative grid-container`;
  gridContainer.style.width = `${gridW}px`;

  const grid = document.createElement("div");
  grid.id = player.name;
  grid.className = "grid";
  grid.style.gridTemplateColumns = `repeat(10, ${squareW}px)`;
  grid.style.gridTemplateRows = `repeat(10, ${squareW}px)`;

  for (let i = 0; i < 100; i++) {
    const square = document.createElement("div");
    square.dataset.coords = `${strCoords(i)}`.split("");
    square.className = `border-2 bg-blue-100 border-blue-300 square`;

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

function addShipsToBoard(player) {
  player.gameboard.ships.forEach((obj, i) => {
    createShip(obj, i);
  });
}

function strCoords(num) {
  if (num < 10) {
    return "0" + num;
  }

  return num;
}

function createShip(obj, i) {
  const shipDiv = document.createElement("div");
  const [r, c] = obj.coords[0];
  shipDiv.className = `bg-blue-950 border border-blue-300 absolute hover:cursor-move ship`;
  shipDiv.style.height = `${squareW}px`;
  shipDiv.style.width = `${obj.ship.length * squareW}px`;
  shipDiv.style.left = `${c * squareW}px`;
  shipDiv.style.top = `${r * squareW}px`;
  shipDiv.draggable = true;
  shipDiv.id = `${player.name}-ship-${i}`;
  shipDiv.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("draggable", event.target.id);
    event.dataTransfer.setData("startSquare", getSquareFromDrag(event));
  });
  document.getElementById(player.name).parentElement.appendChild(shipDiv);
}

document
  .querySelector(".grid-container")
  .addEventListener("dragover", (event) => {
    event.preventDefault();
  });

document.querySelector(".grid-container").addEventListener("drop", (event) => {
  event.preventDefault();
  const startSquare = event.dataTransfer.getData("startSquare");
  const endSquare = getSquareFromDrag(event);
  const squaresMoved = moveVector(startSquare, endSquare);
  const ship = document.getElementById(event.dataTransfer.getData("draggable"));
  const leftBound = document
    .querySelector(".grid-container")
    .getBoundingClientRect().left;
  const rightBound = document
    .querySelector(".grid-container")
    .getBoundingClientRect().right;
  const beforeTranslatePos = getTranslateVals(ship);
  translateShip(ship, squaresMoved);
  const shipAbsPos = ship.getBoundingClientRect();
  // +1 to offset weird pixelation of ships length 3
  if (
    shipAbsPos.left < leftBound ||
    shipAbsPos.right > rightBound + 1 ||
    isOverlapped(ship)
  ) {
    ship.style.transform = `translate(${beforeTranslatePos.x}px, ${beforeTranslatePos.y}px)`;
  }
});

function isOverlapped(ship) {
  const rect = ship.getBoundingClientRect();
  const leftTop =
    document
      .elementsFromPoint(rect.left + 1, rect.top)
      .filter((e) => e.classList.contains("ship")).length === 2;
  const rightTop =
    document
      .elementsFromPoint(rect.right - 1, rect.top)
      .filter((e) => e.classList.contains("ship")).length === 2;
  // const rightBot = document.elementsFromPoint(rect.right - 1, rect.bottom - 1);
  // const leftBot = document.elementsFromPoint(rect.left, rect.bottom - 1);
  return leftTop || rightTop;
}

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
  const [r1, c1] = strToCoords(startSquare);
  const [r2, c2] = strToCoords(endSquare);
  return [r2 - r1, c2 - c1];
}

function translateShip(ship, moveVector) {
  const shipPos = getTranslateVals(ship);
  const [dr, dc] = moveVector;
  ship.style.transform = `translate(${shipPos.x + dc * squareW}px, ${
    shipPos.y + dr * squareW
  }px)`;
}
