import {Database} from "../../../DB/Database";
import {GameItem} from "./GameContract";

class _GameListManager
{
	public static Instance = new _GameListManager();

	constructor()
	{
		Database.initialize().then(() => console.log("DB init"));
	}

	private static get games()
	{
		return Database.db.collection<GameItem>("games");
	}

	public async getGames(zeroBasedPage: number)
	{
		const found = await _GameListManager.games
			.find({
				["settings.public"]: true,
				dateUpdated: {
					$gt: (new Date(Date.now() - (15 * 60 * 1000)))
				}
			})
			.sort({dateUpdated: -1})
			.skip(8 * zeroBasedPage)
			.limit(8);

		return found.toArray();
	}
}

export const GameListManager = _GameListManager.Instance;