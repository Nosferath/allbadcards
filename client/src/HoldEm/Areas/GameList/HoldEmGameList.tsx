import {AbstractGameList} from "@UI/AbstractGameList";
import React from "react";
import {HoldEmPlatform} from "../../Global/holdemPlatform";

export const HoldEmGameList = () => {
	return (
		<AbstractGameList
			findGameById={HoldEmPlatform.getGame}
			getGamesForPage={HoldEmPlatform.getGames}
			renderGameSummary={(data) => (
				<div />
			)} />
	);
};