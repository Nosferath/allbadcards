import * as React from "react";
import {FaPlus, MdArrowForward, MdArrowUpward} from "react-icons/all";
import Button from "@material-ui/core/Button";
import {RouteComponentProps, withRouter} from "react-router";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import {Platform} from "../../Global/Platform/platform";
import {UserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import {NicknameDialog} from "../../UI/NicknameDialog";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import {SponsorList} from "./SponsorList";
import {GameDataStore} from "../../Global/DataStore/GameDataStore";
import {Divider, Grid} from "@material-ui/core";
import {TwitterTimelineEmbed} from "react-twitter-embed";
import {LoadingButton} from "../../UI/LoadingButton";
import {Link} from "react-router-dom";
import {SocketDataStore} from "../../Global/DataStore/SocketDataStore";
import {EnvDataStore} from "../../Global/DataStore/EnvDataStore";

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

	private createGame = async () =>
	{
		this.setState({
			createLoading: true,
			nicknameDialogOpen: true
		});
	};

	private onNicknameClose = () =>
	{
		this.setState({
			createLoading: false,
			nicknameDialogOpen: false
		});
	};

	private onNicknameConfirm = async (nickname: string) =>
	{
		SocketDataStore.clear();
		const game = await Platform.createGame(this.state.userData.playerGuid, nickname);
		this.setState({
			createLoading: false
		});
		GameDataStore.storeOwnedGames(game);
		this.props.history.push(`/game/${game.id}`)
	};

	public render()
	{
		const mobile = matchMedia('(max-width:600px)').matches;

		const familyMode = EnvDataStore.state.site.family;

		return (
			<Container style={{textAlign: "center"}}>
				<Typography component={"h1"} variant={mobile ? "h5" : "h3"}>be rude. be irreverent. be hilarious!</Typography>

				{familyMode && (
					<Typography variant={"h4"} style={{marginTop: "1rem"}}>Family-friendly edition!</Typography>
				)}

				<img style={{width: "50%", margin: "2rem auto", maxWidth: "13rem"}} src={"/logo-large.png"}/>

				<ButtonGroup style={{width: "100%", justifyContent: "center", marginTop: "2rem"}}>
					<ButtonGroup orientation={mobile ? "vertical" : "horizontal"}>
						{!familyMode && (
							<Button
								variant="outlined"
								color="default"
								size="large"
								style={{
									fontSize: "2rem"
								}}
								component={p => <Link to={"/games"} {...p} />}
								startIcon={<MdArrowUpward/>}
							>
								Join Game
							</Button>
						)}
						<LoadingButton
							loading={this.state.createLoading}
							variant="contained"
							color="secondary"
							size="large"
							style={{
								fontSize: "2rem"
							}}
							onClick={this.createGame}
							startIcon={<FaPlus/>}
						>
							New Game
						</LoadingButton>
					</ButtonGroup>
				</ButtonGroup>
				{!familyMode && (
					<ButtonGroup style={{width: "100%", justifyContent: "center", marginTop: "2rem"}}>
						<Button href={"https://not.allbad.cards"}>
							Family-Friendly Version &nbsp; <MdArrowForward/>
						</Button>
					</ButtonGroup>
				)}
				<NicknameDialog
					open={this.state.nicknameDialogOpen}
					onClose={this.onNicknameClose}
					onConfirm={this.onNicknameConfirm}
					title={"Please enter your nickname:"}
				/>
				<div>
					<SponsorList />
				</div>

				<Paper style={{padding: "1rem", margin: "3rem 0 1rem", textAlign: "left"}}>
					<Grid container>
						<Grid item md={7} xs={12}>
							<Typography>
								<strong>Updates - 5/11</strong>
								<li>Adding chat!</li>
								<br/>
								<strong>Updates - 5/10</strong>
								<li>Added round timer to prevent games stopping if players leave</li>
								<li>Removed the limitation preventing games from starting without human players</li>
								<br/>
							</Typography>
						</Grid>
						<Grid item md={1} xs={12} style={{display: "flex", justifyContent: "center", margin: "2rem 0"}}>
							<Divider orientation={"vertical"}/>
						</Grid>
						<Grid item md={4} xs={12}>
							<TwitterTimelineEmbed
								sourceType="profile"
								screenName="allbadcards"
								options={{
									height: 400
								}}
							/>
						</Grid>
					</Grid>
				</Paper>
				{EnvDataStore.state.site.lite && (
					<Paper style={{padding: "1rem", marginTop: "3rem"}}>
						<Typography variant={"caption"}>
							Cards Against Humanity by <a href={"https://cardsagainsthumanity.com"}>Cards Against Humanity</a> LLC is licensed under CC BY-NC-SA 2.0.
						</Typography>
					</Paper>
				)}
			</Container>
		);
	}
}

export default withRouter(GameDashboard);