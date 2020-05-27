import {GamePlayer} from "../../../../Global/Platform/Contract";
import React from "react";
import {Tooltip} from "@material-ui/core";
import {FaPatreon} from "react-icons/all";

interface UserFlairProps
{
	player: GamePlayer;
}

export const UserFlair: React.FC<UserFlairProps> = (props) =>
{
	if (!props.player?.isSubscriber)
	{
		return null;
	}

	return (
		<Tooltip title={"This person is a Patreon supporter!"} placement={"top"} arrow>
			<a href={"http://patreon.com/allbadcards/"} target={"_blank"} style={{color: "#E64413", textDecoration: "none", fontSize: "0.8rem"}}>
				<FaPatreon />&nbsp;&nbsp;
			</a>
		</Tooltip>
	);
};