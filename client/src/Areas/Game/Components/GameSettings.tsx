import React, {ChangeEvent, useState} from "react";
import {DialogActions, DialogTitle, LinearProgress, ListItemAvatar, ListItemSecondaryAction, Slider, TextField, Typography} from "@material-ui/core";
import {useDataStore} from "../../../Global/Utils/HookUtils";
import {GameDataStore} from "../../../Global/DataStore/GameDataStore";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import {ExpandMore} from "@material-ui/icons";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Divider from "@material-ui/core/Divider";
import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import {SettingsBlockGame} from "./Settings/SettingsBlockGame";
import {GiCardPlay, MdEdit, MdSettings} from "react-icons/all";
import {SettingsBlockMainPacks} from "./Settings/SettingsBlockMainPacks";
import IconButton from "@material-ui/core/IconButton";
import {SettingsBlockCustomPacks} from "./Settings/SettingsBlockCustomPacks";
import Avatar from "@material-ui/core/Avatar";
import {UserDataStore} from "../../../Global/DataStore/UserDataStore";
import {SettingsBlockGeneral} from "./Settings/SettingsBlockGeneral";

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

const useStyles = makeStyles({
	whiteBox: {
		height: "1rem",
		border: "1px solid black",
		padding: 5
	},
	blackBox: {
		marginLeft: 20,
		padding: 5,
		height: "1rem",
		background: "black",
		border: "1px solid black",
		color: "white",
	}
});

export const GameSettings = () =>
{
	const userData = useDataStore(UserDataStore);
	const gameData = useDataStore(GameDataStore);
	const [gameSettingsVisible, setGameSettingsVisible] = useState(false);
	const [generalSettingsVisible, setGeneralSettingsVisible] = useState(false);
	const [mainPackSettingsVisible, setMainPackSettingsVisible] = useState(false);
	const [customPackSettingsVisible, setCustomPackSettingsVisible] = useState(false);
	const isOwner = userData.playerGuid === gameData.game?.ownerGuid;

	if(!isOwner)
	{
		return (
			<div>
				<Typography>Only the game owner can edit settings</Typography>
			</div>
		)
	}

	return (
		<div>
			<div style={{marginTop: "1rem"}}>
				<List>
					<ListItem>
						<ListItemAvatar>
							<Avatar>
								<MdSettings style={{color: "black"}}/>
							</Avatar>
						</ListItemAvatar>
						<ListItemText primary={"General"} secondary={"General settings"}/>
						<ListItemSecondaryAction style={{right: 0}}>
							<IconButton color={"primary"} onClick={() => setGeneralSettingsVisible(true)}>
								<MdEdit/>
							</IconButton>
						</ListItemSecondaryAction>
					</ListItem>
					<ListItem>
						<ListItemAvatar>
							<Avatar>
								<GiCardPlay style={{color: "black"}}/>
							</Avatar>
						</ListItemAvatar>
						<ListItemText primary={"Gameplay"} secondary={"Change how the game is played"}/>
						<ListItemSecondaryAction style={{right: 0}}>
							<IconButton color={"primary"} onClick={() => setGameSettingsVisible(true)}>
								<MdEdit/>
							</IconButton>
						</ListItemSecondaryAction>
					</ListItem>
					<ListItem>
						<ListItemAvatar>
							<Avatar>
								<strong style={{color: "black"}}>{(gameData.ownerSettings?.includedPacks.length ?? 0).toString()}</strong>
							</Avatar>
						</ListItemAvatar>
						<ListItemText primary={"Main Card Packs"} secondary={"Pick from official and third-party card packs for your game"}/>
						<ListItemSecondaryAction style={{right: 0}}>
							<IconButton color={"primary"} onClick={() => setMainPackSettingsVisible(true)}>
								<MdEdit/>
							</IconButton>
						</ListItemSecondaryAction>
					</ListItem>
					<ListItem>
						<ListItemAvatar>
							<Avatar>
								<strong style={{color: "black"}}>{(gameData.ownerSettings?.includedCardcastPacks.length ?? 0).toString()}</strong>
							</Avatar>
						</ListItemAvatar>
						<ListItemText primary={"Custom Card Packs"} secondary={
							<span>
								Add custom card packs from <a href={"https://www.cardcastgame.com/browse"} target={"_null"}>CardCast's</a> robust custom deck list.
							</span>
						}/>
						<ListItemSecondaryAction style={{right: 0}}>
							<IconButton color={"primary"} onClick={() => setCustomPackSettingsVisible(true)}>
								<MdEdit/>
							</IconButton>
						</ListItemSecondaryAction>
					</ListItem>
				</List>
			</div>
			<Dialog open={generalSettingsVisible} onClose={() => setGeneralSettingsVisible(false)}>
				<DialogTitle>General</DialogTitle>
				<DialogContent>
					<SettingsBlockGeneral/>
				</DialogContent>
				<Divider/>
				<DialogActions>
					<Button onClick={() => setGeneralSettingsVisible(false)} color="primary">
						Save
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={gameSettingsVisible} onClose={() => setGameSettingsVisible(false)}>
				<DialogTitle>General</DialogTitle>
				<DialogContent>
					<SettingsBlockGame/>
				</DialogContent>
				<Divider/>
				<DialogActions>
					<Button onClick={() => setGameSettingsVisible(false)} color="primary">
						Save
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={mainPackSettingsVisible} onClose={() => setMainPackSettingsVisible(false)} maxWidth={"xl"}>
				<DialogTitle>Main Card Packs</DialogTitle>
				<DialogContent>
					<SettingsBlockMainPacks/>
				</DialogContent>
				<Divider/>
				<DialogActions>
					<Button onClick={() => setMainPackSettingsVisible(false)} color="primary">
						Save
					</Button>
				</DialogActions>
			</Dialog>

			<Dialog open={customPackSettingsVisible} onClose={() => setCustomPackSettingsVisible(false)} maxWidth={"xl"}>
				<DialogTitle>Custom Card Packs</DialogTitle>
				<DialogContent>
					<SettingsBlockCustomPacks/>
				</DialogContent>
				<Divider/>
				<DialogActions>
					<Button onClick={() => setCustomPackSettingsVisible(false)} color="primary">
						Save
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};
