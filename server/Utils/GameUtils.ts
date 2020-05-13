import {ClientGameItem, GameItem} from "../Engine/Games/Game/Contract";

export const serverGameToClientGame = (game: GameItem): ClientGameItem =>
{
	const {
		dateCreated,
		blackCard,
		chooserGuid,
		id,
		kickedPlayers,
		lastWinner,
		ownerGuid,
		pendingPlayers,
		playerOrder,
		players,
		revealIndex,
		roundCards,
		roundCardsCustom,
		roundIndex,
		roundStarted,
		settings,
		spectators,
		started
	} = game;

	return {
		dateCreated,
		blackCard,
		chooserGuid,
		id,
		kickedPlayers,
		lastWinner,
		ownerGuid,
		pendingPlayers,
		playerOrder,
		players,
		revealIndex,
		roundCards,
		roundCardsCustom,
		roundIndex,
		roundStarted,
		settings,
		spectators,
		started
	};
};