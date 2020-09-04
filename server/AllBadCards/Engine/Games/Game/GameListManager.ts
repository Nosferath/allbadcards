import {CardsDatabase} from "../../Database/CardsDatabase";
import {GameItem} from "./GameContract";
import {BaseGameListManager} from "../../../../Shared/Games/BaseGameListManager";

class _GameListManager extends BaseGameListManager<GameItem>
{
	public static Instance = new _GameListManager();

	protected collectionSetter = () => CardsDatabase.db.collection<GameItem>("games");

	constructor()
	{
		super();
	}
}

export const GameListManager = _GameListManager.Instance;