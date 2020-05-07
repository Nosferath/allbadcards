import {ErrorDataStore} from "../DataStore/ErrorDataStore";
import ReactGA from "react-ga";
import {CardId, GameItem, GamesList, IBlackCardDefinition, ICardPackSummary, IGameSettings} from "./Contract";

export interface GamePayload extends GameItem, WithBuildVersion
{
}

export interface WithBuildVersion
{
	buildVersion: number;
}

export type IWhiteCard = string;

class _Platform
{
	public static Instance = new _Platform();

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

	private static doGet<TData>(url: string)
	{
		return new Promise<TData>((resolve, reject) =>
		{
			fetch(url)
				.then(r =>
				{
					const jsonResponse = r.json() as Promise<TData>;

					if (r.ok)
					{
						jsonResponse
							.then((data: TData) => resolve(data))
							.catch(reject);
					}
					else
					{
						jsonResponse.then(reject);
					}
				})
				.catch(ErrorDataStore.add);
		});
	}

	private static async doPost<TData>(url: string, data: any)
	{
		return await fetch(url, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(data)
		})
			.then(async r =>
			{
				if (r.ok)
				{
					return r.json();
				}
				else
				{
					throw await r.json();
				}
			})
			.catch(ErrorDataStore.add) as Promise<TData>;
	}

	public async getGame(gameId: string)
	{
		return _Platform.doGet<GameItem>(`/api/game/get?gameId=${gameId}`);
	}

	public async createGame(guid: string, nickname: string)
	{
		this.trackEvent("create");

		return _Platform.doPost<GameItem>("/api/game/create", {
			guid,
			nickname
		});
	}

	public async sendChat(guid: string, gameId: string, message: string)
	{
		return _Platform.doPost(`/api/game/send-chat`, {
			gameId: gameId,
			message: message,
			playerGuid: guid
		})
	}

	public async joinGame(guid: string, gameId: string, nickname: string, isSpectating = false)
	{
		this.trackEvent("join", gameId);

		return _Platform.doPost<GameItem>("/api/game/join", {
			guid,
			gameId,
			nickname,
			isSpectating
		});
	}

	public async removePlayer(gameId: string, targetGuid: string, guid: string)
	{
		this.trackEvent("remove-player", gameId);

		return _Platform.doPost<GameItem>("/api/game/kick", {
			gameId,
			targetGuid,
			guid
		});
	}

	public async startGame(
		guid: string,
		gameId: string,
		settings: IGameSettings)
	{
		this.trackEvent("start", gameId);

		return _Platform.doPost<GameItem>("/api/game/start", {
			gameId,
			guid,
			settings
		});
	}

	public async updateSettings(
		guid: string,
		gameId: string,
		settings: IGameSettings)
	{
		this.trackEvent("start", gameId);

		return _Platform.doPost<GameItem>("/api/game/update-settings", {
			gameId,
			guid,
			settings
		});
	}

	public async playCards(gameId: string, guid: string, cardIds: CardId[])
	{
		this.trackEvent("play-cards", gameId);

		return _Platform.doPost<GameItem>("/api/game/play-cards", {
			gameId,
			guid,
			cardIds
		});
	}

	public async playCardsCustom(gameId: string, guid: string, cards: string[])
	{
		this.trackEvent("play-cards-custom", gameId);

		return _Platform.doPost<GameItem>("/api/game/play-cards-custom", {
			gameId,
			guid,
			cards
		});
	}

	public async forfeit(gameId: string, guid: string, playedCards: CardId[])
	{
		this.trackEvent("my-cards-suck", gameId);

		return _Platform.doPost<GameItem>("/api/game/forfeit", {
			gameId,
			guid,
			playedCards
		});
	}

	public async restart(gameId: string, guid: string)
	{
		this.trackEvent("game-restart", gameId);

		return _Platform.doPost<GameItem>("/api/game/restart", {
			gameId,
			guid,
		});
	}

	public async selectWinnerCard(gameId: string, guid: string, winningPlayerGuid: string)
	{
		this.trackEvent("selected-winner", gameId);

		return _Platform.doPost<GameItem>("/api/game/select-winner-card", {
			gameId,
			guid,
			winningPlayerGuid
		});
	}

	public async revealNext(gameId: string, guid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/reveal-next", {
			gameId,
			guid,
		});
	}

	public async startRound(gameId: string, guid: string)
	{
		this.trackEvent("round-start", gameId);

		return _Platform.doPost<GameItem>("/api/game/start-round", {
			gameId,
			guid,
		});
	}

	public async addRandomPlayer(gameId: string, guid: string)
	{
		this.trackEvent("round-start", gameId);

		return _Platform.doPost<GameItem>("/api/game/add-random-player", {
			gameId,
			guid,
		});
	}

	public async nextRound(gameId: string, guid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/next-round", {
			gameId,
			guid,
		});
	}

	public async skipBlack(gameId: string, guid: string)
	{
		return _Platform.doPost<GameItem>("/api/game/skip-black", {
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
				_Platform.doGet<{ card: IWhiteCard }>(`/api/game/get-white-card?packId=${packId}&cardIndex=${cardIndex}`)
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
		return _Platform.doGet<IBlackCardDefinition>(`/api/game/get-black-card?packId=${cardId.packId}&cardIndex=${cardId.cardIndex}`);
	}

	public async getWhiteCards(cards: CardId[])
	{
		const promises = cards.map(cardId => this.getWhiteCard(cardId));

		return Promise.all(promises);
	}

	public async getPacks(type: "all" | "official" | "thirdParty" | "family" = "all")
	{
		return _Platform.doGet<ICardPackSummary[]>("/api/game/get-packnames?type=" + type);
	}

	public async getGames(zeroBasedPage = 0)
	{
		return _Platform.doGet<GamesList>(`/api/games/public?zeroBasedPage=${zeroBasedPage}`);
	}

	public registerUser()
	{
		return _Platform.doGet<{ guid: string }>(`/api/user/register`);
	}
}

export const Platform = _Platform.Instance;