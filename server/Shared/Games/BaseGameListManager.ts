import {Collection} from "mongodb";
import {IBaseGame} from "./BaseContracts";

export abstract class BaseGameListManager<TGameType extends IBaseGame>
{
	protected abstract collectionSetter: () => Collection<IBaseGame>;
	private dbGameCollection: Collection<IBaseGame>;

	protected constructor()
	{
	}

	private get games()
	{
		if (!this.dbGameCollection)
		{
			this.initialize();
		}
		return this.dbGameCollection;
	}

	protected initialize()
	{
		this.dbGameCollection = this.collectionSetter();
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
