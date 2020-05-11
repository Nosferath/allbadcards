import {GameDataStore} from "../../../../Global/DataStore/GameDataStore";
import {useDataStore} from "../../../../Global/Utils/HookUtils";
import React, {useEffect, useRef, useState} from "react";
import {Button, Card, CardActions, CardContent, Chip, List, ListItem, ListItemText, TextField} from "@material-ui/core";
import {Platform} from "../../../../Global/Platform/platform";
import {UserDataStore} from "../../../../Global/DataStore/UserDataStore";
import classNames from "classnames";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
	chatWrap: {
		display: "flex",
		flexDirection: "column"
	},
	chatMessage: {
		width: "80%",
		margin: "0.5rem 0",
		alignSelf: "flex-end"
	},
	messageText: {
		borderRadius: "5px",
		backgroundColor: theme.palette.secondary.main,
		color: theme.palette.secondary.contrastText,
		padding: "0.5rem",
	},
	theirs: {
		backgroundColor: "#CCC",
		color: "#000",
	},
	theirsWrapper: {
		alignSelf: "flex-start"
	},
}));

export const GameChat = () =>
{
	const userData = useDataStore(UserDataStore);
	const gameData = useDataStore(GameDataStore);
	const [pendingMessage, setPendingMessage] = useState("");

	const inputRef = useRef<HTMLInputElement>();

	useEffect(() => inputRef.current?.focus());

	const send = () =>
	{
		if (gameData.game?.id)
		{
			Platform.sendChat(userData.playerGuid, gameData.game?.id, pendingMessage)
				.then(() => setPendingMessage(""))
		}
	};

	const getNickname = (playerGuid: string) => gameData.game?.players?.[playerGuid]?.nickname ?? "Unknown";

	const me = userData.playerGuid;

	const classes = useStyles();

	return (
		<>
			<CardContent>
				<div className={classes.chatWrap}>
					{gameData.chat?.map((chatPayload, i) => (
						<ChatMessage
							isSelf={chatPayload.playerGuid === me}
							nickname={getNickname(chatPayload.playerGuid)}
							message={unescape(chatPayload.message)}
							isConsecutive={gameData.chat?.[i + 1]?.playerGuid === chatPayload.playerGuid}
						/>
					))}
				</div>
			</CardContent>
			<CardActions>
				<TextField
					style={{flex: "1 0"}}
					ref={inputRef as any}
					value={pendingMessage}
					variant={"outlined"}
					inputProps={{
						onKeyDown: (e) => e.which === 13 && send()
					}}
					onChange={e => setPendingMessage(e.currentTarget.value)}
					color={"secondary"}
				/>
				<Button color={"secondary"} onClick={send} variant={"contained"}>Send</Button>
			</CardActions>
		</>
	);
};

interface MessageProps
{
	isSelf: boolean;
	nickname: string;
	message: string;
	isConsecutive: boolean;
}

const ChatMessage: React.FC<MessageProps> = (props) =>
{
	const classes = useStyles();

	return (
		<>
			<div className={classNames(classes.chatMessage, {
				[classes.theirsWrapper]: !props.isSelf
			})}>
				<div className={classNames(classes.messageText, {
					[classes.theirs]: !props.isSelf
				})}>
					{props.message}
				</div>
				{!props.isConsecutive && (
					<Chip size={"small"} style={{marginTop: 3}} label={props.nickname}/>
				)}
			</div>
		</>
	);
};