import React, {useState} from "react";
import {Button, DialogContent, Typography} from "@material-ui/core";
import {CloseableDialog} from "@UI/CloseableDialog";
import {getPatreonUrl} from "@Global/Utils/UserUtils";
import {useHistory} from "react-router";
import {useDataStore} from "@Global/Utils/HookUtils";
import {AuthDataStore} from "@Global/DataStore/AuthDataStore";
import {MdRemoveCircle} from "react-icons/md/index";
import {EnvDataStore} from "@Global/DataStore/EnvDataStore";

export const RemoveAdsButton = () =>
{
	const envData = useDataStore(EnvDataStore);
	const authData = useDataStore(AuthDataStore);
	const [showModal, setShowModal] = useState(false);
	const history = useHistory();

	if(authData.isSubscriber || envData.site?.family)
	{
		return null;
	}

	return (
		<div style={{textAlign: "center"}}>
			<Button startIcon={<MdRemoveCircle/>} onClick={() => setShowModal(true)} variant={"contained"} color={"secondary"}>
				Remove the Ads!
			</Button>
			<CloseableDialog onClose={() => setShowModal(false)} open={showModal} TitleProps={{
				children: "Want to hide ads?",
			}}>
				<DialogContent dividers style={{paddingBottom: "2rem"}}>
					<Typography style={{textAlign: "center"}}>
						Patreon subscribers don't see ads. Pay what you want, and ads will disappear while you're logged in!
						<br/><br/>
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
					</Typography>
				</DialogContent>
			</CloseableDialog>
		</div>
	);
}