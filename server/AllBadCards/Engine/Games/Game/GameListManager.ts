import {CardsDatabase} from "../../Database/CardsDatabase";
import {GameItem} from "./GameContract";
import {BaseGameListManager} from "../../../../Shared/Games/BaseGameListManager";

class _GameListManager extends BaseGameListManager<GameItem>
{
	public static Instance = new _GameListManager();

	constructor()
	{
		CardsDatabase.initialize().then(() => console.log("DB init"));

		super(CardsDatabase.db.collection<GameItem>("games"));
	}
}

export const GameListManager = _GameListManager.Instance;