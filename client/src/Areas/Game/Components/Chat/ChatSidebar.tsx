import {GameChat} from "./GameChat";
import {Drawer, useMediaQuery} from "@material-ui/core";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

interface Props
{
	chatDrawerOpen: boolean;
}

const useStyles = makeStyles({
	paper: {
		paddingTop: 64,
		width: 320
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
			style={{flex: chatDrawerOpen ? 1 : 0}}
			variant="persistent"
			anchor="right"
			open={chatDrawerOpen}
		>
			<GameChat/>
		</Drawer>
	);
};