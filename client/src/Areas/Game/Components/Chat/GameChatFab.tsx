import {Dialog, DialogContent} from "@material-ui/core";
import React, {useState} from "react";
import Helmet from "react-helmet";
import Fab from "@material-ui/core/Fab";
import {FiMessageCircle} from "react-icons/all";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {GameChat} from "./GameChat";

interface IGameChatProps
{
	showChat: boolean;
}

const useStyles = makeStyles({
	dialogContent: {
		margin: "3rem"
	},
	dialogContainer: {
		alignItems: "flex-end",
		justifyContent: "flex-end"
	}
});

export const GameChatFab: React.FC<IGameChatProps> = (props) =>
{
	const classes = useStyles();
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<>
			{(props.showChat) && (
				<Fab variant="extended"
				     color="secondary"
				     aria-label="add"
				     onClick={() => setDialogOpen(true)}
				     style={{position: "fixed", bottom: 15, right: 15, zIndex: 15}}>
					<FiMessageCircle style={{marginRight: "1rem"}}/> Chat
				</Fab>
			)}
			<Dialog open={dialogOpen} classes={{
				paper: classes.dialogContent,
				container: classes.dialogContainer,
			}} onClose={() => setDialogOpen(false)} style={{bottom: 15}}>
				<DialogContent>
					<GameChat/>
				</DialogContent>
			</Dialog>
		</>
	);
};