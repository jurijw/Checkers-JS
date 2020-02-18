class Board {
  constructor() {
    this.whiteTurn = false;
    this.board = [];

    // Keep track of the last piece that moved
    this.lastMoved = undefined;
    this.captureOnLastMove = false;

    // populate the board
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        // Lazy loading of 2d array
        if (!this.board[j]) {
          this.board[j] = [];
        }
        this.board[j][i] = new Piece(i, j, true, true);

        // Add white pieces (1)
        if (i % 2 === 0 && j === 1) {
          this.board[j][i] = new Piece(i, j, true, false);
        }
        if (i % 2 !== 0 && (j === 0 || j === 2)) {
          this.board[j][i] = new Piece(i, j, true, false);
        }

        // Add red pieces (-1)
        if (i % 2 === 0 && (j === 5 || j === 7)) {
          this.board[j][i] = new Piece(i, j, false, false);
        }
        if (i % 2 !== 0 && j === 6) {
          this.board[j][i] = new Piece(i, j, false, false);
        }
      }
    }

    // Calculate the valid moves
    this.validMoves = this.updateValidMoves();
  }

  updateValidMoves() {
    let validMoves = {};
    let allCapturingMoves = [];
    let allSingleSquareMoves = [];

    let vectors = undefined;
    // Loop through all pieces and select the current players pieces
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let piece = this.board[j][i];
        // If the square is not empty or not the current players piece
        if (!piece.empty && piece.isWhite === this.whiteTurn) {
          // Get the vectors to the squares the piece can move to
          if (piece.crowned) {
            vectors = [
              [-1, 1],
              [1, 1],
              [-1, -1],
              [1, -1]
            ];
          } else if (piece.isWhite) {
            vectors = [
              [-1, 1],
              [1, 1]
            ];
          } else {
            vectors = [
              [-1, -1],
              [1, -1]
            ];
          }

          for (let vector of vectors) {
            // Calculate useful indices (positions of squares)
            let neighborX = i + vector[0];
            let neighborY = j + vector[1];
            let squareBehindNeighborX = i + vector[0] * 2;
            let squareBehindNeighborY = j + vector[1] * 2;

            // Make sure the neighboring square is on the board
            if (
              neighborX >= 0 &&
              neighborX < 8 &&
              neighborY >= 0 &&
              neighborY < 8
            ) {
              // Check if there is an opposite colored piece on the square
              let neighbor = this.board[neighborY][neighborX];
              if (!neighbor.empty && neighbor.isWhite !== piece.isWhite) {
                // Check the square behind it (if it is on the board)
                if (
                  squareBehindNeighborX >= 0 &&
                  squareBehindNeighborX < 8 &&
                  squareBehindNeighborY >= 0 &&
                  squareBehindNeighborY < 8
                ) {
                  let squareBehindNeighbor = this.board[squareBehindNeighborY][
                    squareBehindNeighborX
                  ];

                  // If its empty add this move to the capturing moves of the current piece
                  if (squareBehindNeighbor.empty) {
                    let piecePos = [i, j];
                    let endPos = [squareBehindNeighborX, squareBehindNeighborY];
                    let intermediateSteps = [[neighborX, neighborY]];

                    // FIX: currently we push the pieces position, once for every move it makes although it would make more sense to push the
                    // position of the piece just once with all the posible moves it can make
                    allCapturingMoves.push([
                      piecePos,
                      [endPos, intermediateSteps]
                    ]);
                  }
                }
              } else if (neighbor.empty) {
                let piecePos = [i, j];
                let endPos = [neighborX, neighborY];
                let intermediateSteps = [];
                allSingleSquareMoves.push([
                  piecePos,
                  [endPos, intermediateSteps]
                ]);
              }
            }
          }
        }
      }
    }
    // If capturing moves can be made, add only these to the pieces valid moves
    if (allCapturingMoves.length > 0) {
      let canMakeCapturingMove = true;
      this.validMoves = [canMakeCapturingMove, allCapturingMoves];
    } else if (allSingleSquareMoves.length > 0) {
      let canMakeCapturingMove = false;
      return (this.validMoves = [canMakeCapturingMove, allSingleSquareMoves]);
    } else {
      return (this.validMoves = []);
    }
  }

  updatePerPieceValidMoves() {
    // Updates the boards valid moves and asigns each piece on the board its valid moves

    for (let moveInfo of this.validMoves[1]) {
      // Disect moveInfo
      let initialX = moveInfo[0][0];
      let initialY = moveInfo[0][1];
      let finalX = moveInfo[1][0][0];
      let finalY = moveInfo[1][0][1];
      let intermediateSteps = moveInfo[1][1];

      // Get a reference to the piece
      let piece = this.board[initialY][initialX];
      piece.validMoves.push([[finalX, finalY], intermediateSteps]);
    }
  }

  move(initialX, initialY, finalX, finalY, intermediateSteps) {
    // Get reference to the piece
    let piece = this.board[initialY][initialX];

    // Overwrite the target
    this.board[finalY][finalX] = piece;

    // Update piece properties and check for crowning
    piece.update(finalX, finalY);

    // Remove the piece reference from the original position
    this.board[initialY][initialX] = new Piece(initialX, initialY, true, true);

    // In case of a capture
    if (intermediateSteps.length > 0) {
      // Remove all pieces in intermediateSteps (All captured pieces)
      for (let step of intermediateSteps) {
        let stepX = step[0];
        let stepY = step[1];
        this.board[stepY][stepX] = new Piece(stepX, stepY, true, true);
      }

      // Update the capture on last move property
      this.captureOnLastMove = true;
    } else {
      // If no capture was made
      this.captureOnLastMove = false;
    }

    // Update the last moved property
    this.lastMoved = piece;
  }

  checkForTurnSwitch() {
    let piece = this.lastMoved;
    // If no piece was captured or if the piece cannot move anymore, switch turns
    if (!this.captureOnLastMove || piece.validMoves.length === 0) {
      this.whiteTurn = !this.whiteTurn;
    }
    // Otherwise check if the capturing piece can make another capture
    else {
      let canCapture = false;
      let moves = piece.validMoves;
      for (let i = 0; i < moves.length; i++) {
        let intermediateSteps = moves[i][1];
        if (intermediateSteps.length > 0) {
          canCapture = true;
          break;
        }
      }
      // If it cannot make another capture swith the turn
      if (!canCapture) {
        this.whiteTurn = !this.whiteTurn;
      }
    }
  }

  show() {
    // Fill the background
    background(181, 136, 99);
    fill(240, 217, 181);
    stroke(255);
    // Add the light squares
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (i % 2 === 0 && j % 2 === 0) {
          // Draw a square at that position
          rect((i * width) / 8, (j * height) / 8, width / 8, height / 8);
        }
        if (i % 2 !== 0 && j % 2 !== 0) {
          // Draw a square at that position
          rect((i * width) / 8, (j * height) / 8, width / 8, height / 8);
        }
      }
    }

    // Draw the pieces in the appropriate positions
    const radius = (0.7 * width) / 8;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        // Get the piece on the associated square
        let piece = this.board[j][i];

        // Don't draw empty squares
        if (!piece.empty) {
          // Calculate the center of the piece
          let centerX = (i * width) / 8 + width / 16;
          let centerY = (j * height) / 8 + height / 16;
          // Display white pieces
          if (piece.isWhite) {
            fill(255);
            stroke(0);
            circle(centerX, centerY, radius);
          }

          // Display red pieces
          if (!piece.isWhite) {
            fill(184, 30, 0);
            stroke(255);
            circle(centerX, centerY, radius);
          }

          // Outline selected piece
          if (piece.selected) {
            fill(100, 220, 100);
            circle(centerX, centerY, radius, 2);
            // Highlight possible moves
            for (let moveInfo of piece.validMoves) {
              // Get the position to be highlighted
              let highlightX = moveInfo[0][0];
              let highlightY = moveInfo[0][1];
              let highlightCenterX = (highlightX * width) / 8 + width / 16;
              let highlightCenterY = (highlightY * height) / 8 + height / 16;
              // Draw a circle with no fill at that position
              noFill();
              stroke(255);
              circle(highlightCenterX, highlightCenterY, radius);
            }
          }
        }
      }
    }
  }

  toTestBoard() {
    // Set up a board for testing double captures

    // Clear the board
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        this.board[j][i] = new Piece(i, j, true, true);
      }
    }

    // Add pieces
    this.board[1][1] = new Piece(1, 1, true, false);
    this.board[1][5] = new Piece(5, 1, true, false);

    this.board[3][3] = new Piece(3, 3, false, false);
    this.board[4][2] = new Piece(2, 4, false, false);
    this.board[4][4] = new Piece(4, 4, false, false);
    this.board[6][2] = new Piece(2, 6, false, false);
  }

  update() {
    // Clears some board properties and recalculates valid moves
    this.validMoves = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        this.board[j][i].validMoves = [];
      }
    }

    // Update the boards valid moves
    this.updateValidMoves();
    // Update each pieces valid moves
    this.updatePerPieceValidMoves();
  }

  // For the AI
}

