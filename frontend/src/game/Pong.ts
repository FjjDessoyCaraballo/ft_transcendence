import { GameStates, IGameState } from "./GameStates";
import { canvas, ctx } from "../components/Canvas";
import { User, UserManager } from "../UI/UserManager";
import { stateManager } from "../components";
import { EndScreen } from "./EndScreen";
import { TournamentPlayer } from "./Tournament";
import { GameType } from "../UI/Types";
import { PONG_DOWN_1, PONG_DOWN_2, PONG_UP_1, PONG_UP_2 } from "./Constants";

// Don't access canvas at the module level - only inside functions

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
const PADDLE_WIDTH = 15; 
const PADDLE_HEIGHT = 100;
const PADDLE_SPEED = 8;
const BALL_SIZE = 15;
const BUFFER = 15;

class Paddle {
  y: number;

  constructor(public x: number, canvasHeight: number) {
    this.y = (canvasHeight - PADDLE_HEIGHT) / 2;
  }

  moveUp() {
    this.y -= PADDLE_SPEED;
  }

  moveDown() {
    this.y += PADDLE_SPEED;
  }

  stayInBounds(canvasHeight: number) {
    this.y = Math.max(0, Math.min(canvasHeight - PADDLE_HEIGHT, this.y));
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, PADDLE_WIDTH, PADDLE_HEIGHT);
  }
}

class Ball {
  x: number;
  y: number;
  speedX: number = 15 * -1;
  speedY: number = 0.5 * (Math.random() > 0.5 ? 1 : -1); // 50% chance positive or negative;
  currentRallyLen: number = 0;
  totalHits: number = 0;
  longestRally: number = 0;
  pointsPlayed: number = 0;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = canvasWidth / 2 - BALL_SIZE / 2 + 1.5
    this.y = (canvasHeight - PADDLE_HEIGHT) / 2;
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  checkCollisions(player1: Paddle, player2: Paddle, canvasHeight: number, canvasWidth: number) {
    // Ball collision with top and bottom
    if (this.y <= 0) {
      this.y = 0; // Push ball back inside. Fixes wall "hugging"
      this.speedY *= -1;
    } 
    else if (this.y + BALL_SIZE >= canvasHeight) {
      this.y = canvasHeight - BALL_SIZE; // Push ball back inside. Fixes wall "hugging"
      this.speedY *= -1;
    }


    // Player 1 paddle collision
    if (this.x <= PADDLE_WIDTH + BUFFER && this.y + BALL_SIZE >= player1.y && this.y <= player1.y + PADDLE_HEIGHT) {
        this.currentRallyLen++;
        //console.log('currentRallyLen =', this.currentRallyLen);
        const hitPos = (this.y + BALL_SIZE / 2) - (player1.y + PADDLE_HEIGHT / 2); // calculates the difference between the centres of the ball and the paddle
        const normalized = hitPos / (PADDLE_HEIGHT / 2); // -1 (top) to 1 (bottom)
      
        const bounceAngle = normalized * Math.PI / 4; // -1 (-45 degrees) to 1 (+45 degrees)
        const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2); // keep same speed after bounce (pythagoras)
      
        this.speedX = Math.cos(bounceAngle) * speed; // reflected to right
        this.speedY = Math.sin(bounceAngle) * speed;
      
        // Make sure ball is moving right
        if (this.speedX < 0) 
          this.speedX *= -1;
    }

