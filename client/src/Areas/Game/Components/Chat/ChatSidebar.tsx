import {GameChat} from "./GameChat";
import {Drawer, useMediaQuery} from "@material-ui/core";
import React, {useEffect, useRef} from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {ChatDataStore} from "../../../../Global/DataStore/ChatDataStore";

interface Props
{
	chatDrawerOpen: boolean;
}

const useStyles = makeStyles({
	root: {
		overflow: "hidden"
	},
	paper: {
		paddingTop: 64,
		overflow: "hidden",
		width: 320,
	}
});

export const ChatSidebar: React.FC<Props> = (
	{
		chatDrawerOpen
	}
) =>
{
	const classes = useStyles();
	const tablet = useMediaQuery('(max-width:1200px)');

	if(tablet)
	{
		return null;
	}

	return (
		<Drawer
			classes={classes}
			style={{flex: chatDrawerOpen ? 1 : 0, overflow: "hidden"}}
			variant="persistent"
			anchor="right"
			open={chatDrawerOpen}
		>
			<GameChat/>
		</Drawer>
	);
};