
export enum GameStates
{
	START_SCREEN,
	MAIN_MENU,
	INSTRUCTIONS,
	USER_HUB,
	MATCH_INTRO,
	IN_GAME,
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
}


// GAME STATE INTERFACE

export interface IGameState {
	name: GameStates;
    enter(): void;
    exit(): void;
    update(deltaTime: number): void;
    render(ctx: CanvasRenderingContext2D): void;
}
