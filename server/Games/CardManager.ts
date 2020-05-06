import fs from "fs";
import * as path from "path";
import {CardId, GameItem, ICardPackDefinition, ICardTypes, CardPackMap} from "./Contract";
import {CardCastConnector} from "./CardCastConnector";
import deepEqual from "deep-equal";
import cloneDeep from "clone-deep";

export class CardManager
{
	public static packTypeDefinition: ICardTypes;
	public static packs: { [key: string]: ICardPackDefinition } = {};

	public static initialize()
	{
		const typesPath = path.resolve(process.cwd(), "./server/data/types.json");
		const typesFile = fs.readFileSync(typesPath, "utf8");
		this.packTypeDefinition = JSON.parse(typesFile) as ICardTypes;

		this.packTypeDefinition.types.forEach(type =>
		{
			type.packs.forEach(packForType =>
			{
				const packPath = path.resolve(process.cwd(), `./server/data/${type.id}/packs/${packForType}.json`);
				const packFile = fs.readFileSync(packPath, "utf8");
				const packDef = JSON.parse(packFile) as ICardPackDefinition;
				this.packs[packForType] = packDef;
			});
		});
	}

	private static getAllowedCard(allowedCards: CardPackMap, usedCards: CardPackMap): CardId
	{
		const packKeys = Object.keys(allowedCards);
		const validPacksIds = packKeys.filter(k => {
			const totalPackCards = Object.keys(allowedCards[k]).length;
			const usedPackCards = Object.keys(usedCards[k] ?? {}).length;
			return usedPackCards < totalPackCards;
		});
		const randomPack = Math.floor(Math.random() * validPacksIds.length);
		const chosenPackId = validPacksIds[randomPack];
		const pack = allowedCards[chosenPackId];
		const allowedPackCards = Object.keys(pack)
			.filter(cardIndex => !Object.keys(usedCards[chosenPackId] ?? {}).includes(cardIndex));
		const index = Math.floor(Math.random() * allowedPackCards.length);
		const chosenCardIndex = parseInt(allowedPackCards[index]);

		return {
			packId: chosenPackId,
			cardIndex: chosenCardIndex
		};
	}

	public static async nextBlackCard(gameItem: GameItem)
	{
		let allowedCards: CardPackMap = {};
		const includedPacks = [...gameItem.settings.includedPacks, ...gameItem.settings.includedCardcastPacks];
		for (let packId of includedPacks)
		{
			const pack = await CardManager.getPack(packId);
			const cardMap = pack.black.reduce((acc, cardVal, cardIndex) => {
				acc[cardIndex] = {
					cardIndex,
					packId
				};

				return acc;
			}, {} as {[cardIndex: number]: CardId});

			allowedCards[packId] = cardMap;
		}

		const newCard = this.getAllowedCard(allowedCards, gameItem.usedBlackCards);

		const newGame = cloneDeep(gameItem);
		newGame.blackCard = newCard;
		newGame.usedBlackCards[newCard.packId] = newGame.usedBlackCards[newCard.packId] ?? {};
		newGame.usedBlackCards[newCard.packId][newCard.cardIndex] = newCard;

		return newGame;
	}

	public static async dealWhiteCards(gameItem: GameItem)
	{
		if(gameItem.settings.customWhites)
		{
			return gameItem;
		}

		const newGame = cloneDeep(gameItem);

		let usedWhiteCards: CardPackMap = {...gameItem.usedWhiteCards};

		const playerKeys = Object.keys(gameItem.players);

		let allWhiteCards = gameItem.settings.includedPacks.reduce((acc, packId) =>
		{
			const packCount = this.packs[packId].white.length;
			acc += packCount;
			return acc;
		}, 0);

		if (gameItem.settings.includedCardcastPacks.length > 0)
		{
			for (let packId of gameItem.settings.includedCardcastPacks)
			{
				const pack = await CardCastConnector.getDeck(packId);
				const whiteCardsForPack = pack.white;
				allWhiteCards += whiteCardsForPack.length;
			}
		}

		const usedWhiteCardCount = Object.keys(usedWhiteCards).reduce((acc, packId) => {
			acc += Object.keys(usedWhiteCards[packId]).length;
			return acc;
		}, 0);

		const availableCardRemainingCount = allWhiteCards - usedWhiteCardCount;

		// If we run out of white cards, reset them
		if (availableCardRemainingCount < playerKeys.length)
		{
			usedWhiteCards = {};
		}

		const blackCardPack = await CardManager.getPack(gameItem.blackCard.packId);
		const blackCard = blackCardPack.black[gameItem.blackCard.cardIndex];
		const pick = blackCard.pick;

		// Assume the hand size is 10. If pick is more than 1, pick that many more.
		const targetHandSize = 10 + (pick - 1);

		let allowedCards: CardPackMap = {};
		const includedPacks = [...gameItem.settings.includedPacks, ...gameItem.settings.includedCardcastPacks];
		for (let packId of includedPacks)
		{
			const pack = await CardManager.getPack(packId);
			const cardMap = pack.white.reduce((acc, cardVal, cardIndex) => {
				acc[cardIndex] = {
					cardIndex,
					packId
				};

				return acc;
			}, {} as {[cardIndex: number]: CardId});

			allowedCards[packId] = cardMap;
		}

		playerKeys.forEach(playerGuid =>
		{
			const cards = [...gameItem.players[playerGuid].whiteCards];

			while (cards.length < targetHandSize)
			{
				const newCard = this.getAllowedCard(allowedCards, usedWhiteCards);
				usedWhiteCards[newCard.packId] = usedWhiteCards[newCard.packId] ?? {};
				usedWhiteCards[newCard.packId][newCard.cardIndex] = newCard;

				cards.push(newCard);
			}

			newGame.players[playerGuid].whiteCards = cards;
		});

		newGame.usedWhiteCards = usedWhiteCards;

		return newGame;
	}

	public static async getWhiteCard(cardId: CardId)
	{
		const pack = await CardManager.getPack(cardId.packId);
		return pack.white[cardId.cardIndex];
	}

	public static async getBlackCard(cardId: CardId)
	{
		const pack = await CardManager.getPack(cardId.packId);
		return pack.black[cardId.cardIndex];
	}

	private static async getPack(packId: string)
	{
		const isCardCast = !(packId in this.packs);
		if (isCardCast)
		{
			return await CardCastConnector.getDeck(packId);
		}
		else
		{
			return this.packs[packId];
		}
	}
}