import {Alert} from "@material-ui/lab";
import {Typography, useMediaQuery} from "@material-ui/core";
import {ShowWinner} from "./ShowWinner";
import {ErrorBoundary} from "../../../App/ErrorBoundary";
import {GamePlayWhite} from "../GamePlayWhite";
import {GamePlayBlack} from "../GamePlayBlack";
import {GamePlaySpectate} from "../GamePlaySpectate";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import {Sponsor} from "../../GameDashboard/SponsorList";
import React from "react";
import {useDataStore} from "../../../Global/Utils/HookUtils";
import {GameDataStore} from "../../../Global/DataStore/GameDataStore";
import {UserDataStore} from "../../../Global/DataStore/UserDataStore";
import GameStart from "../GameStart";
import GameJoin from "../GameJoin";
import moment from "moment";
import {ChatDataStore} from "../../../Global/DataStore/ChatDataStore";

interface Props
{
	gameId: string;
}

export const GameInner: React.FC<Props> = (
	{
		gameId,
	}
) => {
	const gameData = useDataStore(GameDataStore);
	const userData = useDataStore(UserDataStore);
	const chatData = useDataStore(ChatDataStore);

	const {
		dateCreated,
		started,
		chooserGuid,
		ownerGuid,
		spectators,
		pendingPlayers,
		players,
		settings,
		kickedPlayers
	} = gameData.game ?? {};

	const {
		playerGuid
	} = userData;

	const isOwner = ownerGuid === userData.playerGuid;
	const isChooser = playerGuid === chooserGuid;
	const amInGame = playerGuid in (players ?? {});
	const amSpectating = playerGuid in {...(spectators ?? {}), ...(pendingPlayers ?? {})};

	const playerGuids = Object.keys(players ?? {});
	const winnerGuid = playerGuids.find(pg => (players?.[pg].wins ?? 0) >= (settings?.roundsToWin ?? 99));

	const inviteLink = (settings?.inviteLink?.length ?? 0) > 25
		? `${settings?.inviteLink?.substr(0, 25)}...`
		: settings?.inviteLink;

	const iWasKicked = !!kickedPlayers?.[playerGuid];

	const tablet = useMediaQuery('(max-width:1200px)');
	const canChat = (amInGame || amSpectating) && moment(dateCreated).isAfter(moment(new Date(1589260798170)));
	const chatBarExpanded = chatData.sidebarOpen && !tablet && canChat;

	return (
		<div style={{maxWidth: chatBarExpanded ? "calc(100% - 320px)" : "100%"}}>
			<div style={{minHeight: "70vh"}}>
				{iWasKicked && (
					<Alert variant={"filled"} severity={"error"}>
						<Typography>
							You left or were kicked from this game
						</Typography>
					</Alert>
				)}
				{!winnerGuid && settings?.inviteLink && (
					<Typography variant={"caption"}>
						Chat/Video Invite: <a href={settings.inviteLink} target={"_blank"} rel={"nofollow noreferrer"}>{inviteLink}</a>
					</Typography>
				)}
				{winnerGuid && (
					<ShowWinner/>
				)}
				{!winnerGuid && (
					<ErrorBoundary>
						{(!started || !(amInGame || amSpectating)) && (
							<BeforeGame gameId={gameId} isOwner={isOwner}/>
						)}

						{started && amInGame && !isChooser && (
							<GamePlayWhite/>
						)}

						{started && amInGame && isChooser && (
							<GamePlayBlack/>
						)}

						{started && amSpectating && (
							<GamePlaySpectate/>
						)}
					</ErrorBoundary>
				)}
			</div>
			<Grid style={{marginTop: "5rem"}}>
				<Divider style={{margin: "1rem 0"}}/>
				<Sponsor sponsor={undefined} isDiamondSponsor={true}/>
			</Grid>
		</div>
	);
};

interface BeforeGameProps
{
	isOwner: boolean;
	gameId: string;
}

const BeforeGame: React.FC<BeforeGameProps> = (props) =>
{
	return (
		<>
			{props.isOwner && (
				<GameStart id={props.gameId}/>
			)}

			{!props.isOwner && (
				<GameJoin id={props.gameId}/>
			)}
		</>
	);
};