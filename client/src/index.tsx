import React from 'react';
import "./base.scss";
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import AllBadCardsApp from "./AllBadCards/App/AllBadCardsApp";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import {MuiThemeProvider} from "@material-ui/core";
import ReactGA from "react-ga";
import CssBaseline from "@material-ui/core/CssBaseline";
import {useDataStore} from "./Shared/Global/Utils/HookUtils";
import {PreferencesDataStore} from "./AllBadCards/Global/DataStore/PreferencesDataStore";
import {abcColors} from "./colors";
import {HoldEmGameDashboard} from "./HoldEm/Areas/GameDashboard/HoldEmGameDashboard";

require('es6-promise').polyfill();
const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

const lightTheme = createMuiTheme({
	typography: {
		fontFamily: "victorian-orchid, serif",
		button: {
			textTransform: 'none',
			color: abcColors.light.contrastText
		}
	},
	palette: {
		background: {
			default: abcColors.light.light,
			paper: abcColors.light.main
		},
		primary: {
			...abcColors.light
		},
		secondary: {
			...abcColors.secondary
		},
		type: "light",
	},
	overrides: {
		MuiListItem: {
			secondaryAction: {
				paddingRight: 84
			}
		},
		MuiTooltip: {
			tooltip: {
				fontSize: "1rem"
			}
		}
	}
});

const darkTheme = createMuiTheme({
	typography: {
		fontFamily: "victorian-orchid, serif",
		button: {
			textTransform: 'none',
		}
	},
	palette: {
		background: {
			default: abcColors.dark.dark,
			paper: abcColors.dark.main
		},
		primary: {
			...abcColors.dark
		},
		secondary: {
			...abcColors.secondary
		},
		type: "dark",
	},
	overrides: {
		MuiListItem: {
			secondaryAction: {
				paddingRight: 84
			}
		}
	}
});

ReactGA.initialize('UA-23730353-5', {
	debug: location.hostname.includes("local") || location.hostname.includes("beta")
});
ReactGA.pageview(window.location.pathname + window.location.search);

const AllBadCardsTheme: React.FC = (props) =>
{
	const preferences = useDataStore(PreferencesDataStore);

	return (
		<MuiThemeProvider theme={preferences.darkMode ? darkTheme : lightTheme}>
			{props.children}
		</MuiThemeProvider>
	);
};

ReactDOM.render(
	<BrowserRouter>
		<CssBaseline/>
		<Switch>
			<Route path={"/holdem"} exact>
				<HoldEmGameDashboard/>
			</Route>
			<Route path={"/"}>
				<AllBadCardsTheme>
					<AllBadCardsApp/>
				</AllBadCardsTheme>
			</Route>
		</Switch>
	</BrowserRouter>
	, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();