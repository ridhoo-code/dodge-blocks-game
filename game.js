const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startBtn');

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 60,
  width: 50,
  height: 50,
  speed: 7,
  dx: 0,
};

let blocks = [];
let blockSpeed = 3;
let blockSpawnInterval = 1500;
let lastSpawn = 0;
let score = 0;
let gameOver = false;
let isRunning = false;
let animationId;

function drawPlayer() {
  ctx.fillStyle = '#0af';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBlock(block) {
  ctx.fillStyle = '#f44';
  ctx.fillRect(block.x, block.y, block.width, block.height);
}

function clear() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updatePlayer() {
  player.x += player.dx;
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function spawnBlock() {
  const width = 40 + Math.random() * 40;
  const x = Math.random() * (canvas.width - width);
  blocks.push({ x, y: -50, width, height: 20 });
}

function updateBlocks() {
  for (let i = blocks.length - 1; i >= 0; i--) {
    blocks[i].y += blockSpeed;

    if (blocks[i].y > canvas.height) {
      blocks.splice(i, 1);
      score++;
      scoreDisplay.textContent = `Score: ${score}`;
      if (score % 5 === 0 && blockSpeed < 12) {
        blockSpeed += 0.5;
        if (blockSpawnInterval > 500) blockSpawnInterval -= 100;
      }
    }
  }
}

function checkCollision() {
  for (const block of blocks) {
    if (
      player.x < block.x + block.width &&
      player.x + player.width > block.x &&
      player.y < block.y + block.height &&
      player.y + player.height > block.y
    ) {
      return true;
    }
  }
  return false;
}

let lastTime = 0;

function gameLoop(timestamp = 0) {
  if (!isRunning) return;

  clear();
  updatePlayer();
  drawPlayer();

  if (timestamp - lastSpawn > blockSpawnInterval) {
    spawnBlock();
    lastSpawn = timestamp;
  }

  updateBlocks();
  blocks.forEach(drawBlock);

  if (checkCollision()) {
    gameOver = true;
    isRunning = false;
    cancelAnimationFrame(animationId);
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '24px Arial';
    ctx.fillText(`Your Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    startBtn.textContent = 'Restart Game';
    return;
  }

  animationId = requestAnimationFrame(gameLoop);
  lastTime = timestamp;
}

function resetGame() {
  cancelAnimationFrame(animationId);
  blocks = [];
  blockSpeed = 3;
  blockSpawnInterval = 1500;
  lastSpawn = 0;
  score = 0;
  gameOver = false;
  isRunning = true;
  player.x = canvas.width / 2 - player.width / 2;
  scoreDisplay.textContent = `Score: 0`;
  startBtn.textContent = 'Restart Game';
  requestAnimationFrame(gameLoop);
}

function keyDownHandler(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    player.dx = -player.speed;
  } else if (e.key === 'ArrowRight' || e.key === 'd') {
    player.dx = player.speed;
  }
}

function keyUpHandler(e) {
  if (
    e.key === 'ArrowLeft' ||
    e.key === 'a' ||
    e.key === 'ArrowRight' ||
    e.key === 'd'
  ) {
    player.dx = 0;
  }
}

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
startBtn.addEventListener('click', resetGame);
