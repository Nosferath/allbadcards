import React, {useState} from "react";
import {GameDataStore} from "../../../../Global/DataStore/GameDataStore";
import {useDataStore} from "../../../../Global/Utils/HookUtils";
import {Alert, AlertTitle} from "@material-ui/lab";

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
				<Alert color={"error"}>
					<AlertTitle>Sorry!</AlertTitle>
					CardCast shut down. CardCast packs are no longer supported.
				</Alert>
			</div>
		</>
	);
};