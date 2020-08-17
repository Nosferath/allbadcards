import ReactGA from "react-ga";
import {DataStore} from "./DataStore";

export interface HistoryDataStorePayload
{
	url: string;
}

class _HistoryDataStore extends DataStore<HistoryDataStorePayload>
{
	public static Instance = new _HistoryDataStore({
		url: location.pathname + location.search
	});

	public onChange()
	{
		const newUrl = location.pathname + location.search;

		this.update({
			url: newUrl
		});

		ReactGA.pageview(newUrl);
	}
}

export const HistoryDataStore = _HistoryDataStore.Instance;