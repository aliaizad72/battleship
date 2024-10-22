# battleship
The classic board game on the web

Game description / rules:
  - Grid:
    - 2 grids
      - 1 to arrange ships and records shots taken
      - 1 to record shots fired on enemy
    - Each are 10 x 10 squares
    - Individual squares identified by letter and number
  - Ship:
    - Only arranged horizontally / vertically
    - Cannot be overlapped with other ships
    - Different length depending on their types:
      - Carrier - 5
      - Battleship - 4
      - Cruiser - 3
      - Submarine - 3
      - Destroyer - 2
  - Gameplay:
    - Players arrange the ships
    - Players take turns to shoot the opponents' ships
    - Feedback to players whether it was hit
      - If it is hit, players have to announce what ship was hit
    - If all of the squares that one ship occupied was hit, the ship sank
    - Game ends when all ships sank