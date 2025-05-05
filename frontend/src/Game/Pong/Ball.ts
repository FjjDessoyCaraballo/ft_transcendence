import { canvasWidth, canvasHeight, paddleHeight, paddleWidth, ballSize } from "./Pong";
import { Paddle } from "./Paddle";
import { ctx } from "../../components/Canvas";

export class Ball {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  rallyLen: number = 0;
  longestRally: number = 0;

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
        this.rallyLen++;
        console.log('rallyLen =', this.rallyLen);
        const hitPos = (this.y + ballSize / 2) - (player1.y + paddleHeight / 2);
        const normalized = hitPos / (paddleHeight / 2); // -1 (top) to 1 (bottom)
      
        const bounceAngle = normalized * Math.PI / 4; // Max 45 degree angle
        const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2); // keep same speed
      
        this.speedX = Math.cos(bounceAngle) * speed;
        this.speedY = Math.sin(bounceAngle) * speed;
      
        // Make sure ball is moving right
        if (this.speedX < 0) 
          this.speedX *= -1;
    }

    // Player 2 paddle collision
    if (this.x + ballSize >= canvasWidth - paddleWidth - 15 &&
      this.y + ballSize >= player2.y &&
      this.y <= player2.y + paddleHeight) {
        this.rallyLen++;
        console.log('rallyLen =', this.rallyLen);
        const hitPos = (this.y + ballSize / 2) - (player2.y + paddleHeight / 2);
        const normalized = hitPos / (paddleHeight / 2);
      
        const bounceAngle = normalized * Math.PI / 4;
        const speed = Math.sqrt(this.speedX ** 2 + this.speedY ** 2);
      
        this.speedX = -Math.cos(bounceAngle) * speed; // reflected to left
        this.speedY = Math.sin(bounceAngle) * speed;
      
        if (this.speedX > 0) 
          this.speedX *= -1;
    }
  }

  reset() {
    //console.log("Ball reset");
    if (this.rallyLen > this.longestRally)
      this.longestRally = this.rallyLen;
    console.log('longestRally =', this.longestRally);
    this.rallyLen = 0;
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