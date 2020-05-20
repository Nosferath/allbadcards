import {DataStore} from "./DataStore";
import {Platform} from "../Platform/platform";
import {BackerType} from "../Platform/Contract";

export interface IAuthContext
{
	userId: string | null;
	authorized: boolean;
	levels: BackerType[];
	loaded: boolean;
	isSubscriber: boolean;
}

const BackerLevelMap = {
	[BackerType.None]: [BackerType.None],
	[BackerType.Backer]: [BackerType.Backer],
	[BackerType.Sponsor]: [BackerType.Backer, BackerType.Sponsor],
	[BackerType.DiamondSponsor]: [BackerType.Backer, BackerType.Sponsor, BackerType.DiamondSponsor],
};

class _AuthDatastore extends DataStore<IAuthContext>
{
	public static Instance = new _AuthDatastore();

	private constructor()
	{
		super({
			authorized: false,
			userId: null,
			isSubscriber: false,
			loaded: false,
			levels: []
		});

		this.initialize();
	}

	private async initialize()
	{
		const result = await Platform.getAuthStatus();
		const status = result.status;
		const {
			levels,
			userId,
		} = status;

		const ownedLevels = levels.length
			? BackerLevelMap[levels[0]]
			: [BackerType.None];

		this.update({
			authorized: !!userId,
			userId,
			levels: ownedLevels,
			loaded: true
		});
	}

	public refresh()
	{
		this.initialize();
	}

	public hasLevel(backerType: BackerType)
	{
		return this.state.levels?.indexOf(backerType) > -1;
	}

}

export const AuthDataStore = _AuthDatastore.Instance;