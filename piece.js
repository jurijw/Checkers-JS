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
}
