import {GameDataStore} from "../../../../Global/DataStore/GameDataStore";
import {useDataStore} from "../../../../Global/Utils/HookUtils";
import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import {Button, CardActions, CardContent, TextField} from "@material-ui/core";
import {Platform} from "../../../../Global/Platform/platform";
import {UserDataStore} from "../../../../Global/DataStore/UserDataStore";
import classNames from "classnames";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Linkify from "linkifyjs/react";
import {ChatDataStore} from "../../../../Global/DataStore/ChatDataStore";

const useStyles = makeStyles(theme => ({
	cardContent: {
		flex: "1 0",
		justifyContent: "flex-end",
		display: "flex",
		flexDirection: "column",
		overflowY: "auto",
		overflowX: "hidden",
		"&::-webkit-scrollbar": {
			display: "none"
		},
		width: "calc(100% + 30px)",
		paddingRight: 50
	},
	chatWrap: {
		display: "flex",
		flexDirection: "column",
		height: "100%",
	},
	chatMessage: {
		width: "80%",
		margin: "0.5rem 0",
		alignSelf: "flex-end",
		"& a": {
			color: theme.palette.secondary.contrastText
		}
	},
	messageText: {
		borderRadius: "5px",
		backgroundColor: theme.palette.secondary.main,
		color: theme.palette.secondary.contrastText,
		padding: "0.5rem",
	},
	theirs: {
		backgroundColor: "#CCC",
		color: "#333",
	},
	theirsWrapper: {
		alignSelf: "flex-start"
	},
	cardActions: {
		padding: 0
	},
	sendButton: {
		margin: "0 !important",
		height: "100%",
		borderRadius: 0
	}
}));

export const GameChat = () =>
{
	const userData = useDataStore(UserDataStore, () =>
	{
		if (cardContentRef.current)
		{
			const el = cardContentRef.current as HTMLDivElement;
			el.scrollTop = el.scrollHeight + el.clientHeight;
		}
	});
	const gameData = useDataStore(GameDataStore);
	const chatData = useDataStore(ChatDataStore);
	const [pendingMessage, setPendingMessage] = useState("");

	const inputRef = useRef<HTMLInputElement>();
	const cardContentRef = useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;

	useEffect(() => inputRef.current?.focus());

	const send = () =>
	{
		if (gameData.game?.id && pendingMessage.trim().length > 0)
		{
			Platform.sendChat(userData.playerGuid, gameData.game?.id, pendingMessage)
				.then(() => setPendingMessage(""))
		}
	};

	const getNickname = (playerGuid: string) => gameData.game?.players?.[playerGuid]?.nickname ?? "Spectator";
	const me = userData.playerGuid;
	const classes = useStyles();
	const thisGameChat = chatData.chat[gameData.game?.id ?? ""] ?? [];
	const noMessages = !thisGameChat || thisGameChat.length === 0;

	return (
		<>
			<CardContent className={classes.cardContent} ref={cardContentRef}>
				<div className={classes.chatWrap}>
					{noMessages && (
						<div style={{textAlign: "center", opacity: 0.5}}>Send a message to the rest of the players!</div>
					)}
					{thisGameChat?.map((chatPayload, i) => (
						<ChatMessage
							isSelf={chatPayload.playerGuid === me}
							nickname={getNickname(chatPayload.playerGuid)}
							message={unescape(chatPayload.message)}
							isConsecutive={thisGameChat?.[i + 1]?.playerGuid === chatPayload.playerGuid}
						/>
					))}
				</div>
			</CardContent>
			<CardActions classes={{
				root: classes.cardActions
			}}>
				<TextField
					style={{flex: "1 0"}}
					ref={inputRef as any}
					value={pendingMessage}
					variant={"outlined"}
					multiline
					InputProps={{
						style: {
							borderRadius: 0
						}
					}}
					inputProps={{
						maxLength: 500,
						onKeyDown: (e) =>
						{
							if(e.which === 13 && !e.shiftKey)
							{
								send();
								e.preventDefault();
							}
						}
					}}
					onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPendingMessage(e.currentTarget.value)}
					color={"secondary"}
				/>
				<Button color={"secondary"} onClick={send} variant={"contained"} className={classes.sendButton}>Send</Button>
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
					<Linkify options={{target: "_blank"}}>
						{props.message}
					</Linkify>
				</div>
				{!props.isConsecutive && (
					<div style={{opacity: 0.5, marginTop: 3}}>{unescape(props.nickname)}</div>
				)}
			</div>
		</>
	);
};