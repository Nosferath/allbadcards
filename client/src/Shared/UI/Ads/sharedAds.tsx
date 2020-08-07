import * as React from "react";
import {useEffect, useState} from "react";
import {useDataStore, usePrevious} from "@Global/Utils/HookUtils";
import {AuthDataStore} from "@Global/DataStore/AuthDataStore";
import {HistoryDataStore} from "@Global/DataStore/HistoryDataStore";

declare var adsbygoogle: any;

export const HideableAd = (props: React.PropsWithChildren<any>) =>
{
	if (String("ads") === "enabled")
	{
		return null;
	}

	const authData = useDataStore(AuthDataStore);

	if (authData.authorized && authData.isSubscriber)
	{
		return null;
	}

	const align = {
		align: "center",
		style: {
			height: 100,
			margin: "1rem 0"
		}
	};

	return (
		<div
			{...align}
		>
			<div className={"adwrap"}>
				{props.children}
			</div>
		</div>
	);
};

const AdRefresher: React.FC = (props) =>
{
	const history = useDataStore(HistoryDataStore);
	const [refresh, setRefresh] = useState(false);
	const prevPath = usePrevious(history.url);

	useEffect(() =>
	{
		let newRefresh = false;
		if (prevPath && prevPath !== history.url)
		{
			newRefresh = true;
			setRefresh(newRefresh);
			setTimeout(() => setRefresh(false), 100);
		}

		if (!newRefresh && !refresh)
		{
			adsbygoogle = adsbygoogle || []
			adsbygoogle.push({})
		}

	}, [history.url, refresh]);

	if (refresh)
	{
		return null;
	}
	else
	{
		return <>{props.children}</>;
	}
}

export const AdFixedBottom = () =>
{
	return (
		<HideableAd>
			<AdRefresher>
				<ins className="adsbygoogle"
				     style={{
					     display: "block",
					     width: 728,
					     height: 90
				     }}
				     data-ad-client="ca-pub-8346501809638313"
				     data-ad-slot="4227022681"
				/>
			</AdRefresher>
		</HideableAd>
	);
};