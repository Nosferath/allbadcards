import {ICustomCardPack} from "@Global/Platform/Contract";
import React, {useEffect, useState} from "react";
import {Button, Card, CardActions, CardContent, CardHeader, CardMedia, Chip} from "@material-ui/core";
import {Link} from "react-router-dom";
import {SiteRoutes} from "@Global/Routes/Routes";
import {FaArrowRight, MdEdit, MdFavorite, MdFavoriteBorder} from "react-icons/all";
import makeStyles from "@material-ui/core/styles/makeStyles";
import classNames from "classnames";
import {Platform} from "@Global/Platform/platform";
import {ErrorDataStore} from "@Global/DataStore/ErrorDataStore";
import {colors} from "../../colors";
import shuffle from "shuffle-array";
import {CopyToClipboard} from "react-copy-to-clipboard";
import {PreferencesDataStore} from "@Global/DataStore/PreferencesDataStore";

interface IPackSummaryProps
{
	pack: ICustomCardPack;
	hideExamples?: boolean;
	authed: boolean;
	favorited: boolean;
	canEdit: boolean;
	isAdmin: boolean;
}

const useStyles = makeStyles(theme => ({
	cardListWrap: {
		position: "relative",
		display: "flex",
		margin: "0.5rem",
		borderRadius: 4,
		overflow: "hidden"
	},
	cardList: {
		fontSize: "0.75rem",
		width: "50%"
	},
	blackCardList: {},
	whiteCardList: {},
	blackItem: {
		background: colors.dark.main,
		color: colors.light.dark,
		borderBottom: "1px solid rgba(245,245,245,0.1)",
		padding: "0.25rem",
		overflow: "hidden",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis"
	},
	whiteItem: {
		background: colors.light.main,
		color: colors.dark.light,
		borderBottom: "1px solid rgba(0,0,0,0.1)",
		padding: "0.25rem",
		overflow: "hidden",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis"
	},
	packCode: {
		fontFamily: "monospace",
		fontWeight: "bold",
		fontSize: "1.5rem"
	}
}));

export const PackSummary: React.FC<IPackSummaryProps> = (props) =>
{
	const classes = useStyles();

	const [isFaved, setIsFaved] = useState(props.favorited);
	const [shuffledBlack, setShuffledBlack] = useState([...props.pack.definition.black]);
	const [shuffledWhite, setShuffledWhite] = useState([...props.pack.definition.white]);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		setIsFaved(props.favorited);
	}, [props.favorited]);

	useEffect(() => {
		const newBlackShuffle = shuffle([...props.pack.definition.black]);
		const newWhiteShuffle = shuffle([...props.pack.definition.white]);
		setShuffledBlack(newBlackShuffle);
		setShuffledWhite(newWhiteShuffle);
	}, [props.pack]);

	const {
		pack,
	} = props;

	const {
		definition,
	} = pack;

	const setFavorite = () =>
	{
		const method = isFaved
			? Platform.unfavoritePack(definition.pack.id)
			: Platform.favoritePack(definition.pack.id);

		method
			.then(() => setIsFaved(!isFaved))
			.catch(ErrorDataStore.add);
	};

	const onClick = () =>
	{
		const newBlackShuffle = shuffle([...definition.black]);
		const newWhiteShuffle = shuffle([...definition.white]);
		setShuffledBlack(newBlackShuffle);
		setShuffledWhite(newWhiteShuffle);
	};

	const onCopy = () =>
	{
		setCopied(true);

		setTimeout(() => setCopied(false), 3000);
	};

	const onDelete = () => {
		const approved = window.confirm("Are you sure you want to delete this pack?");
		if(approved)
		{
			Platform.deletePack(definition.pack.id)
				.then(() => window.alert("Deleted!"))
				.catch(ErrorDataStore.add);
		}
	};

	return (
		<Card elevation={5} style={{height: "100%"}}>
			<CardMedia onClick={onClick}>
				{!props.hideExamples && (
					<div className={classes.cardListWrap}>
						<div className={classNames(classes.cardList, classes.blackCardList)}>
							{shuffledBlack.slice(0, 3).map((bc, i) => (
								<div key={i} className={classes.blackItem}>{bc.content}</div>
							))}
						</div>
						<div className={classNames(classes.cardList, classes.whiteCardList)}>
							{shuffledWhite.slice(0, 3).map((wc, i) => (
								<div key={i} className={classes.whiteItem}>{wc}</div>
							))}
						</div>
					</div>
				)}
			</CardMedia>
			<CardHeader
				title={
					<Link to={SiteRoutes.PackCreate.resolve({id: definition.pack.id})} style={{textDecoration: "none", color: PreferencesDataStore.state.darkMode ? colors.dark.contrastText : colors.light.contrastText}}>
						{definition.pack.name}
					</Link>
				}
				subheader={<span>
					P:<strong>{definition.quantity.black}</strong> R:<strong>{definition.quantity.white}</strong>
				</span>}
			/>
			<CardContent>
				<span className={classes.packCode}>{definition.pack.id}</span>
				<CopyToClipboard text={definition.pack.id} onCopy={onCopy}>
					<Chip label={copied ? "Copied!" : "Copy Pack Code"} style={{marginLeft: "1rem"}}/>
				</CopyToClipboard>
			</CardContent>
			<CardActions>
				<Button onClick={setFavorite} startIcon={isFaved ? <MdFavorite/> : <MdFavoriteBorder/>} color={"secondary"} disabled={!props.authed}>
					{isFaved
						? "Unsave"
						: props.authed
							? `Save (${pack.favorites})`
							: "Log in to Save"}
				</Button>
				<Button
					component={p => <Link {...p} to={SiteRoutes.PackCreate.resolve({id: definition.pack.id})}/>}
					startIcon={props.canEdit && <MdEdit/>}
					endIcon={!props.canEdit && <FaArrowRight/>}
					color={"secondary"}
				>
					{props.canEdit ? "Edit" : "View Details"}
				</Button>
				{props.isAdmin && (
					<Button
						onClick={onDelete}
						color={"secondary"}
					>
						Delete
					</Button>
				)}
			</CardActions>
		</Card>
	);
};