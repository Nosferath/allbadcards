import * as React from "react";
import {useEffect, useState} from "react";
import {AppBar, Button, ButtonGroup, Container, createStyles, DialogActions, DialogContent, IconButton, List, ListItem, ListItemText, Menu, MenuItem, Paper, styled, SwipeableDrawer, Switch, Typography, useMediaQuery} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import {Routes} from "./Routes";
import {UserDataStore} from "../Global/DataStore/UserDataStore";
import {FaGithub, FaPatreon, FaTwitter, FaUser, FiMenu, MdBugReport, TiLightbulb} from "react-icons/all";
import {Link, matchPath} from "react-router-dom";
import {useHistory} from "react-router";
import ReactGA from "react-ga";
import classNames from "classnames";
import Helmet from "react-helmet";
import {useDataStore} from "../Global/Utils/HookUtils";
import {ErrorDataStore} from "../Global/DataStore/ErrorDataStore";
import {ErrorBoundary} from "./ErrorBoundary";
import {BrowserUtils} from "../Global/Utils/BrowserUtils";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {PreferencesDataStore} from "../Global/DataStore/PreferencesDataStore";
import {getPatreonUrl} from "../Global/Utils/UserUtils";
import {AuthDataStore} from "../Global/DataStore/AuthDataStore";
import {SiteRoutes} from "../Global/Routes/Routes";
import {CloseableDialog} from "../UI/CloseableDialog";
import {NavButtons} from "./NavButtons";
import {colors} from "../colors";
import {AppBarGameButtons} from "./GameButtons";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import {DiamondSponsor} from "../Areas/GameDashboard/SponsorList";
import {ChatDataStore} from "../Global/DataStore/ChatDataStore";