// function simulateMovesRecursively(boardCopy, piece) {
//   // Base case - No more capturing moves can be made
//   if (!boardCopy.validMoves[0]) {
//     return true;
//   }
//   // Recursive case - Capturing moves can be made
//   else {
//     for (let moveInfo of boardCopy.validMoves[1]) {
//       // Disect moveInfo
//       let initialX = moveInfo[0][0];
//       let initalY = moveInfo[0][1];
//       let finalX = moveInfo[1][0][0];
//       let finalY = moveInfo[1][0][1];
//       let intermediateSteps = moveInfo[1][1];
//       // Simulate the move
//       boardCopy.move(initalX, initalY, finalX, finalY, intermediateSteps);
//     }
//   }
// }

function simulateCaptureRecursively(
  boardCopy,
  pieceCopy,
  intermediateSteps = undefined
) {
  // Takes a piece that can capture and simulates all possible sequential capturing routes

  if (intermediateSteps === undefined) {
    intermediateSteps = [];
  }

  let moveInfo = pieceCopy.validMoves;

  // Basecases

  // No more moves are available
  if (moveInfo.length === 0) {
    // Append the path

    // Return true
    return true;
  }

  //No more capturing moves available
  let canCapture = false;
  for (let i = 0; i < moveInfo.length; i++) {
    if (moveInfo[i][1].length > 0) {
      canCapture = true;
      break;
    }
  }
  if (!canCapture) {
    // Append the path

    // Return true
    return true;
  }

  // Recrusive Case - captures can be made

  // Get piece info
  let initialX = pieceCopy.x;
  let initialY = pieceCopy.y;

  // Loop through possible capturing moves
  for (let i = 0; i < moveInfo.length; i++) {
    // Disect the moveInfo
    let finalX = moveInfo[i][0][0];
    let finalY = moveInfo[i][0][1];
    let intermediateStep = moveInfo[i][1];

    // Add the intermediate step to the intermediateSteps array
    intermediateSteps.push(intermediateStep);
    // FIX: Simulate the move on a copy of the board
    // let newCopied Piece, newCopiedBoard
    // newCopiedBoard.move(...)

    if (simulateCaptureRecursively(newCopiedBoard, newCopiedPiece)) {
      return true;
    } else {
      return false;
    }
  }
}
