import { GameStates, IGameState } from "../GameStates";
import { User } from "../../UI/UserManager";
import { global_stateManager } from "../../UI/GameCanvas";
import { EndScreen } from "../EndScreen";
import { TournamentPlayer } from "../Tournament";
import { GameType } from "../../UI/Types";
import { PONG_DOWN_1, PONG_DOWN_2, PONG_UP_1, PONG_UP_2 } from "../Constants";
import { Player, Paddle} from "./Paddle";
import { Ball } from "./Ball";
import { TFunction } from 'i18next';
import { getLoggedInUserData, getNextTournamentGameData, getOpponentData, recordTournamentMatchResult } from "../../services/userService";
import { drawCenteredText } from "../StartScreen";
import { UserManager } from "../../UI/UserManager";
import { StartScreen } from "../StartScreen";

export interface pongMatchData {
	date: Date;
	game_type: string;
	startTime: number;
	player1_id: number;
	player1_rank: number;
	player2_id: number;
	player2_rank: number;
	game_duration: number; // in seconds
	winner_id: number;
	longest_rally: number;
	avg_rally: number;
	player1_points: number;
	player2_points: number;
}


// Game Constants
export const PADDLE_WIDTH = 15; 
export const PADDLE_HEIGHT = 110;
export const PADDLE_SPEED = 500;
export const BALL_SIZE = 15;
export const BUFFER = 15;
export const MAX_BALL_SPEED = 1500;
export const WINNING_SCORE = 5;
export const AI_UPDATE_INTERVAL = 1000;
export const INITIAL_BALLSPEED_X = 800;
export const INITIAL_BALLSPEED_Y = 25;


