import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import React, {ChangeEvent, useState} from "react";
import {GameDataStore, GameDataStorePayload} from "../../../../Global/DataStore/GameDataStore";
import FormControl from "@material-ui/core/FormControl";
import Divider from "@material-ui/core/Divider";
import {ListItemSecondaryAction, Slider, TextField, Typography} from "@material-ui/core";
import {useDataStore} from "../../../../Global/Utils/HookUtils";
import Game from "../../Game";
import Checkbox from "@material-ui/core/Checkbox";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Switch from "@material-ui/core/Switch";
import List from "@material-ui/core/List";
import Button from "@material-ui/core/Button";

const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

export const SettingsBlockGeneral: React.FC = () =>
{
	const gameData = useDataStore(GameDataStore);

	return (
		<List style={{paddingBottom: "1rem"}}>
			<MakePrivate gameData={gameData} />

			<Divider style={{margin: "0 0 1rem 0"}}/>
			<UrlField gameData={gameData}/>
		</List>
	);
};


interface IGameDataProps
{
	gameData: GameDataStorePayload;
}

let timeout = 0;
const UrlField: React.FC<IGameDataProps> = ({
	                                            gameData
                                            }) =>
{
	const [url, setUrl] = useState(gameData.ownerSettings.inviteLink ?? "");
	const [invalid, setInvalid] = useState(false);

	const setOuter = (value: string) =>
	{
		setUrl(value);

		clearTimeout(timeout);
		timeout = window.setTimeout(() =>
		{
			const invalid = value.length > 0 && !value.match(urlRegex);
			setInvalid(invalid);
			if (!invalid)
			{
				GameDataStore.setInviteLink(value);
			}
		}, 500);
	};

	return (
		<ListItem>
			<FormControl component="fieldset" style={{width: "100%"}}>
				<Typography>Chat / Video invite URL</Typography>
				<Typography style={{marginBottom: "0.5rem"}} variant={"caption"}>Allow players to easily join your video chat by adding an invite URL</Typography>
				<TextField color={"secondary"} value={url} label="URL" variant="outlined" onChange={(e) => setOuter(e.target.value)} error={invalid}/>
			</FormControl>
		</ListItem>
	);
};

const MakePrivate: React.FC<IGameDataProps> = (
	{
		gameData
	}
) =>
{
	const onChange = (e: ChangeEvent<{}>, v: boolean) =>
	{
		GameDataStore.setGamePublic(v);
	};

	return (
		<FormControl component="fieldset" style={{width: "100%"}}>
			<ListItem>
				<ListItemText primary={"Make Public"} secondary={`When enabled, this game will be visible and joinable by anybody from the game list page.`}/>
				<ListItemSecondaryAction>
					<Switch
						edge="end"
						color={"secondary"}
						onChange={onChange}
						name={"isPublic"}
						checked={gameData.ownerSettings.public}
					/>
				</ListItemSecondaryAction>
			</ListItem>
		</FormControl>
	);
};

const CustomWhites: React.FC<IGameDataProps> = (
	{
		gameData
	}
) =>
{
	const onChange = (e: ChangeEvent<{}>, v: boolean) =>
	{
		GameDataStore.setCustomWhites(v);
	};

	return (
		<FormControl component="fieldset" style={{width: "100%"}}>
			<ListItem>
				<ListItemText primary={"Write Your Own!"} secondary={`Write your own answers instead of using the built-in white cards!`}/>
				<ListItemSecondaryAction>
					<Switch
						edge="end"
						color={"secondary"}
						onChange={onChange}
						name={"isPublic"}
						checked={gameData.ownerSettings.public}
					/>
				</ListItemSecondaryAction>
			</ListItem>
		</FormControl>
	);
};

