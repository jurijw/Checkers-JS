function simulateCaptureRecursively(board, piece, stepSequence = undefined) {
  // Takes a piece that can capture and simulates all possible sequential capturing routes

  if (stepSequence === undefined) {
    stepSequence = [];
  }

  // Get the pieces valid moves
  let validMoves = piece.validMoves;

  // Basecases //

  // No more moves are available
  if (validMoves.length === 0) {
    // Append the path

    // Return true
    return true;
  }

  // No more capturing moves available
  let canCapture = false;
  for (let i = 0; i < validMoves.length; i++) {
    if (validMoves[i][1].length > 0) {
      canCapture = true;
      break;
    }
  }
  if (!canCapture) {
    // Append the path

    // Return true
    return true;
  }

  // Recrusive Case - captures can be made //

  // Get piece info
  let initialX = piece.x;
  let initialY = piece.y;

  // Loop through possible capturing moves
  for (let i = 0; i < validMoves.length; i++) {
    // Disect the validMoves
    let finalX = validMoves[i][0][0];
    let finalY = validMoves[i][0][1];
    let intermediateStep = validMoves[i][1];

    // Add the intermediate step to the stepSequence array //

    // Keep track of the final position of the piece
    let finalPos = [undefined, undefined];

    // Lazy load a place in the list, the first place will be used to track
    // the final position of the piece in that sequence of moves
    if (!stepSequence[i]) {
      stepSequence[i] = [finalPos];
    }
    stepSequence[i].push(intermediateStep);

    // Clone the board and get a reference to the cloned piece
    let clonedBoard = board.clone();
    let clonedPiece = clonedBoard.board[initialY][initialX];

    // Simulate the move
    clonedBoard.move(initialX, initialY, finalX, finalY, intermediateStep);
    clonedBoard.update();
    // Update the final position of the piece
    console.log(finalX, finalY);
    let newFinalPos = [finalX, finalY];
    stepSequence[i][0] = newFinalPos;

    // Recurse
    if (simulateCaptureRecursively(clonedBoard, clonedPiece, stepSequence)) {
      console.log(stepSequence);
    }
  }
  // Return the final step sequence
  return stepSequence;
}

function staticEval(board) {
  // Takes a board object and returns a float loosely representing the evaluation of either players
  // chances to win. A positive outcome means white is evaluated better, a negative outcome means red
  // Is evaluated as having a better position.

  // Set up some basic values
  let eval = 0;

  let pieceVal = 1;
  let edgePieceVal = 1.1;
  let crownedPieceVal = 1.6;

  // Loop through the board
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      // Get the square / piece in question
      let piece = board.board[j][i];

      // Make sure the square is not empty
      if (!piece.empty) {
        let sign = undefined;
        if (piece.isWhite) {
          sign = 1;
        } else {
          sign = -1;
        }

        // Check if the piece is crowned
        if (piece.crowned) {
          eval += sign * crownedPieceVal;
        }
        // Otherwise check if the piece is on the edge
        else if (piece.x === 0 || piece.x === 7) {
          eval += sign * edgePieceVal;
        }
        // If not just add the default piece value
        else {
          eval += sign * pieceVal;
        }
      }
    }
  }

  // Return the evaluation
  return eval;
}

function neatifyAllMoves(board) {
  // Takes a board object and returns all possible moves (where one move may involve
  // several steps and only ends once a players turn is over) in a neatly ordered array

  let validMoves = board.validMoves;
  let canCapture = validMoves[0];

  // An array to store all moves to be analyzed
  let allPossibleMoves = [];

  // Loop through all valid moves
  for (let moveInfo of validMoves[1]) {
    // Disect the move info
    let initialX = moveInfo[0][0];
    let initialY = moveInfo[0][1];

    let finalX = moveInfo[1][0][0];
    let finalY = moveInfo[1][0][1];

    let intermediateSteps = moveInfo[1][1];

    // If the piece can capture loop through all sequential capturing moves.
    if (canCapture) {
      // Get the current capturing piece
      let piece = board.board[initialY][initialX];

      // Get all possible sequential capturing routes
      let sequentialCaptureMoves = simulateCaptureRecursively(board, piece);

      for (let captureMove of sequentialCaptureMoves) {
        finalX = captureMove[0][0];
        finalY = captureMove[0][1];

        // Get the intermediate moves
        intermediateSteps = captureMove.splice(1);

        // Push the move sequence to all possible moves array
        allPossibleMoves.push([
          initialX,
          initialY,
          finalX,
          finalY,
          intermediateSteps
        ]);
      }
    }
    // Otherwise just append the single square move to all possible moves
    else {
      // Format [initialX, initialY, finalX, finalY, intermediateSteps]
      allPossibleMoves.push([
        initialX,
        initialY,
        finalX,
        finalY,
        intermediateSteps
      ]);
    }
  }

  // Return the array of all possible moves
  return allPossibleMoves;
}

function miniMax(board, depth, whiteTurn) {
  // Base case - max depth reached
  // FIX: need to check for game over
  if (depth === 0) {
    return staticEval(board);
  }

  // Simulate all possible moves
  let simulatedBoards = [];

  // Get all possible moves (these are in the format [[initialX, initialY, finalX, finalY, intermediateSteps], ..])
  let allMoves = neatifyAllMoves(board);

  // Loop through all moves
  for (let move of allMoves) {
    // Disect the move
    let initialX = move[0];
    let initialY = move[1];
    let finalX = move[2];
    let finalY = move[3];
    let intermediateSteps = move[4];

    // Clone the board
    let clonedBoard = board.clone();

    // Execute the move on the cloned baord
    clonedBoard.move(initialX, initialY, finalX, finalY, intermediateSteps);

    // Add the board to the simulatedBoards array
    simulatedBoards.push(clonedBoard);
  }

  // adapted from https://www.youtube.com/watch?v=l-hh51ncgDI
  // If it's white turn try to maximize the evaluation
  if (whiteTurn) {
    let maxEval = -Infinity;

    // Loop through all possible child positions
    for (let simulatedBoard of simulatedBoards) {
      // Recursively call the miniMax function
      eval = miniMax(simulatedBoard, depth - 1, false);
      // Determine the maximizing evaluation and return it
      maxEval = max(eval, maxEval);
      return maxEval;
    }
  }
  // Otherwise, try to minimize the evaluation
  else {
    let minEval = Infinity;

    // Loop through all possible child positions
    for (let simulatedBoard of simulatedBoards) {
      // Recursively call the miniMax function
      eval = miniMax(simulatedBoard, depth - 1, true);
      // Determine the minimizing evaluation and return it
      minEval = min(eval, minEval);
      return minEval;
    }
  }
}
