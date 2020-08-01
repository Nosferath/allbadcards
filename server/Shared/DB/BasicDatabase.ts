import {Db, MongoClient} from "mongodb";
import * as fs from "fs";
import * as path from "path";
import {Config} from "../../../config/config";
import {logError, logMessage} from "../../logger";

export abstract class BasicDatabase
{
	private _client: MongoClient;
	private readonly url: string;
	private initialized = false;
	private initializationPromise: Promise<boolean> | undefined;

	protected constructor(protected readonly dbName: string)
	{
		const keysFile = fs.readFileSync(path.resolve(process.cwd(), "./config/keys.json"), "utf8");
		const keys = JSON.parse(keysFile)[0];
		this.url = keys.mongo[Config.Environment];
	}

	protected get client()
	{
		if (!this._client)
		{
			throw new Error("Mongo failed to connect");
		}

		return this._client;
	}

	public initialize()
	{
		if (this.initialized)
		{
			return Promise.resolve(true);
		}

		if (this.initializationPromise)
		{
			return this.initializationPromise;
		}

		this.initializationPromise = new Promise<boolean>((resolve, reject) =>
		{
			logMessage("Connecting to mongo");
			MongoClient.connect(this.url, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			}, async (err, client) =>
			{
				logMessage("Mongo connection attempt finished");
				if (err)
				{
					logError(err);

					reject(err);

					throw err;
				}

				this._client = client;

				this.initializeClient(client);

				await this.initializeCollections();

				this.initialized = true;
				this.initializationPromise = undefined;
				resolve(true);
			});
		});

		return this.initializationPromise;
	};

	protected abstract initializeClient(client: MongoClient): void;

	protected abstract async initializeCollections(): Promise<void>;

	public get db()
	{
		return this.client.db(this.dbName);
	}
}