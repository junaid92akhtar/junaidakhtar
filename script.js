const canvas = document.getElementById('breakout');
const ctx = canvas.getContext('2d');

// Neon Colors
const neonColors = [
  '#39ff14', // Green
  '#ff2ec7', // Pink
  '#00fff7', // Blue
  '#fff200', // Yellow
  '#ff00c8', // Magenta
];

// Paddle
const paddle = {
  width: 140,
  height: 18,
  x: canvas.width / 2 - 70,
  y: canvas.height - 40,
  speed: 12,
  color: neonColors[0],
  dx: 0
};

// Ball
const ball = {
  x: canvas.width / 2,
  y: paddle.y - 12,
  radius: 12,
  speed: 6,
  dx: 6,
  dy: -6,
  color: neonColors[2]
};

// Bubbles/Bricks
const brickRowCount = 6;
const brickColumnCount = 10;
const brickWidth = 78;
const brickHeight = 24;
const brickPadding = 18;
const brickOffsetTop = 40;
const brickOffsetLeft = 30;

let bricks = [];
function createBricks() {
  bricks = [];
  for(let r = 0; r < brickRowCount; r++) {
    bricks[r] = [];
    for(let c = 0; c < brickColumnCount; c++) {
      const color = neonColors[(r + c) % neonColors.length];
      bricks[r][c] = {
        x: c * (brickWidth + brickPadding) + brickOffsetLeft,
        y: r * (brickHeight + brickPadding) + brickOffsetTop,
        status: 1,
        color: color
      };
    }
  }
}
createBricks();

let score = 0;
let lives = 3;
let isGameOver = false;
let isGameWin = false;

// Draw neon rectangle (paddle/bricks)
function drawNeonRect(x, y, w, h, color) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// Draw neon circle (ball)
function drawNeonCircle(x, y, r, color) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI*2, false);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Draw neon text
function drawNeonText(text, x, y, color, size=32) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px Orbitron, Arial, sans-serif`;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Draw bricks ("bubbles")
function drawBricks() {
  for(let r = 0; r < brickRowCount; r++) {
    for(let c = 0; c < brickColumnCount; c++) {
      const b = bricks[r][c];
      if(b.status === 1) {
        drawNeonRect(b.x, b.y, brickWidth, brickHeight, b.color);
      }
    }
  }
}

// Draw paddle
function drawPaddle() {
  drawNeonRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);
}

// Draw ball
function drawBall() {
  drawNeonCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Draw score and lives
function drawHUD() {
  drawNeonText(`Score: ${score}`, 30, 35, neonColors[1], 28);
  drawNeonText(`Lives: ${lives}`, canvas.width - 160, 35, neonColors[4], 28);
}

// Move paddle
function movePaddle() {
  paddle.x += paddle.dx;
  if(paddle.x < 0) paddle.x = 0;
  if(paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}

// Move ball
function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Wall collision (left/right)
  if(ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
    ball.dx = -ball.dx;
  }

  // Wall collision (top)
  if(ball.y - ball.radius < 0) {
    ball.dy = -ball.dy;
  }

  // Paddle collision
  if(
    ball.y + ball.radius > paddle.y &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    ball.dy = -ball.dy;
    let hit = ball.x - (paddle.x + paddle.width / 2);
    ball.dx = hit * 0.18;
  }

  // Bottom collision (lose life)
  if(ball.y + ball.radius > canvas.height) {
    lives--;
    if(lives === 0) {
      isGameOver = true;
    } else {
      resetBallAndPaddle();
    }
  }
}

// Bubble/brick collision
function collisionDetection() {
  for(let r = 0; r < brickRowCount; r++) {
    for(let c = 0; c < brickColumnCount; c++) {
      let b = bricks[r][c];
      if(b.status === 1) {
        if(
          ball.x > b.x &&
          ball.x < b.x + brickWidth &&
          ball.y - ball.radius < b.y + brickHeight &&
          ball.y + ball.radius > b.y
        ) {
          ball.dy = -ball.dy;
          b.status = 0;
          score += 10;
          if(score === brickRowCount * brickColumnCount * 10) {
            isGameWin = true;
          }
        }
      }
    }
  }
}

function resetBallAndPaddle() {
  ball.x = canvas.width / 2;
  ball.y = paddle.y - 13;
  ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : -1);
  ball.dy = -ball.speed;
  paddle.x = canvas.width / 2 - paddle.width / 2;
}

// Mouse controls
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  paddle.x = mouseX - paddle.width / 2;
  if(paddle.x < 0) paddle.x = 0;
  if(paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
});

// Touch controls
canvas.addEventListener('touchmove', function(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touchX = e.touches[0].clientX - rect.left;
  paddle.x = touchX - paddle.width / 2;
  if(paddle.x < 0) paddle.x = 0;
  if(paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
}, {passive: false});

// Keyboard controls (optional)
document.addEventListener('keydown', function(e) {
  if(e.key === 'ArrowLeft') paddle.dx = -paddle.speed;
  if(e.key === 'ArrowRight') paddle.dx = paddle.speed;
  if(isGameOver || isGameWin) {
    if(e.key.toLowerCase() === 'r') restartGame();
  }
});
document.addEventListener('keyup', function(e) {
  if(e.key === 'ArrowLeft' || e.key === 'ArrowRight') paddle.dx = 0;
});

// Restart functionality
function restartGame() {
  score = 0;
  lives = 3;
  isGameOver = false;
  isGameWin = false;
  createBricks();
  resetBallAndPaddle();
}

// Main draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawPaddle();
  drawBall();
  drawHUD();

  if(isGameOver) {
    drawNeonText('GAME OVER', canvas.width/2 - 150, canvas.height/2, neonColors[4], 52);
    drawNeonText('Press R to Restart', canvas.width/2 - 180, canvas.height/2 + 60, neonColors[2], 36);
  }
  if(isGameWin) {
    drawNeonText('YOU WIN!', canvas.width/2 - 120, canvas.height/2, neonColors[0], 52);
    drawNeonText('Press R to Restart', canvas.width/2 - 180, canvas.height/2 + 60, neonColors[2], 36);
  }
}

// Game loop
function loop() {
  if(!isGameOver && !isGameWin) {
    movePaddle();
    moveBall();
    collisionDetection();
  }
  draw();
  requestAnimationFrame(loop);
}

loop();