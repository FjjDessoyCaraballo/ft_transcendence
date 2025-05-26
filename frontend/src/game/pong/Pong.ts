import { GameStates, IGameState } from "../GameStates";
import { User } from "../../UI/UserManager";
import { global_stateManager } from "../../UI/GameCanvas";
import { EndScreen } from "../EndScreen";
import { TournamentPlayer } from "../Tournament";
import { GameType } from "../../UI/Types";
import { PONG_DOWN_1, PONG_DOWN_2, PONG_UP_1, PONG_UP_2 } from "../Constants";
import { Player, Paddle} from "./Paddle";
import { Ball } from "./Ball";
import { getLoggedInUserData, getOpponentData } from "../../services/userService";
import { drawCenteredText } from "../StartScreen";
import { UserManager } from "../../UI/UserManager";

// Game Constants
export const PADDLE_WIDTH = 15; 
export const PADDLE_HEIGHT = 100;
export const PADDLE_SPEED = 10;
export const BALL_SIZE = 15;
export const BUFFER = 15;

export class Pong implements IGameState {
  name: GameStates = GameStates.PONG; //STAT
  gameState: 'playing' | 'result' | 'ai';
  startTime: number = 0;
  duration: number = 0; // In milliseconds, can convert later //STAT
  averageRally: number = 0;

  aiLastUpdateTime: number = 0;
  aiTargetY: number; // AI's current target

