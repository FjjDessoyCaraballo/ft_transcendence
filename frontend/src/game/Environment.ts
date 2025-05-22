import { FLOOR_THICKNESS, WALL_THICKNESS} from "./Constants";

export interface GameArea {
	minX: number;
	maxX: number;
	maxY: number;
  }
  

export function drawGround(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D){
	ctx.fillStyle = '#5d4863';
    ctx.fillRect(0, canvas.height - FLOOR_THICKNESS, canvas.width, FLOOR_THICKNESS);
}

export function drawWalls(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D){
	ctx.fillStyle = '#5d4863';

    ctx.fillRect(0, 0, WALL_THICKNESS, canvas.height);
	ctx.fillRect(canvas.width - WALL_THICKNESS, 0, WALL_THICKNESS, canvas.height);
}