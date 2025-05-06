import { GameStates, IGameState } from "../GameStates";
import { canvas, ctx } from "../../components/Canvas";
import { User } from "../../UI/UserManager";
import { Paddle, Player } from "./Paddle";
import { Ball } from "./Ball";

// STATS
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

// Game Constants
export const paddleWidth = 15; 
export const paddleHeight = 100;
export const paddleSpeed = 8;
export const ballSize = 15;
export const canvasWidth = canvas.width;
export const canvasHeight = canvas.height;


export class Game implements IGameState {
  name: GameStates = GameStates.PONG; //STAT
  gameState: 'menu' | 'playing' | 'result' = 'menu';
  startTime: number = 0;
  duration: number = 0; // In milliseconds, can convert later //STAT
  averageRally: number = 0;

  aiLastUpdateTime: number = 0;
  aiTargetY: number = (canvasHeight - paddleHeight) / 2; // AI's current target

  twoPlayerMode: boolean = false;
  player1: Player;
  player2: Player;
  storedOpponentName: string;
  ball: Ball = new Ball();
  keysPressed: { [key: string]: boolean } = {};
  winner: Player | null = null; //STAT

  constructor(user1: User, user2: User) {
    this.storedOpponentName = user2.username;
    this.player1 = new Player(user1, new Paddle(15)); //STAT
    this.player2 = new Player(user2, new Paddle(canvasWidth - paddleWidth - 15)); //STAT
    this.gameLoop = this.gameLoop.bind(this);
    this.enter();
    this.gameLoop();
  }

