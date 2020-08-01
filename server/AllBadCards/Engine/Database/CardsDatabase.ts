import {Db, MongoClient} from "mongodb";
import {GameItem, ICustomCardPack, IUserPackFavorite} from "../Games/Game/GameContract";
import {Patron} from "../../../Shared/Auth/UserContract";
import {BasicDatabase} from "../../../Shared/DB/BasicDatabase";

class _CardsDatabase extends BasicDatabase
{
	public static Instance = new _CardsDatabase();
	public collections: Collections;

	constructor()
	{
		super("letsplaywtf");
	}

	protected initializeClient(client: MongoClient)
	{
		this.collections = new Collections(this.db);
	}

	public get db()
	{
		return this.client.db("letsplaywtf");
	}

	protected async initializeCollections(): Promise<void>
	{
		await this.collections.games.createIndex({
			id: 1
		}, {
			unique: true
		});

		await this.collections.games.createIndex({
			["settings.public"]: 1,
			dateCreated: -1,
			dateUpdated: -1
		});

		await this.collections.users.createIndex({
			userId: 1
		});

		await this.collections.packs.createIndex({
			["definition.pack.id"]: 1,
			isBlocked: 1,
			owner: 1,
			categories: 1
		});

		await this.collections.packFavorites.createIndex({
			packId: 1,
			userId: 1
		});
	}
}

class Collections
{
	constructor(private readonly db: Db)
	{

	}

	public get games()
	{
		return this.db.collection<GameItem>("games");
	}

	public get users()
	{
		return this.db.collection<Patron>("patrons");
	}

	public get packs()
	{
		return this.db.collection<ICustomCardPack>("packs");
	}

	public get packFavorites()
	{
		return this.db.collection<IUserPackFavorite>("pack_favorites");
	}
}

export const CardsDatabase = _CardsDatabase.Instance;