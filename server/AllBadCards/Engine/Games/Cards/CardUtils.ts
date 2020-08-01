import {CardId, CardPackMap} from "../Game/GameContract";

export const getAllCardsInPackMap = (map: CardPackMap) =>
{
	return Object.values(map).reduce((acc: CardId[], packCardMap) =>
	{
		const packCards = Object.values(packCardMap);
		acc.push(...packCards);
		return acc;
	}, []);
};

export const cardPackMapToHashTable = (map: CardPackMap): { [cardPackIndex: string]: CardId } =>
{
	return Object.values(map).reduce((acc: { [cardPackIndex: string]: CardId }, packCardMap) =>
	{
		Object.keys(packCardMap).forEach(cardIndex =>
		{
			const card = packCardMap[parseInt(cardIndex)];
			acc[cardPackIndex(card)] = card;
		});
		return acc;
	}, {});
};

export const cardPackIndex = (card: CardId) => `${card.packId}:${card.cardIndex}`;

export const getCardPackMapCount = (map: CardPackMap) => {
	return Object.keys(map).reduce((acc, packId) =>
	{
		acc += Object.keys(map[packId]).length;
		return acc;
	}, 0);
};

export const getFirstLastLetter = (content: string) => {
	const letters = content.replace(/[^a-z0-9:]/gi, "");
	const fl = letters[0] + letters.charAt(letters.length - 1);

	return fl.toLowerCase();
};