import {CardPack, GameItem, ICardPackDefinition, ICardTypes, ICustomCardPack, ICustomPackDataInput, ICustomPackSearchResult, PackFavorites} from "../Game/GameContract";
import {loadFileAsJson} from "../../../Utils/FileUtils";
import {CardCastConnector} from "../Game/CardCastConnector";
import {Database} from "../../../DB/Database";
import {packInputToPackDef} from "../../../Utils/PackUtils";
import {AuthCookie} from "../../Auth/AuthCookie";
import {Request} from "express";
import {FilterQuery} from "mongodb";

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
		if (!storedUserData || !storedUserData.userId)
		{
			throw new Error("Not logged in!");
		}

		let existingPack: ICustomCardPack | null = null;
		if (packInput.id)
		{
			existingPack = await this.getCustomPack(packInput.id);

			if (existingPack && storedUserData.userId !== existingPack.owner)
			{
				throw new Error("You don't have permission to update this pack");
			}
		}

		const packDefFromInput = packInputToPackDef(packInput);

		const now = new Date();
		const toSave: ICustomCardPack = {
			packId: packDefFromInput.pack.id,
			owner: storedUserData.userId,
			definition: packDefFromInput,
			dateCreated: existingPack?.dateCreated ?? now,
			dateUpdated: now,
			isNsfw: packInput.isNsfw,
			isPublic: packInput.isPublic,
			categories: packInput.categories
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

	public async getPacks(req: Request, query: FilterQuery<ICustomCardPack>, zeroBasedPage: number = 0): Promise<ICustomPackSearchResult>
	{
		const packs = await Database.collections.packs
			.find(query)
			.sort({dateUpdated: -1})
			.skip(12 * zeroBasedPage)
			.limit(12)
			.toArray();

		const storedUserData = AuthCookie.get(req);
		let userFavorites: PackFavorites = {};
		if (storedUserData?.userId)
		{
			const packIds = packs.map(p => p.packId);

			const favorites = await Database.collections.packFavorites.find({
				userId: storedUserData.userId,
				packId: {
					$in: packIds
				}
			}).toArray();

			userFavorites = favorites.reduce((acc, item) => {
				acc[item.packId] = true;
				return acc;
			}, {} as PackFavorites);
		}

		return {
			packs,
			hasMore: packs.length === 12,
			userFavorites
		};
	}

	public async getPacksForOwner(req: Request)
	{
		const storedUserData = AuthCookie.get(req);

		const owner = storedUserData?.userId;
		if (!owner)
		{
			throw new Error("You must be logged in to get your packs");
		}

		return this.getPacks(req, {
			owner
		});
	}

	public async addFavorite(req: Request, packId: string)
	{
		const storedUserData = AuthCookie.get(req);
		if (!storedUserData || !storedUserData.userId)
		{
			throw new Error("Not logged in!");
		}

		const result = await Database.collections.packFavorites
			.updateOne({
				packId,
				userId: storedUserData.userId
			}, {
				$set: {
					packId,
					userId: storedUserData.userId
				}
			}, {
				upsert: true
			});

		if (result.upsertedCount < 1)
		{
			throw new Error("This item is already favorited!")
		}

		return;
	}

	public async removeFavorite(req: Request, packId: string)
	{
		const storedUserData = AuthCookie.get(req);
		if (!storedUserData || !storedUserData.userId)
		{
			throw new Error("Not logged in!");
		}

		const result = await Database.collections.packFavorites.deleteOne({
			packId,
			userId: storedUserData.userId
		});

		if (result.deletedCount && result.deletedCount < 1)
		{
			throw new Error("This item was not favorited!")
		}

		return;
	}
}

export const PackManager = new _PackManager();