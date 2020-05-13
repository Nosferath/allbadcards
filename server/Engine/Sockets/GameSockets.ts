import {Config} from "../../../config/config";
import WebSocket from "ws";
import * as http from "http";
import {ChatPayload, GameItem, GamePayload} from "../Games/Game/Contract";
import {serverGameToClientGame} from "../../Utils/GameUtils";
import {GameMessage} from "./Messages/GameMessage";
import {ArrayUtils} from "../../Utils/ArrayUtils";
import {ChatMessage} from "./Messages/ChatMessage";

interface IWSMessage
{
	user: {
		playerGuid: string;
	};
	gameId: string;
}

export class GameSockets
{
	private wss: WebSocket.Server;

	private socketIdsForPlayer: { [playerGuid: string]: string[] } = {};
	private playerSocketIdsForGame: { [gameid: string]: string[] } = {};

	constructor(server: http.Server, port?: number)
	{
		this.wss = new WebSocket.Server({
			server,
			port,
			perMessageDeflate: true
		});

		this.addListeners();
	}

	private addListeners()
	{
		this.wss.on("connection", (ws, req) =>
		{
			const id = req.headers['sec-websocket-key'] as string | undefined;
			if (id)
			{
				(ws as any)["id"] = id;
				ws.on("message", (message) =>
				{
					const data = JSON.parse(message as string) as IWSMessage;

					if (data.user)
					{
						const existingPlayerConnections = this.socketIdsForPlayer[data.user.playerGuid] ?? [];
						this.socketIdsForPlayer[data.user.playerGuid] = [id, ...existingPlayerConnections];
					}

					const existingGameConnections = this.playerSocketIdsForGame[data.gameId] ?? [];
					this.playerSocketIdsForGame[data.gameId] = [id, ...existingGameConnections];
				});

				ws.on("close", () =>
				{
					const matchingPlayerGuid = Object.keys(this.socketIdsForPlayer)
						.find(playerGuid => this.socketIdsForPlayer[playerGuid].includes(id));

					if (matchingPlayerGuid)
					{
						const existingConnections = this.socketIdsForPlayer[matchingPlayerGuid];
						this.socketIdsForPlayer[matchingPlayerGuid] = existingConnections.filter(a => a !== id);
					}
				});
			}
		});
	}

	public updateGames(game: GameItem)
	{
		const clientGame = serverGameToClientGame(game);

		const playerGuids = Object.keys({
			...game.players,
			...game.pendingPlayers,
			...game.spectators,
			...game.kickedPlayers
		});

		// Get every socket that needs updating
		const playerSocketListsForGame = playerGuids.map(pg => this.socketIdsForPlayer[pg]);
		const allPlayerSocketIdsForGame = ArrayUtils.flatten(playerSocketListsForGame);

		this.playerSocketIdsForGame[game.id] = allPlayerSocketIdsForGame;

		const gameWithVersion: GamePayload = {
			...clientGame,
			buildVersion: Config.Version
		};

		this.sendPayloadToMatching(GameMessage.send(gameWithVersion), allPlayerSocketIdsForGame);
	}

	public updateChats(chatPayload: ChatPayload)
	{
		// Get every socket that needs updating
		const allPlayerSocketIdsForGame = this.playerSocketIdsForGame[chatPayload.gameId];

		this.sendPayloadToMatching(ChatMessage.send(chatPayload), allPlayerSocketIdsForGame);
	}

	private sendPayloadToMatching(payload: string, socketIds: string[])
	{
		this.wss.clients.forEach(ws =>
		{
			const socketId = (ws as any).id;
			if (socketIds.includes(socketId))
			{
				ws.send(payload);
			}
		});
	}
}