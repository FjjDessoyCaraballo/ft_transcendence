import { Platform } from "./Platform";
import { COIN_RADIUS } from "./Constants";

export interface Coin
{
	x: number;
	y: number;
	radius: number;
	color: string;
	onPlatform: Platform;
}

export class CoinHandler {

	private intervalId: NodeJS.Timeout | null;
	private intervalMs: number;
	private platforms: Platform[];
	coinArr: Coin [];
  
	constructor(intervalAsMilliseconds: number = 5000, platformArr: Platform []) 
	{
		this.intervalMs = intervalAsMilliseconds;
		this.intervalId = null;
		this.platforms = platformArr;
		this.coinArr = [];
	}

	spawnCoin() {

		// A loop that finds an available platform. 
		// We also need to check if all of the platforms are unavailable
		let coinPlatform = this.platforms[Math.floor(Math.random() * this.platforms.length)];

		const newCoin: Coin = {
			x: coinPlatform.x + (coinPlatform.width / 2),
			y: coinPlatform.y - COIN_RADIUS,
			radius: COIN_RADIUS,
			color: 'gold',
			onPlatform: coinPlatform
		}

		this.coinArr.push(newCoin);
	}

	renderCoins(ctx: CanvasRenderingContext2D)
	{
		// Check this AND add CheckCollision() function
		for (const coin of this.coinArr)
		{
			ctx.beginPath();
			ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
			ctx.fillStyle = 'gold';
			ctx.fill();
			ctx.stroke(); // Optional: draw the outline
		}
	}

	checkCoinCollision()
	{
		
	}
  
	start() {
	  if (this.intervalId) 
		return; // Prevent multiple timers

	  this.intervalId = setInterval(() => {
		this.spawnCoin();
	  }, this.intervalMs);
	}
  
	stop() {

	  if (this.intervalId) {
		clearInterval(this.intervalId);
		this.intervalId = null;
	  }

	}
  }