import * as React from "react";
import {useEffect, useState} from "react";
import {AppBar, Button, ButtonGroup, CardContent, CardMedia, Container, Dialog, DialogContent, DialogTitle, List, ListItem, ListItemText, Paper, styled, Switch, Tooltip, useMediaQuery} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import {Routes} from "./Routes";
import {UserDataStore} from "../Global/DataStore/UserDataStore";
import {MdBugReport, MdPeople, MdSettings, MdShare, TiLightbulb} from "react-icons/all";
import {GameRoster} from "../Areas/Game/Components/GameRoster";
import {Link, matchPath} from "react-router-dom";
import {CopyGameLink} from "../UI/CopyGameLink";
import {GameDataStore} from "../Global/DataStore/GameDataStore";
import {useHistory} from "react-router";
import {SiteRoutes} from "../Global/Routes/Routes";
import ReactGA from "react-ga";
import classNames from "classnames";
import Helmet from "react-helmet";
import {useDataStore} from "../Global/Utils/HookUtils";
import {ErrorDataStore} from "../Global/DataStore/ErrorDataStore";
import {ErrorBoundary} from "./ErrorBoundary";
import {BrowserUtils} from "../Global/Utils/BrowserUtils";
import {createStyles, Theme, Typography} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {GameSettings} from "../Areas/Game/Components/GameSettings";

const useStyles = makeStyles(theme => createStyles({
	logoIcon: {
		height: "2rem",
		width: "auto",
		paddingRight: "1rem"
	},
	settingsButton: {
		minWidth: 0,
		fontSize: "1.5rem",
	},
	firstButton: {
		minWidth: 0,
		marginLeft: "auto",
		fontSize: "1.5rem"
	},
	rosterButton: {
		minWidth: 0,
		fontSize: "1.5rem"
	},
	logo: {
		color: theme.palette.text.primary,
		textDecoration: "none",
		display: "flex",
		alignItems: "center",
		fontWeight: 700
	},
	appBar: {
		padding: "0 1rem"
	},
	centerBar: {
		display: "flex",
		justifyContent: "center"
	}
}));

const OuterContainer = styled(Container)({
	background: "#EEE",
	minHeight: "100vh",
	width: "100%",
	padding: 0,
	maxWidth: "none"
});

