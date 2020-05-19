import * as React from "react";
import {useEffect, useState} from "react";
import {AppBar, Button, ButtonGroup, Container, createStyles, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Paper, styled, Switch, Tooltip, Typography, useMediaQuery} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import {Routes} from "./Routes";
import {UserDataStore} from "../Global/DataStore/UserDataStore";
import {FaUserCircle, IoMdVolumeHigh, IoMdVolumeOff, MdBugReport, MdPeople, MdSettings, TiLightbulb} from "react-icons/all";
import {GameRoster} from "../Areas/Game/Components/GameRoster";
import {Link} from "react-router-dom";
import {useHistory} from "react-router";
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
import {SocketDataStore} from "../Global/DataStore/SocketDataStore";
import {getPatreonUrl} from "../Global/Utils/UserUtils";
import {AuthDataStore} from "../Global/DataStore/AuthDataStore";
import cookies from "browser-cookies";

const useStyles = makeStyles(theme => createStyles({
	header: {
		position: "relative",
		zIndex: 1300
	},
	appBar: {
		background: theme.palette.secondary.main,
		color: "white",
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
	appBarButton: {
		marginLeft: "0.5rem"
	},
	appBarButtonRight: {
		marginRight: "0.5rem"
	},
	rightButtons: {
		marginLeft: "auto"
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
	const mobile = useMediaQuery('(max-width:600px)');
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

	const appBarClasses = classNames(classes.appBar, {});
	const date = new Date();
	const year = date.getFullYear();
	const isFamilyMode = location.hostname.startsWith("not.");


	const titleDefault = isFamilyMode
		? "(Not) All Bad Cards | Play the Family Edition of All Bad Cards online!"
		: "All Bad Cards | Be rude. Be irreverent. Be Hilarious!";

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
				<AppBar className={classes.appBar} classes={{root: classes.header}} position="static" elevation={0}>
					<Toolbar className={appBarClasses}>
						<Typography variant={mobile ? "body1" : "h5"}>
							<Link to={"/"} className={classes.logo}>
								{!isFamilyMode && <img className={classes.logoIcon} src={"/logo-tiny-inverted.png"}/>}
								{isFamilyMode ? "(not) " : ""} ALL BAD CARDS
							</Link>
						</Typography>
						<AppBarLeftButtons/>
						<AppBarRightButtons/>
					</Toolbar>
				</AppBar>
				<Paper square style={{padding: "0 1rem 6rem"}}>
					<Container maxWidth={"xl"} style={{position: "relative", padding: "2rem 0 0 0", minHeight: "100vh"}}>
						<ErrorBoundary>
							<Routes />
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

const AppBarGameButtons = () =>
{
	const preferences = useDataStore(PreferencesDataStore);
	const socketData = useDataStore(SocketDataStore);
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
			<Dialog open={socketData.lostConnection} onClose={() =>
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
					<Button color={"secondary"} variant={"outlined"} onClick={() => SocketDataStore.reconnect()}>Retry</Button>
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

const AppBarLeftButtons: React.FC = () =>
{
	const classes = useStyles();
	const mobile = useMediaQuery('(max-width:600px)');
	if (mobile)
	{
		return null;
	}

	return (
		<div style={{marginLeft: "2rem"}}>
			<Button className={classes.appBarButton} color="inherit" component={p => <Link {...p} to={"/"}/>}>
				Play
			</Button>
			<Button className={classes.appBarButton} color="inherit" component={p => <Link {...p} to={"/packs"}/>}>
				Custom Packs
			</Button>
		</div>
	);
};

const AppBarRightButtons = () =>
{
	const authData = useDataStore(AuthDataStore);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const history = useHistory();

	const logOut = () =>
	{
		cookies.erase("auth");

		AuthDataStore.refresh();
	};

	const openMenu = (element: HTMLElement) => {
		setAnchorEl(element);
		setUserMenuOpen(true);
	};

	const classes = useStyles();

	return (
		<div className={classes.rightButtons}>
			{authData.authorized ? (
				<>
					<IconButton aria-label={"User Page"} className={classes.appBarButtonRight} color="inherit" onClick={(e) => openMenu(e.currentTarget)}>
						<FaUserCircle/>
					</IconButton>
					<Menu
						anchorEl={anchorEl}
						keepMounted
						open={userMenuOpen}
						getContentAnchorEl={null}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'left',
						}}
						onClose={() => setUserMenuOpen(false)}
					>
						<MenuItem href={"/"}>Settings</MenuItem>
						<MenuItem onClick={logOut}>Logout</MenuItem>
					</Menu>
				</>
			) : (
				<Button className={classes.appBarButtonRight} color="inherit" href={getPatreonUrl(history.location.pathname)}>
					Log In
				</Button>
			)}
		</div>
	);
};

export default App;