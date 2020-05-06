import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import * as React from "react";
import {useDataStore} from "../../../Global/Utils/HookUtils";
import {GameDataStore, WhiteCardMap} from "../../../Global/DataStore/GameDataStore";
import {WhiteCard} from "../../../UI/WhiteCard";
import {UserDataStore} from "../../../Global/DataStore/UserDataStore";
import sanitize from "sanitize-html";
import {useState} from "react";
import {LoadingButton} from "../../../UI/LoadingButton";
import {CardId} from "../../../Global/Platform/Contract";

export interface IPickWinnerProps
{
	children?: undefined;
	canPick: boolean;
	timeToPick: boolean;
	revealMode: boolean;
	hasWinner: boolean;
	onPickWinner?: (winnerGuid: string) => Promise<any>;
}

export const PickWinner: React.FC<IPickWinnerProps> = (
	{
		onPickWinner,
		canPick,
		timeToPick,
		children,
		hasWinner,
		revealMode
	}
) =>
{
	const gameData = useDataStore(GameDataStore);
	const userData = useDataStore(UserDataStore);
	const [pickWinnerLoading, setPickWinnerLoading] = useState(false);

	const me = gameData.game?.players?.[userData.playerGuid] ?? gameData.game?.spectators?.[userData.playerGuid];

	const cardDefsLoaded = Object.values(gameData.game?.roundCards ?? {}).length === 0 || Object.keys(gameData.roundCardDefs).length > 0;

	if (!me || !gameData.game || !cardDefsLoaded)
	{
		return null;
	}

	const pickWinner = (winnerGuid: string) =>
	{
		if (onPickWinner)
		{
			setPickWinnerLoading(true);

			onPickWinner(winnerGuid)
				.finally(() => setPickWinnerLoading(false));
		}
	};

	const {
		roundCards,
		playerOrder,
		chooserGuid,
		settings,
		roundCardsCustom
	} = gameData.game;

	const cardBucket = settings.customWhites ? roundCardsCustom : roundCards;
	const roundCardsDefined = cardBucket ?? {};
	const roundCardKeys = playerOrder.filter(a => a !== chooserGuid);
	const roundCardValues = settings.customWhites
		? roundCardKeys.map(playerGuid => roundCardsDefined[playerGuid] as string[])
		: roundCardKeys.map(playerGuid => (roundCardsDefined[playerGuid] as CardId[])?.map(cardId =>
			gameData.roundCardDefs?.[cardId.packId]?.[cardId.cardIndex]
		));

 
	return (
		<>
			{timeToPick && !revealMode && !hasWinner && (
				<>
					<Grid container spacing={2} style={{justifyContent: "center"}}>
						{roundCardKeys.map((playerGuid, i) => (
							<Grid item xs={12} sm={6} md={4} lg={3}>
								<WhiteCard actions={canPick && (
									<LoadingButton
										loading={pickWinnerLoading}
										variant={"contained"}
										color={"secondary"}
										onClick={() => pickWinner(playerGuid)}
									>
										Pick Winner
									</LoadingButton>
								)}>
									{roundCardValues[i]?.map(card => card && (
										<>
											<div dangerouslySetInnerHTML={{__html: sanitize(unescape(card))}}/>
											<Divider style={{margin: "1rem 0"}}/>
										</>
									))}
								</WhiteCard>
							</Grid>
						))}
					</Grid>
					<Divider style={{margin: "1rem 0"}}/>
				</>
			)}
		</>
	)
}