import {DataStore} from "./DataStore";
import {Platform} from "../Platform/platform";
import {ErrorDataStore} from "./ErrorDataStore";
import {ICustomCardPack} from "../Platform/Contract";

export interface PackCreatorDataStorePayload
{
	packId: string | null;
	packName: string;
	blackCards: string[];
	whiteCards: string[];
	blackCardErrors: { [index: number]: boolean };
	whiteCardErrors: { [index: number]: boolean };
	isEdited: boolean;
	isNsfw: boolean;
	isPublic: boolean;
}

class _PackCreatorDataStore extends DataStore<PackCreatorDataStorePayload>
{
	private static InitialState: PackCreatorDataStorePayload = {
		packId: null,
		packName: "",
		whiteCards: [],
		blackCards: [],
		blackCardErrors: [],
		whiteCardErrors: [],
		isEdited: false,
		isNsfw: true,
		isPublic: false
	};

	public static Instance = new _PackCreatorDataStore(_PackCreatorDataStore.InitialState);

	public hydrate(id: string)
	{
		Platform.getPack(id)
			.then(data => {
				this.update({
					packId: data.definition.pack.id,
					isNsfw: data.isNsfw,
					isPublic: data.isPublic,
					whiteCards: data.definition.white,
					blackCards: data.definition.black.map(bc => bc.content),
					packName: data.definition.pack.name,
					isEdited: false,
					blackCardErrors: [],
					whiteCardErrors: []
				})
			})
			.catch(ErrorDataStore.add);
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
		const newCards = [...this.state.blackCards];
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
	}

	public setIsNsfw = (nsfw: boolean) =>
	{
		this.update({
			isNsfw: nsfw
		});
	};

	public setIsPublic = (isPublic: boolean) =>
	{
		this.update({
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
				whiteCards: this.state.whiteCards
			}).then(resolve)
				.catch(e => {
					ErrorDataStore.add(e);
					reject(e);
				});
		});
	}
}

export const PackCreatorDataStore = _PackCreatorDataStore.Instance;