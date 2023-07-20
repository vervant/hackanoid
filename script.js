const dialog = document.querySelector("#dialog");
const startButton = document.querySelector("#start");
const canvas = document.getElementById("canvas");
const c = canvas.getContext("2d");
const out = document.getElementById("out");
const gameOverSound = document.getElementById("gameovermusic");
const blockCrushSound = document.getElementById("blockcrushmusic");
const soundTrackSound = document.getElementById("soundtrack");
const clickSound = document.getElementById("clickMusic");

out.style.display = "none";

canvas.width = 380;
canvas.height = 280;

let player = new Player(200, 380, 55, 15);
let ball = new Ball(
  200,
  200,
  10,
  Math.floor(Math.random() * 4 + 4),
  Math.floor(Math.random() * 4 + 4)
);
let bricks;
let dKeyDown = false;
let aKeyDown = false;
let gameOver = false;
let winner = false;

// Constructor function for creating a brick
function Brick(x, y, width, height, imageSRC) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.image = new Image();
  this.image.src = imageSRC;
}

// Constructor function for creating a ball
function Ball(x, y, dx, dy) {
  this.x = x;
  this.y = y;
  this.dx = dx * 0.2;
  this.dy = dy * 0.2;
  this.size = 10;
  this.image = new Image();
  this.image.src = "./asset/Images/ball-hackanoid.png";
}

// Constructor function for creating a player
function Player(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.moveSpeedLimit = 10;
  this.accel = 0.75;
  this.decel = 0.75;
  this.xVel = 0;
  this.yVel = 0;
  this.image = new Image();
  this.image.src = "./asset/Images/spaceship-hackanoid.png";
}

// Game loop function
function start() {
  checkKeyboardStatus();
  checkPlayer_BoundsCollision();
  checkBall_PlayerCollision();
  checkBall_BoundsCollision();
  checkBall_BrickCollision();
  clear();
  renderPlayer();
  moveBall();
  renderBall();
  renderBricks();
  checkWinner();

  function gameOverMusic() {
    gameOverSound.volume = 0.2;
    gameOverSound.play();
  }
  function soundTrackMusic() {
    soundTrackSound.play();
    soundTrackSound.volume = 0.1;
  }

  if (!gameOver) {
    requestAnimationFrame(start);
    soundTrackMusic();
  } else {
    soundTrackSound.pause();
    out.innerHTML = "<h2>Game over</h2>";
    out.style.display = "visibility";
    gameOverMusic();

    if (gameOver) {
      //Event listener for the restart button
      const restartButton = document.querySelector(".select-button");
      restartButton.addEventListener("click", () => {
        canvas.classList.remove("hidden");
        restart();
      });
    }
    if (winner) {
      out.innerHTML += ", you won!";
    }
    out.innerHTML += "<br>";
    out.innerHTML += "Press start to restart";
    out.style.display = "block";
    canvas.classList.add("hidden");
  }
}

// Move the ball by updating its position
function moveBall() {
  ball.x = ball.x + ball.dx;
  ball.y = ball.y + ball.dy;
}

// Handle keydown event
document.onkeydown = function (e) {
  if (e.keyCode === 37) {
    aKeyDown = true;
  }
  if (e.keyCode === 39) {
    dKeyDown = true;
  }
  if (e.keyCode === 82) {
    if (gameOver) restart();
  }
};

// Handle keyup event
document.onkeyup = function (e) {
  if (e.keyCode === 37) {
    aKeyDown = false;
  }
  if (e.keyCode === 39) {
    dKeyDown = false;
  }
};

// Check for collision between the ball and bricks

function blockCrushMusic() {
  blockCrushSound.play();
}

function checkBall_BrickCollision() {
  let ax1 = ball.x - ball.size;
  let ay1 = ball.y - ball.size;
  let ax2 = ball.x + ball.size;
  let ay2 = ball.y + ball.size;
  let bx1;
  let bx2;
  let by2;
  let by1;
  for (let i = 0; i < bricks.length; i++) {
    bx1 = bricks[i].x;
    by1 = bricks[i].y;
    bx2 = bricks[i].x + bricks[i].width;
    by2 = bricks[i].y + bricks[i].height;
    if (!(ax2 <= bx1 || bx2 <= ax1 || ay2 <= by1 || by2 <= ay1)) {
      let prevX = ball.x - ball.dx - ball.size;
      let prevY = ball.y - ball.dy - ball.size;
      if ((prevX > bx2 || prevX < bx1) && prevY >= by1 && prevY <= by2) {
        ball.dx = -ball.dx;
      } else {
        ball.dy = -ball.dy;
      }
      bricks.splice(i, 1);

      blockCrushMusic();
      return;
    }
  }
}

