import {GamePlayer} from "../Game/GameContract";
import {IAuthContext} from "../../Auth/UserContract";
import {BackerType} from "../../../../client/src/Global/Platform/Contract";

const LowestBacker = BackerType["Hide Ads (Pay-what-you-want)"];
const BackerHideGameAds = BackerType["Ad-free Games"];

export const BackerLevelMap = {
	[BackerType.None]: [BackerType.None],
	[LowestBacker]: [LowestBacker],
	[BackerHideGameAds]: [BackerHideGameAds, LowestBacker],
	[BackerType.Sponsor]: [LowestBacker, BackerHideGameAds, BackerType.Sponsor],
	[BackerType.Owner]: [LowestBacker, BackerHideGameAds, BackerType.Sponsor, BackerType.Owner],
};

class _PlayerManager
{
	public static Instance = new _PlayerManager();

	public createPlayer(authContext: IAuthContext, playerGuid: string, nickname: string, isSpectating: boolean, isRandom: boolean): GamePlayer
	{
		const ownedLevels = authContext.levels.length
			? BackerLevelMap[authContext.levels[0] as BackerType]
			: [BackerType.None];

		return {
			isSubscriber: ownedLevels.includes(LowestBacker),
			hideGameAds: ownedLevels.includes(BackerType["Ad-free Games"]),
			levels: authContext.levels,
			guid: playerGuid,
			whiteCards: [],
			nickname,
			wins: 0,
			isSpectating,
			isRandom,
			isIdle: false,
			kickedForTimeout: false,
			isApproved: isRandom ? true : null
		};
	}
}

export const PlayerManager = _PlayerManager.Instance;