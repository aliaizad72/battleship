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

// grid and respective squares dimensions
const gridW = 400;
const squareW = gridW / 10;

// event listener controllers
const controller = new AbortController();
const { signal } = controller;

// a global switch to trigger shake on drag but undrop event
let dropped = false;

// setting up boards and ships
createBoard(user);
createBoard(computer);
user.addShipsRandomly();
computer.addShipsRandomly();
addShipsToBoard(user);
addShipsToBoard(computer);

function createBoard(player) {
	const prependZeroIfSingleDigit = num => {
		if (num < 10) {
			return "0" + num;
		}
		return num;
	};

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

		//prepending 0 for numbers 0 to 9 to assign coords to squares
		square.dataset.coords = `${prependZeroIfSingleDigit(i)}`.split("");
		square.className = `border-2 bg-dark-blue border-neon-blue square transition`;

		// to avoid border overlapping
		if (i % 10 !== 0) {
			square.classList.add("border-l-0");
		}

		if (100 - i > 10) {
			square.classList.add("border-b-0");
		}

		grid.appendChild(square);
	}

	const gridTag = document.createElement("p");
	const tag = player.name === "user" ? "YOU" : "COMPUTER";
	gridTag.textContent = `${tag}`;
	gridTag.className = "text-neon-blue pixelify-sans text-xl text-center my-2";

	gridContainer.appendChild(grid);
	gridContainer.appendChild(gridTag);

	document.getElementById("grids").appendChild(gridContainer);
}

function addShipsToBoard(player) {
	const createShip = (player, obj, i) => {
		const ship = document.createElement("img");

		ship.className = `absolute ship ${player.name}-ships`;

		// set attributes from gameboard / ship objects in the DOM to refer to it easier later on
		ship.dataset.name = obj.ship.name;
		ship.dataset.horizontal = obj.ship.horizontal;
		ship.dataset.length = obj.ship.length;
		ship.dataset.start = obj.coords[0];
		ship.dataset.end = obj.coords[obj.ship.length - 1];
		ship.id = `${player.name}-ship-${i}`;

		// assign images and height / width according to their ship direction
		if (obj.ship.horizontal) {
			ship.src = images[obj.ship.name];
			ship.style.height = `${squareW}px`;
			ship.style.width = `${obj.ship.length * squareW}px`;
		} else {
			ship.src = images[obj.ship.name + "90"];
			ship.style.width = `${squareW}px`;
			ship.style.height = `${obj.ship.length * squareW}px`;
		}

		// absolute positioning based on their start row and column
		const [r, c] = obj.coords[0];
		ship.style.left = `${c * squareW}px`;
		ship.style.top = `${r * squareW}px`;

		// set the origin to the center of the first square for rotation
		ship.style.transformOrigin = `${squareW / 2}px ${squareW / 2}px`;

		// allow drag if users ship
		if (player.name == "user") {
			ship.draggable = true;
			ship.classList.add("hover:cursor-move");
		} else {
			// hide ship if computers ship
			ship.style.zIndex = "-1";
		}

		document.getElementById(player.name).parentElement.appendChild(ship);
	};

	player.gameboard.ships.forEach((obj, i) => {
		createShip(player, obj, i);
	});
}

const playerGridContainer = document.getElementById(`${user.name}`);

// prevent default on dragover to allow drop events on container
playerGridContainer.addEventListener("dragover", e => e.preventDefault(), {
	signal,
});

playerGridContainer.addEventListener(
	"drop",
	e => {
		e.preventDefault();

		// startSquare are coords passed by dragstart
		const startSquare = e.dataTransfer.getData("startSquare");

		// endSquare are coords where mouse pointer was last when drop happened
		const endSquare = document
			.elementsFromPoint(e.clientX, e.clientY)
			.find(e => e.classList.contains("square")).dataset.coords;

		// "r2, c2" => [r2, c2]
		const [r1, c1] = strToCoords(startSquare);
		const [r2, c2] = strToCoords(endSquare);

		// get ship that was dragged
		const ship = document.getElementById(e.dataTransfer.getData("draggable"));

		// x, y coordinates before the current translation happens
		const { x, y } = translatedCoords(ship);

		// find row and column distance between start and end drag/drop process
		const [dr, dc] = [r2 - r1, c2 - c1];

		// apply translation to ship base on their distance and current translated position
		ship.style.transform = `translate(${x + dc * squareW}px, ${
			y + dr * squareW
		}px)`;

		// move back ship to original position if move invalid
		if (shipOutOfBounds(ship) || isOverlapped(ship)) {
			ship.style.transform = `translate(${x}px, ${y}px)`;
			shakeShip(ship);
			return;
		}
		updateShipPosition(ship);

		//
		dropped = true;
	},
	{ signal },
);

