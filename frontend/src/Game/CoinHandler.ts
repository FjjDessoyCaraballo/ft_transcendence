import { Platform } from "./Platform";
import { COIN_RADIUS } from "./Constants";

export interface Coin
{
	x: number;
	y: number;
	radius: number;
	color: string;
	platform: Platform;
}

export class CoinHandler {

	intervalId: NodeJS.Timeout | null;
	private intervalMs: number;
	private platforms: Platform[];
	platformsFull: boolean;
	coinArr: Coin [];
  
	constructor(intervalAsMilliseconds: number = 5000, platformArr: Platform []) 
	{
		this.intervalMs = intervalAsMilliseconds;
		this.intervalId = null;
		this.platforms = platformArr;
		this.platformsFull = false;
		this.coinArr = [];
	}

	spawnCoin()
	{

		this.platformsFull = this.platforms.every(obj => obj.hasCoin);
		if (this.platformsFull)
		{
			console.log("Platforms are full");
			return ;
		}


		let coinPlatform: Platform = this.platforms[0];

		while (1)
		{
			// We also need to check if all of the platforms are unavailable
			coinPlatform = this.platforms[Math.floor(Math.random() * this.platforms.length)];

			if (!coinPlatform.hasCoin)
			{
				coinPlatform.hasCoin = true;				
				break ;
			}
		}


		const newCoin: Coin = {
			x: coinPlatform.x + (coinPlatform.width / 2),
			y: coinPlatform.y - COIN_RADIUS,
			radius: COIN_RADIUS,
			color: 'gold',
			platform: coinPlatform
		}

		this.coinArr.push(newCoin);

	}

	renderCoins(ctx: CanvasRenderingContext2D)
	{
		for (const coin of this.coinArr)
		{
			coin.x = coin.platform.x + (coin.platform.width / 2);
			coin.y = coin.platform.y - COIN_RADIUS;

			ctx.beginPath();
			ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
			ctx.fillStyle = 'gold';
			ctx.fill();
			// ctx.stroke(); // Optional: draw the outline
		}
	}

	checkCoinCollision()
	{
		// Check this 

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