export class Pong implements IGameState {
  name: GameStates = GameStates.PONG; //STAT
  state: 'playing' | 'result' | 'ai';
  gameStats: pongMatchData | null;
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
  isLoggedIn: boolean = false;
  t: TFunction;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, AIData: User | null, state: 'ai' | 'playing', isTournament: boolean, t: TFunction) {

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
  this.t = t;
    this.state = state;
	this.gameStats = null;
    this.tournamentData1 = null;
	  this.tournamentData2 = null;
    if (this.state === 'playing')
    {
      this.twoPlayerMode = true; // Two-player mode
    }
    else if (this.state === 'ai')
    {
      this.twoPlayerMode = false; // One player mode (AI plays as Player 2)
      this.state = 'playing';
    }

	setTimeout(() => {
		this.showLoadingText = true;
	}, 500); 

	if (!isTournament)
		this.fetchUserData();
	else
		this.fetchNextTournamentData();

    // Listen for key events
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

	async fetchNextTournamentData()
	{
		try {
		const response = await getNextTournamentGameData();
  
		this.tournamentData1 = response[0];
		this.tournamentData2 = response[1];
  
		this.player1 = new Player(this.tournamentData1.user, new Paddle(BUFFER, this.canvasHeight)); //STAT
    	this.player2 = new Player(this.tournamentData2.user, new Paddle(this.canvasWidth - PADDLE_WIDTH - BUFFER, this.canvasHeight)); //STAT
  
		this.gameStats = {
			date: new Date(),
			game_type: 'pong',
			startTime: Date.now(),
			player1_id: this.tournamentData1.user.id,
			player1_rank: this.tournamentData1.user.ranking_points,
			player2_id: this.tournamentData2.user.id,
			player2_rank: this.tournamentData2.user.ranking_points,
			game_duration: -1,
			winner_id: -1,
			longest_rally: 0,
			avg_rally: 0,
			player1_points: 0,
			player2_points: 0
		}
  
		this.isDataReady = true;
		}
		catch (error) {
			alert(`${this.t('data_fail')} ${error}`)
			console.log("PONG: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
			this.isDataReady = false;
		}
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
  
			let player2UserData = null;
			if (this.twoPlayerMode)
				player2UserData = await getOpponentData();
			else
				player2UserData = this.AIData;
  
			if (!player2UserData)
			{
				console.log("PONG: User data fetch failed.");
				return ;
			}
			
			this.player1 = new Player(player1UserData, new Paddle(BUFFER, this.canvasHeight)); //STAT
    		this.player2 = new Player(player2UserData, new Paddle(this.canvasWidth - PADDLE_WIDTH - BUFFER, this.canvasHeight)); //STAT

			this.gameStats = {
				date: new Date(),
				game_type: 'pong',
				startTime: Date.now(),
				player1_id: player1UserData.id,
				player1_rank: player1UserData.ranking_points,
				player2_id: player2UserData.id,
				player2_rank: player2UserData.ranking_points,
				game_duration: -1,
				winner_id: -1,
				longest_rally: 0,
				avg_rally: 0,
				player1_points: 0,
				player2_points: 0
			}

			this.isDataReady = true;
		}
		catch (error) {
			alert(`${this.t('data_fail')} ${error}`)
			console.log("PONG: User data fetch failed.");
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
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

  updatePlayerPositions(deltaTime: number) {
    // Player 1 movement
	if (!this.player1)
		return ;
    if (this.keysPressed[PONG_UP_1]) 
      this.player1.paddle.moveUp(deltaTime);
    if (this.keysPressed[PONG_DOWN_1]) 
      this.player1.paddle.moveDown(deltaTime);

    if (this.twoPlayerMode && this.player2) {
      // Player 2 movement
      if (this.keysPressed[PONG_UP_2]) 
        this.player2.paddle.moveUp(deltaTime);
      if (this.keysPressed[PONG_DOWN_2]) 
        this.player2.paddle.moveDown(deltaTime);
    } 
    else {

		if (!this.player2)
			return ;

      if (this.ball.speedX < 0) {
        this.player1.paddle.stayInBounds(this.canvasHeight);
        this.player2.paddle.stayInBounds(this.canvasHeight);
        return ; //Prevents unnecessary calculations if the ball is moving away from the AI paddle
      }

      const now = performance.now();

      if (now - this.aiLastUpdateTime >= 1000) {
        this.aiTargetY = this.predictBallY(
          this.ball.x, this.ball.y,
          this.ball.speedX, this.ball.speedY,
          this.player2.paddle.x
        );
        this.aiLastUpdateTime = now;
      }
      // Move paddle smoothly toward predicted Y
      const paddleCenter = this.player2.paddle.y + PADDLE_HEIGHT / 2;

      if (paddleCenter < this.aiTargetY - PADDLE_SPEED * deltaTime) {
        this.player2.paddle.moveDown(deltaTime);
      } else if (paddleCenter > this.aiTargetY + PADDLE_SPEED * deltaTime) {
        this.player2.paddle.moveUp(deltaTime);
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

  updateGame(deltaTime: number) {

	if (!this.player1 || !this.player2)
		return ;

    this.updatePlayerPositions(deltaTime);
    this.ball.move(deltaTime);
    this.ball.checkCollisions(this.player1.paddle, this.player2.paddle, this.canvasHeight, this.canvasWidth);

    // Reset ball if missed and count score
    if (this.ball.x < 0) {
      this.player2.score++;
      if (this.player2.score === WINNING_SCORE) {
        this.state = 'result';
        this.averageRally = this.ball.totalHits / this.ball.pointsPlayed;
        this.winner = this.player2;
        this.duration = performance.now() - this.startTime;
      }
      this.ball.reset(this.twoPlayerMode, this.canvasWidth, this.canvasHeight);
    }

    if (this.ball.x > this.canvasWidth) {
      this.player1.score++;
      if (this.player1.score === WINNING_SCORE) {
        this.state = 'result';
        this.averageRally = this.ball.totalHits / this.ball.pointsPlayed;
        this.winner = this.player1;
        this.duration = performance.now() - this.startTime;
      }
      this.ball.reset(this.twoPlayerMode, this.canvasWidth, this.canvasHeight);
    }
  }

  update(deltaTime: number) {
		if (this.state === 'playing')
			this.updateGame(deltaTime);
  }


	async saveUserDataToDB(winner: User)
	{
		if (!this.gameStats || !this.player1 || !this.player2 || !this.player1.user || !this.player2.user)
			return ;

		this.gameStats.winner_id = winner.id;

		this.savingDataToDB = true;

		try {
			await UserManager.updateUserStats(this.player1.user, this.player2.user, this.gameStats);
		} catch (error){

			alert(`${this.t('saving_failed')} ${error}`);
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
			this.savingDataToDB = false;
			return ;
		}

		this.saveReady = true;
	}

	async saveTournamentGameDataToDB(winner: User)
	{
		if (!this.gameStats || !this.player1 || !this.player2 || !this.player1.user || !this.player2.user)
			return ;

		this.gameStats.winner_id = winner.id;
		this.savingDataToDB = true;

		try {

			await recordTournamentMatchResult(this.player1.user, this.player2.user, this.gameStats);
			this.isStateReady = true;

		} catch (error) {

			alert(`${this.t('saving_failed')} ${error}`);
			global_stateManager.changeState(new StartScreen(this.canvas, this.ctx, this.t));
			this.savingDataToDB = false;
			return ;
		}

		this.saveReady = true;
	}

  drawResult() {

	if (!this.player1 || !this.player2 || !this.gameStats)
			return ;

	const p1 = this.player1.user;
	const p2 = this.player2.user;

	// AI ending
	if (!this.twoPlayerMode)
	{
		if (this.winner === this.player1)
			global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, p1.id, p2.id, GameType.PONG_AI, false, this.AIData, this.t));
		else if (this.winner === this.player2)
			global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, p2.id, p1.id, GameType.PONG_AI, false, this.AIData, this.t));

		return ;
	}

	this.gameStats.game_duration = (Date.now() - this.gameStats.startTime) / 1000; // in seconds
	this.gameStats.avg_rally = this.averageRally;
	this.gameStats.longest_rally = this.ball.longestRally;
	this.gameStats.player1_points = this.player1.score;
	this.gameStats.player2_points = this.player2.score;

    // Tournament ending
    if (this.tournamentData1 && this.tournamentData2)
    {
		if (!this.savingDataToDB)
		{
			if (this.winner === this.player1)
			{
				this.saveTournamentGameDataToDB(this.tournamentData1.user);
			}
			else if (this.winner === this.player2)
			{
				this.saveTournamentGameDataToDB(this.tournamentData2.user);
			}
		}

		return ;
    }

    // Regular ending
	if (!this.savingDataToDB && this.winner)
	{
		this.saveUserDataToDB(this.winner.user);
		return ;
	}

    if (this.saveReady)
    {
      if (this.winner === this.player1)
        global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, p1.id, p2.id, GameType.PONG, false, null, this.t));
      else if (this.winner === this.player2)
        global_stateManager.changeState(new EndScreen(this.canvas, this.ctx, p2.id, p1.id, GameType.PONG, false, null, this.t));
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

    if (this.state === 'result') {
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
