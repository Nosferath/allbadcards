import createMuiTheme from "@material-ui/core/styles/createMuiTheme";
import {abcColors} from "./colors";

export const createThemes = (scheme: any) => {
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
}