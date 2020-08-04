import * as React from "react";
import {useEffect} from "react";
import {useDataStore} from "../../Global/Utils/HookUtils";
import {AuthDataStore} from "../../Global/DataStore/AuthDataStore";

declare var adsbygoogle: any;

export const HideableAd = (props: React.PropsWithChildren<any>) =>
{
	const authData = useDataStore(AuthDataStore);

	if (authData.authorized && authData.isSubscriber)
	{
		return null;
	}

	const align = {
		align: "center"
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

export const AdFixedBottom = () =>
{
	useEffect(() =>
	{
		adsbygoogle = adsbygoogle || []
		adsbygoogle.push({})
	});

	return (
		<HideableAd>
			<ins className="adsbygoogle"
			     style={{display: "block"}}
			     data-ad-client="ca-pub-8346501809638313"
			     data-ad-slot="4227022681"
			     data-ad-format="auto"
			     data-full-width-responsive="true"/>
		</HideableAd>
	);
};