import {Db, MongoClient} from "mongodb";
import {Patron} from "../../../Shared/Auth/UserContract";
import {BasicDatabase} from "../../../Shared/DB/BasicDatabase";

class _HoldEmDatabase extends BasicDatabase
{
	public static Instance = new _HoldEmDatabase();
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
		await this.collections.users.createIndex({
			userId: 1
		});
	}
}

class Collections
{
	constructor(private readonly db: Db)
	{

	}

	public get users()
	{
		return this.db.collection<Patron>("patrons");
	}

}

export const HoldEmDatabase = _HoldEmDatabase.Instance;