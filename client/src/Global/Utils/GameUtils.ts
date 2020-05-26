import {ArrayUtils} from "./ArrayUtils";
import {CardId} from "../Platform/Contract";
import {GameDataStorePayload} from "../DataStore/GameDataStore";

export const cardDefsLoaded = (gameData: GameDataStorePayload) => {

	const playedCards = Object.values(gameData.game?.roundCards ?? {});
	const loadableCards = ArrayUtils.flatten<CardId>(playedCards).filter(c => !c.customInput);
	const loadedCardIds = Object.keys(gameData.roundCardDefs);

	return playedCards.length === 0 || loadedCardIds.length === loadableCards.length;
};