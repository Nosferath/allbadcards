import {GamePlayer} from "../../../../Global/Platform/Contract";
import React from "react";
import {Twemoji} from "react-emoji-render";
import {Tooltip} from "@material-ui/core";

interface UserFlairProps
{
	player: GamePlayer;
}

export const UserFlair: React.FC<UserFlairProps> = (props) =>
{
	if (!props.player.isSubscriber)
	{
		return null;
	}

	return (
		<Tooltip title={"This person is a Patreon supporter!"} placement={"top"} arrow>
			<span>
				<Twemoji text={"💖 "}/>
			</span>
		</Tooltip>
	);
};