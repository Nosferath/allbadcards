import {DataStore} from "./DataStore";
import shortid from "shortid";
import {GameDataStore} from "./GameDataStore";
import {Platform} from "../Platform/platform";
import {ErrorDataStore} from "./ErrorDataStore";

export interface UserData
{
	wsId: string | null;
	playerGuid: string;
}

class _UserDataStore extends DataStore<UserData>
{
	private static lsKey = "guid";

	public static Instance = new _UserDataStore({
		playerGuid: "",
		wsId: null
	});

	constructor(params: UserData)
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