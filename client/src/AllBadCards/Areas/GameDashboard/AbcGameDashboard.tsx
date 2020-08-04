import * as React from "react";
import {MdArrowForward} from "react-icons/all";
import Button from "@material-ui/core/Button";
import {RouteComponentProps, withRouter} from "react-router";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import {UserData, UserDataStore} from "../../../Shared/Global/DataStore/UserDataStore";
import Typography from "@material-ui/core/Typography";
import {EnvDataStore} from "../../Global/DataStore/EnvDataStore";
import {JoinNewButtons} from "../../UI/JoinNewButtons";
import AbstractGameDashboard from "../../../Shared/UI/AbstractGameDashboard";

interface IGameDashboardProps extends RouteComponentProps
{
}

interface DefaultProps
{
}

type Props = IGameDashboardProps & DefaultProps;
type State = ICreationState;

interface ICreationState
{
	userData: UserData;
	nicknameDialogOpen: boolean;
	createLoading: boolean;
}

export const gamesOwnedLsKey = "games-owned";

class AbcGameDashboard extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			userData: UserDataStore.state,
			nicknameDialogOpen: false,
			createLoading: false
		};
	}

	public componentDidMount(): void
	{
		UserDataStore.listen(data => this.setState({
			userData: data
		}));
	}

	public render()
	{
		const familyMode = EnvDataStore.state.site.family;

		return (
			<AbstractGameDashboard
				tagline={"be rude. be irreverent. be hilarious!"}
				subTagLine={familyMode
					? "Family-friendly edition!"
					: undefined
				}
				logo={(
					<img style={{width: "50%", margin: "2rem auto", maxWidth: "13rem"}} src={"/logo-large.png?1"}/>
				)}
				joinButtons={(
					<JoinNewButtons/>
				)}
				subJoinButtons={!familyMode && (
					<ButtonGroup style={{width: "100%", justifyContent: "center", marginTop: "2rem"}}>
						<Button href={"https://notallbad.cards"}>
							Family-Friendly Version &nbsp; <MdArrowForward/>
						</Button>
					</ButtonGroup>
				)}
				changelist={(
					<Typography>
						<strong>Updates - 7/30</strong>
						<li>Included All Bad Cards' official packs in the default packs.</li>
						<li>Added option to delete packs</li>
						<li>Made AI Player naming more interesting</li>
						<li>AI Players can now be added mid-game</li>
						<br/>
						<strong>Updates - 7/28</strong>
						<li>Vastly improved saving time for custom packs</li>
						<li>Potential fix for the issue kicking players mid-game</li>
						<li>Fixed for some of the more common errors</li>
						<br/>
					</Typography>
				)}
			/>
		);
	}
}

export default withRouter(AbcGameDashboard);