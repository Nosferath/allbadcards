import {Database} from "../DB/Database";
import shortid from "shortid";
import {hri} from "allbadcards-human-readable-ids";
import {CardManager} from "./CardManager";
import WebSocket from "ws";
import {GameMessage} from "../SocketMessages/GameMessage";
import * as http from "http";
import {Config} from "../../config/config";
import {ArrayUtils} from "../Utils/ArrayUtils";
import {RandomPlayerNicknames} from "./RandomPlayers";
import {logError, logMessage, logWarning} from "../logger";
import {AbortError, createClient, RedisClient, RetryStrategy} from "redis";
import * as fs from "fs";
import * as path from "path";
import {CardId, ChatPayload, ClientGameItem, GameItem, GamePayload, GamePlayer, IGameSettings, IPlayer, PlayerMap} from "./Contract";
import deepEqual from "deep-equal";
import {UserUtils} from "../User/UserUtils";
import {ChatMessage} from "../SocketMessages/ChatMessage";
import {serverGameToClientGame} from "../Utils/GameUtils";

interface IWSMessage
{
	user: {
		playerGuid: string;
	};
	gameId: string;
}

export let GameManager: _GameManager;

class _GameManager
{
	private wss: WebSocket.Server;
	private redisPub: RedisClient;
	private redisSub: RedisClient;
	private redisReconnectInterval: NodeJS.Timeout | null = null;

	// key = playerGuid, value = WS key
	private wsClientPlayerMap: { [playerGuid: string]: string[] } = {};
	private wsGameIdPlayerMap: { [gameid: string]: string[] } = {};
	private gameRoundTimers: { [gameId: string]: NodeJS.Timeout } = {};
	private gameCardTimers: { [gameId: string]: NodeJS.Timeout } = {};

	constructor(server: http.Server)
	{
		logMessage("Starting WebSocket Server");

		Database.initialize();
		this.initializeWebSockets(server);
		this.initializeRedis();
	}

	public static create(server: http.Server)
	{
		GameManager = new _GameManager(server);
	}

	private static get games()
	{
		return Database.db.collection<GameItem>("games");
	}

	private validateUser(user: IPlayer, game?: GameItem)
	{
		if (game)
		{
			const creationDate = game.dateCreated;
			if (creationDate < new Date(1588317168552))
			{
				return true;
			}
		}

		if (!UserUtils.validateUser(user))
		{
			throw new Error("You cannot perform this action because you are not this user.");
		}
	}

	private initializeRedis()
	{
		const keysFile = fs.readFileSync(path.resolve(process.cwd(), "./config/keys.json"), "utf8");
		const keys = JSON.parse(keysFile)[0];
		const redisHost = keys.redisHost[Config.Environment];
		const redisPort = keys.redisPort;

		const retry_strategy: RetryStrategy = options =>
		{
			if (options.error && options.error.code === "ECONNREFUSED")
			{
				// End reconnecting on a specific error and flush all commands with
				// a individual error
				return new Error("The server refused the connection");
			}
			if (options.total_retry_time > 1000 * 60 * 60)
			{
				// End reconnecting after a specific timeout and flush all commands
				// with a individual error
				return new Error("Retry time exhausted");
			}
			if (options.attempt > 10)
			{
				// End reconnecting with built in error
				return new Error("Too many retries");
			}
			// reconnect after
			return Math.min(options.attempt * 100, 3000);
		};

		const onError = (error: any) =>
		{
			if (error instanceof AbortError)
			{
				this.redisReconnectInterval && clearInterval(this.redisReconnectInterval);
				this.redisReconnectInterval = setInterval(() =>
				{
					logWarning("Attempting to reconnect to Redis...");
					this.initializeRedis();
				}, 10000);
			}
			logError(`Error from pub/sub: `, error);
		};

		this.redisPub = createClient({
			host: redisHost,
			port: redisPort,
			auth_pass: keys.redisKey,
			retry_strategy
		});

		this.redisPub.on("error", onError);
		this.redisPub.on("connect", () => this.redisReconnectInterval && clearInterval(this.redisReconnectInterval));

		this.redisSub = createClient({
			host: redisHost,
			port: redisPort,
			auth_pass: keys.redisKey,
			retry_strategy
		});

		this.redisSub.on("error", onError);
		this.redisSub.on("connect", () => this.redisReconnectInterval && clearInterval(this.redisReconnectInterval));
		this.redisSub.on("message", async (channel, dataString) =>
		{
			logMessage(channel, dataString);
			switch (channel)
			{
				case "games":
					const gameItem = JSON.parse(dataString) as GameItem;
					logMessage(`Redis update for game ${gameItem.id}`);

					this.updateSocketGames(gameItem);
					break;

				case "chat":
					const chatPayload = JSON.parse(dataString) as ChatPayload;
					logMessage(`Chat update for game ${chatPayload.gameId}`);

					this.updateSocketChat(chatPayload);
					break;
			}
		});

		this.redisSub.subscribe(`games`, `chat`);
	}

