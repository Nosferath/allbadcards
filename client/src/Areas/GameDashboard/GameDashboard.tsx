import * as React from "react";
import {FaPlus, MdArrowForward, MdArrowUpward} from "react-icons/all";
import Button from "@material-ui/core/Button";
import {RouteComponentProps, withRouter} from "react-router";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import {Platform} from "../../Global/Platform/platform";
import {IUserData, UserDataStore} from "../../Global/DataStore/UserDataStore";
import {NicknameDialog} from "../../UI/NicknameDialog";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import {SponsorList} from "./SponsorList";
import {GameDataStore} from "../../Global/DataStore/GameDataStore";
import {Divider, Grid} from "@material-ui/core";
import {TwitterTimelineEmbed} from "react-twitter-embed";
import {LoadingButton} from "../../UI/LoadingButton";
import {GameItem} from "../../Global/Platform/Contract";
import {Link} from "react-router-dom";

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
	userData: IUserData;
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
		GameDataStore.clear();
		const game = await Platform.createGame(this.state.userData.playerGuid, nickname);
		this.setState({
			createLoading: false
		});
		this.storeOwnedGames(game);
		this.props.history.push(`/game/${game.id}`)
	};

	private storeOwnedGames(game: GameItem)
	{
		const gamesOwnedString = localStorage.getItem(gamesOwnedLsKey) ?? "[]";
		const gamesOwned = JSON.parse(gamesOwnedString) as string[];
		gamesOwned.push(game.id);
		localStorage.setItem(gamesOwnedLsKey, JSON.stringify(gamesOwned));
	}

	public render()
	{
		const mobile = matchMedia('(max-width:600px)').matches;

		return (
			<Container style={{textAlign: "center"}}>
				<Typography>the best cards against humanity clone!</Typography>

				{GameDataStore.state.familyMode && (
					<Typography variant={"h4"} style={{marginTop: "1rem"}}>Family-friendly edition!</Typography>
				)}
				<img style={{width: "50%", margin: "2rem auto", maxWidth: "13rem"}} src={"/logo-large.png"}/>

				<Typography variant={"h4"}>Click "New Game" to start playing now!</Typography>

				{!GameDataStore.state.familyMode && (
					<ButtonGroup style={{width: "100%", justifyContent: "center", marginTop: "1rem"}}>
						<Button href={"https://not.allbad.cards"}>
							Family Edition &nbsp; <MdArrowForward/>
						</Button>
					</ButtonGroup>
				)}
				<ButtonGroup style={{width: "100%", justifyContent: "center", marginTop: "2rem"}}>
					<ButtonGroup orientation={mobile ? "vertical" : "horizontal"}>
						{!GameDataStore.state.familyMode && (
							<Button
								variant="outlined"
								color="default"
								size="large"
								style={{
									fontSize: "1.5rem"
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
							color="primary"
							size="large"
							style={{
								fontSize: "1.5rem"
							}}
							onClick={this.createGame}
							startIcon={<FaPlus/>}
						>
							New Game
						</LoadingButton>
					</ButtonGroup>
				</ButtonGroup>
				<NicknameDialog
					open={this.state.nicknameDialogOpen}
					onClose={this.onNicknameClose}
					onConfirm={this.onNicknameConfirm}
					title={"Please enter your nickname:"}
				/>
				<div>
					<SponsorList familyMode={GameDataStore.state.familyMode}/>
				</div>

				<Paper style={{padding: "1rem", margin: "3rem 0 1rem", textAlign: "left"}}>
					<Grid container>
						<Grid item md={7} xs={12}>
							<Typography>
								<strong>Updates - 5/4</strong>
								<li>Added mutable audio cue for Card Czar</li>
								<li>Improved kick/leave game behavior</li>
								<li>Added confirmation step before leaving/kicking player</li>
								<li>Improved instructions for new players</li>
								<li>Removed 2012 holiday pack due to duplicate cards</li>
								<li>Added ability to edit settings during game</li>
								<li>Improved speed of game updates</li>
								<li>Fixed some typos</li>
								<br/>
								<strong>Updates - 5/1</strong>
								<li>Added support for creating and browsing public games</li>
								<li>Added Dark Mode switch in footer</li>
								<li>Modified the method for user identification to reduce hackability of games (in preparation for public games list)</li>
								<li>Added new option (off by default) for the winning player to become the new Card Czar</li>
								<li>Fix for game restart not working</li>
								<li>Improved layout for larger screens</li>
								<li>Fix for some mobile devices not being able to use My Cards Suck options</li>
								<li>Card typo fixes</li>
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
				<Paper style={{padding: "1rem", marginTop: "3rem"}} elevation={5}>
					<Typography variant={"caption"}>
						Cards Against Humanity by <a href={"https://cardsagainsthumanity.com"} style={{color: "lightblue"}}>Cards Against Humanity</a> LLC is licensed under CC BY-NC-SA 2.0.
					</Typography>
				</Paper>
			</Container>
		);
	}
}

export default withRouter(GameDashboard);