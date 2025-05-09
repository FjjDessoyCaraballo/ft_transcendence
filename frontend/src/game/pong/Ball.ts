import { CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, BALL_SIZE, BUFFER } from "./Pong";
import { Paddle } from "./Paddle";
import { ctx } from "../../components/Canvas";

export class Ball {
  x: number = CANVAS_WIDTH / 2 - BALL_SIZE / 2 + 1.5;
  y: number = CANVAS_HEIGHT / 2;
  speedX: number = 10 * -1;
  speedY: number = 0.5 * (Math.random() > 0.5 ? 1 : -1); // 50% chance positive or negative;
  currentRallyLen: number = 0;
  totalHits: number = 0;
  longestRally: number = 0;
  pointsPlayed: number = 0;

  move() {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  checkCollisions(player1: Paddle, player2: Paddle) {
    // Ball collision with top and bottom
    if (this.y <= 0) {
      this.y = 0; // Push ball back inside. Fixes wall "hugging"
      this.speedY *= -1;
    } 
    else if (this.y + BALL_SIZE >= CANVAS_HEIGHT) {
      this.y = CANVAS_HEIGHT - BALL_SIZE; // Push ball back inside. Fixes wall "hugging"
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
    if (this.x + BALL_SIZE >= CANVAS_WIDTH - PADDLE_WIDTH - BUFFER && this.y + BALL_SIZE >= player2.y && this.y <= player2.y + PADDLE_HEIGHT) {
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

  reset(twoPlayerMode: boolean) {
    //console.log("Ball reset");
    if (this.currentRallyLen > this.longestRally)
      this.longestRally = this.currentRallyLen;
    //console.log('longestRally =', this.longestRally);
    this.totalHits += this.currentRallyLen;
    //console.log('totalHits =', this.totalHits);
    this.pointsPlayed++;
    //console.log('pointsPlayed =', this.pointsPlayed);
    this.currentRallyLen = 0;
    this.x = CANVAS_WIDTH / 2 - BALL_SIZE / 2 + 1.5;
    this.y = CANVAS_HEIGHT / 2;
  
    // Pause the ball temporarily
    this.speedX = 0;
    this.speedY = 0;
  
    setTimeout(() => {
      if (twoPlayerMode) {
        this.speedX = 10 * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = 0.5 * (Math.random() > 0.5 ? 1 : -1);
      }
      else {
        this.speedX = 10 * -1;
        this.speedY = 0.5 * (Math.random() > 0.5 ? 1 : -1);
      }
    }, 1000); // 1000ms = 1 second delay
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x, this.y, BALL_SIZE, BALL_SIZE);
  }
}