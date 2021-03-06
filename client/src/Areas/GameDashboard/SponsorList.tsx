import React from "react";
import classNames from "classnames";
import {createStyles, Theme, Typography} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Grid from "@material-ui/core/Grid";
import {Platform} from "@Global/Platform/platform";
import Tooltip from "@material-ui/core/Tooltip";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import {useDataStore} from "@Global/Utils/HookUtils";
import {EnvDataStore} from "@Global/DataStore/EnvDataStore";
import {ArrayUtils} from "@Global/Utils/ArrayUtils";
import {RemoveAdsButton} from "../../Shared/UI/Ads/RemoveAdsButton";

const useStyles = makeStyles(theme => createStyles({
	callout: {
		textAlign: "center",
		marginTop: "10vh"
	},
	sponsors: {
		display: "flex",
		flexWrap: "wrap",
		marginTop: "1rem"
	},
	sponsor: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		height: "7rem",
		boxSizing: "border-box",
		padding: "1rem",
		"& a": {
			display: "flex",
			flexDirection: "column",
			alignItems: "center",
			justifyContent: "center",
			width: "100%",
			height: "100%",
			color: theme.palette.secondary,
			textDecoration: "none",
			transition: "0.25s",
			"&:hover": {
				color: "#999"
			},
		}
	},
	diamond: {
		height: "9rem"
	},
	noSponsor: {
		transition: "0.25s",
		"& a": {
			border: "1px dashed #BBB",
		},
		"&:hover": {
			background: "#EEE",
			borderColor: "#999"
		}
	},
	hasSponsor: {
		border: "none"
	}
}));

interface ISponsor
{
	url: string;
	src: string;
	byline: string;
}

export const SponsorList = () =>
{
	const classes = useStyles();
	const envData = useDataStore(EnvDataStore);

	if (!envData.site?.base)
	{
		return null;
	}

	const sponsors: (ISponsor | undefined)[] = [
		{
			src: "/sponsors/carepod.png",
			byline: "🐾 Need a vacay to fly away with our pets 🐶",
			url: "https://flycarepod.link/games",
		},
		{
			byline: "Everyone will notice, no one will know",
			url: "https://www.novellusaesthetics.co.uk/",
			src: "/sponsors/novellusauesthetics2.jpeg",
		},
		{
			url: "https://soundcloud.com/damndirtydrivein?source=abc",
			src: "/sponsors/damndirtydrivein.jpg",
			byline: "Damn Dirty Drive-In Podcast",
		},
		{
			url: "http://leisurelandps.com",
			src: "/sponsors/leisurelandps.png",
			byline: "A Unique Palm Springs Experience"
		},
		{
			url: "https://justlikejane.com?source=abc",
			src: "/sponsors/justlikejane.jpg",
			byline: "🧼 wash out your mouth!",
		},
		undefined,
	];

	const shuffledSponsors = ArrayUtils.shuffle(sponsors).sort((a,b) => {
		return (!!a ? 1 : 0) - (!!b ? 1 : 0);
	});

	return (
		<>
			<div className={classes.callout}>
				<Typography variant={"h6"}>
					Sponsors
				</Typography>
				<div>
					<RemoveAdsButton/>
				</div>
			</div>
			<Grid className={classes.sponsors}>

				{shuffledSponsors.map((s, i) =>
					<Sponsor key={i} sponsor={s}/>
				)}

				<div style={{width: "100%"}}>
					<a href={"https://www.senahugheslauer.com/?source=abc"} style={{textDecoration: "none", display: "inline-block"}} target={"_blank"} onClick={() => Platform.trackEvent("sponsor-click", "sena")}>
						<Card style={{maxWidth: "30rem", margin: "4rem auto 0"}} elevation={7}>
							<CardMedia style={{paddingTop: "22.66667%"}} image={"/sponsors/shl.png"}/>
							<CardContent>
								<div>
									senahugheslauer.com
								</div>
								<Typography>
									My sister, without whom this site would not exist (it was her idea), is a communications
									consultant who can make your business shine. Here's her site so you can hire her, because she rocks.
								</Typography>
							</CardContent>
						</Card>
					</a>
				</div>
			</Grid>
		</>
	);
};

interface ISponsorProps
{
	sponsor: ISponsor | undefined;
}

export const Sponsor: React.FC<ISponsorProps> = (props) =>
{
	const envData = useDataStore(EnvDataStore);
	const classes = useStyles();

	const wrapperClasses = classNames(classes.sponsor, {
		[classes.hasSponsor]: !!props.sponsor,
		[classes.noSponsor]: !props.sponsor,
	});

	if (!envData.site?.base)
	{
		return null;
	}

	return (
		<Grid item xs={12} sm={6} md={4} className={wrapperClasses}>
			<SponsorInner {...props} />
		</Grid>
	);
};

const useStylesBootstrap = makeStyles((theme: Theme) => ({
	arrow: {
		color: theme.palette.common.black,
	},
	tooltip: {
		backgroundColor: theme.palette.common.black,
		fontSize: "0.8rem",
		textAlign: "center"
	},
}));

const SponsorInner: React.FC<ISponsorProps> = (props) =>
{
	const url = props.sponsor?.url ?? "http://patreon.com/allbadcards";

	const byline = props.sponsor?.byline ?? "+ Sponsor";

	const track = () =>
	{
		Platform.trackEvent("sponsor-click", props.sponsor?.url);
	};

	const hasSponsor = props.sponsor !== undefined;

	const link = (
		<a href={url} target={"_blank"} rel={"noreferrer nofollow"} onClick={track}>
			{hasSponsor && (
				<div style={{
					width: "100%",
					height: "5rem",
					backgroundImage: `url(${props.sponsor?.src})`,
					backgroundSize: "contain",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center"
				}}/>
			)}

			<Typography style={{color: "black", fontSize: "12px"}}>
				{byline}
			</Typography>
		</a>
	);

	const classes = useStylesBootstrap();

	return (
		hasSponsor
			? link
			: (
				<Tooltip arrow classes={classes} title={"Become a Patreon sponsor. Email allbadcards[at]gmail.com for traffic information."}>
					{link}
				</Tooltip>
			)
	);
};