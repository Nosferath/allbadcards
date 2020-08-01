import {CardPack, GameItem, ICardPackDefinition, ICardPackSummary, ICardTypes, ICustomCardPack, ICustomPackDataInput, ICustomPackSearchResult, PackFavorites} from "../Game/GameContract";
import {loadFileAsJson} from "../../../../Utils/FileUtils";
import {CardsDatabase} from "../../Database/CardsDatabase";
import {packInputToPackDef} from "../../../../Utils/PackUtils";
import {AuthCookie} from "../../../../Shared/Auth/AuthCookie";
import {Request} from "express";
import {FilterQuery} from "mongodb";
import levenshtein from "js-levenshtein";
import {getFirstLastLetter} from "./CardUtils";
import {BackerType} from "../../../../../client/src/Global/Platform/Contract";

class _PackManager
{
	public static Instance = new _PackManager();

	public packTypeDefinition: ICardTypes;
	public packs: { [key: string]: ICardPackDefinition } = {};
	public officialPackWhiteCards: { [firstlast: string]: string[] } = {};
	public officialPackBlackCards: { [firstlast: string]: string[] } = {};

	constructor()
	{
	}

	public initialize()
	{
		this.packTypeDefinition = loadFileAsJson<ICardTypes>("./server/data/types.json");

		const officialPacks: { [key: string]: ICardPackDefinition } = {};

		this.packTypeDefinition.types.forEach(type =>
		{
			type.packs.forEach(packForType =>
			{
				this.packs[packForType] = loadFileAsJson<ICardPackDefinition>(`./server/data/${type.id}/packs/${packForType}.json`);

				if (type.id === "official")
				{
					officialPacks[packForType] = this.packs[packForType];
				}
			});
		});

		this.getApprovedCustomPacks().forEach(async (pack) =>
		{
			const customPack = await this.getCustomPack(pack.packId);
			if (customPack)
			{
				this.packs[pack.packId] = customPack.definition;
			}
		});

		Object.values(officialPacks)
			.forEach(pack =>
			{
				pack.black.forEach(bc =>
				{
					const fl = getFirstLastLetter(bc.content);
					if (!this.officialPackBlackCards[fl])
					{
						this.officialPackBlackCards[fl] = [];
					}

					this.officialPackBlackCards[fl].push(bc.content);
				});

				pack.white.forEach(wc =>
				{
					const fl = getFirstLastLetter(wc);
					if (!this.officialPackWhiteCards[fl])
					{
						this.officialPackWhiteCards[fl] = [];
					}

					this.officialPackWhiteCards[fl].push(wc);
				});
			});
	}

	public async getPack(packId: string)
	{
		let pack: ICardPackDefinition | null = null;

		const isCustom = !(packId in PackManager.packs);
		if (isCustom)
		{
			const foundPack = await this.getCustomPack(packId);
			if (foundPack)
			{
				pack = foundPack.definition;
			}
		}
		else
		{
			pack = PackManager.packs[packId];
		}

		if (!pack)
		{
			throw new Error(`Could not find pack with ID '${packId}'`);
		}

		return pack;
	}

	public getPacksForGame(gameItem: GameItem)
	{
		return [...gameItem.settings.includedPacks, ...gameItem.settings.includedCustomPackIds];
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
		return await CardsDatabase.collections.packs.findOne({
			["definition.pack.id"]: packId
		});
	}