let sliderTimeout = 0;
const RoundsRequiredField: React.FC<IGameDataProps> = ({
	                                                       gameData
                                                       }) =>
{
	const onChange = (e: ChangeEvent<{}>, v: number | number[]) =>
	{
		clearTimeout(sliderTimeout);
		sliderTimeout = window.setTimeout(() =>
		{
			GameDataStore.setRequiredRounds(v as number)
		}, 500);
	};

	return (
		<ListItem>
			<FormControl component="fieldset" style={{width: "100%"}}>
				<Typography>Rounds required to win: {gameData.ownerSettings?.roundsToWin}</Typography>
				<Typography style={{marginBottom: "0.5rem"}} variant={"caption"}>The game will end if a player wins this many rounds</Typography>
				<Slider
					defaultValue={gameData.ownerSettings?.roundsToWin}
					onChange={onChange}
					aria-labelledby="discrete-slider"
					valueLabelDisplay="auto"
					step={1}
					marks
					min={1}
					max={25}
				/>
			</FormControl>
		</ListItem>
	);
};

const PlayerLimitField: React.FC<IGameDataProps> = ({
	                                                    gameData
                                                    }) =>
{
	const onChange = (e: ChangeEvent<{}>, v: number | number[]) =>
	{
		clearTimeout(sliderTimeout);
		sliderTimeout = window.setTimeout(() =>
		{
			GameDataStore.setPlayerLimit(v as number)
		}, 500);
	};

	return (
		<ListItem>
			<FormControl component="fieldset" style={{width: "100%"}}>
				<Typography>Player limit: {gameData.ownerSettings?.playerLimit}</Typography>
				<Typography style={{marginBottom: "0.5rem"}} variant={"caption"}>The maximum number of players for this game</Typography>
				<Slider
					defaultValue={gameData.ownerSettings.playerLimit}
					onChange={onChange}
					aria-labelledby="discrete-slider"
					valueLabelDisplay="auto"
					step={1}
					marks
					min={3}
					max={50}
				/>
			</FormControl>
		</ListItem>
	);
};

const WinnerBecomesCzar: React.FC<IGameDataProps> = ({
	                                                     gameData
                                                     }) =>
{
	const onChange = (e: ChangeEvent<{}>, v: boolean) =>
	{
		GameDataStore.setWinnerBecomesCzar(v);
	};

	return (
		<FormControl component="fieldset" style={{width: "100%"}}>
			<ListItem>
				<ListItemText primary={"Winner Becomes Card Czar"} secondary={`Make the winner of the last round become the Card Czar for the next round.`}/>
				<ListItemSecondaryAction>
					<Switch
						edge="end"
						color={"secondary"}
						onChange={onChange}
						name={"winnerBecomesCzar"}
						checked={gameData.ownerSettings.winnerBecomesCzar}
					/>
				</ListItemSecondaryAction>
			</ListItem>
		</FormControl>
	);
};

const HideDuringReveal: React.FC<IGameDataProps> = ({
	                                                    gameData
                                                    }) =>
{
	const onChange = (e: ChangeEvent<{}>, v: boolean) =>
	{
		GameDataStore.setHideDuringReveal(v);
	};

	return (
		<FormControl component="fieldset" style={{width: "100%"}}>
			<ListItem>
				<ListItemText primary={"Hide Cards During Reveal"} secondary={`While revealing white cards each round, don't show them to the rest of players.`}/>
				<ListItemSecondaryAction>
					<Switch
						edge="end"
						color={"secondary"}
						onChange={onChange}
						name={"hideDuringReveal"}
						checked={gameData.ownerSettings.hideDuringReveal}
					/>
				</ListItemSecondaryAction>
			</ListItem>
		</FormControl>
	);
};

const SkipReveal: React.FC<IGameDataProps> = (
	{
		gameData
	}
) =>
{
	const onChange = (e: ChangeEvent<{}>, v: boolean) =>
	{
		GameDataStore.setSkipReveal(v);
	};

	return (
		<FormControl component="fieldset" style={{width: "100%"}}>
			<ListItem>
				<ListItemText primary={"Skip Reveal"} secondary={`Skip right to picking a winner without reading each white card.`}/>
				<ListItemSecondaryAction>
					<Switch
						edge="end"
						color={"secondary"}
						onChange={onChange}
						name={"hideDuringReveal"}
						checked={gameData.ownerSettings.skipReveal}
					/>
				</ListItemSecondaryAction>
			</ListItem>
		</FormControl>
	);
};