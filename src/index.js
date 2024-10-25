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
  gridContainer.className = `w-[${gridW}px] mx-auto my-4 relative container`;
  const grid = document.createElement("div");
  grid.id = player.name;
  grid.className = "grid grid-cols-10 grid-rows-10";

  for (let i = 0; i < 100; i++) {
    const square = document.createElement("div");
    square.dataset.coords = `${strCoords(i)}`.split("");
    square.className = `border bg-blue-100 border-blue-300 h-[${squareW}px] square`;

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
  shipDiv.className = `bg-blue-950 h-[40px] absolute hover:cursor-move`;
  shipDiv.style.width = `${obj.ship.length * 40}px`;
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

document.querySelector(".container").addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.querySelector(".container").addEventListener("drop", (event) => {
  event.preventDefault();
  console.log(document.elementsFromPoint(event.clientX, event.clientY));
  const startSquare = event.dataTransfer.getData("startSquare");
  const endSquare = getSquareFromDrag(event);
  const squaresMoved = moveVector(startSquare, endSquare);
  const ship = document.getElementById(event.dataTransfer.getData("draggable"));
  const leftBound = document
    .querySelector(".container")
    .getBoundingClientRect().left;
  const rightBound = document
    .querySelector(".container")
    .getBoundingClientRect().right;
  const beforeTranslatePos = getTranslateVals(ship);
  translateShip(ship, squaresMoved);
  const shipAbsPos = ship.getBoundingClientRect();
  if (shipAbsPos.left < leftBound || shipAbsPos.right > rightBound) {
    ship.style.transform = `translate(${beforeTranslatePos.x}px, 0)`;
  }
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
