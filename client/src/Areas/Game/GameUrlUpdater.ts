import {GameDataStorePayload} from "@Global/DataStore/GameDataStore";
import {getTrueRoundsToWin} from "@Global/Utils/GameUtils";
import {ClientGameItem} from "@Global/Platform/Contract";
import {UserData} from "@Global/DataStore/UserDataStore";
import {SiteRoutes} from "@Global/Routes/Routes";
import {match} from "react-router";
import {HistoryDataStore} from "@Global/DataStore/HistoryDataStore";

let timer = 0;
let lastExpectedUrl = "";

export const UpdateGameUrl = (gameData: GameDataStorePayload, userData: UserData, match: match<{ throwaway?: string, id: string }>) =>
{
	const currentThrowaway = match.params.throwaway;
	let newThrowaway = currentThrowaway;

	const {
		id,
		started,
		chooserGuid,
		ownerGuid,
		spectators,
		pendingPlayers,
		players,
		roundIndex,
		kickedPlayers
	} = gameData.game ?? {};

	if (!id)
	{
		return;
	}

	const {
		playerGuid
	} = userData;

	const isOwner = ownerGuid === userData.playerGuid;
	const isChooser = playerGuid === chooserGuid;
	const amSpectating = playerGuid in {...(spectators ?? {}), ...(pendingPlayers ?? {})};

	const playerGuids = Object.keys(players ?? {});
	const roundsToWin = getTrueRoundsToWin(gameData.game as ClientGameItem);
	const winnerGuid = playerGuids.find(pg => (players?.[pg].wins ?? 0) >= roundsToWin);

	const iWasKicked = !!kickedPlayers?.[playerGuid];
	const amInGame = playerGuid in (players ?? {});

	if (!started || !(amInGame || amSpectating))
	{
		newThrowaway = "join";
	}
	else if (started)
	{
		newThrowaway = `round-${(roundIndex ?? 1) + 1}`;
	}

	if (winnerGuid)
	{
		newThrowaway = "game-over";
	}

	clearTimeout(timer);
	timer = window.setTimeout(() =>
	{
		if (newThrowaway !== currentThrowaway && !!newThrowaway)
		{
			const newUrl = SiteRoutes.Game.resolve({
				id: id,
				throwaway: newThrowaway
			});

			if (newUrl !== lastExpectedUrl)
			{
				history.replaceState(null, "", newUrl);
				HistoryDataStore.onChange();
				lastExpectedUrl = newUrl;
			}
		}
	}, 1000 / 60);
};