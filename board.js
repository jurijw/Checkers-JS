class Board {
  constructor() {
    this.board = [];
    // populate the board
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        // Lazy loading of 2d array
        if (!this.board[j]) {
          this.board[j] = [];
        }
        this.board[j][i] = 0;

        // Add white pieces (1)
        if (i % 2 === 0 && j === 1) {
          this.board[j][i] = 1;
        }
        if (i % 2 !== 0 && (j === 0 || j === 2)) {
          this.board[j][i] = 1;
        }

        // Add red pieces (-1)
        if (i % 2 === 0 && (j === 5 || j === 7)) {
          this.board[j][i] = -1;
        }
        if (i % 2 !== 0 && j === 6) {
          this.board[j][i] = -1;
        }
      }
    }
  }

  show() {
    // Fill the background
    background(181, 136, 99);
    fill(240, 217, 181);
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
        // Display white pieces
        if (this.board[j][i] === 1) {
          fill(255);
          circle(
            (i * width) / 8 + width / 16,
            (j * width) / 8 + width / 16,
            radius
          );
        }
        // Display red pieces
        if (this.board[j][i] === -1) {
          fill(184, 30, 0);
          circle(
            (i * width) / 8 + width / 16,
            (j * width) / 8 + width / 16,
            radius
          );
        }
      }
    }
  }
}