	public async upsertPack(req: Request | undefined, packInput: ICustomPackDataInput, force = false)
	{
		if (!req && !force)
		{
			throw new Error("Must specify force=true if request is not provided");
		}

		const storedUserData = AuthCookie.get(req);
		if (!force)
		{
			if (!storedUserData || !storedUserData.userId)
			{
				throw new Error("Not logged in!");
			}
		}

		let existingPack: ICustomCardPack | null = null;
		if (packInput.id)
		{
			existingPack = await this.getCustomPack(packInput.id);

			if (!force)
			{
				if (existingPack && storedUserData.userId !== existingPack.owner)
				{
					throw new Error(`You don't have permission to update pack: ${existingPack.packId}`);
				}
			}
		}

		const packDefFromInput = packInputToPackDef(packInput);

		if (!force)
		{
			this.checkPackValidity(packDefFromInput);
		}

		const now = new Date();
		const toSave: ICustomCardPack = {
			packId: packDefFromInput.pack.id,
			owner: existingPack?.owner ?? storedUserData?.userId ?? "",
			definition: packDefFromInput,
			dateCreated: existingPack?.dateCreated ?? now,
			dateUpdated: now,
			isNsfw: packInput.isNsfw,
			isPublic: packInput.isPublic,
			categories: packInput.categories,
			favorites: existingPack?.favorites ?? 0
		};

		await CardsDatabase.collections.packs.updateOne({
			id: toSave.packId
		}, {
			$set: toSave
		}, {
			upsert: true
		});

		return toSave;
	}

	private checkPackValidity(packDef: ICardPackDefinition)
	{
		if (packDef.pack.name.match(/(cards against|against humanity|humanity|cah|party game|horrible people|concert)/gi))
		{
			throw new Error(`The pack name you chose may contain trademarked material. Please change it.`);
		}

		packDef.white.forEach((w1, w1i) =>
		{
			// If it's one or two words, we can ignore the test
			const wordCount = w1.split(" ").length;
			if (wordCount > 2)
			{
				const fl = getFirstLastLetter(w1);
				const matchingCards = this.officialPackWhiteCards[fl] ?? [];

				matchingCards.forEach(w2 =>
				{
					if (levenshtein(w2, w1) < w2.length / 4)
					{
						throw new Error(`Response with value "${w1}" (ID: ${w1i + 1}) cannot be saved as it contains copyrighted content.`)
					}
				});
			}
		});

		packDef.black.forEach((b1, b1i) =>
		{
			const fl = getFirstLastLetter(b1.content);
			const matchingCards = this.officialPackBlackCards[fl] ?? [];

			matchingCards.forEach(b2 =>
			{
				if (levenshtein(b2, b1.content) < b2.length / 4)
				{
					throw new Error(`Prompt with value "${b1.content}" (ID: ${b1i + 1}) cannot be saved as it contains copyrighted content.`)
				}
			});
		});
	}

	public async deletePack(req: Request | undefined, packId: string, force = false)
	{
		if (!req && !force)
		{
			throw new Error("Must specify force=true if request is not provided");
		}

		const storedUserData = AuthCookie.get(req);
		if (!force)
		{
			if (!storedUserData || !storedUserData.userId)
			{
				throw new Error("Not logged in!");
			}
		}

		let existingPack: ICustomCardPack | null = null;
		if (packId)
		{
			existingPack = await this.getCustomPack(packId);

			if (!force && !storedUserData.levels.includes(BackerType.Owner))
			{
				if (existingPack && (storedUserData.userId !== existingPack.owner))
				{
					throw new Error(`You don't have permission to update pack: ${existingPack.packId}`);
				}
			}
		}

		await CardsDatabase.collections.packs.deleteOne({
			packId
		});

		return {
			success: true
		};
	}

