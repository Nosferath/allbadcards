import {DataStore} from "@Global/DataStore/DataStore";
import {Platform} from "@Global/Platform/platform";
import {UserData} from "@Global/DataStore/UserDataStore";

interface IKickPlayerDataStorePayload
{
	kickCandidateGuid: string | null;
}

class _KickPlayerDataStore extends DataStore<IKickPlayerDataStorePayload>
{
	public static Instance = new _KickPlayerDataStore();

	constructor()
	{
		super({
			kickCandidateGuid: null
		});
	}

	public setKickCandidate(playerGuid: string)
	{
		this.update({
			kickCandidateGuid: playerGuid
		});
	}

	public cancelKickCandidate()
	{
		this.update({
			kickCandidateGuid: null
		});
	}

	public approveKickCandidate(gameId: string, userData: UserData)
	{
		if(this.state.kickCandidateGuid)
		{
			Platform.removePlayer(gameId, this.state.kickCandidateGuid, userData.playerGuid)
				.then(() => {
					this.update({
						kickCandidateGuid: null
					});
				})
				.catch(e => console.error(e));
		}
	}
}

export const KickPlayerDataStore = _KickPlayerDataStore.Instance;