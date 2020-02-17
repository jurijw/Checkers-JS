class Board {
  constructor() {
    this.board = [];
    // populate the board
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (!this.board[j]) {
          this.board[j] = [];
        }
        // Assume the space is empty
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
        if (i % 2 !== 0 && (j === 0 || j === 2)) {
          this.board[j][i] = -1;
        }
      }
    }
  }

  show() {
    // Fill the background
    background(0);
    // Add the white squares
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (i % 2 === 0 && j % 2 === 0) {
          // Draw a square at that position
          rect(i, j, width / 8, height / 8);
        }
      }
    }
    // for (let row of this.board) {
    //     for (let elem of row) {
    //         if
    //     }
    // }
  }
}
