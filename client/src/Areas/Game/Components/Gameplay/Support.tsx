import React, {useEffect, useState} from "react";
import Button from "@material-ui/core/Button";
import {Twemoji} from "react-emoji-render";
import {Platform} from "@Global/Platform/platform";
import {makeStyles} from "@material-ui/styles";
import {EnvDataStore} from "@Global/DataStore/EnvDataStore";
import {useDataStore} from "@Global/Utils/HookUtils";
import {AdResponsive} from "../../../../Shared/UI/Ads/sharedAds";

const useStyles = makeStyles({
	link: {
		textDecoration: 'none'
	}
});

export const Support = () =>
{
	const classes = useStyles();
	const [randomThankYou, setRandomThankYou] = useState(0);
	const envData = useDataStore(EnvDataStore);

	useEffect(() =>
	{
		setRandomThankYou(Math.random());
		Platform.trackEvent("saw-support-message");
	}, []);

	if (!envData.site.base)
	{
		return null;
	}

	const thankYous = [
		<>
			<div>
				<a href={"http://patreon.com/allbadcards"} target={"_blank"} rel={"noreferrer nofollow"}>
					<img src={"/become_a_patron_button.png"}/>
				</a>
			</div>
			<div>
				- OR -
			</div>
		</>,
		<Button
			variant={"contained"}
			color={"secondary"}
			style={{color: "white", textDecoration: "none", marginTop: "1rem", backgroundColor: "#058dc7"}}
			startIcon={<Twemoji text={"☕"}/>}
			onClick={() => Platform.trackEvent("support-link-click", "bmac-coffee")}
			href="https://www.buymeacoffee.com/allbadcards" target="_blank"
		>
			Buy me a coffee
		</Button>,
	];

	const which = Math.floor(randomThankYou * thankYous.length);

	return (
		<div style={{
			marginTop: "3rem",
			marginBottom: "8rem",
			textAlign: "center"
		}}>
			<AdResponsive/>
		</div>
	);
};
