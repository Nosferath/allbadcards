import React, {useState} from "react";
import GamePreview from "./GamePreview";
import {Platform} from "../../Global/Platform/platform";
import {UserDataStore} from "../../Global/DataStore/UserDataStore";
import {GameDataStore} from "../../Global/DataStore/GameDataStore";
import Typography from "@material-ui/core/Typography";
import {GameSettings} from "./GameSettings";
import Divider from "@material-ui/core/Divider";
import {LoadingButton} from "../../UI/LoadingButton";
import {FaPlay} from "react-icons/all";
import {useDataStore} from "../../Global/Utils/HookUtils";
import {Tooltip} from "@material-ui/core";
import {BrowserUtils} from "../../Global/Utils/BrowserUtils";

interface IGameStartProps
{
	id: string;
}

const GameStart: React.FC<IGameStartProps> = (props) =>
{
	const gameData = useDataStore(GameDataStore);
	const [startLoading, setStartLoading] = useState(false);

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

	const players = Object.keys({...gameData.game?.players ?? {}, ...gameData.game?.pendingPlayers ?? {}});
	const selectedPacks = [...gameData.ownerSettings.includedPacks, ...gameData.ownerSettings.includedCustomPackIds];
	const canStart = selectedPacks.length > 0 && players.length > 1;

	return (
		<>
			<Tooltip placement={"top"} arrow title={canStart ? "Start the game!" : "You must have at least one pack and at least two players."}>
				<span>
					<LoadingButton
						size={"large"}
						loading={startLoading}
						variant={"contained"}
						color={"secondary"}
						onClick={onClickStart}
						disabled={!canStart}
						style={{pointerEvents: "auto", fontSize: "2rem"}}
						startIcon={<FaPlay/>}>
						Start the Game!
					</LoadingButton>
				</span>
			</Tooltip>
			<GamePreview id={props.id}>
				<Divider style={{margin: "3rem 0"}}/>
				<Typography variant={"h4"}>Settings</Typography>
				<GameSettings/>
			</GamePreview>
		</>
	);
};

export default GameStart;