	private initializeWebSockets(server: http.Server)
	{
		const port = Config.Environment === "local" ? {port: 8080} : undefined;

		this.wss = new WebSocket.Server({
			server,
			...port,
			perMessageDeflate: true
		});

		this.wss.on("connection", (ws, req) =>
		{
			const id = req.headers['sec-websocket-key'] as string | undefined;
			if (id)
			{
				(ws as any)["id"] = id;
				ws.on("message", (message) =>
				{
					const data = JSON.parse(message as string) as IWSMessage;
					const existingPlayerConnections = this.wsClientPlayerMap[data.user.playerGuid] ?? [];
					const existingGameConnections = this.wsGameIdPlayerMap[data.gameId] ?? [];
					this.wsClientPlayerMap[data.user.playerGuid] = [id, ...existingPlayerConnections];
					this.wsGameIdPlayerMap[data.gameId] = [id, ...existingGameConnections];
				});

				ws.on("close", () =>
				{
					const matchingPlayerGuid = Object.keys(this.wsClientPlayerMap)
						.find(playerGuid => this.wsClientPlayerMap[playerGuid].includes(id));

					if (matchingPlayerGuid)
					{
						const existingConnections = this.wsClientPlayerMap[matchingPlayerGuid];
						this.wsClientPlayerMap[matchingPlayerGuid] = existingConnections.filter(a => a !== id);
					}
				});
			}
		});

	}

	private static createPlayer(playerGuid: string, nickname: string, isSpectating: boolean, isRandom: boolean): GamePlayer
	{
		return {
			guid: playerGuid,
			whiteCards: [],
			nickname,
			wins: 0,
			isSpectating,
			isRandom
		};
	}

	public async getGame(gameId: string)
	{
		let existingGame: GameItem | null;
		try
		{
			existingGame = await _GameManager.games.findOne({
				id: gameId
			});
		}
		catch (e)
		{
			throw new Error("Could not find game.");
		}

		if (!existingGame)
		{
			throw new Error("Game not found!");
		}

		if(!existingGame.settings.roundTimeoutSeconds)
		{
			existingGame.settings.roundTimeoutSeconds = 60;
		}

		return existingGame;
	}

	public async updateGame(newGame: GameItem)
	{
		newGame.dateUpdated = new Date();

		await Database.db.collection<GameItem>("games").updateOne({
			id: newGame.id
		}, {
			$set: newGame
		});

		this.updateRedisGame(newGame);

		return newGame;
	}

	private updateRedisGame(gameItem: GameItem)
	{
		this.redisPub.publish("games", JSON.stringify(gameItem));
	}

	public updateRedisChat(player: IPlayer, chatPayload: ChatPayload)
	{
		this.validateUser(player);

		this.redisPub.publish("chat", JSON.stringify(chatPayload));
	}

	private updateSocketGames(game: GameItem)
	{
		const clientGame = serverGameToClientGame(game);

		const playerGuids = Object.keys({...game.players, ...game.pendingPlayers, ...game.spectators, ...game.kickedPlayers});

		// Get every socket that needs updating
		const wsIds = playerGuids
			.map(pg => this.wsClientPlayerMap[pg])
			.reduce((acc, val) => acc.concat(val), []);

		this.wsGameIdPlayerMap[game.id] = wsIds;

		const gameWithVersion: GamePayload = {
			...clientGame,
			buildVersion: Config.Version
		};

		this.wss.clients.forEach(ws =>
		{
			if (wsIds?.includes((ws as any).id))
			{
				ws.send(GameMessage.send(gameWithVersion));
			}
		});
	}

	private updateSocketChat(chatPayload: ChatPayload)
	{
		// Get every socket that needs updating
		const wsIds = this.wsGameIdPlayerMap[chatPayload.gameId];

		this.wss.clients.forEach(ws =>
		{
			if (wsIds.includes((ws as any).id))
			{
				ws.send(ChatMessage.send(chatPayload));
			}
		});
	}