	public async getPacks(req: Request, query: FilterQuery<ICustomCardPack>, sort: string = "newest", zeroBasedPage: number = 0, fetchAll = false): Promise<ICustomPackSearchResult>
	{
		let packsPromise = CardsDatabase.collections.packs
			.find(query);

		switch (sort)
		{
			case "favorites":
				packsPromise = packsPromise.sort({
					favorites: -1
				});
				break;
			case "newest":
				packsPromise = packsPromise.sort({dateUpdated: -1});
				break;
			case "largest":
				packsPromise = packsPromise.sort({
					"definition.quantity.total": -1
				});
				break;
			default:
				break;
		}

		if (!fetchAll)
		{
			packsPromise = packsPromise
				.skip(12 * zeroBasedPage)
				.limit(12);
		}

		const packs = await packsPromise.toArray();

		const storedUserData = AuthCookie.get(req);
		let userFavorites: PackFavorites = {};
		if (storedUserData?.userId)
		{
			const packIds = packs.map(p => p.packId);

			const favorites = await CardsDatabase.collections.packFavorites.find({
				userId: storedUserData.userId,
				packId: {
					$in: packIds
				}
			}).toArray();

			userFavorites = favorites.reduce((acc, item) =>
			{
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

	public async getMyFavoritePacks(req: Request): Promise<ICustomPackSearchResult>
	{
		const storedUserData = AuthCookie.get(req);
		if (!storedUserData?.userId)
		{
			return {
				packs: [],
				userFavorites: {},
				hasMore: false
			};
		}

		const userFavorites = await CardsDatabase.collections.packFavorites.find({
			userId: storedUserData.userId
		}).toArray();

		return await this.getPacks(req, {
			packId: {
				$in: userFavorites.map(fav => fav.packId)
			},
			isBlocked: {$ne: true}
		}, "favorites", undefined, true);
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
			owner,
			isBlocked: {$ne: true}
		});
	}

	public async addFavorite(req: Request, packId: string)
	{
		const storedUserData = AuthCookie.get(req);
		if (!storedUserData || !storedUserData.userId)
		{
			throw new Error("Not logged in!");
		}

		const result = await CardsDatabase.collections.packFavorites
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

		const result2 = await CardsDatabase.collections.packs.updateOne({
			packId
		}, {
			$inc: {
				favorites: 1
			}
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

		const result = await CardsDatabase.collections.packFavorites.deleteOne({
			packId,
			userId: storedUserData.userId
		});

		await CardsDatabase.collections.packs.updateOne({
			packId
		}, {
			$inc: {
				favorites: -1
			}
		});

		if (result.deletedCount && result.deletedCount < 1)
		{
			throw new Error("This item was not favorited!")
		}

		return;
	}

	public async getPackNames(which: "all" | "official" | "thirdParty" | "family" = "all")
	{
		let packIds: string[];
		switch (which)
		{
			case "all":
				packIds = PackManager.packTypeDefinition.types.reduce((acc, type) =>
				{
					acc.push(...type.packs);
					return acc;
				}, [] as string[]);
				break;
			case "official":
				packIds = [...PackManager.packTypeDefinition.types[0].packs];
				break;
			case "thirdParty":
				packIds = [...PackManager.packTypeDefinition.types[1].packs];
				packIds.unshift(...PackManager.getApprovedCustomPacks().map(c => c.packId));
				break;
			case "family":
				packIds = ["family_edition", "DcaImc6UC"];
				break;
			default:
				throw new Error("No pack type " + which + " exists!");
		}

		const packs = await Promise.all(
			packIds.map(packId =>
			{
				return new Promise<ICardPackSummary>(async (resolve) =>
				{
					const packDef = PackManager.packs[packId] ?? await this.getCustomPack(packId);

					resolve({
						name: packDef.pack.name,
						quantity: packDef.quantity,
						isOfficial: PackManager.packTypeDefinition.types[0].packs.includes(packId),
						packId
					} as ICardPackSummary);
				});
			})
		);

		return packs;
	}

	public getApprovedCustomPacks()
	{
		const customDefaults: ICardPackSummary[] = [
			{
				packId: "pPwmQe1ME",
				isOfficial: false,
				name: "All Bad Cards - Official Pack 1",
				quantity: {
					black: 50,
					white: 197,
					total: 247
				}
			},
			{
				packId: "DcaImc6UC",
				isOfficial: false,
				name: "All Bad Cards - Official Family Edition",
				quantity: {
					black: 38,
					white: 179,
					total: 38 + 179
				}
			}
		];

		return customDefaults;
	}

	public getDefaultPacks(packs: ICardPackSummary[])
	{
		const thirdPartyDefaults = packs.filter(a =>
			!a.packId.match(/toronto|knit|colorado|kentucky|texas|hombres|corps|insanity/gi)
		);

		return [...thirdPartyDefaults].map(p => p.packId);
	}
}

export const PackManager = new _PackManager();