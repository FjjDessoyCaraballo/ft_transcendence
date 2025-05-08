import { Platform } from "./Platform";
import { COIN_WIN_LIMIT, COIN_RADIUS } from "./Constants";
import { Player } from "./Player";

export interface Coin
{
	x: number;
	y: number;
	radius: number;
	color: string;
	platform: Platform;
	isCollected: boolean;
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
		if (this.platformsFull)
		{
			console.log("Platforms are full"); // REMOVE THIS LATER
			return ;
		}


		let coinPlatform = this.platforms[0];

		while (1)
		{
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
			platform: coinPlatform,
			isCollected: false
		};

		this.coinArr.push(newCoin);

		this.platformsFull = this.platforms.every(obj => obj.hasCoin);
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

	checkCoinCollision(player: Player)
	{
		const playerMidX = player.x + (player.width / 2);
		const playerMidY = player.y + (player.height / 2);
		const maxDist = COIN_RADIUS + player.width; // NOT ACCURATE, need to add corner points for the final check

		for (const coin of this.coinArr)
		{
			// Count the distance
			const dx = coin.x - playerMidX;
			const dy = coin.y - playerMidY;
			const curDist = Math.sqrt(dx * dx + dy * dy);

			if (curDist <= maxDist)
			{
				player.coinCount++;
				coin.isCollected = true;
				coin.platform.hasCoin = false;
				if (player.coinCount === COIN_WIN_LIMIT)
					player.hasWon = true;
			}
		}

		this.coinArr = this.coinArr.filter(coin => !coin.isCollected);

		if (this.coinArr.length != this.platforms.length && this.platformsFull)
			this.platformsFull = false;
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