const App: React.FC = () =>
{
	const classes = useStyles();

	const history = useHistory();

	const isGame = !!matchPath(history.location.pathname, SiteRoutes.Game.path);
	const isHome = history.location.pathname === "/";

	const appBarClasses = classNames(classes.appBar, {
		[classes.centerBar]: isHome
	});

	history.listen(() => BrowserUtils.scrollToTop());

	useEffect(() =>
	{
		UserDataStore.initialize();
		history.listen(() =>
		{
			UserDataStore.initialize();
			ReactGA.pageview(window.location.pathname + window.location.search);
		});
	}, []);

	const date = new Date();
	const year = date.getFullYear();
	const isFamilyMode = location.hostname.startsWith("not.");

	const mobile = useMediaQuery('(max-width:600px)');

	const titleDefault = isFamilyMode
		? "(Not) All Bad Cards | Play the Family Edition of Cards Against Humanity online!"
		: "All Bad Cards | Play Cards Against Humanity online!";

	const template = isFamilyMode
		? "(Not) All Bad Cards"
		: "All Bad Cards";

	const familyEdition = isFamilyMode ? " (Family Edition)" : "";

	const bugReportUrl = "https://github.com/jakelauer/allbadcards/issues/new?assignees=jakelauer&labels=bug&template=bug_report.md";
	const featureRequestUrl = "https://github.com/jakelauer/allbadcards/issues/new?assignees=jakelauer&labels=enhancement&template=feature_request.md";

	return (
		<div>
			<Helmet titleTemplate={`%s | ${template}`} defaultTitle={titleDefault}>
				<meta name="description" content={`Play Cards Against Humanity${familyEdition} online, for free! Over 10,000 cards in total. Play with friends over video chat, or in your house with your family. `}/>
			</Helmet>
			<OuterContainer>
				<Paper elevation={10}>
					<Container maxWidth={"lg"} style={{position: "relative", padding: 0, minHeight: "100vh"}}>
						<CardMedia>
							<AppBar color={"transparent"} position="static" elevation={0}>
								<Toolbar className={appBarClasses}>
									<Typography variant={mobile ? "body1" : "h5"}>
										<Link to={"/"} className={classes.logo}>
											{!isFamilyMode && <img className={classes.logoIcon} src={"/logo-small.png"}/>}
											{isFamilyMode ? "(not) " : ""} all bad cards
										</Link>
									</Typography>
									{isGame && (
										<AppBarButtons/>
									)}
								</Toolbar>
							</AppBar>
						</CardMedia>
						<CardContent style={{paddingTop: 0}}>
							<ErrorBoundary>
								<Routes/>
							</ErrorBoundary>
						</CardContent>
					</Container>
					<div style={{textAlign: "center"}}>
						Dark Mode
						<Switch
							onChange={e =>
							{
								localStorage.setItem("theme", e.target.checked ? "dark" : "light");
								location.reload();
							}}
							checked={localStorage.getItem("theme") === "dark"}
						/>
					</div>
					<div style={{textAlign: "center", padding: "0.5rem 0"}}>
						<ButtonGroup style={{margin: "1rem 0 2rem"}}>
							<Button
								size={"small"}
								color={"default"}
								variant={"outlined"}
								href={bugReportUrl}
								target={"_blank"}
								rel={"noreferrer nofollow"}
								startIcon={<MdBugReport/>}
							>
								Report a Bug
							</Button>
							<Button
								size={"small"}
								color={"default"}
								variant={"outlined"}
								startIcon={<TiLightbulb/>}
								href={featureRequestUrl}
								target={"_blank"}
								rel={"noreferrer nofollow"}
							>
								Feature Idea
							</Button>
						</ButtonGroup>
						<Typography>
							&copy; {year}. Created by <a href={"http://jakelauer.com"} style={{color: "lightblue"}}>Jake Lauer</a> (<a style={{color: "lightblue"}} href={"https://reddit.com/u/HelloControl_"}>HelloControl_</a>)
						</Typography>
					</div>
				</Paper>
			</OuterContainer>
			<Errors/>
		</div>
	);
};

const Errors = () =>
{
	const errorData = useDataStore(ErrorDataStore);
	const errors = errorData.errors ?? [];

	return (
		<Dialog open={errors.length > 0} onClose={() => ErrorDataStore.clear()}>
			<DialogContent style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
				<List>
					{errors.map(e => (
						<ListItem>
							<ListItemText>
								{e.message}
							</ListItemText>
						</ListItem>
					))}
				</List>
			</DialogContent>
		</Dialog>
	);
};

const AppBarButtons = () =>
{
	const classes = useStyles();
	const [rosterOpen, setRosterOpen] = useState(false);
	const [shareOpen, setShareOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

	return (
		<>
			<Tooltip title={"Share"} arrow>
				<Button aria-label={"Share"} className={classes.firstButton} size={"large"} onClick={() => setShareOpen(true)}>
					<MdShare/>
				</Button>
			</Tooltip>
			<Tooltip title={"Scoreboard"} arrow>
				<Button aria-label={"Scoreboard"} className={classes.rosterButton} size={"large"} onClick={() => setRosterOpen(true)}>
					<MdPeople/>
				</Button>
			</Tooltip>
			<Tooltip title={"Game settings"} arrow>
				<Button aria-label={"Settings"} className={classes.settingsButton} size={"large"} onClick={() => setSettingsOpen(true)}>
					<MdSettings/>
				</Button>
			</Tooltip>
			<Dialog open={shareOpen} onClose={() => setShareOpen(false)}>
				<DialogContent style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
					<Typography variant={"h4"}>Game: {GameDataStore.state.game?.id}</Typography>
					<br/>
					<br/>
					<CopyGameLink buttonSize={"large"}/>
				</DialogContent>
			</Dialog>
			<Dialog open={rosterOpen} onClose={() => setRosterOpen(false)}>
				<DialogTitle id="form-dialog-title">Game Roster</DialogTitle>
				<DialogContent>
					<GameRoster/>
				</DialogContent>
			</Dialog>
			<Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
				<DialogTitle id="form-dialog-title">Settings</DialogTitle>
				<DialogContent>
					<GameSettings/>
				</DialogContent>
			</Dialog>
		</>
	);
}

export default App;