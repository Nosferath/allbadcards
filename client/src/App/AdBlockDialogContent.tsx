import {Button, DialogContent} from "@material-ui/core";
import {getPatreonUrl} from "@Global/Utils/UserUtils";
import * as React from "react";
import {useHistory} from "react-router";

export const AdBlockDialogContent = () => {
	const history = useHistory();

	return (
		<DialogContent>
			The reason you're seeing this message every time you visit the site is because you're using an ad blocker.
			We want the site to work for everyone, even if you block our ads.
			<br/>
			<br/>
			However, All Bad Cards is not free to operate - ads and Patreon supporters keep us running. If you don't like the ads,
			consider becoming a Patreon supporter, for as low as $1 per month.
			<br/>
			<br/>
			Thank you!
			<br/>
			<br/>
			<div style={{textAlign: "center"}}>
				<a href={"http://patreon.com/allbadcards"} target={"_blank"} rel={"noreferrer nofollow"}>
					<img src={"/become_a_patron_button.png"}/>
				</a>
				<br/>
				<br/>
				<br/>
				Already a subscriber?
				<br/>
				<Button href={getPatreonUrl(history.location.pathname)} variant={"contained"} color={"secondary"} style={{margin: "auto", background: "#E64413"}} size={"large"}>
					Log In with Patreon
				</Button>
			</div>
		</DialogContent>
	);
}