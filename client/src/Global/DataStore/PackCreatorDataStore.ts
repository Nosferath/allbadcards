import {DataStore} from "./DataStore";
import {Platform} from "../Platform/platform";
import {ErrorDataStore} from "./ErrorDataStore";
import {ICardPackDefinition, ICustomCardPack, PackCategories} from "../Platform/Contract";
import {ValuesOf} from "../../../../server/Engine/Games/Game/GameContract";

export interface PackCreatorDataStorePayload
{
	ownerId: string | null;
	packId: string | null;
	packName: string;
	blackCards: string[];
	whiteCards: string[];
	blackCardErrors: { [index: number]: boolean };
	whiteCardErrors: { [index: number]: boolean };
	isEdited: boolean;
	isNsfw: boolean;
	isPublic: boolean;
	categories: ValuesOf<typeof PackCategories>[];
}

class _PackCreatorDataStore extends DataStore<PackCreatorDataStorePayload>
{
	private static InitialState: PackCreatorDataStorePayload = {
		ownerId: null,
		packId: null,
		packName: "",
		whiteCards: [],
		blackCards: [],
		blackCardErrors: [],
		whiteCardErrors: [],
		isEdited: false,
		isNsfw: true,
		isPublic: true,
		categories: []
	};

	public static Instance = new _PackCreatorDataStore(_PackCreatorDataStore.InitialState);

	public hydrate(id: string)
	{
		return Platform.getPack(id, true)
			.then(data =>
			{
				this.update({
					ownerId: data.owner,
					packId: data.definition.pack.id,
					isNsfw: data.isNsfw,
					isPublic: data.isPublic,
					whiteCards: data.definition.white,
					blackCards: data.definition.black.map(bc => bc.content),
					packName: data.definition.pack.name,
					isEdited: false,
					blackCardErrors: [],
					whiteCardErrors: [],
					categories: data.categories
				})
			})
			.catch(ErrorDataStore.add);
	}

	public hydrateFromData(pack: Partial<ICardPackDefinition>)
	{
		const blackCards = pack.black?.map(bc => bc.content) ?? [];
		const allBlack = [...this.state.blackCards, ...blackCards];
		const allWhite = [...this.state.whiteCards, ...(pack.white ?? [])];

		this.update({
			blackCards: allBlack,
			whiteCards: allWhite,
			packName: pack?.pack?.name ?? ""
		})
	}

	public reset()
	{
		this.update(_PackCreatorDataStore.InitialState);
	}

	public addBlackCard = () =>
	{
		this.update({
			isEdited: true,
			blackCards: [...this.state.blackCards, ""]
		});
	};

	public editBlackCard = (index: number, value: string) =>
	{
		const newCards = this.state.blackCards;
		newCards[index] = value;

		this.update({
			isEdited: true,
			blackCards: newCards
		});
	};

	public addWhiteCard = () =>
	{
		this.update({
			isEdited: true,
			whiteCards: [...this.state.whiteCards, ""]
		});
	};

	public editWhiteCard = (index: number, value: string) =>
	{
		const newCards = [...this.state.whiteCards];
		newCards[index] = value;

		this.update({
			isEdited: true,
			whiteCards: newCards
		});
	};

	public removeBlackCard = (index: number) =>
	{
		const newCards = [...this.state.blackCards];
		newCards.splice(index, 1);

		this.update({
			isEdited: true,
			blackCards: newCards
		})
	};

	public removeWhiteCard = (index: number) =>
	{
		const newCards = [...this.state.whiteCards];
		newCards.splice(index, 1);

		this.update({
			isEdited: true,
			whiteCards: newCards
		})
	};

	public setPackName = (name: string) =>
	{
		this.update({
			isEdited: true,
			packName: name
		});
	};

	public setBlackCardErrorState = (index: number, hasError: boolean) =>
	{
		const blackCardErrors = {...this.state.blackCardErrors};
		blackCardErrors[index] = hasError;
		this.update({
			blackCardErrors
		});
	};

	public setWhiteCardErrorState = (index: number, hasError: boolean) =>
	{
		const whiteCardErrors = {...this.state.whiteCardErrors};
		whiteCardErrors[index] = hasError;
		this.update({
			whiteCardErrors
		});
	};

	public getValidity(): string | undefined
	{
		if (this.state.packName.length < 3)
		{
			return "Pack name must be at least 3 characters long";
		}

		const validWhiteCards = this.state.whiteCards.filter(c => c.trim().length > 0);
		const validBlackCards = this.state.blackCards.filter(c => c.trim().length > 0);

		if (validWhiteCards.length === 0 && validBlackCards.length === 0)
		{
			return "You need at least one card";
		}

		if(this.state.categories.length === 0)
		{
			return "You must select a category";
		}

		if(this.state.categories.length > 3)
		{
			return "You can only select 3 categories";
		}
	}

	public setIsNsfw = (nsfw: boolean) =>
	{
		this.update({
			isEdited: true,
			isNsfw: nsfw
		});
	};

	public setIsPublic = (isPublic: boolean) =>
	{
		this.update({
			isEdited: true,
			isPublic
		});
	};

	public save = async (): Promise<ICustomCardPack> =>
	{
		return new Promise((resolve, reject) =>
		{
			Platform.savePack({
				isPublic: this.state.isPublic,
				isNsfw: this.state.isNsfw,
				id: this.state.packId,
				packName: this.state.packName,
				blackCards: this.state.blackCards,
				whiteCards: this.state.whiteCards,
				categories: this.state.categories
			}).then(data =>
			{
				resolve(data);
				this.update({
					isEdited: false
				});
			})
				.catch(e =>
				{
					ErrorDataStore.add(e);
					reject(e);
				});
		});
	};

	public setCategories(categories: ValuesOf<typeof PackCategories>[])
	{
		if (categories.length <= 3)
		{
			this.update({
				isEdited: true,
				categories
			});
		}
	}
}

export const PackCreatorDataStore = _PackCreatorDataStore.Instance;