const grid = document.querySelector(".grid");
const scoreDisplay = document.querySelector("#score");
const highScoreDisplay = document.querySelector("#highscore");

/**
 * Variables to manage the board
 */
const boardWidth = 560;
const boardHeight = 300;

/**
 * Variables for managing the blocks to destroy
 */
const blockWidth = 100;
const blockHeight = 20;

const horizontalBlocks = 5;
const verticalBlocks = 3;

/**
 * Variables for managing the user block
 */
const userStart = 230;
const userHeight = 10;
let currentPosition = userStart;

/**
 * Variables for managing the ball
 */
const ballDiameter = 20;

let timerId;
let timerIdInterval = 30;

let xDirection = -2;
let yDirection = 2;

const ballStart = [270, 40];
let ballCurrentPosition = [...ballStart];

/**
 * Variables for managing the score
 */
let score = 0;
let highscore = 0;

//my block
class Block {
  constructor(xAxis, yAxis) {
    this.bottomLeft = [xAxis, yAxis];
    this.bottomRight = [xAxis + blockWidth, yAxis];
    this.topRight = [xAxis + blockWidth, yAxis + blockHeight];
    this.topLeft = [xAxis, yAxis + blockHeight];
  }
}

let blocks = [];
function populateBlocks() {
  blocks = []; //ensure it's empty
  for (let i = 0; i < verticalBlocks; i++) {
    let startHeight = boardHeight - blockHeight - 10 - i * 30;
    for (let j = 0; j < horizontalBlocks; j++) {
      let startHorizontal = 10 + (blockWidth + 10) * j;
      blocks.push(new Block(startHorizontal, startHeight));
    }
  }
}

//draw my blocks
function addBlocks() {
  for (let i = 0; i < blocks.length; i++) {
    const block = document.createElement("div");
    block.classList.add("block");
    block.style.left = blocks[i].bottomLeft[0] + "px";
    block.style.bottom = blocks[i].bottomLeft[1] + "px";
    grid.appendChild(block);
  }
}
populateBlocks();
addBlocks();

//add user
const user = document.createElement("div");
user.classList.add("user");
grid.appendChild(user);
drawUser();

//add ball
const ball = document.createElement("div");
ball.classList.add("ball");
grid.appendChild(ball);
drawBall();

//move user
function moveUser(e) {
  switch (e.key) {
    case "ArrowLeft":
      if (currentPosition > 0) {
        currentPosition -= 10;
        drawUser();
      }
      break;
    case "ArrowRight":
      if (currentPosition < boardWidth - blockWidth) {
        currentPosition += 10;
        drawUser();
      }
      break;
  }
}
document.addEventListener("keydown", moveUser);

//draw User
function drawUser() {
  user.style.left = currentPosition + "px";
  user.style.bottom = userHeight + "px";
}

//draw Ball
function drawBall() {
  ball.style.left = ballCurrentPosition[0] + "px";
  ball.style.bottom = ballCurrentPosition[1] + "px";
}

//move ball
function moveBall() {
  ballCurrentPosition[0] += xDirection;
  ballCurrentPosition[1] += yDirection;
  drawBall();
  checkForCollisions();
}

timerId = setInterval(moveBall, timerIdInterval);

//check for collisions
function checkForCollisions() {
  //check for block collision
  for (let i = 0; i < blocks.length; i++) {
    if (
      ballCurrentPosition[0] > blocks[i].bottomLeft[0] &&
      ballCurrentPosition[0] < blocks[i].bottomRight[0] &&
      ballCurrentPosition[1] + ballDiameter > blocks[i].bottomLeft[1] &&
      ballCurrentPosition[1] < blocks[i].topLeft[1]
    ) {
      const allBlocks = Array.from(document.querySelectorAll(".block"));
      allBlocks[i].classList.remove("block");
      blocks.splice(i, 1);
      changeDirection();
      score += 1;
      scoreDisplay.innerHTML = `Score: ${score}`;

      if (blocks.length == 0) {
        scoreDisplay.innerHTML = "You've reached next level!";
        if (timerIdInterval > 5) {
          timerIdInterval -= 5;
        } else {
          scoreDisplay.innerHTML = "You've reached the impossible level!!!!";
          timerIdInterval = 0.1;
        }
        restartGame(false);
      }
    }
  }
  // check for wall hits
  if (
    ballCurrentPosition[0] >= boardWidth - ballDiameter ||
    ballCurrentPosition[0] <= 0 ||
    ballCurrentPosition[1] >= boardHeight - ballDiameter
  ) {
    changeDirection();
  }

  //check for user collision
  if (
    ballCurrentPosition[0] > currentPosition &&
    ballCurrentPosition[0] < currentPosition + blockWidth &&
    ballCurrentPosition[1] > userHeight &&
    ballCurrentPosition[1] < userHeight + blockHeight
  ) {
    changeDirection();
  }

  //game over
  if (ballCurrentPosition[1] <= 0) {
    if (score > highscore) {
      highscore = score;
      highScoreDisplay.innerHTML = `Highscore: ${highscore}`;
    }
    clearInterval(timerId);
    scoreDisplay.innerHTML = "You lose!";
    document.removeEventListener("keydown", moveUser);
  }
}

function changeDirection() {
  if (xDirection === 2 && yDirection === 2) {
    yDirection = -2;
    return;
  }
  if (xDirection === 2 && yDirection === -2) {
    xDirection = -2;
    return;
  }
  if (xDirection === -2 && yDirection === -2) {
    yDirection = 2;
    return;
  }
  if (xDirection === -2 && yDirection === 2) {
    xDirection = 2;
    return;
  }
}

function restartGame(resetScore = true) {
  // empty the playing field
  const elements = document.getElementsByClassName("block");
  console.log(elements);
  while (elements.length > 0) {
    elements[0].parentNode.removeChild(elements[0]);
  }

  ballCurrentPosition = [...ballStart];
  currentPosition = userStart;

  populateBlocks();
  addBlocks();

  drawUser();

  drawBall();

  xDirection = -2;
  yDirection = 2;

  if (resetScore) {
    score = 0;
    scoreDisplay.innerHTML = `Score: ${score}`;
  }

  clearInterval(timerId);
  document.removeEventListener("keydown", moveUser);

  document.addEventListener("keydown", moveUser);
  timerId = setInterval(moveBall, timerIdInterval);
}

let isPaused = false;
function checkForPause(e) {
  if (e.code === "Space") {
    isPaused = !isPaused;
    if (isPaused) {
      clearInterval(timerId);
      document.removeEventListener("keydown", moveUser);
    } else {
      document.addEventListener("keydown", moveUser);
      timerId = setInterval(moveBall, timerIdInterval);
    }
  }

  if (e.code === "KeyF") {
    restartGame();
  }
}
document.addEventListener("keydown", checkForPause);