  twoPlayerMode: boolean = false;
  player1: Player | null;
  player2: Player | null;
  AIData: User | null;
  tournamentData1: TournamentPlayer | null;
  tournamentData2: TournamentPlayer | null;
  ball: Ball;
  keysPressed: { [key: string]: boolean } = {};
  winner: Player | null = null; //STAT
  canvas: HTMLCanvasElement;
  canvasWidth: number;
  canvasHeight: number;
  ctx: CanvasRenderingContext2D;
  isStateReady: boolean;
  isDataReady: boolean;
  showLoadingText: boolean;
  savingDataToDB: boolean;
  saveReady: boolean;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, AIData: User | null, state: 'ai' | 'playing') {

	this.canvas = canvas;
	this.ctx = ctx;
    this.canvasWidth = canvas.width;
    this.canvasHeight = canvas.height;
    this.aiTargetY = (this.canvasHeight - PADDLE_HEIGHT) / 2; // AI's current target
    this.player1 = null;
    this.player2 = null;
	this.AIData = AIData;
    this.ball = new Ball(this.canvasWidth, this.canvasHeight);
    this.isStateReady = false;
	this.isDataReady = false;
	this.showLoadingText = false;
	this.savingDataToDB = false;
	this.saveReady = false;
    this.gameState = state;
    this.tournamentData1 = null;
	  this.tournamentData2 = null;
    if (this.gameState === 'playing')
    {
      this.twoPlayerMode = true; // Two-player mode
    }
    else if (this.gameState === 'ai')
    {
      this.twoPlayerMode = false; // One player mode (AI plays as Player 2)
      this.gameState = 'playing';
    }

	setTimeout(() => {
		this.showLoadingText = true;
	}, 500); 

	this.fetchUserData();

    // Listen for key events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  async fetchUserData()
	{
		try
		{
			const player1UserData = await getLoggedInUserData();
			if (!player1UserData)
			{
				console.log("PONG: User data fetch failed.");
				return ;
			}
  
			let player2UserData;
			if (this.twoPlayerMode)
			{
				player2UserData = await getOpponentData();
				if (!player2UserData)
				{
					console.log("PONG: User data fetch failed.");
					return ;
				}
			}
			else
				player2UserData = this.AIData;
  
			if (!player2UserData)
			{
				console.log("PONG: User data fetch failed.");
				return ;
			}
			
			this.player1 = new Player(player1UserData, new Paddle(BUFFER, this.canvasHeight)); //STAT
    		this.player2 = new Player(player2UserData, new Paddle(this.canvasWidth - PADDLE_WIDTH - BUFFER, this.canvasHeight)); //STAT

			this.isDataReady = true;
		}
		catch {
			console.log("PONG: User data fetch failed.");
			this.isDataReady = false;
		}
	}

  handleKeyDown(e: KeyboardEvent) {
      this.keysPressed[e.key] = true;
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
	if (!this.player1)
		return ;
    if (this.keysPressed[PONG_UP_1]) 
      this.player1.paddle.moveUp();
    if (this.keysPressed[PONG_DOWN_1]) 
      this.player1.paddle.moveDown();

    if (this.twoPlayerMode && this.player2) {
      // Player 2 movement
      if (this.keysPressed[PONG_UP_2]) 
        this.player2.paddle.moveUp();
      if (this.keysPressed[PONG_DOWN_2]) 
        this.player2.paddle.moveDown();
    } 
    else {
      const now = performance.now();
      if (now - this.aiLastUpdateTime >= 1000 && this.player2) { // Only update AI's target once per second
        this.aiTargetY = this.predictBallY(this.ball.x, this.ball.y, this.ball.speedX, this.ball.speedY, this.player2.paddle.x);
        this.aiLastUpdateTime = now;
      }

      // AI movement toward target using same speed as human
	  if (!this.player2)
		return ;
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
	if (!this.player1 || !this.player2)
		return ;

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

// STATS
// BOTH GAMES
// - Player1 (in TP)
// - Player2 (in TP)
// - Winner (in TP)
// - Game duration 
// - Game type
// PONG
// - Longest ball rally
// - Avg ball rally
// - Points scored by Player1 (in TP)
// - Points scored by Player2 (in TP)

// Wins and Losses for each user?

	async saveUserDataToDB(winner: User, loser: User)
	{
		this.savingDataToDB = true;

		try {
			await UserManager.updateUserStats(winner, loser, GameType.PONG);
		} catch {

			// Is this enough? Or do we need more error handling...?
			// Should we change state to StartScreen or something?
			alert('User data saving failed');
			console.log('User data saving failed');
			this.savingDataToDB = false;
			return ;
		}

		this.saveReady = true;
	}

  drawResult() {

	if (!this.player1 || !this.player2)
			return ;

	const p1 = this.player1.user;
	const p2 = this.player2.user;

	// AI ending
	if (!this.twoPlayerMode)
	{
		if (this.winner === this.player1)
			global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, p1, p2, null, null, GameType.PONG_AI));
		else if (this.winner === this.player2)
			global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, p2, p1, null, null, GameType.PONG_AI));
	}

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

    // GAME STATS FOR CURRENT GAME - NOT USING YET
    // const player1Username = this.player1.user.username;
    // const player2Username = this.player2.user.username;
    // const winnerUsername = this.winner?.user.username || '';
    // const gameType = this.twoPlayerMode ? 'PONG' : 'PONG_AI';
    // const durationMs = this.duration;
    // const averageRally = this.averageRally;
    // const longestRally = this.ball.longestRally;
    // const player1Score = this.player1.score;
    // const player2Score = this.player2.score;

    // Regular ending
	if (!this.savingDataToDB)
	{
		if (this.winner === this.player1)
			this.saveUserDataToDB(this.player1.user, this.player2.user);
		else if (this.winner === this.player2)
			this.saveUserDataToDB(this.player2.user, this.player1.user);

		return ;
	}

    if (this.saveReady)
    {
      if (this.winner === this.player1)
        global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, p1, p2, null, null, GameType.PONG));
      else if (this.winner === this.player2)
        global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, p2, p1, null, null, GameType.PONG));
    }

  }

  drawGame()
  {

	if (!this.player1 || !this.player2)
		return ;

    // Clear canvas
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw paddles
    this.player1.paddle.draw(this.ctx);
    this.player2.paddle.draw(this.ctx);

    // Draw centre line
    for (let i = 0; i < this.canvasHeight; i += this.canvasHeight / 20) {
    this.ctx.fillRect(this.canvasWidth / 2, i, 3, this.canvasHeight / 40);
    }

    // Draw ball
    this.ball.draw(this.ctx);

    // Draw scores
    this.ctx.font = "50px 'Courier New', monospace";
    const player1Text = `${this.player1.user.username}: ${this.player1.score}`;
    const player1TextWidth = this.ctx.measureText(player1Text).width;
    this.ctx.fillText(player1Text, (this.canvasWidth * 0.25) - (player1TextWidth / 2), 70);

    const player2Text = `${this.player2.user.username}: ${this.player2.score}`;
    const player2TextWidth = this.ctx.measureText(player2Text).width;
    this.ctx.fillText(player2Text, (this.canvasWidth * 0.75) - (player2TextWidth / 2), 70);
  }

  render(ctx: CanvasRenderingContext2D) {

	if (!this.isDataReady)
	{
		if (!this.showLoadingText)
			return ;

		const loadingHeader = 'Fetching user data, please wait.';
		drawCenteredText(this.canvas, this.ctx, loadingHeader, '50px arial', 'white', this.canvas.height / 2);
		const loadingInfo = 'If this takes more than 10 seconds, please try to log out and in again.';
		drawCenteredText(this.canvas, this.ctx, loadingInfo, '30px arial', 'white', this.canvas.height / 2 + 50);
		return ;
	}	 

    if (this.gameState === 'result') {
		  this.drawResult();
	  } 
    else {
		  this.drawGame();
	  }
  }

  resetGame() {

	if (!this.player1 || !this.player2)
		return ;

    this.player1.paddle.y = (this.canvasHeight - PADDLE_HEIGHT) / 2;
    this.player2.paddle.y = (this.canvasHeight - PADDLE_HEIGHT) / 2;
    this.ball.reset(this.twoPlayerMode, this.canvasWidth, this.canvasHeight);
    this.player1.score = 0;
    this.player2.score = 0;
  }
}
