const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highscore');
const startBtn = document.getElementById('startBtn');
const soundHit = document.getElementById('sound-hit');
const soundLevel = document.getElementById('sound-level');

const player = { x: canvas.width/2-25, y: canvas.height-60, width:50, height:50, speed:7, dx:0 };

let blocks = [], blockSpeed = 3, blockSpawnInterval = 1500, lastSpawn=0;
let score=0, highScore=0, level=1;
let gameOver=false, isRunning=false, animationId;

function loadHighScore() {
  const stored = parseInt(localStorage.getItem('dodgeHigh')) || 0;
  highScore = stored;
  highScoreDisplay.textContent = `High Score: ${highScore}`;
}

function saveHighScore() {
  if(score>highScore) {
    localStorage.setItem('dodgeHigh', score);
    highScoreDisplay.textContent = `High Score: ${score}`;
  }
}

function drawPlayer(){ ctx.fillStyle='#0af'; ctx.fillRect(player.x,player.y,player.width,player.height); }
function drawBlock(b){ ctx.fillStyle='#f44'; ctx.fillRect(b.x,b.y,b.width,b.height); }
function clear(){ ctx.clearRect(0,0,canvas.width,canvas.height); }

function updatePlayer() {
  player.x += player.dx;
  player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));
}

function spawnBlock(){
  const width = 40 + Math.random()*40;
  const x = Math.random()*(canvas.width - width);
  blocks.push({ x, y: -50, width, height:20 });
}

function updateBlocks(){
  blocks.forEach((b, i)=>{
    b.y += blockSpeed;
    if(b.y>canvas.height) {
      blocks.splice(i,1); score++;
      scoreDisplay.textContent = `Score: ${score}`;
      if(score % 5 === 0) levelUp();
    }
  });
}

function levelUp(){
  level++;
  blockSpeed = Math.min(15, blockSpeed + 0.5);
  blockSpawnInterval = Math.max(400, blockSpawnInterval - 100);
  soundLevel.play();
}

function checkCollision(){
  for(const b of blocks){
    if(player.x < b.x + b.width &&
       player.x + player.width > b.x &&
       player.y < b.y + b.height &&
       player.y + player.height > b.y) return true;
  }
  return false;
}

function showGameOver(){
  soundHit.play();
  ctx.fillStyle='rgba(0,0,0,0.7)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle='#fff';
  ctx.font='36px Arial';
  ctx.textAlign='center';
  ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 20);
  ctx.font='24px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
  startBtn.textContent = 'Restart Game';
}

let lastTime=0;
function gameLoop(timestamp=0){
  if(!isRunning) return;
  clear();
  updatePlayer();
  drawPlayer();

  if(timestamp - lastSpawn > blockSpawnInterval) {
    spawnBlock(); lastSpawn = timestamp;
  }
  updateBlocks();
  blocks.forEach(drawBlock);

  if(checkCollision()){
    gameOver = true; isRunning=false;
    cancelAnimationFrame(animationId);
    saveHighScore();
    showGameOver();
    return;
  }

  animationId = requestAnimationFrame(gameLoop);
  lastTime = timestamp;
}

function resetGame(){
  cancelAnimationFrame(animationId);
  blocks=[]; blockSpeed=3; blockSpawnInterval=1500; lastSpawn=0;
  score=0; level=1; gameOver=false; isRunning=true;
  player.x = canvas.width/2 - player.width/2;
  scoreDisplay.textContent = 'Score: 0';
  startBtn.textContent = 'Playing...';
  requestAnimationFrame(gameLoop);
}

function keyDown(e){ if(e.key==='ArrowLeft'||e.key==='a') player.dx=-player.speed;
                     else if(e.key==='ArrowRight'||e.key==='d') player.dx=player.speed; }
function keyUp(e){ if(['ArrowLeft','a','ArrowRight','d'].includes(e.key)) player.dx=0; }

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
startBtn.addEventListener('click', resetGame);

loadHighScore();
