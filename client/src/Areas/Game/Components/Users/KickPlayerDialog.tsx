import {Dialog, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import React from "react";
import {useDataStore} from "@Global/Utils/HookUtils";
import {UserDataStore} from "@Global/DataStore/UserDataStore";
import {GamePayload} from "@AbcGlobal/Platform/Contract";
import {KickPlayerDataStore} from "../../../../Global/DataStore/KickPlayerDataStore";

interface IKickPlayerDialog
{
	game: GamePayload;
}

export const KickPlayerDialog: React.FC<IKickPlayerDialog> = (
	{
		game
	}
) =>
{
	const userData = useDataStore(UserDataStore);
	const {
		kickCandidateGuid
	} = useDataStore(KickPlayerDataStore);

	return (
		<Dialog open={!!kickCandidateGuid} onClose={() => KickPlayerDataStore.cancelKickCandidate()}>
			<DialogTitle>Confirm</DialogTitle>
			{!!kickCandidateGuid && (
				<DialogContent>
					Are you sure you want to remove {unescape(game?.players?.[kickCandidateGuid]?.nickname)} from this game?
				</DialogContent>
			)}
			<DialogActions>
				<Button onClick={() => KickPlayerDataStore.approveKickCandidate(game.id, userData)} variant={"contained"} color={"secondary"}>
					Kick em!
				</Button>
			</DialogActions>
		</Dialog>
	);
}