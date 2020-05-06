import React, {useEffect, useState} from "react";
import GamePreview from "./GamePreview";
import {Platform} from "../../Global/Platform/platform";
import {UserDataStore} from "../../Global/DataStore/UserDataStore";
import {GameDataStore} from "../../Global/DataStore/GameDataStore";
import Typography from "@material-ui/core/Typography";
import {GameSettings} from "./Components/GameSettings";
import Divider from "@material-ui/core/Divider";
import {LoadingButton} from "../../UI/LoadingButton";
import {MdAdd} from "react-icons/all";
import {useDataStore} from "../../Global/Utils/HookUtils";
import {Tooltip} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {BrowserUtils} from "../../Global/Utils/BrowserUtils";
import {Alert} from "@material-ui/lab";

interface IGameStartProps
{
	id: string;
}

const GameStart: React.FC<IGameStartProps> = (props) =>
{
	const gameData = useDataStore(GameDataStore);
	const userData = useDataStore(UserDataStore);
	const [startLoading, setStartLoading] = useState(false);
	const [randomPlayerLoading, setRandomPlayerLoading] = useState(false);

	const onClickStart = () =>
	{
		setStartLoading(true);

		BrowserUtils.scrollToTop();

		Platform.startGame(
			UserDataStore.state.playerGuid,
			props.id,
			gameData.ownerSettings)
			.catch(e => console.error(e))
			.finally(() => setStartLoading(false));
	};

	const onClickAddRandom = () =>
	{
		setRandomPlayerLoading(true);
		GameDataStore.addRandomPlayer(userData.playerGuid)
			.finally(() => setRandomPlayerLoading(false));
	};

	const players = gameData.game?.players ?? {};
	const playerGuids = Object.keys(gameData.game?.players ?? {});
	const randomPlayers = playerGuids.filter(pg => players[pg]?.isRandom) ?? [];
	const nonRandomPlayers = playerGuids.filter(pg => !players[pg]?.isRandom) ?? [];
	const canAddRandom = randomPlayers.length < 10;
	const selectedPacks = [...gameData.ownerSettings.includedPacks, ...gameData.ownerSettings.includedCardcastPacks];
	const hasRandoms = randomPlayers.length > 0;
	const isCustomWhites = gameData.ownerSettings?.customWhites;
	const badCustomState = isCustomWhites && hasRandoms;
	const canStart = nonRandomPlayers.length > 1 && selectedPacks.length > 0 && !badCustomState;

	return (
		<GamePreview id={props.id}>
			<Tooltip placement={"top"} arrow title={canStart ? "Start the game!" : "You must have one more human player to start the game."} >
				<span>
					<LoadingButton loading={startLoading} variant={"contained"} color={"secondary"} onClick={onClickStart}
					               disabled={!canStart} style={{pointerEvents: "auto"}}>
						Start
					</LoadingButton>
				</span>
			</Tooltip>
			<Tooltip placement={"top"} arrow title={"A fake player! If he wins, everyone else feels shame. Add up to 10."}>
				<span>
					<LoadingButton
						loading={startLoading || randomPlayerLoading}
						startIcon={<MdAdd/>}
						variant={"contained"}
						color={"secondary"}
						onClick={onClickAddRandom}
						style={{marginLeft: "1rem"}}
						disabled={!canAddRandom}>
						AI Player
					</LoadingButton>
				</span>
			</Tooltip>
			{badCustomState && (
				<Alert severity={"error"} style={{marginTop: "1rem"}}>
					You can't have AI players if you are using the <strong>Write Your Own</strong> option. The AI players are too dumb for that!
				</Alert>
			)}
			<Divider style={{margin: "3rem 0"}}/>
			<Typography variant={"h4"}>Settings</Typography>
			<GameSettings/>
		</GamePreview>
	);
};

export default GameStart;