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

	public static calculateSuggestedRoundsToWin(newGame: GameItem, modifySuggestedRounds: boolean)
	{
		const playerGuids = Object.keys(newGame.players);

		const mostRoundsWon = playerGuids.reduce((acc, guid) => {
			if(newGame.players[guid].wins > acc)
			{
				acc = newGame.players[guid].wins;
			}

			return acc;
		}, 0);

		const minSuggestedRoundsToWin = Math.ceil(32 / playerGuids.length);
		const suggestedRoundsToWin = Math.max(
			minSuggestedRoundsToWin,
			modifySuggestedRounds
				? mostRoundsWon + 1
				: minSuggestedRoundsToWin
		);

		return Math.min(Math.max(4, suggestedRoundsToWin), 7);
	}
}