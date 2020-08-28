import * as React from "react";
import {RouteComponentProps, withRouter} from "react-router";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";

interface IGameDashboardProps extends RouteComponentProps
{
	tagline: string;
	subTagLine?: string;
	logo: React.ReactNode;
	joinButtons: React.ReactNode;
	subJoinButtons?: React.ReactNode;
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
				<Typography component={"h1"} variant={mobile ? "h5" : "h3"}>{this.props.tagline}</Typography>

				{this.props.subTagLine && (
					<Typography variant={"h4"} style={{marginTop: "1rem"}}>{this.props.subTagLine}</Typography>
				)}

				{this.props.logo}

				<ButtonGroup style={{width: "100%", justifyContent: "center", marginTop: "2rem"}}>
					{this.props.joinButtons}
				</ButtonGroup>

				{this.props.subJoinButtons}


			</Container>
		);
	}
}

export default withRouter(GameDashboard);