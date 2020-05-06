import {LinearProgress, TextField, Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import React, {useState} from "react";
import {GameDataStore} from "../../../../Global/DataStore/GameDataStore";
import {useDataStore} from "../../../../Global/Utils/HookUtils";
import {SettingsBlockMainPacks} from "./SettingsBlockMainPacks";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import {MdDelete, MdEdit} from "react-icons/all";
import DialogContent from "@material-ui/core/DialogContent";
import Divider from "@material-ui/core/Divider";
import Dialog from "@material-ui/core/Dialog";

export const SettingsBlockCustomPacks: React.FC = () =>
{
	const gameData = useDataStore(GameDataStore);
	const [cardCastDeckCode, setCardCastDeckCode] = useState("");

	const onPacksChange = (event: React.ChangeEvent<HTMLInputElement>) =>
	{
		const newPacks = event.target.checked
			? [...gameData.ownerSettings.includedPacks, event.target.name]
			: gameData.ownerSettings.includedPacks.filter(a => a !== event.target.name);
		GameDataStore.setIncludedPacks(newPacks);
	};

	const onAddCardCastDeck = () =>
	{
		if (!gameData.ownerSettings.includedCardcastPacks?.includes(cardCastDeckCode))
		{
			const allCodes = cardCastDeckCode.split(",").map(c => c.trim());
			GameDataStore.setIncludedCardcastPacks([...gameData.ownerSettings.includedCardcastPacks, ...allCodes]);
		}

		setCardCastDeckCode("");
	};

	const removeCardCastDeck = (packId: string) =>
	{
		const newDecks = [...gameData.ownerSettings.includedCardcastPacks].filter(p => p !== packId);

		GameDataStore.setIncludedCardcastPacks(newDecks);
	};

	return (
		<>
			<div>
				<TextField value={cardCastDeckCode} style={{margin: "0 1rem 1rem 0"}} size={"small"} onChange={e => setCardCastDeckCode(e.target.value)} id="outlined-basic" label="CardCast Deck Code" variant="outlined"/>
				<Button variant={"contained"} color={"primary"} onClick={onAddCardCastDeck} disabled={cardCastDeckCode.length !== 5 && !cardCastDeckCode.includes(",")}>
					Add Deck
				</Button>
				<Typography variant={"subtitle2"}>
					Add one code, or a comma-separated list
				</Typography>
			</div>

			{(gameData.ownerSettings.includedCardcastPacks?.length ?? 0 > 0) ?
				(
					<List>
						{gameData.ownerSettings.includedCardcastPacks?.map((packId, index) =>
						{
							const packDef = gameData.cardcastPackDefs[packId];
							if (!packDef)
							{
								return null;
							}

							return (
								<>
									{index > 0 && (
										<Divider/>
									)}
									<ListItem>
										<ListItemText>{packDef.name}</ListItemText>
										<ListItemSecondaryAction>
											<IconButton color={"primary"} onClick={() => removeCardCastDeck(packId)}>
												<MdDelete/>
											</IconButton>
										</ListItemSecondaryAction>
									</ListItem>
								</>
							);
						})}
					</List>
				)
				:
				null
			}
			{gameData.cardcastPacksLoading && (
				<LinearProgress color="primary"/>
			)}
		</>
	);
};