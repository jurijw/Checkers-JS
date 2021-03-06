// Window settings
const width = 800;
const height = 800;
const fps = 60;

// Variables that need to be able to be modified
let ai = false;
let aiWhiteTurn = true;
let recursionDepth = 5;

let started = false;
let gameOver = false;
let selectionX = undefined;
let selectionY = undefined;

// Initialize the board
let playingBoard = new Board();
// DEBUG: switch to test board
playingBoard.toTestBoard(1);
let piece = playingBoard.board[1][1];
// let skurr = playingBoard.board[6][2];
// playingBoard.board[6][4] = skurr;
// playingBoard.board[6][2] = new Piece(2, 6, true, true);

function setup() {
  // put setup code here
  createCanvas(width, height);
  frameRate(fps);
  // noCursor();

  // Update the board
  playingBoard.update();
}

function draw() {
  if (!gameOver) {
    // Draw the board
    background(139, 93, 46);
    playingBoard.show();

    // Check if the game is over
    if (playingBoard.gameOver) {
      gameOver = true;
      if (playingBoard.whiteWins) {
        console.log("White wins!");
      } else {
        console.log("Red wins!");
      }
    }

    // If ai mode is selected and it is white's turn make the ai make a move
    if (ai && playingBoard.whiteTurn) {
      // Run the minimax funtion and get the best move
      let [eval, move] = miniMax(playingBoard, recursionDepth);

      console.log(eval, move);

      // Disect the move
      let [initialX, initialY, finalX, finalY, intermediateSteps] = move;

      // Execute the move
      playingBoard.move(initialX, initialY, finalX, finalY, intermediateSteps);
      playingBoard.update();
      playingBoard.checkForTurnSwitch();
      playingBoard.update();
    }
  }
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

            // // Change the player's turn if no capture was made and update the board
            // if (intermediateSteps.length === 0) {
            //   playingBoard.whiteTurn = !playingBoard.whiteTurn;
            // }
            // // else {
            // //   // If a capture was made check if another capture can be made
            // //   for (let i = 0; i < )
            // // }
            playingBoard.update();
            console.log(playingBoard.lastMoved, playingBoard.captureOnLastMove);
            playingBoard.checkForTurnSwitch();
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
