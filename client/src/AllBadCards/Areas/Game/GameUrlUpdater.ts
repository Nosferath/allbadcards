import {UserData} from "@Global/DataStore/UserDataStore";
import {match} from "react-router";
import {HistoryDataStore} from "@Global/DataStore/HistoryDataStore";
import {GameDataStorePayload} from "@AbcGlobal/DataStore/GameDataStore";
import {getTrueRoundsToWin} from "@AbcGlobal/Utils/GameUtils";
import {ClientGameItem} from "@AbcGlobal/Platform/Contract";
import {SiteRoutes} from "@AbcGlobal/Routes/Routes";

let timer = 0;
let lastExpectedUrl = "";

export const UpdateGameUrl = (gameData: GameDataStorePayload, userData: UserData, match: match<{ throwaway?: string, id: string }>) =>
{
	const currentThrowaway = match.params.throwaway;
	let newThrowaway = currentThrowaway;

	const {
		id,
		started,
		spectators,
		pendingPlayers,
		players,
		roundIndex,
	} = gameData.game ?? {};

	if (!id)
	{
		return;
	}

	const {
		playerGuid
	} = userData;

	const amSpectating = playerGuid in {...(spectators ?? {}), ...(pendingPlayers ?? {})};

	const playerGuids = Object.keys(players ?? {});
	const roundsToWin = getTrueRoundsToWin(gameData.game as ClientGameItem);
	const winnerGuid = playerGuids.find(pg => (players?.[pg].wins ?? 0) >= roundsToWin);

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