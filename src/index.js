import "./global.css";
import Game from "./game";
import battleship from "./images/battleship.png";
import carrier from "./images/carrier.png";
import cruiser from "./images/cruiser.png";
import destroyer from "./images/destroyer.png";
import submarine from "./images/submarine.png";
import battleship90 from "./images/battleship-90.png";
import carrier90 from "./images/carrier-90.png";
import cruiser90 from "./images/cruiser-90.png";
import destroyer90 from "./images/destroyer-90.png";
import submarine90 from "./images/submarine-90.png";

const images = {
	battleship,
	carrier,
	cruiser,
	destroyer,
	submarine,
	battleship90,
	carrier90,
	cruiser90,
	destroyer90,
	submarine90,
};

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
	const { x, y } = getCoords(ship);

	translateShip(ship, d);

	// find abs position of ship after translation
	const shipPos = ship.getBoundingClientRect();
	const gridRect = ship.parentElement.getBoundingClientRect();

	const outOfBounds =
		shipPos.left < gridRect.left ||
		// +1 to offset weird pixelation of ships length 3
		shipPos.right > gridRect.right + 1 ||
		shipPos.top < gridRect.top ||
		shipPos.bottom > gridRect.bottom;
	// move back ship to original position if move invalid
	if (outOfBounds || isOverlapped(ship)) {
		ship.style.transform = `translate(${x}px, ${y}px)`;
		shakeShip(ship);
		return;
	}
	updateShipPosition(ship);
}

function shakeShip(ship) {
	const { x, y } = getCoords(ship);
	if (ship.dataset.horizontal === "true") {
		ship.animate(
			[
				{ transform: `translate(${x}px, ${y}px)` },
				{ transform: `translate(${x - 10}px, ${y}px)` },
				{ transform: `translate(${x + 10}px, ${y}px)` },
				{ transform: `translate(${x - 10}px, ${y}px)` },
				{ transform: `translate(${x + 10}px, ${y}px)` },
				{ transform: `translate(${x}px, ${y}px)` },
			],
			{
				duration: 188,
				iterations: 1,
			},
		);
	} else {
		ship.animate(
			[
				{ transform: `translate(${x}px, ${y}px)` },
				{ transform: `translate(${x}px, ${y - 10}px)` },
				{ transform: `translate(${x}px, ${y + 10}px)` },
				{ transform: `translate(${x}px, ${y - 10}px)` },
				{ transform: `translate(${x}px, ${y + 10}px)` },
				{ transform: `translate(${x}px, ${y}px)` },
			],
			{
				duration: 188,
				iterations: 1,
			},
		);
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
	const { width, height, left, top } = ship.getBoundingClientRect();
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

function updateShipPosition(ship) {
	const { left, top } = ship.getBoundingClientRect();
	const x1 = left + squareW / 2;
	const y1 = top + squareW / 2;
	const start = document
		.elementsFromPoint(x1, y1)
		.find(e => e.classList.contains("square")).dataset.coords;
	console.log(start);
	const numStart = strToCoords(start);
	const toAdd = Number(ship.dataset.length) - 1;
	if (ship.dataset.horizontal == "true") {
		ship.dataset.start = start;
		ship.dataset.end = `${numStart[0]}, ${numStart[1] + toAdd}`;
	} else {
		ship.dataset.start = start;
		ship.dataset.end = `${numStart[0] + toAdd}, ${numStart[1]}`;
	}
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
	const ship = document.createElement("img");
	const [r, c] = obj.coords[0];

	ship.className = `absolute hover:cursor-move ship`;
	ship.dataset.name = obj.ship.name;
	ship.dataset.horizontal = obj.ship.horizontal;
	ship.dataset.length = obj.ship.length;
	ship.dataset.start = obj.coords[0];
	ship.dataset.end = obj.coords[obj.ship.length - 1];

	if (obj.ship.horizontal) {
		ship.src = images[obj.ship.name];
		ship.style.height = `${squareW}px`;
		ship.style.width = `${obj.ship.length * squareW}px`;
	} else {
		ship.src = images[obj.ship.name + "90"];
		ship.style.width = `${squareW}px`;
		ship.style.height = `${obj.ship.length * squareW}px`;
	}

	ship.style.left = `${c * squareW}px`;
	ship.style.top = `${r * squareW}px`;
	ship.id = `${player.name}-ship-${i}`;
	ship.style.transformOrigin = `${squareW / 2}px ${squareW / 2}px`;
	ship.draggable = true;

	ship.addEventListener("dragstart", e => {
		e.dataTransfer.setData("draggable", e.target.id);
		e.dataTransfer.setData("startSquare", getSquareFromDrag(e));
	});

	ship.addEventListener("dblclick", e => {
		const ship = e.target;
		changeAxis(ship);

		const shipPos = ship.getBoundingClientRect();
		const gridRect = ship.parentElement.getBoundingClientRect();
		const outOfBounds =
			shipPos.left < gridRect.left ||
			shipPos.right > gridRect.right + 1 ||
			shipPos.top < gridRect.top ||
			shipPos.bottom > gridRect.bottom;
		if (outOfBounds || isOverlapped(ship)) {
			changeAxis(ship);
			shakeShip(ship);
			return;
		}
		updateShipPosition(ship);
	});

	document.getElementById(player.name).parentElement.appendChild(ship);
}

function changeAxis(ship) {
	if (ship.dataset.horizontal == "true") {
		ship.src = images[ship.dataset.name + "90"];
		ship.style.width = `${squareW}px`;
		ship.style.height = `${ship.dataset.length * squareW}px`;
		ship.dataset.horizontal = "false";
	} else {
		ship.src = images[ship.dataset.name];
		ship.style.height = `${squareW}px`;
		ship.style.width = `${ship.dataset.length * squareW}px`;
		ship.dataset.horizontal = "true";
	}
}
