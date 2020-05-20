import {ICustomCardPack} from "../../Global/Platform/Contract";
import React, {useState} from "react";
import {Button, Card, CardActions, CardHeader, CardMedia} from "@material-ui/core";
import {Link} from "react-router-dom";
import {SiteRoutes} from "../../Global/Routes/Routes";
import {FaArrowRight, MdEdit, MdFavorite, MdFavoriteBorder} from "react-icons/all";
import makeStyles from "@material-ui/core/styles/makeStyles";
import classNames from "classnames";
import {Platform} from "../../Global/Platform/platform";
import {ErrorDataStore} from "../../Global/DataStore/ErrorDataStore";
import {colors} from "../../colors";
import shuffle from "shuffle-array";

interface IPackSummaryProps
{
	pack: ICustomCardPack;
	hideExamples?: boolean;
	favorited: boolean;
	canEdit: boolean;
}

const useStyles = makeStyles(theme => ({
	cardListWrap: {
		position: "relative",
		minHeight: "10rem"
	},
	cardList: {
		fontSize: "0.75rem"
	},
	blackCardList: {},
	whiteCardList: {},
	blackItem: {
		background: colors.dark.dark,
		color: colors.dark.contrastText,
		borderBottom: "1px solid rgba(245,245,245,0.2)",
		padding: "0.25rem",
		overflow: "hidden",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis"
	},
	whiteItem: {
		background: colors.light.light,
		color: colors.light.contrastText,
		borderBottom: "1px solid rgba(0,0,0,0.2)",
		padding: "0.25rem",
		overflow: "hidden",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis"
	}
}));

export const PackSummary: React.FC<IPackSummaryProps> = (props) =>
{
	const classes = useStyles();

	const [isFaved, setIsFaved] = useState(props.favorited);
	const [shuffledBlack, setShuffledBlack] = useState([...props.pack.definition.black]);
	const [shuffledWhite, setShuffledWhite] = useState([...props.pack.definition.white]);

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

	const onClick = () => {
		const newBlackShuffle = shuffle([...definition.black]);
		const newWhiteShuffle = shuffle([...definition.white]);
		setShuffledBlack(newBlackShuffle);
		setShuffledWhite(newWhiteShuffle);
	};

	return (
		<Card elevation={5}>
			<CardMedia onClick={onClick}>
				{!props.hideExamples && (
					<div className={classes.cardListWrap}>
						<div className={classNames(classes.cardList, classes.blackCardList)}>
							{shuffledBlack.slice(0, 3).map(bc => (
								<div className={classes.blackItem}>{bc.content}</div>
							))}
						</div>
						<div className={classNames(classes.cardList, classes.whiteCardList)}>
							{shuffledWhite.slice(0, 3).map(wc => (
								<div className={classes.whiteItem}>{wc}</div>
							))}
						</div>
					</div>
				)}
			</CardMedia>
			<CardHeader
				title={definition.pack.name}
				subheader={<span>
					Q:<strong>{definition.quantity.black}</strong> A:<strong>{definition.quantity.white}</strong>
				</span>}
			/>
			<CardActions>
				<Button onClick={setFavorite} startIcon={isFaved ? <MdFavorite/> : <MdFavoriteBorder/>} color={"secondary"}>
					{isFaved ? "Unfavorite" : "Favorite"}
				</Button>
				<Button
					component={p => <Link {...p} to={SiteRoutes.PackCreate.resolve({id: definition.pack.id})}/>}
					startIcon={props.canEdit && <MdEdit/>}
					endIcon={!props.canEdit && <FaArrowRight/>}
					color={"secondary"}
				>
					{props.canEdit ? "Edit" : "View Details"}
				</Button>
			</CardActions>
		</Card>
	);
};