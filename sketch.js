// Window settings
const width = 800;
const height = 800;
const fps = 60;

// Initialize the board
const playingBoard = new Board();

// DEBUG: switch to test board
playingBoard.toTestBoard();
// Do this once per move
playingBoard.update();

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
    // Get the new selection
    newSelectionX = Math.floor(x / (width / 8));
    newSelectionY = Math.floor(y / (height / 8));

    // Get selected piece
    let selectedPiece = playingBoard.board[newSelectionY][newSelectionX];

    // Check if the piece is already selected
    if (selectedPiece.selected) {
      // If so unselect it
      selectedPiece.selected = false;
      // Reset the selection
      selectionX = undefined;
      selectionY = undefined;
    }
    // Otherwise
    else {
      // Select new piece
      selectedPiece.selected = true;

      // Track whether or not a move is made
      let moveMade = false;

      // If a piece was already selected
      if (selectionX !== undefined && selectionY !== undefined) {
        // Unselect old piece
        let oldPiece = playingBoard.board[selectionY][selectionX];
        oldPiece.selected = false;

        // Check if the new selection is part of the validMoves of the old selection
        let oldValidMoves = oldPiece.validMoves;
        for (let i = 0; i < oldValidMoves.length; i++) {
          let move = oldValidMoves[i][0];
          let intermediateSteps = oldValidMoves[i][1];
          if (arraysEqual([newSelectionX, newSelectionY], move)) {
            // If so move the piece
            playingBoard.move(
              selectionX,
              selectionY,
              newSelectionX,
              newSelectionY,
              intermediateSteps
            );

            // Change the player's turn if no capture was made and update the board
            if (intermediateSteps.length === 0) {
              playingBoard.whiteTurn = !playingBoard.whiteTurn;
            }
            // else {
            //   // If a capture was made check if another capture can be made
            //   for (let i = 0; i < )
            // }
            playingBoard.update();

            // Set moveMade to true and the selections to undefined
            moveMade = true;
            selectionX = undefined;
            selectionY = undefined;
            // Break out of loop if a move is made
            break;
          }
        }
      }

      // If no move was made, change the selection to the new one
      if (!moveMade) {
        selectionX = newSelectionX;
        selectionY = newSelectionY;
      }
    }
  }
}

// @source https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