    // Player 2 paddle collision
    if (this.x + BALL_SIZE >= canvasWidth - PADDLE_WIDTH - BUFFER && this.y + BALL_SIZE >= player2.y && this.y <= player2.y + PADDLE_HEIGHT) {
        this.currentRallyLen++;
        //console.log('currentRallyLen =', this.currentRallyLen);
        const hitPos = (this.y + BALL_SIZE / 2) - (player2.y + PADDLE_HEIGHT / 2);
        const normalized = hitPos / (PADDLE_HEIGHT / 2);
      
        const bounceAngle = normalized * Math.PI / 4;
        const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
      
        this.speedX = -Math.cos(bounceAngle) * speed; // reflected to left
        this.speedY = Math.sin(bounceAngle) * speed;
      
        if (this.speedX > 0) 
          this.speedX *= -1;
    }
  }

  reset(twoPlayerMode: boolean, canvasWidth: number, canvasHeight: number) {
    //console.log("Ball reset");
    if (this.currentRallyLen > this.longestRally)
      this.longestRally = this.currentRallyLen;
    //console.log('longestRally =', this.longestRally);
    this.totalHits += this.currentRallyLen;
    //console.log('totalHits =', this.totalHits);
    this.pointsPlayed++;
    //console.log('pointsPlayed =', this.pointsPlayed);
    this.currentRallyLen = 0;
    this.x = canvasWidth / 2 - BALL_SIZE / 2 + 1.5;
    this.y = canvasHeight / 2;
  
    // Pause the ball temporarily
    this.speedX = 0;
    this.speedY = 0;
  
    setTimeout(() => {
      if (twoPlayerMode) {
        this.speedX = 15 * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = 0.5 * (Math.random() > 0.5 ? 1 : -1);
      }
      else {
        this.speedX = 15 * -1;
        this.speedY = 0.5 * (Math.random() > 0.5 ? 1 : -1);
      }
    }, 1000); // 1000ms = 1 second delay
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, BALL_SIZE, BALL_SIZE);
  }
}

export class Player {
constructor(public user: User, public paddle: Paddle, public score: number = 0) {}
}


export class Pong implements IGameState {
  name: GameStates = GameStates.PONG; //STAT
  gameState: 'menu' | 'playing' | 'result' | 'ai';
  startTime: number = 0;
  duration: number = 0; // In milliseconds, can convert later //STAT
  averageRally: number = 0;

  aiLastUpdateTime: number = 0;
  aiTargetY: number; // AI's current target

  twoPlayerMode: boolean = false;
  player1: Player;
  player2: Player;
  tournamentData1: TournamentPlayer | null;
  tournamentData2: TournamentPlayer | null;
  storedOpponentName: string;
  ball: Ball;
  keysPressed: { [key: string]: boolean } = {};
  winner: Player | null = null; //STAT
  canvasWidth: number;
  canvasHeight: number;
  isStateReady: boolean;

