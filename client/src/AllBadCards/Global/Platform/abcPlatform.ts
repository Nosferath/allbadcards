import ReactGA from "react-ga";
import {CardId, ClientGameItem, GamesList, IBlackCardDefinition, ICardPackDefinition, ICardPackSummary, IClientAuthStatus, ICustomCardPack, ICustomPackDataInput, ICustomPackSearchResult, IGameClientSettings, PackSearch} from "./Contract";
import {Fetcher} from "../../../Shared/Global/Platform/Fetcher";
import {BaseCardGamePlatform} from "@Global/Platform/BaseCardGamePlatform";
import {EnvDataStore} from "@AbcGlobal/DataStore/EnvDataStore";

export interface GamePayload extends ClientGameItem, WithBuildVersion
{
}

export interface WithBuildVersion
{
	buildVersion: number;
}

export type IWhiteCard = string;

class _AllBadCardsPlatform extends BaseCardGamePlatform<ClientGameItem,IGameClientSettings, CardId, GamesList>
{
	public static Instance = new _AllBadCardsPlatform();

	private loadedWhiteCards: { [packId: string]: IWhiteCard[] } = {};

	public trackEvent(action: string, label?: string, value?: number)
	{
		ReactGA.event({
			action,
			category: "Game",
			label,
			value
		});
	}

	public async createGame(guid: string, nickname: string)
	{
		this.trackEvent("create");

		return Fetcher.doPost<ClientGameItem>("/api/abc/game/create", {
			guid,
			nickname,
			isFamily: EnvDataStore.state.site.family
		});
	}

	public async forfeit(gameId: string, guid: string, playedCards: CardId[])
	{
		this.trackEvent("my-cards-suck", gameId);

		return Fetcher.doPost<ClientGameItem>("/api/abc/game/forfeit", {
			gameId,
			guid,
			playedCards
		});
	}

	public async selectWinnerCard(gameId: string, guid: string, winningPlayerGuid: string)
	{
		this.trackEvent("selected-winner", gameId);

		return Fetcher.doPost<ClientGameItem>("/api/abc/game/select-winner-card", {
			gameId,
			guid,
			winningPlayerGuid
		});
	}

	public async revealNext(gameId: string, guid: string)
	{
		return Fetcher.doPost<ClientGameItem>("/api/abc/game/reveal-next", {
			gameId,
			guid,
		});
	}

	public async addRandomPlayer(gameId: string, guid: string)
	{
		this.trackEvent("round-start", gameId);

		return Fetcher.doPost<ClientGameItem>("/api/abc/game/add-random-player", {
			gameId,
			guid,
		});
	}

	public async skipBlack(gameId: string, guid: string)
	{
		return Fetcher.doPost<ClientGameItem>("/api/abc/game/skip-black", {
			gameId,
			guid,
		});
	}

	public async getWhiteCard(cardId: CardId)
	{
		const {
			cardIndex,
			packId
		} = cardId;

		return new Promise<IWhiteCard>((resolve, reject) =>
		{
			if (packId in this.loadedWhiteCards && this.loadedWhiteCards[packId].length > cardIndex)
			{
				resolve(this.loadedWhiteCards[packId][cardIndex]);
			}
			else
			{
				Fetcher.doGet<{ card: IWhiteCard }>(`/api/abc/game/get-white-card?packId=${packId}&cardIndex=${cardIndex}`)
					.then(data =>
					{
						if (!data)
						{
							reject("Card not found");
						}

						const card = data.card;
						this.loadedWhiteCards[packId] = this.loadedWhiteCards[packId] ?? {};
						this.loadedWhiteCards[packId][cardIndex] = card;
						resolve(card);
					})
					.catch(e => reject(e));
			}
		})
	}

	public async getBlackCard(cardId: CardId)
	{
		return Fetcher.doGet<IBlackCardDefinition>(`/api/abc/game/get-black-card?packId=${cardId.packId}&cardIndex=${cardId.cardIndex}`);
	}

	public async getWhiteCards(cards: CardId[])
	{
		const promises = cards.map(cardId => this.getWhiteCard(cardId));

		return Promise.all(promises);
	}

	public async getPacks(type: "all" | "official" | "thirdParty" | "family" = "all")
	{
		return Fetcher.doGet<ICardPackSummary[]>("/api/abc/game/get-packnames?type=" + type);
	}

	public async getCardCastPackCached(deckId: string)
	{
		this.trackEvent("cardcast-cached", deckId);

		return Fetcher.doGet<{packs: ICardPackDefinition[]}>(`/api/abc/cardcast-pack-export?input=${deckId}`);
	}

	public registerUser()
	{
		this.trackEvent("register-user");

		return Fetcher.doGet<{ guid: string }>(`/api/abc/user/register`);
	}

	public getAuthStatus()
	{
		this.trackEvent("auth-status");

		return Fetcher.doGet<{status: IClientAuthStatus}>("/auth/status")
	}

	public logOut()
	{
		return Fetcher.doGet("/auth/logout");
	}

	public getPack(packId: string, bustCache = false)
	{
		const append = bustCache ? Date.now() : "";
		return Fetcher.doGet<ICustomCardPack>(`/api/abc/pack/get?pack=${packId}&${append}`);
	}

	public getMyPacks()
	{
		this.trackEvent("get-my-packs");

		return Fetcher.doGet<{result: ICustomPackSearchResult}>(`/api/abc/packs/mine`);
	}

	public searchPacks(input: PackSearch, zeroBasedPage = 0)
	{
		this.trackEvent("pack-search");

		const search = input.search ? `&search=${encodeURIComponent(input.search)}` : "";
		const category = input.category ? `&category=${encodeURIComponent(input.category as string)}` : "";
		const sort = input.sort ? `&sort=${encodeURIComponent(input.sort)}` : "";
		return Fetcher.doGet<{result: ICustomPackSearchResult}>(`/api/abc/packs/search?zeroBasedPage=${zeroBasedPage}&nsfw=${!!input.nsfw}${search}${category}${sort}`);
	}

	public getMyFavoritePacks()
	{
		return Fetcher.doGet<{result: ICustomPackSearchResult}>(`/api/abc/packs/myfaves`);
	}

	public savePack(packData: ICustomPackDataInput)
	{
		this.trackEvent("pack-edit-or-create");

		return Fetcher.doPost<ICustomCardPack>("/api/abc/pack/update", {
			pack: packData
		});
	}

	public favoritePack(packId: string)
	{
		this.trackEvent("pack-favorite");

		return Fetcher.doPost<ICustomCardPack>("/api/abc/pack/favorite", {
			packId
		});
	}

	public unfavoritePack(packId: string)
	{
		this.trackEvent("pack-unfavorite");

		return Fetcher.doPost<ICustomCardPack>("/api/abc/pack/unfavorite", {
			packId
		});
	}

	public setPlayerApproval(gameId: string, targetGuid: string, approved: boolean)
	{
		return Fetcher.doPost("/api/abc/game/player-approval", {
			gameId,
			targetGuid,
			approved
		});
	}

	public deletePack(packId: string)
	{
		return Fetcher.doPost("/api/abc/packs/delete", {
			packId
		});
	}
}

export const AbcPlatform = _AllBadCardsPlatform.Instance;