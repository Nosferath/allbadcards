import {ArrayUtils} from "../../../Shared/Global/Utils/ArrayUtils";
import {CardId, ClientGameItem} from "../Platform/Contract";
import {GameDataStorePayload} from "../DataStore/GameDataStore";
import sanitize from "sanitize-html";

export const cardDefsLoaded = (gameData: GameDataStorePayload) =>
{

	const playedCards = Object.values(gameData.game?.roundCards ?? {});
	const loadableCards = ArrayUtils.flatten<CardId>(playedCards).filter(c => !c.customInput);
	const loadedCards = Object.values(gameData.roundCardDefs).length > 0;

	return playedCards.length === 0 || loadedCards || loadableCards.length === 0;
};

export const getTrueRoundsToWin = (game: ClientGameItem | undefined) =>
{
	const suggested = game?.settings?.suggestedRoundsToWin ?? 7;
	const set = game?.settings?.roundsToWin;

	return set ?? suggested;
};

export const normalizeCard = (unfixed: string) =>
{
	const card = unfixed.trim();
	const capitalized = card.charAt(0).toUpperCase() + card.slice(1);
	const end = capitalized.charAt(capitalized.length - 1).match(/[a-z0-9]/i)
		? `${capitalized}.`
		: capitalized;

	return sanitize(unescape(end));
};