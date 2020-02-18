// Window settings
const width = 800;
const height = 800;
const fps = 60;

// Initialize the board
const playingBoard = new Board();

// Do this once per move
playingBoard.updatePerPieceValidMoves();

// Variables that need to be able to be modified
let started = false;
let selectionX = undefined;
let selectionY = undefined;

function setup() {
  // put setup code here
  createCanvas(width, height);
  frameRate(fps);
  // noCursor();
}

function draw() {
  // put drawing code here
  background(139, 93, 46);
  playingBoard.show();
}

function mousePressed() {
  let x = mouseX;
  let y = mouseY;
  // If mouse is onscreen
  if (x < width && y < height) {
    if (selectionX !== undefined && selectionY !== undefined) {
      // Unselect old piece
      playingBoard.board[selectionY][selectionX].selected = false;
    }
    // Convert selection to index
    selectionX = Math.floor(x / (width / 8));
    selectionY = Math.floor(y / (height / 8));

    // Select new piece
    playingBoard.board[selectionY][selectionX].selected = true;
  }
}
