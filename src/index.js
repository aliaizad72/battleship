import "./global.css";
import Game from "./game";

const game = new Game();
game.players.forEach((player) => {
  console.log(player.gameboard);
});

function createBoard() {
  const board = document.createElement("div");
  for (let i = 0; i < 10; i++) {
    const rows = document.createElement("div");
    for (let j = 0; j < 10; j++) {
      const cols = document.createElement("div");
      cols.className = "border-r border-black w-full";
      if (j === 9) {
        cols.classList.remove("border-r");
      }
      rows.appendChild(cols);
    }
    rows.className = "flex border-t-0 border border-black h-10 w-1/2 mx-auto";
    if (i === 0) {
      rows.classList.remove("border-t-0");
    }
    board.appendChild(rows);
  }
  document.body.appendChild(board);
}

document.body.onload = createBoard;
