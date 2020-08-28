import {Collection} from "mongodb";
import {IBaseGame} from "./BaseContracts";

export class BaseGameListManager<TGameType extends IBaseGame>
{
	constructor(private readonly dbGameCollection: Collection<IBaseGame>)
	{
	}

	private get games()
	{
		return this.dbGameCollection;
	}

	public async getGames(zeroBasedPage: number)
	{
		const found = await this.games
			.find({
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
