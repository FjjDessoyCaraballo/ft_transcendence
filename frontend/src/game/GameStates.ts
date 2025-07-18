import { TFunction } from 'i18next';

export enum GameStates
{
	START_SCREEN,
	MAIN_MENU,
	INSTRUCTIONS,
	USER_HUB,
	MATCH_INTRO,
	BLOCK_BATTLE,
    PONG,
	TOURNAMENT_INTRO,
	TOURNAMENT,
	END_SCREEN
};

// STATE HANDLER

export class GameStateManager {
    private currentState: IGameState | null = null;

    changeState(newState: IGameState): void 
	{
        if (this.currentState) {
            this.currentState.exit();
        }
        
        this.currentState = newState;
        this.currentState.enter();
    }

    update(deltaTime: number): void 
	{
        if (this.currentState) {
            this.currentState.update(deltaTime);
        }
    }

    render(ctx: CanvasRenderingContext2D): void 
	{
        if (this.currentState) {
            this.currentState.render(ctx);
        }
    }

	getStateName(): GameStates | null
	{
		if (!this.currentState)
			return null;
		else
			return this.currentState.name;
	}

	getLoggedInStatus(): boolean
	{
		if (!this.currentState)
			return false;

		return this.currentState.isLoggedIn;
	}

	setLoggedInStatus(newStatus: boolean): void
	{
		if (!this.currentState)
			return ;

		this.currentState.isLoggedIn = newStatus; 
	}

}


// GAME STATE INTERFACE

export interface IGameState {
	name: GameStates;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	isLoggedIn: boolean;
    enter(): void;
    exit(): void;
    update(deltaTime: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
