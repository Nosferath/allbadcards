import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import React, {useState} from "react";
import {GameDataStore, GameDataStorePayload} from "@Global/DataStore/GameDataStore";
import {ListItemSecondaryAction} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {createStyles} from "@material-ui/styles";
import {UserDataStore} from "@Global/DataStore/UserDataStore";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import {GamePayload, GamePlayer} from "@Global/Platform/Contract";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {useDataStore} from "@Global/Utils/HookUtils";
import {SocketDataStore} from "@Global/DataStore/SocketDataStore";
import {UserFlair} from "../Users/UserFlair";
import {getTrueRoundsToWin} from "@Global/Utils/GameUtils";
import {LoadingButton} from "@UI/LoadingButton";
import {MdAdd} from "react-icons/all";
import {KickPlayerDataStore} from "@Global/DataStore/KickPlayerDataStore";

const useStyles = makeStyles(theme => createStyles({
	iconButton: {
		minWidth: 0,
		fontSize: "1.5rem",
	},
	avatarText: {
		color: theme.palette.secondary.contrastText
	}
}));

const getGamePlayer = (game: GamePayload | undefined, guid: string) =>
{
	return game?.players[guid] ?? game?.pendingPlayers[guid] ?? game?.spectators[guid];
};

export const GameRoster = () =>
{
	const socketData = useDataStore(SocketDataStore);
	const gameData = useDataStore(GameDataStore);
	const userData = useDataStore(UserDataStore);
	const [randomPlayerLoading, setRandomPlayerLoading] = useState(false);

	if (!gameData.game || !gameData.loaded || !socketData.hasConnection)
	{
		return null;
	}

	const game = gameData.game;

	const onClickKick = (playerGuid: string) =>
	{
		KickPlayerDataStore.setKickCandidate(playerGuid);
	};

	const onClickAddRandom = () =>
	{
		setRandomPlayerLoading(true);
		GameDataStore.addRandomPlayer(userData.playerGuid)
			.finally(() => setRandomPlayerLoading(false));
	};

	const playerGuids = Object.keys({...game.players, ...game.pendingPlayers});
	const sortedPlayerGuids = [...playerGuids].sort((a, b) =>
		(getGamePlayer(game, b)?.wins ?? 0) - (getGamePlayer(game, a)?.wins ?? 0));
	const spectatorGuids = Object.keys(game.spectators);

	const isOwner = gameData.game?.ownerGuid === userData.playerGuid;
	const playerCount = playerGuids.length;

	const players = gameData.game?.players ?? {};
	const randomPlayers = playerGuids.filter(pg => players[pg]?.isRandom) ?? [];
	const canAddRandom = randomPlayers.length < 10;

	return (
		<div style={{width: "75vw", maxWidth: 500}}>
			<List style={{marginBottom: "1em"}}>
				<Divider/>
				<ListItemText primary={`${getTrueRoundsToWin(gameData.game)} Rounds Required to Win`} secondary={` (modifiable in Gameplay Settings)`}/>
			</List>
			<List>
				{sortedPlayerGuids.map(pg =>
				{
					const player = getGamePlayer(game, pg);
					const isSelf = pg === userData.playerGuid;

					if (!player)
					{
						return null;
					}

					return (
						<RosterPlayer
							gameData={gameData}
							isSelf={isSelf}
							isOwner={isOwner}
							onClickKick={onClickKick}
							player={player}
							playerCount={playerCount}
						/>
					)
				})}
			</List>

			{isOwner && (
				<Tooltip placement={"top"} arrow title={"A fake player! If he wins, everyone else feels shame. Add up to 10."}>
				<span>
					<LoadingButton
						loading={randomPlayerLoading}
						startIcon={<MdAdd/>}
						variant={"contained"}
						color={"secondary"}
						onClick={onClickAddRandom}
						style={{marginBottom: "1rem"}}
						disabled={!canAddRandom}>
						AI Player
					</LoadingButton>
				</span>
				</Tooltip>
			)}

			<Typography style={{margin: "1rem 0 0"}} variant={"h6"}>
				Spectators
			</Typography>

			<List>
				{spectatorGuids.length === 0 && (
					<ListItem>
						<ListItemText>[No Spectators]</ListItemText>
					</ListItem>
				)}
				{spectatorGuids.map(pg =>
				{
					const player = getGamePlayer(game, pg);
					const isSelf = pg === userData.playerGuid;

					if (!player)
					{
						return null;
					}

					return (
						<RosterPlayer
							gameData={gameData}
							isSelf={isSelf}
							isOwner={isOwner}
							onClickKick={onClickKick}
							player={player}
							playerCount={9999}
						/>
					)
				})}
			</List>
		</div>
	);
};

interface RosterPlayer
{
	gameData: GameDataStorePayload;
	player: GamePlayer;
	isOwner: boolean;
	isSelf: boolean;
	playerCount: number;
	onClickKick: (guid: string) => void;
}

const RosterPlayer: React.FC<RosterPlayer> = (
	{
		gameData,
		player,
		isOwner,
		isSelf,
		onClickKick,
		playerCount
	}
) =>
{
	const classes = useStyles();
	const game = gameData.game;
	if (!game)
	{
		return null;
	}

	return (
		<React.Fragment key={player.guid}>
			<ListItem>
				{game.started && (
					<ListItemAvatar>
						<Avatar>
							<strong className={classes.avatarText}>{player?.wins}</strong>
						</Avatar>
					</ListItemAvatar>
				)}
				<ListItemText>
					<UserFlair player={player}/>
					{unescape(player.nickname ?? "Spectator")}
					{player.guid === gameData.game?.ownerGuid && <>
                        <span> (Owner)</span>
                    </>}
					{player.guid in (gameData.game?.pendingPlayers ?? {}) && <>
                        <span> (Waiting for next round)</span>
                    </>}
				</ListItemText>

				{(isOwner || isSelf) && playerCount > 1 && (
					<ListItemSecondaryAction>
						<Tooltip title={`Remove this player`} aria-label={`Remove this player`} arrow>
							<Button size={"large"} onClick={() => onClickKick(player.guid)}>
								{isSelf ? "Leave Game" : "Remove"}
							</Button>
						</Tooltip>
					</ListItemSecondaryAction>
				)}
			</ListItem>
			<Divider/>
		</React.Fragment>
	);
};