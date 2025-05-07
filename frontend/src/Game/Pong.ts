import { GameStates, IGameState } from "./GameStates";
import { canvas, ctx } from "../components/Canvas";
import { User, UserManager } from "../UI/UserManager";
import { stateManager } from "../components";
import { EndScreen } from "./EndScreen";

// Game Constants
const paddleWidth = 15, paddleHeight = 100;
const ballSize = 15;
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

class Paddle {
  y: number;
  speed: number = 8;

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
    this.x = canvasWidth / 2 - ballSize / 2 + 1.5;
    this.y = canvasHeight / 2;
    this.speedX = 7;
    this.speedY = 3 * (Math.random() > 0.5 ? 1 : -1); // 50% chance positive or negative
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
    if (this.x <= paddleWidth + 15 &&
      this.y + ballSize >= player1.y &&
      this.y <= player1.y + paddleHeight) {
        const hitPos = (this.y + ballSize / 2) - (player1.y + paddleHeight / 2);
        const normalized = hitPos / (paddleHeight / 2); // -1 (top) to 1 (bottom)
      
        const bounceAngle = normalized * Math.PI / 4; // Max 45 degree angle
        const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2); // keep same speed
      
        this.speedX = Math.cos(bounceAngle) * speed;
        this.speedY = Math.sin(bounceAngle) * speed;
      
        // Make sure ball is moving right
        if (this.speedX < 0) this.speedX *= -1;
    }

    // Player 2 paddle collision
    if (this.x + ballSize >= canvasWidth - paddleWidth - 15 &&
      this.y + ballSize >= player2.y &&
      this.y <= player2.y + paddleHeight) {
        const hitPos = (this.y + ballSize / 2) - (player2.y + paddleHeight / 2);
        const normalized = hitPos / (paddleHeight / 2);
      
        const bounceAngle = normalized * Math.PI / 4;
        const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
      
        this.speedX = -Math.cos(bounceAngle) * speed; // reflected to left
        this.speedY = Math.sin(bounceAngle) * speed;
      
        if (this.speedX > 0) this.speedX *= -1;
    }
  }

  reset() {
    console.log("Ball reset");
    this.x = canvasWidth / 2 - ballSize / 2 + 1.5;
    this.y = canvasHeight / 2;
  
    // Pause the ball temporarily
    this.speedX = 0;
    this.speedY = 0;
  
    setTimeout(() => {
      this.speedX = 7 * (Math.random() > 0.5 ? 1 : -1);
      this.speedY = 3 * (Math.random() > 0.5 ? 1 : -1);
    }, 1000); // 1000ms = 1 second delay
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, ballSize, ballSize);
  }
}

class Player {
  constructor(public user: User, public paddle: Paddle, public score: number = 0) {}
}

export class Pong implements IGameState {
  name: GameStates
  gameState: 'menu' | 'playing' | 'result';
  twoPlayerMode: boolean = false;
  player1: Player;
  player2: Player;
  private storedOpponentName: string;
  ball: Ball;
  keysPressed: { [key: string]: boolean } = {};
  winner: Player | null = null;

  constructor(user1: User, user2: User, state: 'menu' | 'playing') {
    this.name = GameStates.PONG;
    this.storedOpponentName = user2.username;
    this.player1 = new Player(user1, new Paddle(15));
    this.player2 = new Player(user2, new Paddle(canvasWidth - paddleWidth - 15));
    this.ball = new Ball();
	this.gameState = state;
	if (this.gameState == 'playing')
	{
		this.twoPlayerMode = true; // Two-player mode
        this.player2.user.username = this.storedOpponentName;
	}
    
    // Listen for key events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

	// I removed the gameLoop call from here, because the stateManager takes care of that already - Panu

  }

	handleKeyDown(e: KeyboardEvent) {
    if (this.gameState === 'menu') {
      if (e.key === '1') {
        this.twoPlayerMode = false; // One player mode (AI plays as Player 2)
        this.player2.user.username = "Computer";
        this.gameState = 'playing';
        //this.resetGame(); I don't think we have to reset here
      } else if (e.key === '2') {
        this.twoPlayerMode = true; // Two-player mode
        this.player2.user.username = this.storedOpponentName;
        this.gameState = 'playing';
        //this.resetGame();
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

  	enter()
	{
		// MOVE EVENT LISTENERS HERE

		// document.addEventListener('keydown', this.KeyDownBound);
		// document.addEventListener('keyup', this.KeyUpBound);
	}

	exit()
	{
		// REMOVE EVENT LISTENERS HERE

		// document.removeEventListener('keydown', this.KeyDownBound);
		// document.removeEventListener('keyup', this.KeyUpBound);
	}

	updateGame()
	{
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

  	update() {

		if (this.gameState === 'playing')
			this.updateGame();
  }

  drawResult() {

	// Regular ending
	const p1 = UserManager.cloneUser(this.player1.user); // this might not be needed...
	const p2 = UserManager.cloneUser(this.player2.user); // this might not be needed...

	if (this.winner === this.player1)
		stateManager.changeState(new EndScreen(canvas, p1, p2, null, null));
	else if (this.winner === this.player2)
		stateManager.changeState(new EndScreen(canvas, p2, p1, null, null));


	/*
	OLD VERSION FROM TOM:

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = 'white';
    ctx.font = "30px 'Courier New', monospace";
    const pong = this.winner?.user.username + " is the winner!";
    const pongWidth = ctx.measureText(pong).width;
    ctx.fillText(pong, (canvasWidth * 0.5) - (pongWidth / 2), canvasHeight / 4);
	*/
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

    ctx.font = "20px 'Courier New', monospace";
    const text3 = "Player 1:  up = 'q'  down = 's'";
    const text3Width = ctx.measureText(text3).width;
    const text4 = "Player 2:  up = 'o'  down = 'k'";
    const text4Width = ctx.measureText(text4).width;
    ctx.fillText(text3, (canvasWidth * 0.5) - (text3Width / 2), canvasHeight / 2 + 150);
    ctx.fillText(text4, (canvasWidth * 0.5) - (text4Width / 2), canvasHeight / 2 + 200);
  }

  drawGame()
  {
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
	const player1Text = `${this.player1.user.username}: ${this.player1.score}`;
	const player1TextWidth = ctx.measureText(player1Text).width;
	ctx.fillText(player1Text, (canvasWidth * 0.25) - (player1TextWidth / 2), 70);

	const player2Text = `${this.player2.user.username}: ${this.player2.score}`;
	const player2TextWidth = ctx.measureText(player2Text).width;
	ctx.fillText(player2Text, (canvasWidth * 0.75) - (player2TextWidth / 2), 70);
  }

  render(ctx: CanvasRenderingContext2D) {

	if (this.gameState === 'menu') {
		this.drawMenu();
	  } else if (this.gameState === 'result') {
		this.drawResult();
	  } else {
		this.drawGame();
	  }

  }

  resetGame() {
    this.player1.paddle.y = (canvasHeight - paddleHeight) / 2;
    this.player2.paddle.y = (canvasHeight - paddleHeight) / 2;
    this.ball.reset();
    this.player1.score = 0;
    this.player2.score = 0;
  }

/*

  gameLoop() {
    if (this.gameState === 'menu') {
      this.drawMenu();
    } else if (this.gameState === 'result') {
      this.drawResult();
    } else {
      this.update();
      this.render(ctx);
    }
    requestAnimationFrame(this.gameLoop.bind(this));
  }
*/
}

//const game = new Game();