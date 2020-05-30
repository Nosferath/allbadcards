import {GameItem} from "./GameContract";

export class Game
{
	public static setPlayerIdle(game: GameItem, playerGuid: string, idle: boolean)
	{
		if (game.players[playerGuid])
		{
			game.players[playerGuid].isIdle = idle
		}

		if (game.pendingPlayers[playerGuid])
		{
			game.pendingPlayers[playerGuid].isIdle = idle
		}

		return game;
	}
}