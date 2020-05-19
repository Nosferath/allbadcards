import React from 'react';
import "./base.scss";
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import App from "./App/App";
import {BrowserRouter} from "react-router-dom";
import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import {MuiThemeProvider} from "@material-ui/core";
import ReactGA from "react-ga";
import * as Sentry from "@sentry/browser";
import CssBaseline from "@material-ui/core/CssBaseline";
import {useDataStore} from "./Global/Utils/HookUtils";
import {PreferencesDataStore} from "./Global/DataStore/PreferencesDataStore";

require('es6-promise').polyfill();
const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

const lightTheme = createMuiTheme({
	palette: {
		primary: {
			main: "#FFF",
			contrastText: "#222",
			dark: "#CCC",
			light: "#EEE",
		},
		secondary: {
			main: "#222",
			contrastText: "#FFF",
			dark: "#111",
			light: "#EEE",
		},
		type: "light",
	},
});

const darkTheme = createMuiTheme({
	palette: {
		primary: {
			main: "#333",
			contrastText: "#FFF",
			dark: "#111",
			light: "#FFF",
		},
		secondary: {
			main: "#FFF",
			contrastText: "#333",
			dark: "#CCC",
			light: "#FFF",
		},
		type: "dark",
	},
});

if (!location.hostname.includes("local"))
{
	Sentry.init({
		dsn: "https://6d23e717863b4e2e9870dad240f4e965@o377988.ingest.sentry.io/5200785",
		beforeSend: (event, hint) =>
		{
			let discard = false;

			if (event.message?.includes("ceCurrentVideo.currentTime")
				|| event.message?.includes("chrome-extension"))
			{
				discard = true;
			}

			if (event.breadcrumbs?.some(a => a.data?.url?.includes("analytics")))
			{
				discard = true;
			}

			if (discard)
			{
				return null;
			}

			return event;
		}
	});
}

ReactGA.initialize('UA-23730353-5', {
	debug: location.hostname.includes("local") || location.hostname.includes("beta")
});
ReactGA.pageview(window.location.pathname + window.location.search);

const ThemeWrapper: React.FC = (props) => {
	const preferences = useDataStore(PreferencesDataStore);

	return (
		<MuiThemeProvider theme={preferences.darkMode ? darkTheme : lightTheme}>
			{props.children}
		</MuiThemeProvider>
	);
};

ReactDOM.render(
	<BrowserRouter>
		<ThemeWrapper>
			<CssBaseline/>
			<App/>
		</ThemeWrapper>
	</BrowserRouter>
	, document.getElementById('root'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();