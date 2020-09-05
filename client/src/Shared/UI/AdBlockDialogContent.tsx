import {Button, ButtonGroup, DialogContent, Typography, useMediaQuery} from "@material-ui/core";
import * as React from "react";
import {useHistory} from "react-router";
import {FiLogIn} from "react-icons/fi/index";
import {FaDollarSign} from "react-icons/fa/index";
import {getPatreonUrl} from "@AbcGlobal/Utils/UserUtils";

export const AdBlockDialogContent = () =>
{
	const history = useHistory();
	const mobile = useMediaQuery('(max-width:768px)');

	return (
		<>
			<DialogContent style={{paddingBottom: "2rem"}}>
				<Typography variant={"body1"} style={{fontSize: "1.1em"}}>
					To hide this message, you can turn off your ad blocker or subscribe!
					<br/>
					<br/>
					We want the site to work for everyone, even if you block the ads. However, All Bad Cards is not free to operate; ads and Patreon supporters keep us running. If you don't like the ads,
					consider becoming a Patreon supporter, for as low as $1 per month.
					<br/>
					<br/>
					Thank you!
					<br/>
					<br/>
					<div style={{textAlign: "center"}}>
						<br/>
						<ButtonGroup size={"large"} orientation={mobile ? "vertical" : "horizontal"}>
							<Button startIcon={<FaDollarSign/>} href={"http://patreon.com/allbadcards"} variant={"contained"} color={"secondary"}>
								Become a Patron
							</Button>

							<Button startIcon={<FiLogIn/>} href={getPatreonUrl(history.location.pathname)}>
								Patron Log In
							</Button>
						</ButtonGroup>
					</div>
				</Typography>
			</DialogContent>
		</>
	);
}