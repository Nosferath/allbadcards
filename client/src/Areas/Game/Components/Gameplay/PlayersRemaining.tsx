import Chip from "@material-ui/core/Chip";
import {AiFillCrown} from "react-icons/all";
import {ClockLoader} from "react-spinners";
import {Tooltip, Typography} from "@material-ui/core";
import * as React from "react";
import {useDataStore} from "@Global/Utils/HookUtils";
import {GameDataStore} from "@Global/DataStore/GameDataStore";
import {UserData, UserDataStore} from "@Global/DataStore/UserDataStore";
import {UserFlair} from "../Users/UserFlair";
import {GamePlayer} from "@Global/Platform/Contract";
import {KickPlayerDataStore} from "@Global/DataStore/KickPlayerDataStore";
import {TiUserDelete} from "react-icons/ti/index";


export const PlayersRemaining = () =>
{
	const gameData = useDataStore(GameDataStore);
	const userData = useDataStore(UserDataStore);

	if (!gameData.game)
	{
		return null;
	}

	const {
		players,
		roundCards,
		chooserGuid,
		roundStarted,
	} = gameData.game;

	const remainingPlayerGuids = Object.keys(players ?? {})
		.filter(pg => !(pg in (roundCards ?? {})) && pg !== chooserGuid);

	const isOwner = gameData.game.ownerGuid === userData.playerGuid;
	const remainingPlayers = remainingPlayerGuids.map(pg => players?.[pg]);
	const chooserPlayer = players?.[chooserGuid!];
	const hasWinner = !!gameData.game?.lastWinner;

	const onChipClick = (playerGuid: string) =>
	{
		if (isOwner)
		{
			KickPlayerDataStore.setKickCandidate(playerGuid);
		}
	};

	return (
		<>
			<Chip
				color={"secondary"}
				style={{
					marginBottom: 3,
					paddingLeft: 8,
					cursor: isOwner ? "pointer" : "default"
				}}
				onClick={() => onChipClick(chooserGuid ?? "")}
				icon={<AiFillCrown/>}
				label={
					<KickableUserFlair
						userData={userData}
						player={chooserPlayer}
						showKick={isOwner}
					/>
				}
			/>
			{roundStarted && remainingPlayers.map(player => (
				<Chip
					onClick={() => onChipClick(player?.guid)}
					style={{
						marginLeft: 3,
						marginBottom: 3,
						paddingLeft: 8,
						cursor: isOwner ? "pointer" : "default"
					}}
					avatar={<ClockLoader size={15}/>}
					label={
						<KickableUserFlair
							userData={userData}
							player={player}
							showKick={isOwner}
						/>
					}
				/>
			))}
			{!hasWinner && remainingPlayers.length === 0 && (
				<Typography variant={"body1"} style={{marginTop: "0.5rem"}}>
					{`Waiting for ${unescape(players?.[chooserGuid ?? ""]?.nickname)} to pick the winner.`}
				</Typography>
			)}
		</>
	);
};

interface IKickableUserFlairProps
{
	showKick: boolean;
	children?: undefined;
	player?: GamePlayer;
	userData: UserData;
}

const KickableUserFlair: React.FC<IKickableUserFlairProps> = (props) =>
{
	const {
		player,
		userData,
		showKick
	} = props;

	if(!player)
	{
		return null;
	}

	const isMe = userData.playerGuid === player?.guid;
	const label = isMe ? "You!" : unescape(player?.nickname ?? "");

	return (
		<Tooltip title={showKick ? `Kick [${label}] from the game` : "The owner can kick this person by clicking on their name, or from the scoreboard"}>
			<div style={{display: "flex", alignItems: "center"}}>
				<UserFlair player={player}/>
				{unescape(label)}
				{showKick && (
					<TiUserDelete style={{fontSize: "1.1rem", marginLeft: "0.25rem"}}/>
				)}
			</div>
		</Tooltip>
	);
}