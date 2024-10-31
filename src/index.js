import "./global.css";
import Player from "./player";
import Ship from "./ship";

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

import hit from "./audio/hit.mp3";
import sunk from "./audio/sunk.mp3";
import miss from "./audio/miss.mp3";
import win from "./audio/win.wav";
import lose from "./audio/lose.mp3";

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

const user = new Player("user");
const computer = new Player("computer");
const gridW = 400;
const squareW = gridW / 10;
const controller = new AbortController();
const { signal } = controller;
let dropped = false;
createBoard(user);
createBoard(computer);
user.addShipsRandomly();
computer.addShipsRandomly();
addShipsToBoard(user);
addShipsToBoard(computer);

function addShipsToBoard(player) {
	player.gameboard.ships.forEach((obj, i) => {
		createShip(player, obj, i);
	});
}

const playerGridContainer = document.getElementById(`${user.name}`);
playerGridContainer.addEventListener("dragover", e => e.preventDefault(), {
	signal,
});
playerGridContainer.addEventListener("drop", e => gridDrop(e), { signal });

const playerShips = document.querySelectorAll(`.${user.name}-ships`);
playerShips.forEach(ship => {
	ship.addEventListener(
		"dragstart",
		e => {
			e.dataTransfer.setData("draggable", e.target.id);
			e.dataTransfer.setData("startSquare", getSquareFromDrag(e));
		},
		{ signal },
	);

	// rotate ship when double click
	ship.addEventListener("dblclick", e => rotateShip(e), { signal });

	ship.addEventListener(
		"dragend",
		e => {
			if (!dropped) {
				shakeShip(e.target);
			}
			dropped = false;
		},
		{ signal },
	);
});

function rotateShip(e) {
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
}

//create gameboard element and assign an id of player
// w and h of each grid squares = 45px
function createBoard(player) {
	const gridContainer = document.createElement("div");
	gridContainer.className = `relative grid-container`;
	gridContainer.style.width = `${gridW}px`;

	const grid = document.createElement("div");
	grid.id = player.name;
	grid.className = "grid";
	grid.style.gridTemplateColumns = `repeat(10, ${squareW}px)`;
	grid.style.gridTemplateRows = `repeat(10, ${squareW}px)`;

	for (let i = 0; i < 100; i++) {
		const square = document.createElement("div");
		square.dataset.coords = `${prependZeroIfSingleDigit(i)}`.split("");
		square.className = `border-2 bg-dark-blue border-neon-blue square transition`;

		if (i % 10 !== 0) {
			square.classList.add("border-l-0");
		}

		if (100 - i > 10) {
			square.classList.add("border-b-0");
		}

		grid.appendChild(square);
	}

	gridContainer.appendChild(grid);

	const gridTag = document.createElement("p");
	const tag = player.name === "user" ? "YOU" : "COMPUTER";
	gridTag.textContent = `${tag}`;
	gridTag.className = "text-neon-blue pixelify-sans text-xl text-center my-2";
	gridContainer.appendChild(gridTag);

	document.getElementById("grids").appendChild(gridContainer);
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
	dropped = true;
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

function prependZeroIfSingleDigit(num) {
	if (num < 10) {
		return "0" + num;
	}
	return num;
}

function createShip(player, obj, i) {
	const ship = document.createElement("img");
	const [r, c] = obj.coords[0];

	ship.className = `absolute ship ${player.name}-ships`;
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
	if (player.name == "user") {
		ship.draggable = true;
		ship.classList.add("hover:cursor-move");
	} else {
		ship.style.zIndex = "-1";
	}

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

function updatePlayerGameboard() {
	const ships = document.querySelectorAll(`.user-ships`);
	ships.forEach(ship => {
		const newShip = new Ship(ship.dataset.name, Number(ship.dataset.length));
		const startCoords = strToCoords(ship.dataset.start);
		const endCoords = strToCoords(ship.dataset.end);
		user.gameboard.addShip(newShip, startCoords, endCoords);
	});
}

function removeShipsDrag() {
	const ships = document.querySelectorAll(`.user-ships`);
	ships.forEach(ship => {
		ship.classList.remove("hover:cursor-move");
		ship.draggable = false;
	});
}
document.querySelectorAll(".difficulty").forEach(button => {
	button.addEventListener("click", e => {
		document
			.querySelectorAll(".difficulty")
			.forEach(button => button.classList.add("hidden"));
		document.getElementById("restart").classList.remove("hidden");
		user.resetGameboard();
		updatePlayerGameboard();
		removeShipsDrag();
		// removes event listeners
		controller.abort();
		makeEnemyGridHoverable();
		makeEnemyGridClickable();
	});
});

document
	.getElementById("restart")
	.addEventListener("click", () => location.reload());

function makeEnemyGridHoverable() {
	const squares = document.getElementById("computer").childNodes;
	squares.forEach(square => {
		square.classList.add("hover:bg-neon-blue", "cursor-crosshair");
	});
}

function makeEnemyGridClickable() {
	const squares = document.getElementById("computer").childNodes;
	squares.forEach(square => {
		square.addEventListener("click", userShoot, { once: true });
	});
}

function userShoot(e) {
	const shootCoords = strToCoords(e.target.dataset.coords);
	const shipCoords = computer.gameboard.shipCoords;
	const isHit = JSON.stringify(shipCoords).includes(
		JSON.stringify(shootCoords),
	);

	computer.gameboard.receiveAttack(shootCoords);
	e.target.classList.remove("bg-dark-blue");

	if (isHit) {
		e.target.classList.add("bg-neon-pink");
		playHit();
		const ship = computer.gameboard.findShip(shootCoords);
		if (ship.sunk) {
			setTimeout(playSunk, 50);
		}
	} else {
		e.target.classList.add("bg-neon-blue");
		playMiss();
	}

	revealSunkShips();

	const squares = e.target.parentElement.childNodes;
	squares.forEach(square => {
		square.removeEventListener("click", userShoot);
		square.classList.remove("hover:bg-neon-blue", "cursor-crosshair");
	});

	if (computer.gameboard.allSunk()) {
		const announce = document.getElementById("announce");
		announce.textContent = "YOU WIN!";
		announce.classList.add("text-neon-green");
		announce.classList.remove("hidden");
		playWin();
		return;
	}

	setTimeout(computerPlay, 1000);
}

function revealSunkShips() {
	const sunkShips = computer.gameboard.sunkShips;
	const squares = [...document.getElementById("computer").childNodes];
	sunkShips.forEach(obj => {
		obj.coords.forEach(coord => {
			const coordStr = coord.join(",");
			const square = squares.find(square => square.dataset.coords === coordStr);
			square.style.zIndex = "-2";
		});
	});
}

function allShots() {
	const shots = [];
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 10; j++) {
			shots.push([i, j]);
		}
	}
	return shots;
}

