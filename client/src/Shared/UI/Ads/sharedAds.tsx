import * as React from "react";
import {useEffect, useState} from "react";
import {useDataStore, usePrevious} from "@Global/Utils/HookUtils";
import {AuthDataStore} from "@Global/DataStore/AuthDataStore";
import {HistoryDataStore} from "@Global/DataStore/HistoryDataStore";
import Grid from "@material-ui/core/Grid";
import {GameOwnerContext} from "../../../Global/Utils/GameOwnerContext";
import {AdBlockDataStore} from "../../../Global/DataStore/AdBlockDataStore";

declare var adsbygoogle: any;

type AdProps = React.PropsWithChildren<React.HTMLProps<HTMLDivElement>>;


export const HideableAd: React.FC<AdProps> = (props) =>
{
	const {
		children,
		style,
		...rest
	} = props;

	const authData = useDataStore(AuthDataStore);
	const {
		adBlockerDetected
	} = useDataStore(AdBlockDataStore);

	if (adBlockerDetected)
	{
		return null;
	}

	if (String("ads") === "enabled")
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
		<GameOwnerContext.Consumer>
			{data => (
				!data?.hideGameAds && (
					<div
						{...align}
						{...rest}
					>
						<div className={"adwrap"}>
							{props.children}
						</div>
					</div>
				)
			)}
		</GameOwnerContext.Consumer>
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
			try
			{
				(window as any).adsbygoogle = (window as any).adsbygoogle ?? []
				adsbygoogle?.push({})
			}
			catch (e)
			{
				console.error(e);
			}
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
				     }}
				     data-ad-client="ca-pub-8346501809638313"
				     data-ad-slot="7995851073"
				     data-ad-format="rectangle,horizontal"/>
			</AdRefresher>
		</HideableAd>
	);
};

export const AdResponsiveCard: React.FC<AdProps> = (props) =>
{
	return (
		<HideableAd {...props}>
			<Grid item xs={12} sm={6} md={4} lg={3} style={{overflow: "hidden"}}>
				<AdResponsive {...props}/>
			</Grid>
		</HideableAd>
	);
}