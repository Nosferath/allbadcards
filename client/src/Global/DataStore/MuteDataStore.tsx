import {DataStore} from "./DataStore";

export interface MutePayload
{
	muted: boolean;
}
const lsKey = "muted";
class _MuteDataStore extends DataStore<MutePayload>
{
	public static Instance = new _MuteDataStore();

	constructor()
	{
		const stringVal = localStorage.getItem(lsKey);
		const initial = stringVal === "true";

		super({
			muted: initial
		});
	}

	protected update(data: MutePayload)
	{
		localStorage.setItem(lsKey, String(data.muted));

		super.update(data);
	}

	public setMute(muted: boolean)
	{
		this.update({
			muted
		});
	}
}

export const MuteDataStore = _MuteDataStore.Instance;