import * as React from "react";
import {useEffect, useState} from "react";
import {AppBar, Button, ButtonGroup, Container, createStyles, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, Paper, styled, Switch, Tooltip, Typography, useMediaQuery} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import {Routes} from "./Routes";
import {UserDataStore} from "../Global/DataStore/UserDataStore";
import {FaPlus, IoMdVolumeHigh, IoMdVolumeOff, MdArrowUpward, MdBugReport, MdPeople, MdSettings, TiLightbulb} from "react-icons/all";
import {GameRoster} from "../Areas/Game/Components/GameRoster";
import {Link, matchPath} from "react-router-dom";
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
import makeStyles from "@material-ui/core/styles/makeStyles";
import {GameSettings} from "../Areas/Game/Components/GameSettings";
import {PreferencesDataStore} from "../Global/DataStore/PreferencesDataStore";
import {NicknameDialog} from "../UI/NicknameDialog";
import {Platform} from "../Global/Platform/platform";

const useStyles = makeStyles(theme => createStyles({
	appBar: {
		background: "black",
		color: "white"
	},
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
		color: "white",
		textDecoration: "none",
		display: "flex",
		alignItems: "center",
		fontWeight: 700
	},
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
	const appBarClasses = classNames(classes.appBar, {});

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
				<AppBar className={classes.appBar} position="static" elevation={0}>
					<Toolbar className={appBarClasses}>
						<Typography variant={mobile ? "body1" : "h5"}>
							<Link to={"/"} className={classes.logo}>
								{!isFamilyMode && <img className={classes.logoIcon} src={"/logo-tiny-inverted.png"}/>}
								{isFamilyMode ? "(not) " : ""} all bad cards
							</Link>
						</Typography>
						{!isGame && (
							<AppBarLeftButtons isFamilyMode={isFamilyMode}/>
						)}
						{isGame && (
							<AppBarButtons/>
						)}
					</Toolbar>
				</AppBar>
				<Paper square style={{padding: "0 1rem"}}>
					<Container maxWidth={"lg"} style={{position: "relative", padding: "2rem 0 0 0", minHeight: "100vh"}}>
						<ErrorBoundary>
							<Routes/>
						</ErrorBoundary>
					</Container>
					<DarkModeSwitch/>
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
							&copy; {year}. Created by <a href={"http://jakelauer.com"}>Jake Lauer</a> (<a href={"https://reddit.com/u/HelloControl_"}>HelloControl_</a>)
							<br/>
							<br/>
							Email me at <strong>allbadcards(at)gmail.com</strong>
							<br/>
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
	const bugReportUrl = "https://github.com/jakelauer/allbadcards/issues/new?assignees=jakelauer&labels=bug&template=bug_report.md";

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
			<DialogActions>
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
			</DialogActions>
		</Dialog>
	);
};

const AppBarButtons = () =>
{
	const preferences = useDataStore(PreferencesDataStore);
	const gameData = useDataStore(GameDataStore);
	const classes = useStyles();
	const [rosterOpen, setRosterOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);

	const muteLabel = preferences.muted ? "Unmute" : "Mute";

	const buttonColor = preferences.darkMode ? "secondary" : "primary";

	return (
		<>
			<Tooltip title={`${muteLabel} game sounds`} arrow>
				<Button color={buttonColor} aria-label={"Share"} className={classes.firstButton} size={"large"} onClick={() => PreferencesDataStore.setMute(!preferences.muted)}>
					{preferences.muted && (
						<IoMdVolumeOff/>
					)}
					{!preferences.muted && (
						<IoMdVolumeHigh/>
					)}
				</Button>
			</Tooltip>
			<Tooltip title={"Scoreboard"} arrow>
				<Button color={buttonColor} aria-label={"Scoreboard"} className={classes.rosterButton} size={"large"} onClick={() => setRosterOpen(true)}>
					<MdPeople/>
				</Button>
			</Tooltip>
			<Tooltip title={"Game settings"} arrow>
				<Button color={buttonColor} aria-label={"Settings"} className={classes.settingsButton} size={"large"} onClick={() => setSettingsOpen(true)}>
					<MdSettings/>
				</Button>
			</Tooltip>
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
			<Dialog open={gameData.lostConnection} onClose={() =>
			{
			}}>
				<DialogTitle id="form-dialog-title">Lost Connection</DialogTitle>
				<DialogContent>
					You have lost your connection to the server. Please check your connection, or retry. The most common reason for this to happen is switching tabs or leaving your browser for a while.
					<br/>
					<br/>
					If this behavior continues, please <a target={"_blank"} href={"https://github.com/jakelauer/allbadcards/issues/new?assignees=jakelauer&labels=bug&template=bug_report.md"}>click here</a> to report it.
				</DialogContent>
				<DialogActions>
					<Button color={"secondary"} variant={"outlined"} onClick={() => GameDataStore.reconnect()}>Retry</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

const DarkModeSwitch = () =>
{
	const preferences = useDataStore(PreferencesDataStore);

	return (
		<div style={{textAlign: "center", marginTop: "1rem"}}>
			Dark Mode
			<Switch
				onChange={e => PreferencesDataStore.setDarkMode(e.target.checked)}
				checked={preferences.darkMode}
			/>
		</div>
	)
};

const AppBarLeftButtons: React.FC<{isFamilyMode: boolean}> = (props) =>
{
	const history = useHistory();
	const preferences = useDataStore(PreferencesDataStore);
	const userData = useDataStore(UserDataStore);
	const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);

	const onNicknameConfirm = async (nickname: string) =>
	{
		GameDataStore.clear();
		const game = await Platform.createGame(userData.playerGuid, nickname);
		GameDataStore.storeOwnedGames(game);
		history.push(`/game/${game.id}`)
	};

	const mobile = useMediaQuery('(max-width:600px)');
	if(mobile)
	{
		return null;
	}

	return (
		<>
			<Button
				variant="contained"
				color={preferences.darkMode ? "secondary" : "primary"}
				size="small"
				style={{marginLeft: "2rem"}}
				onClick={() => setNicknameDialogOpen(true)}
				startIcon={<FaPlus/>}
			>
				New Game
			</Button>
			{!props.isFamilyMode && (
				<Button
					variant="outlined"
					color={preferences.darkMode ? "secondary" : "primary"}
					size="small"
					style={{marginLeft: "1rem"}}
					component={p => <Link to={"/games"} {...p} />}
					startIcon={<MdArrowUpward/>}
				>
					Join Game
				</Button>
			)}
			<NicknameDialog
				open={nicknameDialogOpen}
				onClose={() => setNicknameDialogOpen(false)}
				onConfirm={onNicknameConfirm}
				title={"Please enter your nickname:"}
			/>
		</>
	);
};

export default App;