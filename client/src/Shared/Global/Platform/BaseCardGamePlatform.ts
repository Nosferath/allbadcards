import ReactGA from "react-ga";
import {Fetcher} from "@Global/Platform/Fetcher";
import {IClientAuthStatus} from "@AbcGlobal/Platform/Contract";

export class BaseCardGamePlatform<TGameItem, TGameSettings, TCardId, TGameList>
{
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
		return Fetcher.doGet<TGameItem>(`/api/holdem/game/get?gameId=${gameId}`);
	}

	public async createGame(guid: string, nickname: string)
	{
		this.trackEvent("create");

		return Fetcher.doPost<TGameItem>("/api/holdem/game/create", {
			guid,
			nickname
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

		return Fetcher.doPost<TGameItem>("/api/holdem/game/join", {
			guid,
			gameId,
			nickname,
			isSpectating
		});
	}

	public async removePlayer(gameId: string, targetGuid: string, guid: string)
	{
		this.trackEvent("remove-player", gameId);

		return Fetcher.doPost<TGameItem>("/api/holdem/game/kick", {
			gameId,
			targetGuid,
			guid
		});
	}

	public async startGame(
		guid: string,
		gameId: string,
		settings: TGameSettings)
	{
		this.trackEvent("start", gameId);

		return Fetcher.doPost<TGameItem>("/api/holdem/game/start", {
			gameId,
			guid,
			settings
		});
	}

	public async updateSettings(
		guid: string,
		gameId: string,
		settings: TGameSettings)
	{
		this.trackEvent("start", gameId);

		return Fetcher.doPost<TGameItem>("/api/holdem/game/update-settings", {
			gameId,
			guid,
			settings
		});
	}

	public async playCards(gameId: string, guid: string, cardIds: TCardId[])
	{
		this.trackEvent("play-cards", gameId);

		return Fetcher.doPost<TGameItem>("/api/holdem/game/play-cards", {
			gameId,
			guid,
			cardIds
		});
	}

	public async restart(gameId: string, guid: string)
	{
		this.trackEvent("game-restart", gameId);

		return Fetcher.doPost<TGameItem>("/api/holdem/game/restart", {
			gameId,
			guid,
		});
	}

	public async startRound(gameId: string, guid: string)
	{
		this.trackEvent("round-start", gameId);

		return Fetcher.doPost<TGameItem>("/api/holdem/game/start-round", {
			gameId,
			guid,
		});
	}

	public async nextRound(gameId: string, guid: string)
	{
		return Fetcher.doPost<TGameItem>("/api/holdem/game/next-round", {
			gameId,
			guid,
		});
	}

	public async getGames(zeroBasedPage = 0)
	{
		return Fetcher.doGet<TGameList>(`/api/holdem/games/public?zeroBasedPage=${zeroBasedPage}`);
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
}