  handleKeyDown(e: KeyboardEvent) {
    if (this.gameState === 'menu') {
      if (e.key === '1') {
        this.twoPlayerMode = false; // One player mode (AI plays as Player 2)
        this.player2.user.username = "Computer";
        this.startTime = performance.now();
        this.gameState = 'playing';
        this.resetGame();
      } else if (e.key === '2') {
        this.twoPlayerMode = true; // Two-player mode
        this.player2.user.username = this.storedOpponentName;
        this.startTime = performance.now();
        this.gameState = 'playing';
        this.resetGame();
      }
    } 
    else {
      if (e.key === 'Escape') {
        this.gameState = 'menu';
        this.resetGame();
      } 
      else {
        this.keysPressed[e.key] = true;
      }
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    this.keysPressed[e.key] = false;
  }

  // Predict where the ball will go along the Y-axis when it reaches the target X (AI's paddle)
  predictBallY(ballX: number, ballY: number, ballVX: number, ballVY: number, targetX: number): number {
    while (ballX < targetX) { // as long as the ball hasn't passed the target X position

      // calculates the time it takes for the ball to hit either the top or bottom wall of the canvas
      const timeToWallY = ballVY > 0 
        ? (canvasHeight - ballY - ballSize) / ballVY 
        : -ballY / ballVY;

      // calculates the time it will take for the ball to travel horizontally to the target X position
      const timeToTargetX = (targetX - ballX) / ballVX;
  
      // simulates ball movement
      if (timeToWallY < timeToTargetX) { // the ball will hit the wall before it reaches the target
        ballX += ballVX * timeToWallY;
        ballY += ballVY * timeToWallY;
        ballVY *= -1; // Ball bounces when it hits the wall
      } 
      else { // the ball will reach the target X before hitting any wall
        ballX += ballVX * timeToTargetX;
        ballY += ballVY * timeToTargetX;
        break ; // ball reaches target
      }
    }
    return ballY; // Return the predicted Y position of the ball
  }

  updatePlayerPositions() {
    // Player 1 movement
    if (this.keysPressed['q']) 
      this.player1.paddle.moveUp();
    if (this.keysPressed['s']) 
      this.player1.paddle.moveDown();

    if (this.twoPlayerMode) {
      // Player 2 movement
      if (this.keysPressed['o']) 
        this.player2.paddle.moveUp();
      if (this.keysPressed['k']) 
        this.player2.paddle.moveDown();
    } 
    else {
      const now = performance.now();
      if (now - this.aiLastUpdateTime >= 1000) { // Only update AI's target once per second
        this.aiTargetY = this.predictBallY(this.ball.x, this.ball.y, this.ball.speedX, this.ball.speedY, this.player2.paddle.x);
        this.aiLastUpdateTime = now;
      }

      // AI movement toward target using same speed as human
      const paddleCenter = this.player2.paddle.y + paddleHeight / 2;
      if (paddleCenter < this.aiTargetY - paddleSpeed) {
        this.player2.paddle.moveDown();
      } 
      else if (paddleCenter > this.aiTargetY + paddleSpeed) {
        this.player2.paddle.moveUp();
      }
    }
    this.player1.paddle.stayInBounds();
    this.player2.paddle.stayInBounds();
  }

  enter()
	{
		// Listen for key events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
	}

	exit() //Not using this...
	{
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
	}

  update() {
    if (this.gameState !== 'playing') 
      return ; // Shouldn't have to do this!!
    //console.log('Current gameState:', this.gameState);
    this.updatePlayerPositions();
    this.ball.move();
    this.ball.checkCollisions(this.player1.paddle, this.player2.paddle);

    // Reset ball if missed and count score
    if (this.ball.x < 0) {
      this.player2.score++;
      if (this.player2.score === 5) {
        this.gameState = 'result';
        this.averageRally = this.ball.totalHits / this.ball.pointsPlayed;
        this.winner = this.player2;
        this.duration = performance.now() - this.startTime;
      }
      this.ball.reset(this.twoPlayerMode);
    }

    if (this.ball.x > canvasWidth) {
      this.player1.score++;
      if (this.player1.score === 5) {
        this.gameState = 'result';
        this.averageRally = this.ball.totalHits / this.ball.pointsPlayed;
        this.winner = this.player1;
        this.duration = performance.now() - this.startTime;
      }
      this.ball.reset(this.twoPlayerMode);
    }
  }

  drawResult() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = 'white';
    ctx.font = "50px 'Courier New', monospace";
    const pong = this.winner?.user.username + " is the winner!";
    const pongWidth = ctx.measureText(pong).width;
    ctx.fillText(pong, (canvasWidth * 0.5) - (pongWidth / 2), canvasHeight / 4);

    ctx.font = "30px 'Courier New', monospace";
    //add player points here
    const p1 = this.player1.user.username + ": " + this.player1.score + " points";
    ctx.fillText(p1, (canvasWidth * 0.5) - (ctx.measureText(p1).width / 2), canvasHeight / 4 + 100);
    const p2 = this.player2.user.username + ": " + this.player2.score + " points";
    ctx.fillText(p2, (canvasWidth * 0.5) - (ctx.measureText(p2).width / 2), canvasHeight / 4 + 150);

    const seconds = (this.duration / 1000).toFixed(2);
    const durationText = `Game duration: ${seconds} seconds`;
    ctx.fillText(durationText, (canvasWidth * 0.5) - (ctx.measureText(durationText).width / 2), canvasHeight / 4 + 200);

    const longestRally = "Longest rally: " + this.ball.longestRally + " hits";
    ctx.fillText(longestRally, (canvasWidth * 0.5) - (ctx.measureText(longestRally).width / 2), canvasHeight / 4 + 250);

    const avgText = `Average rally: ${this.averageRally.toFixed(2)} hits`;
    ctx.fillText(avgText, (canvasWidth * 0.5) - (ctx.measureText(avgText).width / 2), canvasHeight / 4 + 300);
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
    this.ball.longestRally = 0;
    this.ball.reset(this.twoPlayerMode);
    this.player1.score = 0;
    this.player2.score = 0;
  }

  gameLoop() {
    //console.log('In gameLoop, gameState =', this.gameState);
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