// Check for collision between the ball and canvas bounds

function checkBall_BoundsCollision() {
  let x = ball.x - ball.size;
  let y = ball.y - ball.size;
  let size = ball.size * 2;
  let x2 = x + size;
  let y2 = y + size;
  if (x < 0) {
    ball.x = 0 + ball.size;
    ball.dx = -ball.dx;
  } else if (x + size > canvas.width) {
    ball.x = canvas.width - ball.size;
    ball.dx = -ball.dx;
  }
  if (ball.y < 0) {
    ball.y = 0 + ball.size;
    ball.dy = -ball.dy;
  } else if (ball.y + ball.size > canvas.height) {
    gameOver = true;
    winner = false;
  }
}

// Check for collision between the ball and player
function clickSoundMusic() {
  clickSound.play();
}
function checkBall_PlayerCollision() {
  let ax1 = player.x;
  let ay1 = player.y;
  let ax2 = player.x + player.width;
  let ay2 = player.y + player.height;
  let bx1 = ball.x - ball.size;
  let bx2 = ball.x + ball.size;
  let by2 = ball.y + ball.size;
  let by1 = ball.y + ball.size;
  if (!(ax2 <= bx1 || bx2 <= ax1 || ay2 <= by1 || by2 <= ay1)) {
    ball.dy = -ball.dy;
    clickSoundMusic();
    return;
  }
}

// Check the keyboard status and update player velocity accordingly
function checkKeyboardStatus() {
  if (dKeyDown) {
    if (player.xVel < player.moveSpeedLimit) {
      player.xVel += player.accel;
    } else {
      player.xVel = player.moveSpeedLimit;
    }
  } else {
    if (player.xVel > 0) {
      player.xVel -= player.decel;
      if (player.xVel < 0) player.xVel = 0;
    }
  }
  if (aKeyDown) {
    if (player.xVel > -player.moveSpeedLimit) {
      player.xVel -= player.accel;
    } else {
      player.xVel = -player.moveSpeedLimit;
    }
  } else {
    if (player.xVel < 0) {
      player.xVel += player.decel;
      if (player.xVel > 0) player.xVel = 0;
    }
  }
  player.x += player.xVel;
}

// Check for collision between the player and canvas bounds
function checkPlayer_BoundsCollision() {
  if (player.x < 0) {
    player.x = 0;
    player.xVel = 0;
  } else if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
    player.xVel = 0;
  }
  if (player.y < 0) {
    player.y = 0;
    player.yVel = 0;
  } else if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
    player.yVel = 0;
  }
}

function renderPlayer() {
  c.save();
  c.drawImage(player.image, player.x, player.y, player.width, player.height);
  console.log(player);
  c.restore();
}

