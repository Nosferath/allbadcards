import {ButtonGroup, ListItem, ListItemText, Typography} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import Button from "@material-ui/core/Button";
import {Twemoji} from "react-emoji-render";
import {Platform} from "../../../Global/Platform/platform";
import List from "@material-ui/core/List";
import {FaDollarSign, FaPaypal, RiExternalLinkLine} from "react-icons/all";
import {makeStyles} from "@material-ui/styles";
import {EnvDataStore} from "../../../Global/DataStore/EnvDataStore";
import {useDataStore} from "../../../Global/Utils/HookUtils";

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
		<Button
			variant={"contained"}
			color={"secondary"}
			style={{color: "white", textDecoration: "none", marginTop: "1rem", backgroundColor: "#058dc7"}}
			startIcon={<Twemoji text={"☕"}/>}
			onClick={() => Platform.trackEvent("support-link-click", "kofi")}
			href="https://ko-fi.com/A76217J" target="_blank"
		>
			Buy me a coffee
		</Button>,
		<a href='https://ko-fi.com/A76217J' target='_blank' onClick={() => Platform.trackEvent("support-link-click", "kofi-coffee")}>
			<img
				height='36'
				style={{border: 0, height: 36, marginTop: "1rem"}}
				src='https://cdn.ko-fi.com/cdn/kofi2.png?v=2'
				alt='Buy Me a Coffee at ko-fi.com'
			/>
		</a>,
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
	const thankYouButton = thankYous[which];

	return (
		<div style={{
			marginTop: "3rem",
			marginBottom: "8rem",
			textAlign: "center"
		}}>
			<Typography variant={"h6"}>Did you enjoy the game? One dude made this site and it runs on donations!</Typography>
			<Typography style={{marginTop: "1rem"}}>
				{thankYouButton}
				<List>
					<ListItem>
						<ListItemText style={{textAlign: "center"}} primary={<>
							<ButtonGroup orientation={"vertical"}>
								<Button startIcon={<FaPaypal/>} endIcon={<RiExternalLinkLine/>} variant={"outlined"} size={"large"} className={classes.link} href={"https://paypal.me/jakelauer"} target={"_blank"}>
									paypal
								</Button>
								<Button startIcon={<img width={18} src={"https://cdn1.venmo.com/marketing/images/branding/venmo-icon.svg"}/>} endIcon={<RiExternalLinkLine/>} variant={"outlined"} size={"large"} className={classes.link} href={"https://venmo.com/allbadcards"} target={"_blank"}>
									venmo
								</Button>
								<Button startIcon={<FaDollarSign/>} endIcon={<RiExternalLinkLine/>} variant={"outlined"} size={"large"} className={classes.link} href={"https://cash.app/$allbadcards"} target={"_blank"}>
									$cash
								</Button>
							</ButtonGroup>
						</>}/>
					</ListItem>
				</List>
			</Typography>
		</div>
	);
};