const possibleShots = allShots();
let hunt = true;
let targetStack = [];
let mode;

function computerPlay() {
	const shot = randomShot();
	const isHit = JSON.stringify(user.gameboard.shipCoords).includes(
		JSON.stringify(shot),
	);

	const coordStr = shot.join(",");
	const squares = [...document.getElementById("user").childNodes];
	const square = squares.find(square => square.dataset.coords === coordStr);

	user.gameboard.receiveAttack(shot);
	square.classList.remove("bg-dark-blue");
	if (isHit) {
		square.classList.add("bg-neon-pink");
		const ship = user.gameboard.findShip(shot);
		if (ship.sunk) {
			playSunk();
		} else {
			playHit();
		}
	} else {
		square.classList.add("bg-neon-blue");
		playMiss();
	}

	reactivateEnemyGrid();

	if (user.gameboard.allSunk()) {
		const announce = document.getElementById("announce");
		announce.textContent = "YOU LOSE!";
		announce.classList.add("text-neon-red");
		announce.classList.remove("hidden");
		playLose();

		const squares = document.getElementById("computer").childNodes;
		squares.forEach(square => {
			square.removeEventListener("click", userShoot);
			square.classList.remove("hover:bg-neon-blue", "cursor-crosshair");
		});
	}
}

function randomShot() {
	const index = Math.floor(Math.random() * possibleShots.length);
	const shot = possibleShots.splice(index, 1)[0];
	return shot;
}

function reactivateEnemyGrid() {
	makeEnemyGridHoverable();
	makeEnemyGridClickable();
	const shotSquares = [
		...document.getElementById("computer").childNodes,
	].filter(square => !square.classList.contains("bg-dark-blue"));

	shotSquares.forEach(square => {
		square.removeEventListener("click", userShoot);
		square.classList.remove("hover:bg-neon-blue", "cursor-crosshair");
	});
}

function playHit() {
	const hitAudio = new Audio(hit);
	hitAudio.play();
}

function playSunk() {
	const sunkAudio = new Audio(sunk);
	sunkAudio.play();
}

function playMiss() {
	const missAudio = new Audio(miss);
	missAudio.play();
}

function playWin() {
	const winAudio = new Audio(win);
	winAudio.play();
}

function playLose() {
	const loseAudio = new Audio(lose);
	loseAudio.play();
}
