class Piece {
  constructor(x, y, isWhite = true, empty = false) {
    this.x = x;
    this.y = y;
    this.isWhite = isWhite;
    this.empty = empty; // Set to true for squares without a piece

    // Default initialization values
    this.crowned = false;
    this.selected = false;
  }
}
