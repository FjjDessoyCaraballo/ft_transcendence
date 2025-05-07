// this is our header for defining interfaces and types

export interface User
{
	id: number;
	name: string;
	email: string;
}

export enum UserHubState
{
	INFO,
	SINGLE_GAME,
	TOURNAMENT
}

export enum GameType
{
	PONG,
	BLOCK_BATTLE
}
