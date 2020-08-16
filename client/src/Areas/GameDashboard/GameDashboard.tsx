import * as React from "react";
import {MdArrowForward} from "react-icons/all";
import Button from "@material-ui/core/Button";
import {RouteComponentProps, withRouter} from "react-router";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import {UserData, UserDataStore} from "@Global/DataStore/UserDataStore";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import {SponsorList} from "./SponsorList";
import {EnvDataStore} from "@Global/DataStore/EnvDataStore";
import {JoinNewButtons} from "@UI/JoinNewButtons";
import {Paper} from "@material-ui/core";

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

class GameDashboard extends React.Component<Props, State>
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

		const otherLabel = familyMode ? "NSFW Version" : "Family-Friendly Version";
		const otherLink = familyMode ? "https://allbad.cards" : "https://notallbad.cards";

		const mobile = matchMedia('(max-width:768px)').matches;

		return (
			<Container style={{textAlign: "center"}}>
				<Typography component={"h1"} variant={mobile ? "h5" : "h3"}>Be rude. Be irreverent. Be hilarious!</Typography>

				{familyMode && (
					<Typography variant={"h4"} style={{marginTop: "1rem"}}>Family-friendly edition!</Typography>
				)}

				<img style={{width: "50%", margin: "2rem auto", maxWidth: "13rem"}} src={"/logo-large.png?1"}/>

				<ButtonGroup style={{width: "100%", justifyContent: "center", marginTop: "2rem"}}>
					<JoinNewButtons/>
				</ButtonGroup>
				<ButtonGroup style={{width: "100%", justifyContent: "center", marginTop: "2rem"}}>
					<Button href={otherLink}>
						{otherLabel} &nbsp; <MdArrowForward/>
					</Button>
				</ButtonGroup>

				{EnvDataStore.state.site.family && (
					<Paper style={{padding: "1rem", marginTop: "3rem"}}>
						<Typography variant={"caption"}>
							Cards Against Humanity by <a href={"https://cardsagainsthumanity.com"}>Cards Against Humanity</a> LLC is licensed under CC BY-NC-SA 2.0.
						</Typography>
					</Paper>
				)}

				<div>
					<SponsorList/>
				</div>

			</Container>
		);
	}
}

export default withRouter(GameDashboard);