import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import * as React from "react";
import {IGameDataStorePayload} from "../../../Global/DataStore/GameDataStore";
import {IUserData} from "../../../Global/DataStore/UserDataStore";
import {useState} from "react";
import sanitize from "sanitize-html";
import {CardId} from "../../../Global/Platform/Contract";
import deepEqual from "deep-equal";
import {WhiteCard} from "../../../UI/WhiteCard";
import {TextField} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";

interface Props
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
	targetPicked: number;
	onPickUpdate: (cards: string[]) => void;
}

const useStyles = makeStyles({
	root: {
		fontSize: "1.25em",
		"& .MuiOutlinedInput-input": {
			fontSize: "1.25em"
		}
	}
});

export const WhiteCardHandCustom: React.FC<Props> =
	({
		 userData,
		 gameData,
		 targetPicked,
		 onPickUpdate
	 }) =>
	{
		const [cardValues, setCardValues] = useState<string[]>([]);

		if (targetPicked > cardValues.length)
		{
			setCardValues((new Array(targetPicked)).fill(undefined));
		}

		const setCardValue = (cardIndex: number, cardValue: string) =>
		{
			const newValues = [...cardValues];
			newValues[cardIndex] = cardValue;
			setCardValues(newValues);

			if (newValues.filter(a => !!a).length >= targetPicked)
			{
				onPickUpdate(newValues);
			}
			else
			{
				onPickUpdate([]);
			}
		};

		if (!gameData.game)
		{
			return null;
		}

		const {
			players,
			roundCardsCustom,
		} = gameData.game;

		const me = players[userData.playerGuid];

		if (!me)
		{
			return null;
		}

		const hasPlayed = userData.playerGuid in (roundCardsCustom ?? {});

		const classes = useStyles();

		const renderedHand = cardValues.map((cardValue, i) =>
		{
			return (
				<Grid item xs={12} sm={6} md={4} lg={3}>
					<WhiteCard
						key={i}
						actions={cardValues.length > 1 && <>Card {i + 1}</>}
					>
						<TextField
							placeholder={"Answer here"}
							fullWidth={true}
							multiline={true}
							value={cardValue}
							variant={"outlined"}
							classes={{
								root: classes.root
							}}
							onChange={e => setCardValue(i, e.currentTarget.value)}
						/>
					</WhiteCard>
				</Grid>
			);
		});

		return <>
			{!hasPlayed && (
				<>
					<Grid container style={{justifyContent: "center", marginTop: "2rem"}} spacing={3}>
						{renderedHand}
					</Grid>
				</>
			)}
		</>;
	};