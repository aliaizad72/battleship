export default class Gameboard {
  #ships = [];
  #shots = [];

  #endCoords(ship, startX, startY) {
    const coords = [startX, startY];
    const addVal = ship.length - 1;
    const addVectors = [
      [0, addVal],
      [addVal, 0],
      [0, -addVal],
      [-addVal, 0],
    ];
    return addVectors.map((vector) => vector.map((val, i) => val + coords[i]));
  }

  #withinRange(x, y) {
    return x >= 0 && x < 10 && y >= 0 && y < 10;
  }

  #withinRangeEndCoords(ship, startX, startY) {
    return this.#endCoords(ship, startX, startY).filter((coords) =>
      this.#withinRange(coords[0], coords[1])
    );
  }

  #withinRangePath(ship, startX, startY) {
    const result = {};
    this.#withinRangeEndCoords(ship, startX, startY).forEach((end) => {
      result[end] = this.#coordsPath([startX, startY], end);
    });
    return result;
  }

  #validEnd(ship, startX, startY) {
    const paths = this.#withinRangePath(ship, startX, startY);
    const valid = [];
    for (const end in paths) {
      if (!this.#pathOccupied(paths[end])) {
        valid.push(end.split(",").map((char) => Number(char)));
      }
    }
    return valid;
  }

  #endCoordsValid(ship, startCoords, endCoords) {
    return this.#coordsInArray(
      this.#validEnd(ship, startCoords[0], startCoords[1]),
      endCoords
    );
  }

  #squareOccupied(coords) {
    return this.#coordsInArray(this.#occupiedCoords(), coords);
  }

  #pathOccupied(path) {
    let result = false;
    path.forEach((coords) => {
      if (this.#coordsInArray(this.#occupiedCoords(), coords)) {
        result = true;
      }
    });
    return result;
  }

  #coordsInArray(arr, coords) {
    return JSON.stringify(arr).includes(JSON.stringify(coords));
  }

  #occupiedCoords() {
    return this.#ships.map((ship) => ship.coords).flat(1);
  }

  #coordsPath(startCoords, endCoords) {
    const path = [];

    const [x1, y1] = startCoords;
    const [x2, y2] = endCoords;

    // Handle vertical line (same x-coordinates)
    if (x1 === x2) {
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      for (let y = minY; y <= maxY; y++) {
        path.push([x1, y]);
      }
    }
    // Handle horizontal line (same y-coordinates)
    else if (y1 === y2) {
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      for (let x = minX; x <= maxX; x++) {
        path.push([x, y1]);
      }
    }

    return path;
  }

  #findShip(coords) {
    return this.#ships.find((ship) => {
      return this.#coordsInArray(ship.coords, coords);
    }).ship;
  }

  isValid(ship, startCoords, endCoords) {
    if (
      this.#squareOccupied(startCoords) ||
      !this.#endCoordsValid(ship, startCoords, endCoords)
    ) {
      return false;
    }

    return true;
  }

  addShip(ship, startCoords, endCoords) {
    if (this.isValid(ship, startCoords, endCoords)) {
      this.#ships.push({
        ship,
        coords: this.#coordsPath(startCoords, endCoords),
      });
    }
  }

  receiveAttack(coords) {
    // coords not shot yet
    if (!this.#coordsInArray(this.#shots, coords)) {
      if (this.#squareOccupied(coords)) {
        this.#findShip(coords).hit();
      }
      this.#shots.push(coords);
    }
  }

  allSunk() {
    return this.#ships.map((obj) => obj.ship.sunk).every((bool) => bool);
  }

  get ships() {
    return this.#ships;
  }

  get shots() {
    return this.#shots;
  }

  get missed() {
    return this.#shots.filter((shot) => {
      return !this.#coordsInArray(this.#occupiedCoords(), shot);
    });
  }
}