	public async createGame(owner: IPlayer, nickname: string, roundsToWin = 7, password = ""): Promise<GameItem>
	{
		this.validateUser(owner);

		const ownerGuid = owner.guid;

		logMessage(`Creating game for ${ownerGuid}`);

		const gameId = hri.random();

		try
		{
			const now = new Date();

			const initialGameItem: GameItem = {
				id: gameId,
				roundIndex: 0,
				roundStarted: false,
				ownerGuid,
				chooserGuid: null,
				dateCreated: now,
				dateUpdated: now,
				players: {[ownerGuid]: _GameManager.createPlayer(ownerGuid, nickname, false, false)},
				playerOrder: [],
				spectators: {},
				pendingPlayers: {},
				kickedPlayers: {},
				started: false,
				blackCard: {
					cardIndex: -1,
					packId: ""
				},
				roundCards: {},
				roundCardsCustom: {},
				usedBlackCards: {},
				usedWhiteCards: {},
				revealIndex: -1,
				lastWinner: undefined,
				settings: {
					public: false,
					hideDuringReveal: false,
					skipReveal: false,
					roundsToWin,
					password,
					playerLimit: 50,
					inviteLink: null,
					includedPacks: [],
					includedCardcastPacks: [],
					winnerBecomesCzar: false,
					customWhites: false,
					roundTimeoutSeconds: 60
				}
			};

			await _GameManager.games.insertOne(initialGameItem);

			const game = await this.getGame(gameId);

			logMessage(`Created game for ${ownerGuid}: ${game.id}`);

			this.updateSocketGames(game);

			return game;
		}
		catch (e)
		{
			logError(e);

			throw new Error("Could not create game.");
		}
	}

	public async joinGame(player: IPlayer, gameId: string, nickname: string, isSpectating: boolean, isRandom: boolean)
	{
		const playerGuid = player.guid;

		const existingGame = await this.getGame(gameId);

		this.validateUser(player, existingGame);

		if (Object.keys(existingGame.players).length >= existingGame.settings.playerLimit)
		{
			throw new Error("This game is full.");
		}

		const newGame = {...existingGame};
		newGame.revealIndex = -1;

		// If the player was kicked before and is rejoining, add them back
		const playerWasKicked = !!newGame.kickedPlayers?.[playerGuid];
		if (playerWasKicked)
		{
			newGame.players[playerGuid] = newGame.kickedPlayers[playerGuid];
			delete newGame.kickedPlayers[playerGuid];
		}
		// Otherwise, make a new player
		else
		{
			const newPlayer = _GameManager.createPlayer(playerGuid, escape(nickname), isSpectating, isRandom);
			if (isSpectating)
			{
				newGame.spectators[playerGuid] = newPlayer;
			}
			else
			{
				if (newGame.started)
				{
					newGame.pendingPlayers[playerGuid] = newPlayer;
				}
				else
				{
					newGame.players[playerGuid] = newPlayer;
				}
			}
		}

		// If the game already started, deal in this new person
		if (newGame.started && !isSpectating && !newGame.started)
		{
			const newGameWithCards = await CardManager.dealWhiteCards(newGame);
			newGame.players[playerGuid].whiteCards = newGameWithCards.players[playerGuid].whiteCards;
		}

		await this.updateGame(newGame);

		return newGame;
	}

	public async kickPlayer(gameId: string, targetGuid: string, owner: IPlayer)
	{
		const ownerGuid = owner.guid;

		const existingGame = await this.getGame(gameId);

		this.validateUser(owner, existingGame);

		if (existingGame.ownerGuid !== ownerGuid && targetGuid !== ownerGuid)
		{
			throw new Error("You don't have kick permission!",);
		}

		const newGame = {...existingGame};
		if (newGame.kickedPlayers)
		{
			newGame.kickedPlayers[targetGuid] = newGame.players[targetGuid] ?? newGame.pendingPlayers[targetGuid];
		}
		delete newGame.pendingPlayers[targetGuid];
		delete newGame.players[targetGuid];
		delete newGame.roundCards[targetGuid];
		newGame.playerOrder = ArrayUtils.shuffle(Object.keys(newGame.players));

		// If the owner deletes themselves, pick a new owner
		if (targetGuid === ownerGuid)
		{
			const nonRandoms = Object.keys(newGame.players).filter(pg => !newGame.players[pg].isRandom);
			if (nonRandoms.length > 0)
			{
				newGame.ownerGuid = nonRandoms[0];
			}
			else
			{
				throw new Error("You can't leave the game if you're the only player");
			}
		}

		// If the owner deletes themselves, pick a new owner
		if (targetGuid === existingGame.chooserGuid)
		{
			newGame.chooserGuid = newGame.ownerGuid;
		}

		await this.updateGame(newGame);

		return newGame;
	}