const playerShips = document.querySelectorAll(`.${user.name}-ships`);
playerShips.forEach(ship => {
	ship.addEventListener(
		"dragstart",
		e => {
			e.dataTransfer.setData("draggable", e.target.id);

			// pass the square coords e.g 0, 0 as startSquare
			e.dataTransfer.setData(
				"startSquare",
				document
					.elementsFromPoint(e.clientX, e.clientY)
					.find(e => e.classList.contains("square")).dataset.coords,
			);
		},
		{ signal },
	);

	// rotate ship when double click
	ship.addEventListener(
		"dblclick",
		e => {
			const changeAxis = ship => {
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
			};

			const ship = e.target;
			changeAxis(ship);

			if (shipOutOfBounds(ship) || isOverlapped(ship)) {
				changeAxis(ship);
				shakeShip(ship);
				return;
			}
			updateShipPosition(ship);
		},
		{ signal },
	);

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

function shipOutOfBounds(ship) {
	const shipRect = ship.getBoundingClientRect();
	const gridRect = ship.parentElement.getBoundingClientRect();

	return (
		shipRect.left < gridRect.left ||
		// +1 to offset weird pixelation of ships length 3
		shipRect.right > gridRect.right + 1 ||
		shipRect.top < gridRect.top ||
		shipRect.bottom > gridRect.bottom
	);
}

function shakeShip(ship) {
	const { x, y } = translatedCoords(ship);
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

// "0, 0" => [0, 0]
function strToCoords(str) {
	return str.split(",").map(coord => Number(coord));
}

function translatedCoords(element) {
	const style = window.getComputedStyle(element);
	const matrix = new DOMMatrixReadOnly(style.transform);
	return {
		x: matrix.m41,
		y: matrix.m42,
	};
}

// function to check if a ship overlapped with another ship
function isOverlapped(ship) {
	const horizontal = ship.dataset.horizontal;
	const startCoords = strToCoords(ship.dataset.start);
	const endCoords = strToCoords(ship.dataset.end);
	const c = endCoords[1] - startCoords[1] + 1;
	const r = endCoords[0] - startCoords[0] + 1;

	// find the x, y window coordinates of the center of the first ship square
	const { left, top } = ship.getBoundingClientRect();
	const x = left + squareW / 2;
	const y = top + squareW / 2;

	// if the x, y window coordinates contains 2 ships, then it is overlapped
	const checkOverlap = (x, y) =>
		document.elementsFromPoint(x, y).filter(e => e.classList.contains("ship"))
			.length === 2;

	// iterate through every center point of squares along their span, according to their direction, if overlap return true immediately
	if (horizontal === "true") {
		for (let i = 0; i < c; i++) {
			if (checkOverlap(x + squareW * i, y)) {
				return true;
			}
		}
	} else if (horizontal === "false") {
		for (let i = 0; i < r; i++) {
			if (checkOverlap(x, y + squareW * i)) {
				return true;
			}
		}
	}

	// if nothing returns true, then it is not overlapped
	return false;
}

// update dataset attributes of ship to current coords
function updateShipPosition(ship) {
	const { left, top } = ship.getBoundingClientRect();

	// find x, y of center of first square the ship is on
	const x = left + squareW / 2;
	const y = top + squareW / 2;

	const startSquare = document
		.elementsFromPoint(x, y)
		.find(e => e.classList.contains("square")).dataset.coords;
	const startCoords = strToCoords(startSquare);

	// find the span of the ship excluding the first square
	const toAdd = Number(ship.dataset.length) - 1;

	// add span to startCoords row or column based on their direction to find the end square
	if (ship.dataset.horizontal == "true") {
		ship.dataset.start = startSquare;
		ship.dataset.end = `${startCoords[0]}, ${startCoords[1] + toAdd}`;
	} else {
		ship.dataset.start = startSquare;
		ship.dataset.end = `${startCoords[0] + toAdd}, ${startCoords[1]}`;
	}
}

document.querySelectorAll(".difficulty").forEach(button => {
	button.addEventListener("click", e => {
		const ships = document.querySelectorAll(`.user-ships`);
		const squares = document.getElementById("computer").childNodes;

		const updatePlayerGameboard = () => {
			ships.forEach(ship => {
				const newShip = new Ship(
					ship.dataset.name,
					Number(ship.dataset.length),
				);
				const startCoords = strToCoords(ship.dataset.start);
				const endCoords = strToCoords(ship.dataset.end);
				user.gameboard.addShip(newShip, startCoords, endCoords);
			});
		};

		const removeShipsDrag = () => {
			ships.forEach(ship => {
				ship.classList.remove("hover:cursor-move");
				ship.draggable = false;
			});
		};

		document
			.querySelectorAll(".difficulty")
			.forEach(button => button.classList.add("hidden"));
		document.getElementById("restart").classList.remove("hidden");
		//assign the difficulty of the current game
		difficulty = e.target.textContent.toLowerCase();
		//reset user gameboard object and assign new positions
		user.resetGameboard();
		updatePlayerGameboard();
		//freeze ships from moving
		removeShipsDrag();
		// removes event listeners
		controller.abort();
		// make squares hoverable
		squares.forEach(square => {
			square.classList.add("hover:bg-neon-blue", "cursor-crosshair");
		});
		//make squares clickable
		squares.forEach(square => {
			square.addEventListener("click", userShoot, { once: true });
		});
	});
});

document
	.getElementById("restart")
	.addEventListener("click", () => location.reload());

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
let difficulty;

function computerPlay() {
	let shot;
	const shotHitUser = shot =>
		JSON.stringify(user.gameboard.shipCoords).includes(JSON.stringify(shot));

	if (difficulty === "noob") {
		shot = randomShot();
	} else if (difficulty === "easy") {
		if (hunt) {
			shot = randomShot();
			if (isHit) {
			}
		}
	}

	const coordStr = shot.join(",");
	const squares = [...document.getElementById("user").childNodes];
	const square = squares.find(square => square.dataset.coords === coordStr);

	user.gameboard.receiveAttack(shot);
	square.classList.remove("bg-dark-blue");
	if (shotHitUser(shot)) {
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
	const squares = document.getElementById("computer").childNodes;
	//make all squares hoverable
	squares.forEach(square => {
		square.classList.add("hover:bg-neon-blue", "cursor-crosshair");
	});
	//make all sqauares clickable
	squares.forEach(square => {
		square.addEventListener("click", userShoot, { once: true });
	});
	// remove hoverable and clickable for shot squares
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
