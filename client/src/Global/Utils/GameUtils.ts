import {ArrayUtils} from "./ArrayUtils";
import {CardId} from "../Platform/Contract";
import {GameDataStorePayload} from "../DataStore/GameDataStore";

export const cardDefsLoaded = (gameData: GameDataStorePayload) => {

	const playedCards = Object.values(gameData.game?.roundCards ?? {});
	const loadableCards = ArrayUtils.flatten<CardId>(playedCards).filter(c => !c.customInput);
	const loadedCards = Object.values(gameData.roundCardDefs).length > 0;

	return playedCards.length === 0 || loadedCards || loadableCards.length === 0;
};