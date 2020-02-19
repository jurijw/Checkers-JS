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
