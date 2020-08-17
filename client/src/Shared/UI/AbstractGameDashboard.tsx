import * as React from "react";
import {RouteComponentProps, withRouter} from "react-router";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import {Divider, Grid, Paper} from "@material-ui/core";
import {TwitterTimelineEmbed} from "react-twitter-embed";
import {SponsorList} from "../../AllBadCards/Areas/GameDashboard/SponsorList";

interface IGameDashboardProps extends RouteComponentProps
{
	tagline: string;
	subTagLine?: string;
	logo: React.ReactNode;
	joinButtons: React.ReactNode;
	subJoinButtons?: React.ReactNode;
	changelist: React.ReactNode;
}

interface DefaultProps
{
}

type Props = IGameDashboardProps & DefaultProps;
type State = ICreationState;

interface ICreationState
{
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
			nicknameDialogOpen: false,
			createLoading: false
		};
	}

	public componentDidMount(): void
	{
	}

	public render()
	{
		const mobile = matchMedia('(max-width:768px)').matches;

		return (
			<Container style={{textAlign: "center"}}>
				<Typography component={"h1"} variant={mobile ? "h5" : "h3"}>be rude. be irreverent. be hilarious!</Typography>

				{this.props.subTagLine && (
					<Typography variant={"h4"} style={{marginTop: "1rem"}}>{this.props.subTagLine}</Typography>
				)}

				{this.props.logo}

				<ButtonGroup style={{width: "100%", justifyContent: "center", marginTop: "2rem"}}>
					{this.props.joinButtons}
				</ButtonGroup>

				{this.props.subJoinButtons}

				<div>
					<SponsorList/>
				</div>

				<Paper style={{padding: "1rem", margin: "3rem 0 1rem", textAlign: "left"}}>
					<Grid container>
						<Grid item md={7} xs={12}>
							{this.props.changelist}
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
			</Container>
		);
	}
}

export default withRouter(GameDashboard);