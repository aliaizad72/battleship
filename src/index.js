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
	gridContainer.addEventListener("dragover", e => e.preventDefault());
	gridContainer.addEventListener("drop", e => gridDrop(e));

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

function gridDrop(e) {
	e.preventDefault();
	//find the beginning and end square to find the distance
	const startSquare = e.dataTransfer.getData("startSquare");
	const endSquare = getSquareFromDrag(e);
	const d = distance(startSquare, endSquare);

	//get ship element that was dragged
	const ship = document.getElementById(e.dataTransfer.getData("draggable"));

	//in case move invalid, get coordinates to translate back to earlier pos
	const beforeTranslate = getCoords(ship);

	translateShip(ship, d);

	// find abs position of ship after translation
	const shipAbsPos = ship.getBoundingClientRect();
	const gridRect = document
		.querySelector(".grid-container")
		.getBoundingClientRect();

	const outOfBounds =
		shipAbsPos.left < gridRect.left ||
		// +1 to offset weird pixelation of ships length 3
		shipAbsPos.right > gridRect.right + 1 ||
		shipAbsPos.top < gridRect.top ||
		shipAbsPos.bottom > gridRect.bottom;
	// move back ship to original position if move invalid
	if (outOfBounds || isOverlapped(ship)) {
		ship.style.transform = `translate(${beforeTranslate.x}px, ${beforeTranslate.y}px)`;
	}
}

//this function returns the square element where the pointer was when drag event ends
function getSquareFromDrag(e) {
	return document
		.elementsFromPoint(e.clientX, e.clientY)
		.find(e => e.classList.contains("square")).dataset.coords;
}

function distance(startSquare, endSquare) {
	const [r1, c1] = strToCoords(startSquare);
	const [r2, c2] = strToCoords(endSquare);
	return [r2 - r1, c2 - c1];
}

function strToCoords(str) {
	return str.split(",").map(coord => Number(coord));
}

function getCoords(element) {
	const style = window.getComputedStyle(element);
	const matrix = new DOMMatrixReadOnly(style.transform);
	return {
		x: matrix.m41,
		y: matrix.m42,
	};
}

function translateShip(ship, distance) {
	const shipPos = getCoords(ship);
	const [dr, dc] = distance;
	ship.style.transform = `translate(${shipPos.x + dc * squareW}px, ${
		shipPos.y + dr * squareW
	}px)`;
}

function isOverlapped(ship) {
	const { left, top, right, bottom } = ship.getBoundingClientRect();
	const width = Math.round(right - left);
	const height = Math.round(bottom - top);
	const colCount = width / squareW;
	const rowCount = height / squareW;
	const midX = left + squareW / 2;
	const midY = top + squareW / 2;
	const result = [];

	const checkOverlap = (x, y) =>
		document.elementsFromPoint(x, y).filter(e => e.classList.contains("ship"))
			.length === 2;

	if (rowCount === 1) {
		for (let i = 0; i < colCount; i++) {
			result.push(checkOverlap(midX + 40 * i, midY));
		}
	} else if (colCount === 1) {
		for (let i = 0; i < rowCount; i++) {
			result.push(checkOverlap(midX, midY + 40 * i));
		}
	}

	return result.includes(true);
}

function strCoords(num) {
	if (num < 10) {
		return "0" + num;
	}
	return num;
}

function addShipsToBoard(player) {
	player.gameboard.ships.forEach((obj, i) => {
		createShip(obj, i);
	});
}

function createShip(obj, i) {
	const shipDiv = document.createElement("div");
	const [r, c] = obj.coords[0];

	shipDiv.className = `bg-blue-950 border border-blue-300 absolute hover:cursor-move ship`;

	if (obj.ship.direction === "horizontal") {
		shipDiv.style.height = `${squareW}px`;
		shipDiv.style.width = `${obj.ship.length * squareW}px`;
	} else if (obj.ship.direction === "vertical") {
		shipDiv.style.width = `${squareW}px`;
		shipDiv.style.height = `${obj.ship.length * squareW}px`;
	}

	shipDiv.style.left = `${c * squareW}px`;
	shipDiv.style.top = `${r * squareW}px`;
	shipDiv.id = `${player.name}-ship-${i}`;

	shipDiv.draggable = true;
	shipDiv.addEventListener("dragstart", e => {
		e.dataTransfer.setData("draggable", e.target.id);
		e.dataTransfer.setData("startSquare", getSquareFromDrag(e));
	});

	document.getElementById(player.name).parentElement.appendChild(shipDiv);
}
