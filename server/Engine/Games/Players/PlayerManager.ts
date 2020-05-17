import {GamePlayer} from "../Game/Contract";

class _PlayerManager
{
	public static Instance = new _PlayerManager();

	public createPlayer(playerGuid: string, nickname: string, isSpectating: boolean, isRandom: boolean): GamePlayer
	{
		return {
			guid: playerGuid,
			whiteCards: [],
			nickname,
			wins: 0,
			isSpectating,
			isRandom
		};
	}
}

export const PlayerManager = _PlayerManager.Instance;