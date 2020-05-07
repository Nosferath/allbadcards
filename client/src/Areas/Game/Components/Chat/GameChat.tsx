import {GameDataStore} from "../../../../Global/DataStore/GameDataStore";
import {useDataStore} from "../../../../Global/Utils/HookUtils";
import React, {useState} from "react";
import {Button, Card, CardActions, CardContent, List, ListItem, ListItemText, TextField} from "@material-ui/core";
import {Platform} from "../../../../Global/Platform/platform";
import {UserDataStore} from "../../../../Global/DataStore/UserDataStore";


export const GameChat = () =>
{
	const userData = useDataStore(UserDataStore);
	const gameData = useDataStore(GameDataStore);
	const [pendingMessage, setPendingMessage] = useState("");

	const send = () =>
	{
		if (gameData.game?.id)
		{
			Platform.sendChat(userData.playerGuid, gameData.game?.id, pendingMessage)
				.then(() => setPendingMessage(""))
		}
	};

	return (
		<>
			<CardContent>
				<List>
					{gameData.chat?.map(chatPayload => (
						<ListItem>
							<ListItemText>
								{unescape(chatPayload.message)}
							</ListItemText>
						</ListItem>
					))}
				</List>
			</CardContent>
			<CardActions>
				<TextField
					value={pendingMessage}
					onChange={e => setPendingMessage(e.currentTarget.value)}
					color={"secondary"}
				/>
				<Button color={"secondary"} onClick={send}>Send</Button>
			</CardActions>
		</>
	);
};