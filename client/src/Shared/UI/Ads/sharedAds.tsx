import * as React from "react";
import {useEffect, useState} from "react";
import {useDataStore, usePrevious} from "@Global/Utils/HookUtils";
import {AuthDataStore} from "@Global/DataStore/AuthDataStore";
import {HistoryDataStore} from "@Global/DataStore/HistoryDataStore";
import {EnvDataStore} from "@Global/DataStore/EnvDataStore";

declare var adsbygoogle: any;

type AdProps = React.PropsWithChildren<React.HTMLProps<HTMLDivElement>>;

export const HideableAd: React.FC<AdProps> = (props) =>
{
	const {
		children,
		style,
		...rest
	} = props;

	if (String("ads") === "enabled")
	{
		return null;
	}

	const authData = useDataStore(AuthDataStore);
	const envData = useDataStore(EnvDataStore);

	if (envData.site?.family)
	{
		return null;
	}

	if (authData.authorized && authData.isSubscriber)
	{
		return null;
	}

	const align = {
		align: "center",
		style: {
			height: 100,
			margin: "1rem 0",
			maxWidth: "90vw",
			...style
		}
	};

	return (
		<div
			{...align}
			{...rest}
		>
			<div className={"adwrap"}>
				{props.children}
			</div>
		</div>
	);
};

const AdRefresher: React.FC<AdProps> = (props) =>
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
		return <>
			{props.children}
		</>;
	}
}

export const Ad720x90: React.FC<AdProps> = (props) =>
{
	const mobile = matchMedia('(max-width:768px)').matches;

	if (mobile)
	{
		return <AdResponsive/>;
	}

	return (
		<HideableAd {...props}>
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

export const AdResponsive: React.FC<AdProps> = (props) =>
{
	const [delayShow, setDelayShow] = useState(false);

	useEffect(() =>
	{
		setTimeout(() => setDelayShow(true), 1500);
	}, []);

	if (!delayShow)
	{
		return null;
	}

	return (
		<HideableAd {...props}>
			<AdRefresher>
				<ins className="adsbygoogle adResponsive"
				     style={{
					     display: "block",
					     height: 100,
					     maxHeight: 100
				     }}
				     data-ad-client="ca-pub-8346501809638313"
				     data-ad-slot="7995851073"
				     data-ad-format="rectangle,horizontal"/>
			</AdRefresher>
		</HideableAd>
	);
};

export const AdCard: React.FC<AdProps> = (props) =>
{
	return (
		<HideableAd {...props}>
			<AdRefresher>
				<ins className="adsbygoogle"
				     style={{
					     display: "block",
				     }}
				     data-ad-format="fluid"
				     data-ad-layout-key="-6n+ef+1v-2l-b"
				     data-ad-client="ca-pub-8346501809638313"
				     data-ad-slot="6335602272"/>
			</AdRefresher>
		</HideableAd>
	);
};

export const AdMobileBanner: React.FC<AdProps> = (props) =>
{
	return (
		<HideableAd {...props}>
			<AdRefresher>
				<ins className="adsbygoogle"
				     style={{
					     display: "block",
					     maxWidth: 800,
					     height: 90
				     }}
				     data-ad-format="fluid"
				     data-ad-layout-key="-6n+ef+1v-2l-b"
				     data-ad-client="ca-pub-8346501809638313"
				     data-ad-slot="6335602272"/>
			</AdRefresher>
		</HideableAd>
	);
}