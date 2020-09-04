import {DataStore} from "@Global/DataStore/DataStore";

require("fuckadblock");

type FAB = {
	onDetected: (cb: () => void) => void;
	onNotDetected: (cb: () => void) => void;
}
declare var fuckAdBlock: undefined | FAB;

class _AdBlockDataStore extends DataStore<{adBlockerDetected: boolean}>
{
	public static Instance = new _AdBlockDataStore();

	constructor()
	{
		super({
			adBlockerDetected: false
		});

		if (!fuckAdBlock)
		{
			this.onDetected();
		}
		else
		{
			fuckAdBlock?.onDetected(this.onDetected);
		}
	}

	private readonly onDetected = () => {
		this.update({
			adBlockerDetected: true
		});
	}
}

export const AdBlockDataStore = _AdBlockDataStore.Instance;