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

// Wins and Losses for each user?

// Game Constants
export const PADDLE_WIDTH = 15; 
export const PADDLE_HEIGHT = 100;
export const PADDLE_SPEED = 8;
export const BALL_SIZE = 15;
export const CANVAS_WIDTH = canvas.width;
export const CANVAS_HEIGHT = canvas.height;
export const BUFFER = 15;


export class Game implements IGameState {
  name: GameStates = GameStates.PONG; //STAT
  gameState: 'menu' | 'playing' | 'result' = 'menu';
  startTime: number = 0;
  duration: number = 0; // In milliseconds, can convert later //STAT
  averageRally: number = 0;

  aiLastUpdateTime: number = 0;
  aiTargetY: number = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2; // AI's current target

  twoPlayerMode: boolean = false;
  player1: Player;
  player2: Player;
  storedOpponentName: string;
  ball: Ball = new Ball();
  keysPressed: { [key: string]: boolean } = {};
  winner: Player | null = null; //STAT

  constructor(user1: User, user2: User) {
    this.storedOpponentName = user2.username;
    this.player1 = new Player(user1, new Paddle(BUFFER)); //STAT
    this.player2 = new Player(user2, new Paddle(CANVAS_WIDTH - PADDLE_WIDTH - BUFFER)); //STAT
    this.gameLoop = this.gameLoop.bind(this);
    this.enter();
    this.gameLoop();
    //console.log(localStorage);
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
        ? (CANVAS_HEIGHT - ballY - BALL_SIZE) / ballVY 
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
      const paddleCenter = this.player2.paddle.y + PADDLE_HEIGHT / 2;
      if (paddleCenter < this.aiTargetY - PADDLE_SPEED) {
        this.player2.paddle.moveDown();
      } 
      else if (paddleCenter > this.aiTargetY + PADDLE_SPEED) {
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

    if (this.ball.x > CANVAS_WIDTH) {
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
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = 'white';
    ctx.font = "50px 'Courier New', monospace";
    const pong = this.winner?.user.username + " is the winner!";
    const pongWidth = ctx.measureText(pong).width;
    ctx.fillText(pong, (CANVAS_WIDTH * 0.5) - (pongWidth / 2), CANVAS_HEIGHT / 4);

    ctx.font = "30px 'Courier New', monospace";
    //add player points here
    const p1 = this.player1.user.username + ": " + this.player1.score + " points";
    ctx.fillText(p1, (CANVAS_WIDTH * 0.5) - (ctx.measureText(p1).width / 2), CANVAS_HEIGHT / 4 + 100);
    const p2 = this.player2.user.username + ": " + this.player2.score + " points";
    ctx.fillText(p2, (CANVAS_WIDTH * 0.5) - (ctx.measureText(p2).width / 2), CANVAS_HEIGHT / 4 + 150);

    const seconds = (this.duration / 1000).toFixed(2);
    const durationText = `Game duration: ${seconds} seconds`;
    ctx.fillText(durationText, (CANVAS_WIDTH * 0.5) - (ctx.measureText(durationText).width / 2), CANVAS_HEIGHT / 4 + 200);

    const longestRally = "Longest rally: " + this.ball.longestRally + " hits";
    ctx.fillText(longestRally, (CANVAS_WIDTH * 0.5) - (ctx.measureText(longestRally).width / 2), CANVAS_HEIGHT / 4 + 250);

    const avgText = `Average rally: ${this.averageRally.toFixed(2)} hits`;
    ctx.fillText(avgText, (CANVAS_WIDTH * 0.5) - (ctx.measureText(avgText).width / 2), CANVAS_HEIGHT / 4 + 300);
  }

  drawMenu() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = 'white';
    ctx.font = "100px 'Courier New', monospace";
    const pong = "PONG";
    const pongWidth = ctx.measureText(pong).width;
    ctx.fillText(pong, (CANVAS_WIDTH * 0.5) - (pongWidth / 2), CANVAS_HEIGHT / 4);

    ctx.font = "30px 'Courier New', monospace"; 
    const text1 = "vs computer (Press '1')";
    const text1Width = ctx.measureText(text1).width;
    const text2 = "vs human (Press '2')";
    const text2Width = ctx.measureText(text2).width;
    

    ctx.fillText(text1, (CANVAS_WIDTH * 0.5) - (text1Width / 2), CANVAS_HEIGHT / 2);
    ctx.fillText(text2, (CANVAS_WIDTH * 0.5) - (text2Width / 2), CANVAS_HEIGHT / 2 + 50);

    ctx.font = "20px 'Courier New', monospace";
    const text3 = "Player 1:  up = 'q'  down = 's'";
    const text3Width = ctx.measureText(text3).width;
    const text4 = "Player 2:  up = 'o'  down = 'k'";
    const text4Width = ctx.measureText(text4).width;
    ctx.fillText(text3, (CANVAS_WIDTH * 0.5) - (text3Width / 2), CANVAS_HEIGHT / 2 + 150);
    ctx.fillText(text4, (CANVAS_WIDTH * 0.5) - (text4Width / 2), CANVAS_HEIGHT / 2 + 200);
  }

  render(ctx: CanvasRenderingContext2D) {
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw paddles
    this.player1.paddle.draw();
    this.player2.paddle.draw();

    // Draw centre line
    for (let i = 0; i < CANVAS_HEIGHT; i += CANVAS_HEIGHT / 20) {
      ctx.fillRect(CANVAS_WIDTH / 2, i, 3, CANVAS_HEIGHT / 40);
    }

    // Draw ball
    this.ball.draw();

    // Draw scores
    ctx.font = "50px 'Courier New', monospace";
    const player1Text = `${this.player1.user.username}: ${this.player1.score}`;
    const player1TextWidth = ctx.measureText(player1Text).width;
    ctx.fillText(player1Text, (CANVAS_WIDTH * 0.25) - (player1TextWidth / 2), 70);

    const player2Text = `${this.player2.user.username}: ${this.player2.score}`;
    const player2TextWidth = ctx.measureText(player2Text).width;
    ctx.fillText(player2Text, (CANVAS_WIDTH * 0.75) - (player2TextWidth / 2), 70);
  }

  resetGame() {
    this.player1.paddle.y = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
    this.player2.paddle.y = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
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