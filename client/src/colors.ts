interface CardScheme{
	main: string;
	light: string;
	dark: string;
	text: string;
	contrastText: string;
}

interface CardTheme
{
	dark: CardScheme;
	light: CardScheme;
	secondary: CardScheme;
}

export const abcColors: CardTheme = {
	dark: {
		main: "#3b332c",
		light: "#35312e",
		dark: "#231F20",
		text: "#231F20",
		contrastText: "#F5EDD9"
	},
	light: {
		main: "#F5EDD9",
		light: "#FCF9F1",
		dark: "#e2d0ba",
		text: "#F5EDD9",
		contrastText: "#231F20"
	},
	secondary: {
		main: "#d24e3e",
		light: "#ee5645",
		dark: "#AD4033",
		text: "#F5EDD9",
		contrastText: "#F5EDD9"
	}
};

export const holdemColors: CardTheme = {
	dark: {
		main: "#183012",
		light: "#28511e",
		dark: "#11220d",
		text: "#000000",
		contrastText: "#FFF"
	},
	light: {
		main: "#ffffff",
		light: "#e6ffe2",
		dark: "#a3c89b",
		text: "#F5EDD9",
		contrastText: "#222"
	},
	secondary: {
		main: "#941919",
		light: "#c11e1e",
		dark: "#691212",
		text: "#FFF",
		contrastText: "#FFF"
	}
} as const;