import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {createStyles} from "@material-ui/core";

const useStyles = makeStyles(theme => createStyles({
	topBanner: {
		display: "flex",
		padding: "0.5rem",
		background: "black",
		color: "white"
	},
	links: {
		"& > a": {
			color: "rgba(245,245,245,0.5)",
			padding: "0 0.5rem",
			textDecoration: "none",
			"&:hover": {
				color: "white"
			}
		}
	},
	logo: {
		paddingRight: "0.5rem"
	}
}));

const links: [string,string][] = [
	["https://allbad.cards", "All Bad Cards"],
	["https://kafuckle.com", "Kafuckle"],
	["https://tomemeornottomeme.com", "To Meme or Not To Meme"],
	["https://lexiconned.com", "Lexiconned"]
];

export const TopBanner = () => {
	const classes = useStyles();

	return (
		<div className={classes.topBanner}>
			<div className={classes.logo}>More from GOOD CARDS &raquo;</div>
			<div className={classes.links}>
				{links.map(linkTuple => (
					<a href={linkTuple[0]}>{linkTuple[1]}</a>
				))}
			</div>
		</div>
	);
};