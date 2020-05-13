import {CardCastApi, ICallResponseSet, IDeck} from "isomorphic-cardcast-api";
import {IBlackCardDefinition, ICardPackDefinition} from "./Contract";
import {createClient, RedisClient, RetryStrategy} from "redis";
import * as fs from "fs";
import * as path from "path";
import {Config} from "../../../../config/config";
import {logError, logMessage} from "../../../logger";

class _CardCastConnector
{
	private readonly redisClient: RedisClient;

	public static Instance = new _CardCastConnector();

	private cachedDecks: { [deckId: string]: ICardPackDefinition } = {};
	private memoryTimeouts: { [deckId: string]: NodeJS.Timeout } = {};

	constructor()
	{
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

		const keysFile = fs.readFileSync(path.resolve(process.cwd(), "./config/keys.json"), "utf8");
		const keys = JSON.parse(keysFile)[0];

		this.redisClient = createClient({
			host: keys.redisHost[Config.Environment],
			port: keys.redisPort,
			auth_pass: keys.redisKey,
			retry_strategy
		});
	}

	public async getDeck(deckId: string): Promise<ICardPackDefinition>
	{
		logMessage(`Getting deck ${deckId}`);

		return new Promise<ICardPackDefinition>((resolve, reject) =>
		{
			const isInMemory = deckId in this.cachedDecks;
			if (isInMemory)
			{
				logMessage(`Returning deck ${deckId} from memory`);

				if (deckId in this.memoryTimeouts)
				{
					clearTimeout(this.memoryTimeouts[deckId]);
				}

				// Remove from memory if not requested in the last hour
				this.memoryTimeouts[deckId] = setTimeout(() => {
					delete this.memoryTimeouts[deckId];
					delete this.cachedDecks[deckId];
				}, 60 * 60 * 1000);

				resolve(this.cachedDecks[deckId]);

				return;
			}

			logMessage(`Deck ${deckId} not found in memory. Attempting Redis fetch.`);

			this.redisClient.get(`cardcast:${deckId}`, async (error, storedDeckString) =>
			{
				let shouldFetch = false;
				if (error)
				{
					logError(error);
				}
				else if (storedDeckString)
				{
					const storedDeck = JSON.parse(storedDeckString) as ICardPackDefinition;
					const now = Date.now();
					const dateStoredDiff = now - (storedDeck.dateStoredMs ?? 0);
					const isOld = dateStoredDiff > (24 * 60 * 60 * 1000);
					if (isOld)
					{
						logMessage(`Deck ${deckId} found but it's old. Refetching.`);
						shouldFetch = true;
					}
					else
					{
						resolve(storedDeck);
					}
				}
				else
				{
					shouldFetch = true;
				}

				if (shouldFetch)
				{
					logMessage(`Not found in Redis. Fetching deck ${deckId}`);

					this.fetchDeck(deckId)
						.then(resolve)
						.catch(reject);
				}
			});
		});
	}

	private async fetchDeck(deckId: string)
	{
		return new Promise<ICardPackDefinition>(async (resolve, reject) =>
		{
			let ogDeck: IDeck,
				ogCards: ICallResponseSet;
			try
			{
				ogDeck = await CardCastApi.getDeck(deckId);
				ogCards = await CardCastApi.getDeckCards(deckId);
			}
			catch (e)
			{
				reject(e);
				return;
			}

			if (!ogDeck || !ogCards)
			{
				reject("There was a problem fetching the deck");
				return;
			}

			logMessage(`Fetched ${deckId}`);

			const blackCards: IBlackCardDefinition[] = ogCards.calls.map(c => ({
				content: c.text.join("_"),
				draw: c.text.length - 2,
				pick: c.text.length - 1
			}));

			const whiteCards = ogCards.responses.map(c => _CardCastConnector.capitalize(c.text[0]));

			const deck: ICardPackDefinition = {
				black: blackCards,
				white: whiteCards,
				pack: {
					id: deckId,
					name: ogDeck.name
				},
				quantity: {
					black: blackCards.length,
					white: whiteCards.length,
					total: blackCards.length + whiteCards.length
				},
				dateStoredMs: Date.now()
			};

			this.redisClient.set(`cardcast:${deckId}`, JSON.stringify(deck));

			this.cachedDecks[deckId] = deck;

			resolve(deck);
		});
	}

	private static capitalize(str: string)
	{
		return str[0].toUpperCase() + str.substr(1) + (str.endsWith(".") ? "" : ".");
	}
}

export const CardCastConnector = _CardCastConnector.Instance;