const useStyles = makeStyles(theme => createStyles({
	header: {
		position: "relative",
		zIndex: 1300
	},
	appBar: {
		background: colors.dark.main,
		color: colors.dark.contrastText,
	},
	logoIcon: {
		height: "2rem",
		width: "auto",
		paddingRight: "1rem"
	},
	logo: {
		color: colors.dark.contrastText,
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
	drawer: {
		minWidth: "50vw",
		"& a": {
			display: "flex",
			justifyContent: "flex-start",
			marginTop: "0.5rem",
			marginBottom: "0.5rem"
		}
	}
}));

const OuterContainer = styled(Container)({
	background: colors.light.main,
	minHeight: "100vh",
	width: "100%",
	padding: 0,
	maxWidth: "none"
});

const App: React.FC = () =>
{
	const classes = useStyles();
	const history = useHistory();
	const mobile = useMediaQuery('(max-width:768px)');
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
	const isFamilyMode = location.hostname.startsWith("not.");

	const titleDefault = isFamilyMode
		? "(Not) All Bad Cards | Play the Family Edition of All Bad Cards online!"
		: "All Bad Cards | Be rude. Be irreverent. Be Hilarious!";

	const template = isFamilyMode
		? "(Not) All Bad Cards"
		: "All Bad Cards";

	const familyEdition = isFamilyMode ? " (Family Edition)" : "";

	const isGame = !!matchPath(history.location.pathname, SiteRoutes.Game.path);
	const isHome = history.location.pathname === "/";

	return (
		<div>
			<Helmet titleTemplate={`%s | ${template}`} defaultTitle={titleDefault}>
				<meta name="description" content={`Play All Bad Cards${familyEdition} online, for free! Play with friends over video chat, or in your house with your family. `}/>
			</Helmet>
			<OuterContainer>
				<AppBar className={classes.appBar} classes={{root: classes.header}} position="static" elevation={0}>
					<Toolbar className={appBarClasses}>
						{mobile && (
							<AppDrawer/>
						)}
						<Typography variant={mobile ? "body1" : "h5"} style={{marginRight: mobile ? "auto" : undefined}}>
							<Link to={"/"} className={classes.logo}>
								<img className={classes.logoIcon} src={"/logo-tiny-inverted.png"}/>
								{isFamilyMode && !mobile ? "(not) " : ""} {!mobile && "ALL BAD CARDS"}
							</Link>
						</Typography>
						<AppBarLeftButtons/>
						{isGame && (
							<AppBarGameButtons/>
						)}
						<AppBarRightButtons/>
					</Toolbar>
				</AppBar>
				<Paper square style={{padding: "0 1rem 6rem"}}>
					<Container maxWidth={"xl"} style={{position: "relative", padding: "2rem 0 0 0", minHeight: "100vh"}}>
						<ErrorBoundary>
							<Routes/>
						</ErrorBoundary>
					</Container>
					<Footer/>
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
		<CloseableDialog open={errors.length > 0} onClose={() => ErrorDataStore.clear()} TitleProps={{children: "Error Encountered"}}>
			<DialogContent style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
				<List style={{minWidth: "20rem"}}>
					{errors.map(e => (
						<ListItem>
							<ListItemText>
								{e.message}
							</ListItemText>
						</ListItem>
					))}
				</List>
			</DialogContent>
		</CloseableDialog>
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

const AppBarLeftButtons: React.FC = (props) =>
{
	const mobile = useMediaQuery('(max-width:768px)');
	if (mobile)
	{
		return null;
	}

	return (
		<div style={{marginLeft: "2rem", marginRight: "auto"}}>
			<NavButtons/>
		</div>
	);
};

const AppBarRightButtons = () =>
{
	const authData = useDataStore(AuthDataStore);
	const [userMenuOpen, setUserMenuOpen] = useState(false);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [logInDialogVisible, setLogInDialogVisible] = useState(false);
	const history = useHistory();

	const logOut = () =>
	{
		AuthDataStore.logOut();
	};

	const openMenu = (element: HTMLElement) =>
	{
		setAnchorEl(element);
		setUserMenuOpen(true);
	};

	history.listen(() =>
	{
		setUserMenuOpen(false);
	});

	const classes = useStyles();

	return (
		<div>
			{authData.authorized ? (
				<>
					<IconButton aria-label={"User Page"} className={classes.appBarButtonRight} color="inherit" onClick={(e) => openMenu(e.currentTarget)}>
						<FaUser/>
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
						<MenuItem component={p => <Link {...p} to={SiteRoutes.MyPacks.resolve()}/>}>My Card Packs</MenuItem>
						<MenuItem component={p => <Link {...p} to={SiteRoutes.Settings.resolve()}/>}>Settings</MenuItem>
						<MenuItem onClick={logOut}>Log Out</MenuItem>
					</Menu>
				</>
			) : (
				<Button className={classes.appBarButtonRight} color="inherit" onClick={() => setLogInDialogVisible(true)}>
					Log In
				</Button>
			)}
			<CloseableDialog open={logInDialogVisible} onClose={() => setLogInDialogVisible(false)} TitleProps={{children: "Log In"}}>
				<DialogContent dividers>
					<Typography variant={"h6"}>All Bad Cards uses Patreon for authentication.</Typography>
					<br/>
					<br/>
					<Typography>You <strong>do not</strong> need to be a Patreon supporter to log in.</Typography>
					<br/>
					<Typography>
						Patrons may receive extra benefits, but all users can log in!
					</Typography>
					<br/>
				</DialogContent>
				<DialogActions>
					<Button href={getPatreonUrl(history.location.pathname)} variant={"contained"} color={"secondary"} style={{margin: "auto", background: "#E64413"}} size={"large"}>
						Log In with Patreon
					</Button>
				</DialogActions>
			</CloseableDialog>
		</div>
	);
};

const AppDrawer = () =>
{
	const history = useHistory();
	const [drawerOpen, setDrawerOpen] = useState(false);

	const classes = useStyles();
	const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

	history.listen(() => setDrawerOpen(false));

	return (
		<>
			<IconButton onClick={() => setDrawerOpen(true)} style={{color: "white"}}>
				<FiMenu/>
			</IconButton>
			<SwipeableDrawer
				disableBackdropTransition={!iOS}
				disableDiscovery={iOS}
				anchor={"left"}
				open={drawerOpen}
				onOpen={() => setDrawerOpen(true)}
				onClose={() => setDrawerOpen(false)}
				classes={{
					paper: classes.drawer
				}}
			>
				<div style={{minWidth: "50vw"}}>
					<Typography style={{textAlign: "center", padding: "1rem 0", background: colors.dark.main, color: colors.dark.contrastText}}>
						ALL BAD CARDS
					</Typography>
					<NavButtons/>
				</div>
			</SwipeableDrawer>
		</>
	);
};

const Footer = () =>
{
	const history = useHistory();
	const chatData = useDataStore(ChatDataStore);
	const tablet = useMediaQuery('(max-width:1200px)');
	const isGamePage = history.location.pathname.startsWith("/game/");

	const isHome = history.location.pathname === "/";
	const bugReportUrl = "https://github.com/jakelauer/allbadcards/issues/new?assignees=jakelauer&labels=bug&template=bug_report.md";
	const featureRequestUrl = "https://github.com/jakelauer/allbadcards/issues/new?assignees=jakelauer&labels=enhancement&template=feature_request.md";
	const date = new Date();
	const year = date.getFullYear();
	const chatMode = (isGamePage && chatData.sidebarOpen && !tablet);

	return (
		<Container
			maxWidth={"xl"}
			style={{
				position: "relative",
				padding: "2rem 0 0 0",
				maxWidth: chatMode ? "calc(100% - 320px)" : "100%",
				marginLeft: chatMode ? "0" : "auto"
			}}
		>
			{!isHome && (
				<Grid style={{marginTop: "5rem"}}>
					<Divider style={{margin: "1rem 0"}}/>
					<DiamondSponsor/>
				</Grid>
			)}
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
				<ButtonGroup>
					<IconButton href={"https://github.com/jakelauer/allbadcards"} target={"_blank"} color={"secondary"}>
						<FaGithub/>
					</IconButton>
					<IconButton href={"http://twitter.com/allbadcards/"} target={"_blank"} color={"secondary"}>
						<FaTwitter/>
					</IconButton>
					<IconButton href={"http://patreon.com/allbadcards/"} target={"_blank"} color={"secondary"}>
						<FaPatreon/>
					</IconButton>
				</ButtonGroup>
			</div>
		</Container>
	)
};

export default App;