export default class Ship {
	#hitCount = 0;
	#name;
	#length;
	#horizontal;

	constructor(name, length) {
		this.#setName(name);
		this.#setLength(length);
	}

	#setName(name) {
		this.#name = name;
	}

	#setLength(length) {
		this.#length = length;
	}

	get name() {
		return this.#name;
	}

	get length() {
		return this.#length;
	}

	get hitCount() {
		return this.#hitCount;
	}

	hit() {
		this.#hitCount++;
	}

	get sunk() {
		return this.#hitCount === this.#length;
	}

	set horizontal(strBool) {
		this.#horizontal = strBool;
	}

	get horizontal() {
		return this.#horizontal;
	}
}
