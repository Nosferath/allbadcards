import {BackerType, GamePlayer} from "@Global/Platform/Contract";
import React from "react";
import {Tooltip} from "@material-ui/core";
import {FaPatreon} from "react-icons/all";

interface UserFlairProps
{
	player: GamePlayer;
}

export const UserFlair: React.FC<UserFlairProps> = (props) =>
{
	const isSubscriber = props.player?.isSubscriber;

	const isOwner = props.player?.levels?.includes(BackerType.Owner);

	const label = isOwner
		? "All Bad Cards Creator"
		: "This person is a Patreon supporter!";

	return (
		<>
			{isSubscriber && (
				<Tooltip title={label} placement={"top"} arrow>
					<a href={"http://patreon.com/allbadcards/"} target={"_blank"} style={{color: "#E64413", textDecoration: "none", fontSize: "0.8rem"}}>
						<FaPatreon/>
						&nbsp;&nbsp;
					</a>
				</Tooltip>
			)}
			{props.player?.isIdle && (
				<span>
					<small>[idle] </small>
				</span>
			)}
		</>
	);
};