	public async nextRound(gameId: string, chooser: IPlayer)
	{
		const chooserGuid = chooser.guid;

		if (gameId in this.gameRoundTimers)
		{
			clearTimeout(this.gameRoundTimers[gameId]);
		}

		const existingGame = await this.getGame(gameId);

		this.validateUser(chooser, existingGame);

		if (existingGame.chooserGuid !== chooserGuid)
		{
			throw new Error("You are not the chooser!");
		}

		let newGame = {...existingGame};

		// Reset white card reveal
		newGame.revealIndex = -1;

		newGame.roundStarted = false;

		// Iterate the round index
		newGame.roundIndex = existingGame.roundIndex + 1;

		newGame.players = {...newGame.players, ...newGame.pendingPlayers};
		newGame.pendingPlayers = {};
		const playerGuids = Object.keys(newGame.players);
		const nonRandomPlayerGuids = playerGuids.filter(pg => !newGame.players[pg].isRandom);

		// Grab a new chooser
		const chooserIndex = newGame.roundIndex % nonRandomPlayerGuids.length;
		newGame.chooserGuid = nonRandomPlayerGuids[chooserIndex];

		if (newGame.settings.winnerBecomesCzar && newGame.lastWinner && !newGame.lastWinner.isRandom)
		{
			newGame.chooserGuid = newGame.lastWinner.guid;
		}

		// Remove last winner
		newGame.lastWinner = undefined;

		// Remove the played white card from each player's hand
		if (!newGame.settings.customWhites)
		{
			newGame.players = playerGuids.reduce((acc, playerGuid) =>
			{
				const player = newGame.players[playerGuid];
				const newPlayer = {...player};
				const usedCards = newGame.roundCards[playerGuid] ?? [];
				newPlayer.whiteCards = player.whiteCards.filter(wc =>
					!usedCards.find(uc => deepEqual(uc, wc))
				);
				acc[playerGuid] = newPlayer;

				return acc;
			}, {} as PlayerMap);
		}

		// Reset the played cards for the round
		newGame.roundCards = {};
		newGame.roundCardsCustom = {};

		// Deal a new hand
		newGame = await CardManager.dealWhiteCards(newGame);

		// Grab the new black card
		newGame = await CardManager.nextBlackCard(newGame);

		await this.updateGame(newGame);

		return newGame;
	}

	public async startGame(
		gameId: string,
		owner: IPlayer,
		settings: IGameSettings,
	)
	{
		const ownerGuid = owner.guid;

		const existingGame = await this.getGame(gameId);

		this.validateUser(owner, existingGame);

		if (existingGame.ownerGuid !== ownerGuid)
		{
			throw new Error("User cannot start game");
		}

		let newGame = {...existingGame};

		const playerGuids = Object.keys(existingGame.players);
		newGame.chooserGuid = playerGuids[0];
		newGame.started = true;
		newGame.settings = {...newGame.settings, ...settings};

		newGame = await CardManager.nextBlackCard(newGame);
		newGame = await CardManager.dealWhiteCards(newGame);

		await this.updateGame(newGame);

		return newGame;
	}

	public async updateSettings(
		gameId: string,
		owner: IPlayer,
		settings: IGameSettings,
	)
	{
		this.validateUser(owner);

		const ownerGuid = owner.guid;

		const existingGame = await this.getGame(gameId);

		if (existingGame.ownerGuid !== ownerGuid)
		{
			throw new Error("User cannot edit settings");
		}

		let newGame = {...existingGame};

		newGame.settings = {...newGame.settings, ...settings};

		if (newGame.settings.playerLimit > 50)
		{
			throw new Error("Player limit cannot be greater than 50");
		}

		await this.updateGame(newGame);

		return newGame;
	}

