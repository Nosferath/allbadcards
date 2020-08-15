import {useHistory} from "react-router";
import {useDataStore} from "../Global/Utils/HookUtils";
import {ChatDataStore} from "../Global/DataStore/ChatDataStore";
import {Button, ButtonGroup, Container, IconButton, Switch, Typography, useMediaQuery} from "@material-ui/core";
import {FaGithub, FaPatreon, FaRedditAlien, FaTwitter, MdBugReport, TiLightbulb} from "react-icons/all";
import * as React from "react";
import {PreferencesDataStore} from "../Global/DataStore/PreferencesDataStore";
import {AdResponsive} from "../Shared/UI/Ads/sharedAds";
import {RemoveAdsButton} from "../Shared/UI/Ads/RemoveAdsButton";

export const Footer = () =>
{
	const history = useHistory();
	const chatData = useDataStore(ChatDataStore);
	const tablet = useMediaQuery('(max-width:1200px)');
	const isGamePage = history.location.pathname.startsWith("/game/");

	const isHome = history.location.pathname === "/";
	const bugReportUrl = "https://github.com/jakelauer/allbadcards/issues/new?assignees=jakelauer&labels=bug&template=bug_report.md";
	const featureRequestUrl = "https://github.com/jakelauer/allbadcards/issues/new?assignees=jakelauer&labels=enhancement&template=feature_request.md";
	const date = new Date();
	const year = date.getFullYear();
	const chatMode = (isGamePage && chatData.sidebarOpen && !tablet);

	return (
		<Container
			maxWidth={"xl"}
			style={{
				position: "relative",
				padding: "2rem 0 0 0",
				maxWidth: chatMode ? "calc(100% - 320px)" : "100%",
				marginLeft: chatMode ? "0" : "auto"
			}}
		>
			<AdResponsive />
			<RemoveAdsButton/>
			<DarkModeSwitch/>
			<div style={{textAlign: "center", padding: "0.5rem 0"}}>
				<ButtonGroup style={{margin: "1rem 0 2rem"}}>
					<Button
						size={"small"}
						color={"default"}
						variant={"outlined"}
						href={bugReportUrl}
						target={"_blank"}
						rel={"noreferrer nofollow"}
						startIcon={<MdBugReport/>}
					>
						Report a Bug
					</Button>
					<Button
						size={"small"}
						color={"default"}
						variant={"outlined"}
						startIcon={<TiLightbulb/>}
						href={featureRequestUrl}
						target={"_blank"}
						rel={"noreferrer nofollow"}
					>
						Feature Idea
					</Button>
				</ButtonGroup>
				<Typography>
					&copy; {year}. Created by <a href={"http://jakelauer.com"}>Jake Lauer</a> (<a href={"https://reddit.com/u/HelloControl_"}>HelloControl_</a>)
					<br/>
					<br/>
					Email me at <strong>allbadcards(at)gmail.com</strong>
					<br/>
				</Typography>
				<ButtonGroup>
					<IconButton href={"https://github.com/jakelauer/allbadcards"} target={"_blank"} color={"secondary"}>
						<FaGithub/>
					</IconButton>
					<IconButton href={"https://reddit.com/r/allbadcards"} target={"_blank"} color={"secondary"}>
						<FaRedditAlien/>
					</IconButton>
					<IconButton href={"http://twitter.com/allbadcards/"} target={"_blank"} color={"secondary"}>
						<FaTwitter/>
					</IconButton>
					<IconButton href={"http://patreon.com/allbadcards/"} target={"_blank"} color={"secondary"}>
						<FaPatreon/>
					</IconButton>
				</ButtonGroup>
			</div>
		</Container>
	)
};

const DarkModeSwitch = () =>
{
	const preferences = useDataStore(PreferencesDataStore);

	return (
		<div style={{textAlign: "center", marginTop: "1rem"}}>
			Dark Mode
			<Switch
				onChange={e => PreferencesDataStore.setDarkMode(e.target.checked)}
				checked={preferences.darkMode}
			/>
		</div>
	)
};