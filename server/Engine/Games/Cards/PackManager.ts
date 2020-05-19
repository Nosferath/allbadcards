import {CardPack, GameItem, ICardPackDefinition, ICardTypes, ICustomCardPack, ICustomPackDataInput} from "../Game/GameContract";
import {loadFileAsJson} from "../../../Utils/FileUtils";
import {CardCastConnector} from "../Game/CardCastConnector";
import shortid from "shortid";
import {Database} from "../../../DB/Database";
import {packInputToPackDef} from "../../../Utils/PackUtils";
import {AuthCookie} from "../../Auth/AuthCookie";
import {Request} from "express";

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
		return defs.reduce((acc, cardVal, cardIndex) =>
		{
			acc[cardIndex] = {
				cardIndex,
				packId
			};

			return acc;
		}, {} as CardPack);
	}

	public async getCustomPack(packId: string)
	{
		return await Database.collections.packs.findOne({
			["definition.pack.id"]: packId
		});
	}

	public async upsertPack(req: Request, packInput: ICustomPackDataInput)
	{
		const storedUserData = AuthCookie.get(req);
		if(!storedUserData || !storedUserData.userId)
		{
			throw new Error("Not logged in!");
		}

		let existingPack: ICustomCardPack | null = null;
		if (packInput.id)
		{
			existingPack = await this.getCustomPack(packInput.id);

			if(existingPack && storedUserData.userId !== existingPack.owner)
			{
				throw new Error("You don't have permission to update this pack");
			}
		}

		const packDefFromInput = packInputToPackDef(packInput);

		const now = new Date();
		const toSave: ICustomCardPack = {
			packId: existingPack?.packId ?? shortid(),
			owner: storedUserData.userId,
			definition: packDefFromInput,
			dateCreated: existingPack?.dateCreated ?? now,
			dateUpdated: now,
			isNsfw: packInput.isNsfw,
			isPublic: packInput.isPublic
		};

		await Database.collections.packs.updateOne({
			id: toSave.packId
		}, {
			$set: toSave
		}, {
			upsert: true
		});

		return toSave;
	}
}

export const PackManager = new _PackManager();