	public async restartGame(
		gameId: string,
		player: IPlayer
	)
	{
		const playerGuid = player.guid;

		const existingGame = await this.getGame(gameId);

		this.validateUser(player, existingGame);

		const newGame = {...existingGame};

		if (existingGame.ownerGuid !== playerGuid)
		{
			throw new Error("User cannot start game");
		}

		Object.keys(newGame.players).forEach(pg =>
		{
			newGame.players[pg].whiteCards = [];
			newGame.players[pg].wins = 0;
		});

		newGame.roundIndex = 0;
		newGame.revealIndex = -1;
		newGame.roundCards = {};
		newGame.roundStarted = false;
		newGame.started = false;
		newGame.blackCard = {
			cardIndex: -1,
			packId: ""
		};
		newGame.lastWinner = undefined;

		await this.updateGame(newGame);

		return newGame;
	}

	public async playCard(gameId: string, player: IPlayer, cardIds: CardId[], overrideValidation = false)
	{
		const playerGuid = player.guid;

		const existingGame = await this.getGame(gameId);
		if (!overrideValidation)
		{
			this.validateUser(player, existingGame);
		}

		const cardsAreInPlayerHand = cardIds.every(cid =>
			existingGame.players[playerGuid].whiteCards.find(
				wc => deepEqual(wc, cid)
			)
		);

		if (!cardsAreInPlayerHand)
		{
			throw new Error("You cannot play cards that aren't in your hand.");
		}

		const blackCardDef = await CardManager.getBlackCard(existingGame.blackCard);
		const targetPicked = blackCardDef.pick;
		if (targetPicked !== cardIds.length)
		{
			throw new Error("You submitted the wrong number of cards. Expected " + targetPicked + " but received " + cardIds.length);
		}

		const newGame = {...existingGame};
		newGame.roundCards[playerGuid] = cardIds;
		newGame.playerOrder = ArrayUtils.shuffle(Object.keys(newGame.players));

		await this.updateGame(newGame);

		return newGame;
	}

	public async playCardsCustom(gameId: string, player: IPlayer, cards: string[])
	{
		const playerGuid = player.guid;

		const existingGame = await this.getGame(gameId);

		const blackCardDef = await CardManager.getBlackCard(existingGame.blackCard);
		const targetPicked = blackCardDef.pick;
		if (targetPicked !== cards.length)
		{
			throw new Error("You submitted the wrong number of cards. Expected " + targetPicked + " but received " + cards.length);
		}

		const newGame = {...existingGame};
		if (!newGame.roundCardsCustom)
		{
			newGame.roundCardsCustom = {};
		}
		const sanitizedCards = cards.map(c => escape(c));
		newGame.roundCardsCustom[playerGuid] = sanitizedCards;
		newGame.playerOrder = ArrayUtils.shuffle(Object.keys(newGame.players));

		await this.updateGame(newGame);

		return newGame;
	}

	public async forfeit(gameId: string, player: IPlayer, playedCards: CardId[])
	{
		const playerGuid = player.guid;

		const existingGame = await this.getGame(gameId);

		this.validateUser(player, existingGame);

		const newGame = {...existingGame};

		// Get the cards they haven't played
		const unplayedCards = existingGame.players[playerGuid].whiteCards.filter(c =>
			!playedCards.find(pc => deepEqual(pc, c))
		);

		unplayedCards.forEach(cardId =>
		{
			newGame.usedWhiteCards[cardId.packId] = newGame.usedWhiteCards[cardId.packId] ?? {};
			newGame.usedWhiteCards[cardId.packId][cardId.cardIndex] = cardId;
		});

		// clear out the player's cards
		newGame.players[playerGuid].whiteCards = [];

		await this.updateGame(newGame);

		return newGame;
	}

	public async revealNext(gameId: string, player: IPlayer)
	{
		clearTimeout(this.gameCardTimers[gameId]);

		const playerGuid = player.guid;

		const existingGame = await this.getGame(gameId);

		this.validateUser(player, existingGame);

		if (existingGame.chooserGuid !== playerGuid)
		{
			throw new Error("You are not the chooser!");
		}

		const newGame = {...existingGame};
		newGame.revealIndex = newGame.revealIndex + 1;
		if (newGame.settings.skipReveal)
		{
			newGame.revealIndex = Object.keys(newGame.roundCards).length;
		}

		await this.updateGame(newGame);

		return newGame;
	}

	public async skipBlack(gameId: string, player: IPlayer)
	{
		const playerGuid = player.guid;

		const existingGame = await this.getGame(gameId);

		this.validateUser(player, existingGame);

		if (existingGame.chooserGuid !== playerGuid)
		{
			throw new Error("You are not the chooser!");
		}

		const newGame = {...existingGame};
		const newGameWithBlackCard = await CardManager.nextBlackCard(newGame);

		await this.updateGame(newGameWithBlackCard);

		return newGame;
	}

