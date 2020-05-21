import {GameItem, PlayerMap} from "./GameContract";
import deepEqual from "deep-equal";

export class Game
{
	private _cachedPlayerGuids: string[];

	constructor(private game: GameItem)
	{
	}

	private get playerGuids()
	{
		return this._cachedPlayerGuids ?? Object.keys(this.game.players);
	}

	public get result()
	{
		return this.game;
	}

	public resetReveal()
	{
		this.game.revealIndex = -1;
	}

	public addPendingPlayers()
	{
		this.game.players = {...this.game.players, ...this.game.pendingPlayers};
		this.game.pendingPlayers = {};
	}

	public nextCzar()
	{
		const nonRandomPlayerGuids = this.playerGuids.filter(pg => !this.game.players[pg].isRandom);

		const chooserIndex = this.game.roundIndex + 1 % nonRandomPlayerGuids.length;
		let chooserGuid = nonRandomPlayerGuids[chooserIndex];

		if (this.game.settings.winnerBecomesCzar && this.game.lastWinner && !this.game.lastWinner.isRandom)
		{
			chooserGuid = this.game.lastWinner.guid;
		}

		this.game.chooserGuid = chooserGuid;
	}

	public removeUsedCardsFromPlayers()
	{
		this.game.players = this.playerGuids.reduce((acc, playerGuid) =>
		{
			const player = this.game.players[playerGuid];
			const newPlayer = {...player};
			const usedCards = this.game.roundCards[playerGuid] ?? [];
			newPlayer.whiteCards = player.whiteCards.filter(wc =>
				!usedCards.find(uc => deepEqual(uc, wc))
			);
			acc[playerGuid] = newPlayer;

			return acc;
		}, {} as PlayerMap);
	}

	public update(partial: Partial<GameItem>)
	{
		this.game = {
			...this.game,
			...partial
		};
	}
}