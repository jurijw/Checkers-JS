class Piece {
  constructor(x, y, isWhite = true, empty = false) {
    this.x = x;
    this.y = y;
    this.isWhite = isWhite;
    this.empty = empty; // Set to true for squares without a piece

    // Default initialization values
    this.crowned = false;
    this.selected = false;
    this.validMoves = [];
  }

  update(x, y) {
    // Update's piece properties and checks for crowning
    this.x = x;
    this.y = y;

    // If the piece has reached the back rank, crown it
    if ((this.isWhite && this.y === 7) || (!this.isWhite && this.y === 0)) {
      this.crowned = true;
    }
  }

  clone() {
    // Returns a clone of the piece object with no references to any of the original pieces properties

    // Clone the primitives
    let clonedPiece = new Piece(this.x, this.y, this.isWhite, this.empty);
    clonedPiece.crowned = this.crowned;
    clonedPiece.selected = this.selected;

    // UPGRADE: could maybe be done recurssively (currently only clones 3 layers deep)
    let clonedValidMoves = [];

    for (let moveInfo of this.validMoves) {
      // Clone the final position
      let clonedFinalPos = moveInfo[0].slice();

      // Get and clone the intermediate steps
      let intermediateSteps = moveInfo[1];
      let clonedIntermediateSteps = [];

      // Loop through the intermediate steps and clone each one
      for (let intermediateStep of intermediateSteps) {
        let clonedIntermediateStep = intermediateStep.slice();
        clonedIntermediateSteps.push(clonedIntermediateStep);
      }

      // Push the cloned move info to the cloned valid moves array
      let clonedMoveInfo = [clonedFinalPos, clonedIntermediateSteps];
      clonedValidMoves.push(clonedMoveInfo);
    }
    // Add the cloned valid moves to the cloned piece properties
    clonedPiece.validMoves = this.clonedValidMoves;

    return clonedPiece;
  }
}
