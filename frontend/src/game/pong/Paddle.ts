import { User } from "../../UI/UserManager";
import { ctx } from "../../components/Canvas";
import { CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_SPEED } from "./Pong";

export class Paddle {
    y: number;
  
    constructor(public x: number) {
      this.y = (CANVAS_HEIGHT - PADDLE_HEIGHT) / 2;
    }
  
    moveUp() {
      this.y -= PADDLE_SPEED;
    }
  
    moveDown() {
      this.y += PADDLE_SPEED;
    }
  
    stayInBounds() {
      this.y = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, this.y));
    }
  
    draw() {
      ctx.fillStyle = 'white';
      ctx.fillRect(this.x, this.y, PADDLE_WIDTH, PADDLE_HEIGHT);
    }
  }
  
  export class Player {
    constructor(public user: User, public paddle: Paddle, public score: number = 0) {}
  }