	public async startRound(gameId: string, player: IPlayer)
	{
		const playerGuid = player.guid;

		const existingGame = await this.getGame(gameId);

		this.validateUser(player, existingGame);

		if (existingGame.chooserGuid !== playerGuid)
		{
			throw new Error("You are not the chooser!");
		}

		const newGame = {...existingGame};
		newGame.roundStarted = true;
		newGame.lastWinner = undefined;

		await this.updateGame(newGame);

		this.randomPlayersPlayCard(gameId);

		this.gameCardTimers[gameId] = setTimeout(() => {
			console.log("TIMEOUT REACHED");
			this.playCardsForSlowPlayers(gameId);
		}, (newGame.settings.roundTimeoutSeconds + 2) * 1000);

		return newGame;
	}

	private async playCardsForSlowPlayers(gameId: string)
	{
		const existingGame = await this.getGame(gameId);
		const newGame = {...existingGame};

		if(newGame.settings.customWhites)
		{
			return;
		}

		const blackCardDef = await CardManager.getBlackCard(newGame.blackCard);
		const targetPicked = blackCardDef.pick;
		const allEligiblePlayerGuids = newGame.playerOrder.filter(pg => pg !== newGame.chooserGuid);
		const remaining = allEligiblePlayerGuids.filter(pg => !(pg in newGame.roundCards));

		for (let pg of remaining)
		{
			await this.playRandomCardForPlayer(newGame, pg, targetPicked);
		}
	}

	private randomPlayersPlayCard(gameId: string)
	{
		this.getGame(gameId)
			.then(async existingGame =>
			{
				const newGame = {...existingGame};
				const blackCardDef = await CardManager.getBlackCard(newGame.blackCard);
				const targetPicked = blackCardDef.pick;
				const randomPlayerGuids = Object.keys(newGame.players).filter(pg => newGame.players[pg].isRandom);

				for (let pg of randomPlayerGuids)
				{
					await this.playRandomCardForPlayer(newGame, pg, targetPicked);
				}
			});
	}

	private async playRandomCardForPlayer(game: GameItem, playerGuid: string, targetPicked: number)
	{
		const player = game.players[playerGuid];
		let cards: CardId[] = [];
		for (let i = 0; i < targetPicked; i++)
		{
			const [, newCards] = ArrayUtils.getRandomUnused(player.whiteCards, cards);
			cards = newCards;
		}

		await this.playCard(game.id, {
			secret: "",
			guid: player.guid
		}, cards, true);
	}

	public async addRandomPlayer(gameId: string, owner: IPlayer)
	{
		this.validateUser(owner);

		const ownerGuid = owner.guid;

		const existingGame = await this.getGame(gameId);

		if (existingGame.ownerGuid !== ownerGuid)
		{
			throw new Error("You are not the owner!");
		}

		let newGame = {...existingGame};

		const used = Object.keys(newGame.players).map(pg => newGame.players[pg].nickname);
		const [newNickname] = ArrayUtils.getRandomUnused(RandomPlayerNicknames, used);

		const userId = shortid.generate();
		const fakePlayer: IPlayer = {
			guid: userId,
			secret: UserUtils.generateSecret(userId)
		};

		newGame = await this.joinGame(fakePlayer, gameId, newNickname, false, true);

		return newGame;
	}

	public async selectWinnerCard(gameId: string, player: IPlayer, winnerPlayerGuid: string)
	{
		const playerGuid = player.guid;

		const existingGame = await this.getGame(gameId);

		this.validateUser(player, existingGame);

		if (existingGame.chooserGuid !== playerGuid)
		{
			throw new Error("You are not the chooser!");
		}

		const newGame = {...existingGame};
		newGame.players[winnerPlayerGuid].wins = newGame.players[winnerPlayerGuid].wins + 1;
		newGame.lastWinner = newGame.players[winnerPlayerGuid];

		await this.updateGame(newGame);

		const settings = newGame.settings;
		const players = newGame.players;
		const playerGuids = Object.keys(players);
		const gameWinnerGuid = playerGuids.find(pg => (players?.[pg].wins ?? 0) >= (settings?.roundsToWin ?? 50));

		if (!gameWinnerGuid)
		{
			this.gameRoundTimers[gameId] = setTimeout(() =>
			{
				this.nextRound(gameId, player);
			}, 10000);
		}

		return newGame;
	}
}

export const CreateGameManager = _GameManager.create;
