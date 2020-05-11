import {DataStore} from "./DataStore";
import shortid from "shortid";
import {GameDataStore} from "./GameDataStore";
import {Platform} from "../Platform/platform";
import {ErrorDataStore} from "./ErrorDataStore";

export interface IUserData
{
	wsId: string | null;
	playerGuid: string;
}

class _UserDataStore extends DataStore<IUserData>
{
	private static lsKey = "guid";

	public static Instance = new _UserDataStore({
		playerGuid: "",
		wsId: null
	});

	constructor(params: IUserData)
	{
		super(params);
	}

	private register()
	{
		return Platform.registerUser()
			.then(data => {
				this.update({
					playerGuid: data.guid
				});
			})
			.catch(ErrorDataStore.add);
	}

	public initialize()
	{
		this.register();
	}
}

export const UserDataStore = _UserDataStore.Instance;