  constructor(user1: User, user2: User, tData1: TournamentPlayer | null, tData2: TournamentPlayer | null, state: 'ai' | 'playing') {
    // Get canvas dimensions when constructor is called, not at module level
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.storedOpponentName = user2.username;
    this.aiTargetY = (this.canvasHeight - PADDLE_HEIGHT) / 2; // AI's current target
    this.player1 = new Player(user1, new Paddle(BUFFER, this.canvasHeight)); //STAT
    this.player2 = new Player(user2, new Paddle(this.canvasWidth - PADDLE_WIDTH - BUFFER, this.canvasHeight)); //STAT
    this.ball = new Ball(this.canvasWidth, this.canvasHeight);
    this.isStateReady = false;
    this.gameState = state;
    this.tournamentData1 = tData1;
	  this.tournamentData2 = tData2;
    if (this.gameState === 'playing')
      {
        this.twoPlayerMode = true; // Two-player mode
            this.player2.user.username = this.storedOpponentName;
      }
      else if (this.gameState === 'ai')
      {
        this.twoPlayerMode = false; // One player mode (AI plays as Player 2)
            this.player2.user.username = "Computer";
            this.gameState = 'playing';
      }

        // Listen for key events
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  handleKeyDown(e: KeyboardEvent) {
    if (this.gameState === 'menu') {
		/*
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
		*/
    } else {

		// We should probably disable this...?

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

  // Predict where the ball will go along the Y-axis when it reaches the target X (AI's paddle)
  predictBallY(ballX: number, ballY: number, ballVX: number, ballVY: number, targetX: number): number {
    while (ballX < targetX) { // as long as the ball hasn't passed the target X position

      // calculates the time it takes for the ball to hit either the top or bottom wall of the canvas
      const timeToWallY = ballVY > 0 
        ? (this.canvasHeight - ballY - BALL_SIZE) / ballVY 
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
    this.player1.paddle.stayInBounds(this.canvasHeight);
    this.player2.paddle.stayInBounds(this.canvasHeight);
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

  updateGame() {
    if (this.gameState !== 'playing') 
      return ; // Shouldn't have to do this!!
    //console.log('Current gameState:', this.gameState);
    this.updatePlayerPositions();
    this.ball.move();
    this.ball.checkCollisions(this.player1.paddle, this.player2.paddle, this.canvasHeight, this.canvasWidth);

    // Reset ball if missed and count score
    if (this.ball.x < 0) {
      this.player2.score++;
      if (this.player2.score === 5) {
        this.gameState = 'result';
        this.averageRally = this.ball.totalHits / this.ball.pointsPlayed;
        this.winner = this.player2;
        this.duration = performance.now() - this.startTime;
      }
      this.ball.reset(this.twoPlayerMode, this.canvasWidth, this.canvasHeight);
    }

    if (this.ball.x > this.canvasWidth) {
      this.player1.score++;
      if (this.player1.score === 5) {
        this.gameState = 'result';
        this.averageRally = this.ball.totalHits / this.ball.pointsPlayed;
        this.winner = this.player1;
        this.duration = performance.now() - this.startTime;
      }
      this.ball.reset(this.twoPlayerMode, this.canvasWidth, this.canvasHeight);
    }
  }

  update() {

		if (this.gameState === 'playing')
			this.updateGame();
  }

  drawResult() {

	// Tournament ending
	if (this.tournamentData1 && this.tournamentData2)
		{
			if (this.winner === this.player1)
			{
				this.tournamentData1.tournamentPoints++;
				this.tournamentData1.pongPointsScored += this.player1.score;
				this.tournamentData2.pongPointsScored += this.player2.score;
				this.tournamentData1.isWinner = true;
			}	
			else if (this.winner === this.player2)
			{
				this.tournamentData2.tournamentPoints++;
				this.tournamentData1.pongPointsScored += this.player1.score;
				this.tournamentData2.pongPointsScored += this.player2.score;
				this.tournamentData2.isWinner = true;
			}
						
			this.isStateReady = true;
			return ;
		}

	// Regular ending
	const p1 = UserManager.cloneUser(this.player1.user); // this might not be needed...
	const p2 = UserManager.cloneUser(this.player2.user); // this might not be needed...

	if (this.twoPlayerMode)
	{
		if (this.winner === this.player1)
			stateManager.changeState(new EndScreen(canvas, p1, p2, null, null, GameType.PONG));
		else if (this.winner === this.player2)
			stateManager.changeState(new EndScreen(canvas, p2, p1, null, null, GameType.PONG));
	}
	else
	{
		if (this.winner === this.player1)
			stateManager.changeState(new EndScreen(canvas, p1, p2, null, null, GameType.PONG_AI));
		else if (this.winner === this.player2)
			stateManager.changeState(new EndScreen(canvas, p2, p1, null, null, GameType.PONG_AI));
	}


	/*
	OLD VERSION FROM TOM:

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw paddles
    this.player1.paddle.draw(ctx);
    this.player2.paddle.draw(ctx);

    // Draw centre line
    for (let i = 0; i < this.canvasHeight; i += this.canvasHeight / 20) {
      ctx.fillRect(this.canvasWidth / 2, i, 3, this.canvasHeight / 40);
    }

    // Draw ball
    this.ball.draw(ctx);

    // Draw scores
    ctx.font = "50px 'Courier New', monospace";
    const player1Text = `${this.player1.user.username}: ${this.player1.score}`;
    const player1TextWidth = ctx.measureText(player1Text).width;
    ctx.fillText(player1Text, (this.canvasWidth * 0.25) - (player1TextWidth / 2), 70);

    const player2Text = `${this.player2.user.username}: ${this.player2.score}`;
    const player2TextWidth = ctx.measureText(player2Text).width;
    ctx.fillText(player2Text, (this.canvasWidth * 0.75) - (player2TextWidth / 2), 70);
  }
  
  drawResult(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = 'white';
    ctx.font = "30px 'Courier New', monospace";
    const pong = this.winner?.user.username + " is the winner!";
    const pongWidth = ctx.measureText(pong).width;
    ctx.fillText(pong, (canvasWidth * 0.5) - (pongWidth / 2), canvasHeight / 4);
	*/
  }

  drawMenu(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    ctx.fillStyle = 'white';
    ctx.font = "100px 'Courier New', monospace";
    const pong = "PONG";
    const pongWidth = ctx.measureText(pong).width;
    ctx.fillText(pong, (this.canvasWidth * 0.5) - (pongWidth / 2), this.canvasHeight / 4);

    ctx.font = "30px 'Courier New', monospace"; 
    const text1 = "vs computer (Press '1')";
    const text1Width = ctx.measureText(text1).width;
    const text2 = "vs human (Press '2')";
    const text2Width = ctx.measureText(text2).width;
    
    ctx.fillText(text1, (this.canvasWidth * 0.5) - (text1Width / 2), this.canvasHeight / 2);
    ctx.fillText(text2, (this.canvasWidth * 0.5) - (text2Width / 2), this.canvasHeight / 2 + 50);

    ctx.font = "20px 'Courier New', monospace";
    const text3 = `Player 1:  up = '${PONG_UP_1}'  down = '${PONG_DOWN_1}'`;
    const text3Width = ctx.measureText(text3).width;
    const text4 = `Player 2:  up = '${PONG_UP_2}'  down = '${PONG_DOWN_2}'`;
    const text4Width = ctx.measureText(text4).width;
    ctx.fillText(text3, (this.canvasWidth * 0.5) - (text3Width / 2), this.canvasHeight / 2 + 150);
    ctx.fillText(text4, (this.canvasWidth * 0.5) - (text4Width / 2), this.canvasHeight / 2 + 200);
  }

  drawGame()
  {
	// Clear canvas
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

	// Draw paddles
	this.player1.paddle.draw(ctx);
	this.player2.paddle.draw(ctx);

	// Draw centre line
	for (let i = 0; i < this.canvasHeight; i += this.canvasHeight / 20) {
	ctx.fillRect(this.canvasWidth / 2, i, 3, this.canvasHeight / 40);
	}

	// Draw ball
	this.ball.draw(ctx);

	// Draw scores
	ctx.font = "50px 'Courier New', monospace";
	const player1Text = `${this.player1.user.username}: ${this.player1.score}`;
	const player1TextWidth = ctx.measureText(player1Text).width;
	ctx.fillText(player1Text, (this.canvasWidth * 0.25) - (player1TextWidth / 2), 70);

	const player2Text = `${this.player2.user.username}: ${this.player2.score}`;
	const player2TextWidth = ctx.measureText(player2Text).width;
	ctx.fillText(player2Text, (this.canvasWidth * 0.75) - (player2TextWidth / 2), 70);
  }

  render(ctx: CanvasRenderingContext2D) {

	if (this.gameState === 'menu') {
		this.drawMenu(ctx);
	  } else if (this.gameState === 'result') {
		this.drawResult();
	  } else {
		this.drawGame();
	  }

  }

  resetGame() {
    this.player1.paddle.y = (this.canvasHeight - PADDLE_HEIGHT) / 2;
    this.player2.paddle.y = (this.canvasHeight - PADDLE_HEIGHT) / 2;
    this.ball.reset(this.twoPlayerMode, this.canvasWidth, this.canvasHeight);
    this.player1.score = 0;
    this.player2.score = 0;
  }

/*

  gameLoop() {

  //  requestAnimationFrame(this.gameLoop.bind(this));
  }
*/
}