// Load the map with bricks
function loadMap() {
  bricks = [
    new Brick(50, 50, 50, 10, "./asset/Images/brick_1-neo.png"),
    new Brick(101, 50, 50, 10, "./asset/Images/brick_1-neo.png"),
    new Brick(152, 50, 50, 10, "./asset/Images/brick_1-neo.png"),
    new Brick(203, 50, 50, 10, "./asset/Images/brick_1-neo.png"),
    new Brick(254, 50, 50, 10, "./asset/Images/brick_1-neo.png"),
    new Brick(305, 50, 50, 10, "./asset/Images/brick_1-neo.png"), // Row 1
    new Brick(50, 61, 50, 10, "./asset/Images/brick_2bis-neo.png"),
    new Brick(101, 61, 50, 10, "./asset/Images/brick_2bis-neo.png"),
    new Brick(152, 61, 50, 10, "./asset/Images/brick_2bis-neo.png"),
    new Brick(203, 61, 50, 10, "./asset/Images/brick_2bis-neo.png"),
    new Brick(254, 61, 50, 10, "./asset/Images/brick_2bis-neo.png"),
    new Brick(305, 61, 50, 10, "./asset/Images/brick_2bis-neo.png"), // Row 2
    new Brick(50, 72, 50, 10, "./asset/Images/brick_3.png"),
    new Brick(101, 72, 50, 10, "./asset/Images/brick_3.png"),
    new Brick(152, 72, 50, 10, "./asset/Images/brick_3.png"),
    new Brick(203, 72, 50, 10, "./asset/Images/brick_3.png"),
    new Brick(254, 72, 50, 10, "./asset/Images/brick_3.png"),
    new Brick(305, 72, 50, 10, "./asset/Images/brick_3.png"), // Row 3
    new Brick(50, 83, 50, 10, "./asset/Images/brick_4.png"),
    new Brick(101, 83, 50, 10, "./asset/Images/brick_4.png"),
    new Brick(152, 83, 50, 10, "./asset/Images/brick_4.png"),
    new Brick(203, 83, 50, 10, "./asset/Images/brick_4.png"),
    new Brick(254, 83, 50, 10, "./asset/Images/brick_4.png"),
    new Brick(305, 83, 50, 10, "./asset/Images/brick_4.png"), // Row 4
    new Brick(50, 94, 50, 10, "./asset/Images/brick_2bis-neo.png"),
    new Brick(101, 94, 50, 10, "./asset/Images/brick_2bis-neo.png"),
    new Brick(152, 94, 50, 10, "./asset/Images/brick_2bis-neo.png"),
    new Brick(203, 94, 50, 10, "./asset/Images/brick_2bis-neo.png"),
    new Brick(254, 94, 50, 10, "./asset/Images/brick_2bis-neo.png"),
    new Brick(305, 94, 50, 10, "./asset/Images/brick_2bis-neo.png"), // Row 5
    new Brick(50, 105, 50, 10, "./asset/Images/brick_1-neo.png"),
    new Brick(101, 105, 50, 10, "./asset/Images/brick_1-neo.png"),
    new Brick(152, 105, 50, 10, "./asset/Images/brick_1-neo.png"),
    new Brick(203, 105, 50, 10, "./asset/Images/brick_1-neo.png"),
    new Brick(254, 105, 50, 10, "./asset/Images/brick_1-neo.png"),
    new Brick(305, 105, 50, 10, "./asset/Images/brick_1-neo.png"), // Row 6
  ];
}

// Check if all bricks have been destroyed, indicating a win
function checkWinner() {
  if (bricks.length < 1) {
    gameOver = true;
    winner = true;
  }
}

// Restart the game
// function restart() {
//   out.innerHTML = "";
//   gameOver = false;
//   loadMap();
//   ball = new Ball(200, 200, 5, Math.floor(Math.random() * 4 + 4));
//   player = new Player(200, 380, 55, 15);
//   start();
// }

function restart() {
  out.style.display = "none"; // Hide the #out element before restarting
  out.innerHTML = "";
  gameOver = false;
  loadMap();
  ball = new Ball(200, 200, 5, Math.floor(Math.random() * 4 + 4));
  player = new Player(200, 380, 55, 15);
  start();
}

// Render the ball on the canvas
function renderBall() {
  c.save();
  c.drawImage(ball.image, ball.x, ball.y, ball.size, ball.size);
  c.restore();
}

// Clear the canvas
function clear() {
  c.clearRect(0, 0, canvas.width, canvas.height);
}

// Render the bricks on the canvas
function renderBricks() {
  for (let i = 0; i < bricks.length; i++) {
    c.save();
    const brick = bricks[i];
    c.drawImage(brick.image, brick.x, brick.y, brick.width, brick.height);
    c.restore();
  }
}

// Event listener for the start button

if (start) {
  const startButton = document.querySelector(".select-button");
  startButton.addEventListener("click", () => {
    let countdown = 5;
    const countdownElement = document.querySelector("#countdown");
    setTimeout(() => {
      dialog.classList.add("hidden");
      canvas.classList.remove("hidden");
    }, 5000);
    const countdownInterval = setInterval(() => {
      countdown--;
      countdownElement.textContent = countdown;
      if (countdown === 0) {
        clearInterval(countdownInterval);

        loadMap();
        start();
      }
    }, 1000);
  });
}

// let outShow = out.classList.remove("hidden")
// if (!gameOver){
//   outShow = true
// }else{

// }
// console.log(outShow)
