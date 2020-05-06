import Divider from "@material-ui/core/Divider";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import {createStyles, ListItemSecondaryAction, Typography} from "@material-ui/core";
import React from "react";
import {useDataStore} from "../../../../Global/Utils/HookUtils";
import {GameDataStore} from "../../../../Global/DataStore/GameDataStore";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import Switch from "@material-ui/core/Switch";

export const SettingsBlockMainPacks = () =>
{
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
		GameDataStore.setIncludedPacks(Array.from(new Set([...gameData.ownerSettings.includedPacks, ...GameDataStore.getDefaultPacks(gameData.loadedPacks)])));
	};

	const selectAll = () =>
	{
		GameDataStore.setIncludedPacks(gameData.loadedPacks?.map(p => p.packId));
	};

	const selectNone = () =>
	{
		GameDataStore.setIncludedPacks([]);
	};

	const selectOfficial = () =>
	{
		const packs = gameData.loadedPacks
			?.filter(pack => pack.isOfficial)
			?.map(pack => pack.packId);

		GameDataStore.setIncludedPacks(Array.from(new Set([...gameData.ownerSettings.includedPacks, ...packs])));
	};

	const selectThirdParty = () =>
	{
		const packs = gameData.loadedPacks
			?.filter(pack => !pack.isOfficial)
			?.map(pack => pack.packId);

		GameDataStore.setIncludedPacks(Array.from(new Set([...gameData.ownerSettings.includedPacks, ...packs])));
	};

	const mobile = useMediaQuery('(max-width:600px)');

	return (
		<>
			<Divider style={{marginBottom: "1rem"}}/>
			<div>
				<ButtonGroup orientation={mobile ? "vertical" : "horizontal"}>
					<Button onClick={selectAll}>All</Button>
					<Button onClick={selectNone}>None</Button>
					<Button onClick={selectDefault}>+ Suggested</Button>
					<Button onClick={selectOfficial}>+ Official Packs</Button>
					<Button onClick={selectThirdParty}>+ Third-Party Packs</Button>
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
		</>
	);
};