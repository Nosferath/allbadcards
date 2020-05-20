import React, {useEffect, useState} from "react";
import {GameDataStore} from "../../../../Global/DataStore/GameDataStore";
import {useDataStore} from "../../../../Global/Utils/HookUtils";
import {ICustomPackSearchResult} from "../../../../Global/Platform/Contract";
import {Platform} from "../../../../Global/Platform/platform";
import {AuthDataStore} from "../../../../Global/DataStore/AuthDataStore";
import {ErrorDataStore} from "../../../../Global/DataStore/ErrorDataStore";
import {List, ListItem, ListItemSecondaryAction, ListItemText, Switch} from "@material-ui/core";

export const SettingsBlockCustomPacks: React.FC = () =>
{
	const authState = useDataStore(AuthDataStore);
	const gameData = useDataStore(GameDataStore);
	const [favs, setFavs] = useState<ICustomPackSearchResult | null>(null);

	useEffect(() =>
	{
		if (authState.authorized)
		{
			Platform.getMyFavoritePacks()
				.then(data => setFavs(data.result))
				.catch(ErrorDataStore.add);
		}
	}, []);

	const setPacks = (packId: string, included: boolean) =>
	{
		let packs = [...gameData.ownerSettings.includedCustomPackIds];
		if (included && !packs.includes(packId))
		{
			packs.push(packId);
		}
		else
		{
			packs = packs.filter(pid => pid === packId);
		}

		GameDataStore.setIncludeCustomPacks(packs);
	};


	return (
		<>
			<List style={{width: "75vw", maxWidth: "40rem"}}>
				{favs?.packs?.map(pack => (
					<ListItem>
						<ListItemText
							primary={pack.definition.pack.name}
							secondary={<>
								Q: <strong>{pack.definition.quantity.black}</strong> // A: <strong>{pack.definition.quantity.white}</strong> // {pack.isNsfw ? "NSFW" : "SFW"}
							</>}
						/>
						<ListItemSecondaryAction>
							<Switch onChange={e => setPacks(pack.definition.pack.id, e.target.checked)}/>
						</ListItemSecondaryAction>
					</ListItem>
				))}
			</List>
		</>
	);
};