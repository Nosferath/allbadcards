import {GameChat} from "./GameChat";
import {Drawer, useMediaQuery} from "@material-ui/core";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {ChatDataStore} from "../../../../Global/DataStore/ChatDataStore";
import {useDataStore} from "../../../../Global/Utils/HookUtils";
import {AuthDataStore} from "@Global/DataStore/AuthDataStore";
import {AdResponsive} from "../../../../Shared/UI/Ads/sharedAds";
import {RemoveAdsButton} from "../../../../Shared/UI/Ads/RemoveAdsButton";

interface Props
{
	ownerHidingAds: boolean;
}

const useStyles = (showAds: boolean) => makeStyles({
	root: {
		overflow: "hidden",
		background: "transparent"
	},
	paper: {
		paddingTop: 64,
		overflow: "hidden",
		paddingRight: showAds ? "18vw" : 0,
		width: showAds ? "33vw" : "15vw",
		background: "transparent"
	}
});

export const ChatSidebar: React.FC<Props> = (props) =>
{
	const authData = useDataStore(AuthDataStore);
	const classes = useStyles(!authData.isSubscriber && !props.ownerHidingAds)();
	const tablet = useMediaQuery('(max-width:1200px)');
	const chatData = useDataStore(ChatDataStore);

	if (tablet)
	{
		return null;
	}

	const chatDrawerOpen = chatData.sidebarOpen;

	return (
		<Drawer
			classes={classes}
			style={{
				flex: chatDrawerOpen ? 1 : 0,
				overflow: "hidden"
			}}
			variant="persistent"
			anchor="right"
			open={chatDrawerOpen}
		>
			<GameChat/>
			{!props.ownerHidingAds && (
				<div style={{
					position: "absolute",
					right: 0,
					top: 64,
					height: "100%",
					width: "18vw"
				}}>
					<br/>
					<RemoveAdsButton/>
					<br/>
					<AdResponsive/>
					<AdResponsive/>
					<AdResponsive/>
				</div>
			)}

			<div style={{
				top: 0,
				height: "100%",
				width: 1,
				position: "absolute",
				right: !authData.isSubscriber ? "18vw" : 0,
				background: "#CCC"
			}}/>
		</Drawer>
	);
};