import { GameStates, IGameState } from "../GameStates";
import { canvas, ctx } from "../../components/Canvas";
import { User } from "../../UI/UserManager";
import { Paddle, Player } from "./Paddle";
import { Ball } from "./Ball";

// BOTH GAMES
// - Player1
// - Player2
// - Winner
// - Game duration
// - Game type

// PONG
// - Longest ball rally
// - Avg ball rally
// - Points scored by Player1
// - Points scored by Player2

// Game starts already at first menu

// Game Constants
export const paddleWidth = 15; 
export const paddleHeight = 100;
export const ballSize = 15;
export const canvasWidth = canvas.width;
export const canvasHeight = canvas.height;


export class Game implements IGameState {
  name: GameStates
  gameState: 'menu' | 'playing' | 'result' = 'menu';
  twoPlayerMode: boolean = false;
  player1: Player;
  player2: Player;
  private storedOpponentName: string;
  ball: Ball;
  keysPressed: { [key: string]: boolean } = {};
  winner: Player | null = null;

  constructor(user1: User, user2: User) {
    this.name = GameStates.PONG;
    this.storedOpponentName = user2.username;
    this.player1 = new Player(user1, new Paddle(15));
    this.player2 = new Player(user2, new Paddle(canvasWidth - paddleWidth - 15));
    this.ball = new Ball();

     // Bind once
    this.gameLoop = this.gameLoop.bind(this);
    
    // Listen for key events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));

    this.gameLoop();
  }

  handleKeyDown(e: KeyboardEvent) {
    if (this.gameState === 'menu') {
      if (e.key === '1') {
        this.twoPlayerMode = false; // One player mode (AI plays as Player 2)
        this.player2.user.username = "Computer";
        this.gameState = 'playing';
        this.resetGame();
      } else if (e.key === '2') {
        this.twoPlayerMode = true; // Two-player mode
        this.player2.user.username = this.storedOpponentName;
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

  enter()
	{
		// document.addEventListener('keydown', this.KeyDownBound);
		// document.addEventListener('keyup', this.KeyUpBound);
	}

	exit()
	{
		// document.removeEventListener('keydown', this.KeyDownBound);
		// document.removeEventListener('keyup', this.KeyUpBound);
	}

  update() {
    if (this.gameState !== 'playing') return; // Shouldn't have to do this!!
    console.log('Current gameState:', this.gameState);
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
    const pong = this.winner?.user.username + " is the winner!";
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

    ctx.font = "20px 'Courier New', monospace";
    const text3 = "Player 1:  up = 'q'  down = 's'";
    const text3Width = ctx.measureText(text3).width;
    const text4 = "Player 2:  up = 'o'  down = 'k'";
    const text4Width = ctx.measureText(text4).width;
    ctx.fillText(text3, (canvasWidth * 0.5) - (text3Width / 2), canvasHeight / 2 + 150);
    ctx.fillText(text4, (canvasWidth * 0.5) - (text4Width / 2), canvasHeight / 2 + 200);
  }

  render(ctx: CanvasRenderingContext2D) {
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

  resetGame() {
    this.player1.paddle.y = (canvasHeight - paddleHeight) / 2;
    this.player2.paddle.y = (canvasHeight - paddleHeight) / 2;
    this.ball.reset();
    this.player1.score = 0;
    this.player2.score = 0;
  }

  gameLoop() {
    console.log('In gameLoop, gameState =', this.gameState);
    if (this.gameState === 'menu') {
      this.drawMenu();
    } else if (this.gameState === 'result') {
      this.drawResult();
    } else if (this.gameState === 'playing') {
      this.update();
      this.render(ctx);
    }
    requestAnimationFrame(this.gameLoop);
  }
}