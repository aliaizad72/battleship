import Ship from "../src/ship";

test("hit method alters hit property", () => {
  const ship = new Ship("Carrier", 5);
  const beforeHit = ship.hitCount;
  ship.hit();
  const afterHit = ship.hitCount;
  expect(beforeHit).toBe(0);
  expect(afterHit).toBe(1);
});

test("sunk returns false when hitCount and length differs", () => {
  const ship = new Ship("Carrier", 5);
  expect(ship.sunk).toBe(false);
});

test("sunk returns true when hitCount and length same", () => {
  const ship = new Ship("Carrier", 5);
  ship.hit();
  ship.hit();
  ship.hit();
  ship.hit();
  ship.hit();
  expect(ship.sunk).toBe(true);
});
