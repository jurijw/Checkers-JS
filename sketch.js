// import { Board } from "./board.js";

// Window settings
const width = 800;
const height = 800;
const fps = 60;

// Variables that need to be able to be modified
let started = false;
const playingBoard = new Board();

function setup() {
  // put setup code here
  createCanvas(width, height);
  frameRate(fps);
  // noCursor();
}

function draw() {
  // put drawing code here
  background(139, 93, 46);
  playingBoard.show();
}
