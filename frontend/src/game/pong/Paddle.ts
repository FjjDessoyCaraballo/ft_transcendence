import { PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_SPEED } from "./Pong";
import { User } from "../../UI/UserManager";

export class Paddle {
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
  
  export class Player {
    constructor(public user: User, public paddle: Paddle, public score: number = 0) {}
  }