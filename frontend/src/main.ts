const canvas = document.getElementById('gameCanvas2') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

// Game Constants
const paddleWidth = 10, paddleHeight = 100;
const ballSize = 10;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

class Paddle {
  y: number;
  speed: number = 6;

  constructor(public x: number) {
    this.y = (canvasHeight - paddleHeight) / 2;
  }

  moveUp() {
    this.y -= this.speed;
  }

  moveDown() {
    this.y += this.speed;
  }

  stayInBounds() {
    this.y = Math.max(0, Math.min(canvasHeight - paddleHeight, this.y));
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, paddleWidth, paddleHeight);
  }
}

class Ball {
  x: number;
  y: number;
  speedX: number;
  speedY: number;

  constructor() { // This is the same as reset...
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.speedX = 5;
    this.speedY = 3 * (Math.random() > 0.5 ? 1 : -1);
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  checkCollisions(player1: Paddle, player2: Paddle) {
    // Ball collision with top and bottom
    if (this.y <= 0 || this.y + ballSize >= canvasHeight) {
      this.speedY *= -1;
    }

    // Player 1 paddle collision
    if (this.x === paddleWidth + 15 &&
      this.y + ballSize >= player1.y &&
      this.y <= player1.y + paddleHeight) {
      this.speedX *= -1;
    }

    // Player 2 paddle collision
    if (this.x + ballSize === canvasWidth - paddleWidth - 15 &&
      this.y + ballSize >= player2.y &&
      this.y <= player2.y + paddleHeight) {
      this.speedX *= -1;
    }
  }

  reset() {
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.speedX = 5;
    this.speedY = 3 * (Math.random() > 0.5 ? 1 : -1);
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, ballSize, ballSize);
  }
}

class Player {
  constructor(public name: string, public paddle: Paddle, public score: number = 0) {}
}

class Game {
  gameState: 'menu' | 'playing' | 'result' = 'menu';
  twoPlayerMode: boolean = false;
  player1: Player;
  player2: Player;
  ball: Ball;
  keysPressed: { [key: string]: boolean } = {};
  winner: Player | null = null;

  constructor() {
    this.player1 = new Player('Player 1', new Paddle(15));
    this.player2 = new Player('Player 2', new Paddle(canvasWidth - paddleWidth - 15));
    this.ball = new Ball();
    
    // Listen for key events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    this.gameLoop();
  }

  handleKeyDown(e: KeyboardEvent) {
    if (this.gameState === 'menu') {
      if (e.key === '1') {
        this.twoPlayerMode = false; // One player mode (AI plays as Player 2)
        this.player2.name = "AI";
        this.gameState = 'playing';
        this.resetGame();
      } else if (e.key === '2') {
        this.twoPlayerMode = true; // Two-player mode
        this.player2.name = "Player 2";
        this.gameState = 'playing';
        this.resetGame();
      }
    } else {
      if (e.key === 'Escape') {
        this.gameState = 'menu';
        this.resetGame();
      } else {
        this.keysPressed[e.key] = true;
      }
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keysPressed[e.key] = false;
  }

  updatePlayerPositions() {
    // Player 1 movement (W and S keys)
    if (this.keysPressed['q']) this.player1.paddle.moveUp();
    if (this.keysPressed['s']) this.player1.paddle.moveDown();

    if (this.twoPlayerMode) {
      // Player 2 movement (ArrowUp and ArrowDown keys)
      if (this.keysPressed['o']) this.player2.paddle.moveUp();
      if (this.keysPressed['k']) this.player2.paddle.moveDown();
    } else {
      // AI movement for Player 2
      const lerpSpeed = 0.1; // Smooth movement
      this.player2.paddle.y += (this.ball.y - (this.player2.paddle.y + paddleHeight / 2)) * lerpSpeed;
    }

    this.player1.paddle.stayInBounds();
    this.player2.paddle.stayInBounds();
  }

  update() {
    this.updatePlayerPositions();
    this.ball.move();
    this.ball.checkCollisions(this.player1.paddle, this.player2.paddle);

    // Reset ball if missed and count score
    if (this.ball.x < 0) {
      this.player2.score++;
      if (this.player2.score === 5) {
        this.gameState = 'result';
        this.winner = this.player2;
      }
      this.ball.reset();
    }

    if (this.ball.x > canvasWidth) {
      this.player1.score++;
      if (this.player1.score === 5) {
        this.gameState = 'result';
        this.winner = this.player1;
      }
      this.ball.reset();
    }
  }

  drawResult() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = 'white';
    ctx.font = "30px 'Courier New', monospace";
    const pong = this.winner?.name + " is the winner!";
    const pongWidth = ctx.measureText(pong).width;
    ctx.fillText(pong, (canvasWidth * 0.5) - (pongWidth / 2), canvasHeight / 4);
  }

  drawMenu() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = 'white';
    ctx.font = "100px 'Courier New', monospace";
    const pong = "PONG";
    const pongWidth = ctx.measureText(pong).width;
    ctx.fillText(pong, (canvasWidth * 0.5) - (pongWidth / 2), canvasHeight / 4);

    ctx.font = "30px 'Courier New', monospace"; 
    const text1 = "vs computer (Press '1')";
    const text1Width = ctx.measureText(text1).width;
    const text2 = "vs human (Press '2')";
    const text2Width = ctx.measureText(text2).width;

    ctx.fillText(text1, (canvasWidth * 0.5) - (text1Width / 2), canvasHeight / 2);
    ctx.fillText(text2, (canvasWidth * 0.5) - (text2Width / 2), canvasHeight / 2 + 50);
  }

  draw() {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw paddles
    this.player1.paddle.draw();
    this.player2.paddle.draw();

    // Draw centre line
    for (let i = 0; i < canvasHeight; i += canvasHeight / 20) {
      ctx.fillRect(canvasWidth / 2, i, 3, canvasHeight / 40);
    }

    // Draw ball
    this.ball.draw();

    // Draw scores
    ctx.font = "50px 'Courier New', monospace";
    const player1Text = `${this.player1.name}: ${this.player1.score}`;
    const player1TextWidth = ctx.measureText(player1Text).width;
    ctx.fillText(player1Text, (canvasWidth * 0.25) - (player1TextWidth / 2), 70);

    const player2Text = `${this.player2.name}: ${this.player2.score}`;
    const player2TextWidth = ctx.measureText(player2Text).width;
    ctx.fillText(player2Text, (canvasWidth * 0.75) - (player2TextWidth / 2), 70);
  }

  resetGame() {
    this.player1.paddle.y = (canvasHeight - paddleHeight) / 2;
    this.player2.paddle.y = (canvasHeight - paddleHeight) / 2;
    this.ball.reset();
    this.player1.score = 0;
    this.player2.score = 0;
  }

  gameLoop() {
    if (this.gameState === 'menu') {
      this.drawMenu();
    } else if (this.gameState === 'result') {
      this.drawResult();
    } else {
      this.update();
      this.draw();
    }
    requestAnimationFrame(this.gameLoop.bind(this));
  }
}

const game = new Game();