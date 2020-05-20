import React from "react";
import {Divider, List, ListItem, ListItemText, Typography} from "@material-ui/core";
import {useDataStore} from "../../Global/Utils/HookUtils";
import {AuthDataStore} from "../../Global/DataStore/AuthDataStore";

const Settings: React.FC = () => {
	const authData = useDataStore(AuthDataStore);

	return (
		<div>
			<Typography variant={"h3"} style={{marginBottom: "2rem"}}>
				Settings
			</Typography>
			<List>
				<ListItem>
					<ListItemText
						primary={"Backer Level"}
						secondary={authData.levels}
					/>
				</ListItem>
				<Divider />
			</List>
		</div>
	);
};

export default Settings;