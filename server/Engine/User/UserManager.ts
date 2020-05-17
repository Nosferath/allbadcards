import {IPlayer} from "../Games/Game/Contract";
import {UserUtils} from "./UserUtils";

class _UserManager
{
	public static Instance = new _UserManager();

	public validateUser(user: IPlayer)
	{
		if (!UserUtils.validateUser(user))
		{
			throw new Error("You cannot perform this action because you are not this user.");
		}
	}
}

export const UserManager = _UserManager.Instance;
