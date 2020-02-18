class Board {
  constructor() {
    this.whiteTurn = false;
    this.board = [];
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
        // If the square is not empty
        if (!piece.empty) {
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

          let pieceSingleSquareMoves = []; // Array for single square moves
          let pieceCapturingMoves = []; // Array to store capturing moves for that piece
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
                // Check the square behind it
                let squareBehindNeighbor = this.board[squareBehindNeighborY][
                  squareBehindNeighborX
                ];

                // If its empty add this move to the capturing moves of the current piece
                if (squareBehindNeighbor.empty) {
                  let piecePos = [i, j];
                  let endPos = [squareBehindNeighborX, squareBehindNeighborY];
                  let intermediateSteps = [[neighborX, neighborY]];
                  pieceCapturingMoves.push([endPos, intermediateSteps]);
                  allCapturingMoves.push([
                    piecePos,
                    [endPos, intermediateSteps]
                  ]);
                }
              } else if (neighbor.empty) {
                let piecePos = [i, j];
                let endPos = [neighborX, neighborY];
                let intermediateSteps = [];
                pieceSingleSquareMoves.push([endPos, intermediateSteps]);
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
    // Remove the piece reference from the original position
    this.board[initialY][initialX] = new Piece(initialX, initialY, true, true);
    // Remove all pieces in intermediateSteps
    if (intermediateSteps.length > 0) {
      for (let step of intermediateSteps) {
        let stepX = step[0];
        let stepY = step[1];
        this.board[stepY][stepX] = new Piece(stepX, stepY, true, true);
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
