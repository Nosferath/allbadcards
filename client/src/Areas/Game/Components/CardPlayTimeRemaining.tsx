import Grid from "@material-ui/core/Grid";
import {CircularProgress, Typography} from "@material-ui/core";
import * as React from "react";
import {useState} from "react";
import {GameDataStorePayload} from "../../../Global/DataStore/GameDataStore";
import moment from "moment";
import {useEffect} from "react";

interface Props
{
	gameData: GameDataStorePayload;
}

let interval = 0;
export const CardPlayTimeRemaining: React.FC<Props> = (props) =>
{
	const {
		gameData
	} = props;

	const [timeRemaining, setTimeRemaining] = useState(0);

	const endTime = gameData.roundStartTime.clone().add(gameData.ownerSettings.roundTimeoutSeconds, "seconds");

	const calculateRemaining = () =>
	{
		const diff = endTime.diff(moment());
		setTimeRemaining(Math.max(diff, 0));
	};

	useEffect(() =>
	{
		clearInterval(interval);
		interval = window.setInterval(calculateRemaining, 1000 / 30);

		return () => clearInterval(interval);
	});

	const remainingPct = timeRemaining / (gameData.ownerSettings.roundTimeoutSeconds * 1000);

	return (
		<Grid container style={{justifyContent: "center", marginTop: "2rem"}} spacing={3}>
			<CircularProgress size={20} color={"secondary"} variant={"static"} value={remainingPct * 100} />
			<Typography style={{marginLeft: "1rem"}}>
				{Math.floor(timeRemaining / 1000)} seconds remaining to pick cards
			</Typography>
		</Grid>
	);
};