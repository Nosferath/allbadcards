import Divider from "@material-ui/core/Divider";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import {Dialog, DialogContent, ListItemSecondaryAction, Typography} from "@material-ui/core";
import React, {useState} from "react";
import {useDataStore} from "../../../../Global/Utils/HookUtils";
import {GameDataStore} from "../../../../Global/DataStore/GameDataStore";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import Switch from "@material-ui/core/Switch";
import {FaQuestionCircle} from "react-icons/all";

export const SettingsBlockMainPacks = () =>
{
	const [expDialogOpen, setExpDialogOpen] = useState(false);
	const gameData = useDataStore(GameDataStore);

	const onPacksChange = (event: React.ChangeEvent<HTMLInputElement>) =>
	{
		const newPacks = event.target.checked
			? [...gameData.ownerSettings.includedPacks, event.target.name]
			: gameData.ownerSettings.includedPacks.filter(a => a !== event.target.name);
		GameDataStore.setIncludedPacks(newPacks);
	};

	const selectDefault = () =>
	{
		GameDataStore.setIncludedPacks(GameDataStore.getDefaultPacks(gameData.loadedPacks));
	};

	const selectAll = () =>
	{
		GameDataStore.setIncludedPacks(gameData.loadedPacks?.map(p => p.packId));
	};

	const selectNone = () =>
	{
		GameDataStore.setIncludedPacks([]);
	};

	const mobile = useMediaQuery('(max-width:600px)');

	return (
		<>
			<Button startIcon={<FaQuestionCircle/>} variant={"outlined"} onClick={() => setExpDialogOpen(true)}>
				Looking for the official packs?
			</Button>

			<Divider style={{margin: "1rem 0"}}/>
			<div>
				<ButtonGroup orientation={mobile ? "vertical" : "horizontal"}>
					<Button onClick={selectAll}>All</Button>
					<Button onClick={selectNone}>None</Button>
					<Button onClick={selectDefault}>Suggested</Button>
				</ButtonGroup>
				<Typography style={{padding: "1rem 0"}}>
					<strong>{gameData.ownerSettings.includedPacks?.length ?? 0}</strong> packs selected
				</Typography>
			</div>
			<List>
				{gameData.loadedPacks?.map(pack => (
					<>
						<ListItem>
							<ListItemText primary={pack.name} secondary={`${pack.quantity.black} black cards, ${pack.quantity.white} white cards`}/>
							<ListItemSecondaryAction>
								<Switch
									edge="end"
									color={"secondary"}
									onChange={onPacksChange}
									name={pack.packId}
									checked={gameData.ownerSettings.includedPacks.indexOf(pack.packId) > -1}
								/>
							</ListItemSecondaryAction>
						</ListItem>
					</>
				))}
			</List>
			<Dialog open={expDialogOpen} onClose={() => setExpDialogOpen(false)}>
				<DialogContent>
					On May 15, 2020, we received communication from Cards Against Humanity that our usage of the official Cards Against Humanity packs
					was not permitted under their interpretation of the CC-BY-NC license. At the same time, they removed the license from their website.
					<br/>
					<br/>
					Under their interpretation, requesting donations violates the "non-commercial" portion of the license. We disagreed, as the language
					of the license stipulates "non-commercial" to mean: "not primarily intended for or directed towards commercial advantage or monetary compensation".
					Given that we are clear that donations primarily are used to run the website, we thought All Bad Cards would be fine.
					<br/>
					<br/>
					Cards Against Humanity disagreed. As such, we have created a version of All Bad Cards that only uses the official packs, and does not
					include donations or sponsors. You can access it at <strong>lite.allbad.cards</strong>:
					<br/><br/>
					<Button href={`https://lite.${location.host}/`} variant={"outlined"}>
						Go to the Lite version
					</Button>
				</DialogContent>
			</Dialog>
		</>
	);
};