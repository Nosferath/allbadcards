import ReactGA from "react-ga";
import {CardId, ClientGameItem, GamesList, IClientAuthStatus, ICustomCardPack, IGameClientSettings, IGameSettings} from "./Contract";
import {Fetcher} from "@Global/Platform/Fetcher";


class _HoldEmPlatform
{
	public static Instance = new _HoldEmPlatform();

	public trackEvent(action: string, label?: string, value?: number)
	{
		ReactGA.event({
			action,
			category: "HoldEm",
			label,
			value
		});
	}

	public async getGame(gameId: string)
	{
		return Fetcher.doGet<ClientGameItem>(`/api/holdem/game/get?gameId=${gameId}`);
	}

	public async createGame(guid: string, nickname: string)
	{
		this.trackEvent("create");

		return Fetcher.doPost<ClientGameItem>("/api/holdem/game/create", {
			guid,
			nickname,
			isFamily: EnvDataStore.state.site.family
		});
	}

	public async sendChat(guid: string, gameId: string, message: string)
	{
		this.trackEvent("chat-message", gameId);

		return Fetcher.doPost(`/api/holdem/game/send-chat`, {
			gameId: gameId,
			message: message,
			playerGuid: guid
		})
	}

	public async joinGame(guid: string, gameId: string, nickname: string, isSpectating = false)
	{
		this.trackEvent("join", gameId);

		return Fetcher.doPost<ClientGameItem>("/api/holdem/game/join", {
			guid,
			gameId,
			nickname,
			isSpectating
		});
	}

	public async removePlayer(gameId: string, targetGuid: string, guid: string)
	{
		this.trackEvent("remove-player", gameId);

		return Fetcher.doPost<ClientGameItem>("/api/holdem/game/kick", {
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

		return Fetcher.doPost<ClientGameItem>("/api/holdem/game/start", {
			gameId,
			guid,
			settings
		});
	}

	public async updateSettings(
		guid: string,
		gameId: string,
		settings: IGameClientSettings)
	{
		this.trackEvent("start", gameId);

		return Fetcher.doPost<ClientGameItem>("/api/holdem/game/update-settings", {
			gameId,
			guid,
			settings
		});
	}

	public async playCards(gameId: string, guid: string, cardIds: CardId[])
	{
		this.trackEvent("play-cards", gameId);

		return Fetcher.doPost<ClientGameItem>("/api/holdem/game/play-cards", {
			gameId,
			guid,
			cardIds
		});
	}

	public async restart(gameId: string, guid: string)
	{
		this.trackEvent("game-restart", gameId);

		return Fetcher.doPost<ClientGameItem>("/api/holdem/game/restart", {
			gameId,
			guid,
		});
	}

	public async startRound(gameId: string, guid: string)
	{
		this.trackEvent("round-start", gameId);

		return Fetcher.doPost<ClientGameItem>("/api/holdem/game/start-round", {
			gameId,
			guid,
		});
	}

	public async nextRound(gameId: string, guid: string)
	{
		return Fetcher.doPost<ClientGameItem>("/api/holdem/game/next-round", {
			gameId,
			guid,
		});
	}

	public async getGames(zeroBasedPage = 0)
	{
		return Fetcher.doGet<GamesList>(`/api/holdem/games/public?zeroBasedPage=${zeroBasedPage}`);
	}

	public registerUser()
	{
		this.trackEvent("register-user");

		return Fetcher.doGet<{ guid: string }>(`/api/holdem/user/register`);
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
		return Fetcher.doGet<ICustomCardPack>(`/api/holdem/pack/get?pack=${packId}&${append}`);
	}
}

export const HoldEmPlatform = _HoldEmPlatform.Instance;