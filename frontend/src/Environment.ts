import { FLOOR_THICKNESS, WALL_THICKNESS, PLATFORM_THICKNESS, PLATFORM_SPEED, } from "./constants";
import { canvas } from "./index";

interface GameArea {
	minX: number;
	maxX: number;
	maxY: number;
  }
  
export let gameArea: GameArea;
window.onload = () => {
	// Initialize gameArea only after canvas is fully ready
	gameArea = {
	  minX: WALL_THICKNESS,
	  maxX: canvas.width - WALL_THICKNESS,
	  maxY: canvas.height - FLOOR_THICKNESS
	};
};
  

export function drawGround(ctx: CanvasRenderingContext2D){
	ctx.fillStyle = 'orange';
    ctx.fillRect(0, canvas.height - FLOOR_THICKNESS, canvas.width, FLOOR_THICKNESS);
}

export function drawWalls(ctx: CanvasRenderingContext2D){
	ctx.fillStyle = 'orange';

    ctx.fillRect(0, 0, WALL_THICKNESS, canvas.height);
	ctx.fillRect(canvas.width - WALL_THICKNESS, 0, WALL_THICKNESS, canvas.height);
}