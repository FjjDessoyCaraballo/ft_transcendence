import { User } from "../../UI/UserManager";
import { ctx } from "../../components/Canvas";
import { canvasHeight, paddleHeight, paddleWidth } from "./Pong";

export class Paddle {
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
  
  export class Player {
    constructor(public user: User, public paddle: Paddle, public score: number = 0) {}
  }