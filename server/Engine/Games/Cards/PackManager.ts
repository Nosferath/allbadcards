import {CardPack, GameItem, ICardPackDefinition, ICardTypes} from "../Game/Contract";
import {loadFileAsJson} from "../../../Utils/FileUtils";
import {CardCastConnector} from "../Game/CardCastConnector";

class _PackManager
{
	public static Instance = new _PackManager();

	public packTypeDefinition: ICardTypes;
	public packs: { [key: string]: ICardPackDefinition } = {};

	constructor()
	{
		this.initialize();
	}

	private initialize()
	{
		this.packTypeDefinition = loadFileAsJson<ICardTypes>("./server/data/types.json");

		this.packTypeDefinition.types.forEach(type =>
		{
			type.packs.forEach(packForType =>
			{
				this.packs[packForType] = loadFileAsJson<ICardPackDefinition>(`./server/data/${type.id}/packs/${packForType}.json`);
			});
		});
	}

	public async getPack(packId: string)
	{
		const isCardCast = !(packId in PackManager.packs);
		if (isCardCast)
		{
			return await CardCastConnector.getDeck(packId);
		}
		else
		{
			return PackManager.packs[packId];
		}
	}

	public getPacksForGame(gameItem: GameItem)
	{
		return [...gameItem.settings.includedPacks, ...gameItem.settings.includedCardcastPacks];
	}

	public definitionsToCardPack<T>(packId: string, defs: T[])
	{
		return defs.reduce((acc, cardVal, cardIndex) => {
			acc[cardIndex] = {
				cardIndex,
				packId
			};

			return acc;
		}, {} as CardPack);
	}
}

export const PackManager = new _PackManager();