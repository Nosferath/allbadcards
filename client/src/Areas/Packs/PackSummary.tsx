import {ICustomCardPack} from "../../Global/Platform/Contract";
import React, {useState} from "react";
import {Button, Card, CardActions, CardContent, CardHeader, Divider} from "@material-ui/core";
import {Link} from "react-router-dom";
import {SiteRoutes} from "../../Global/Routes/Routes";
import {FaArrowRight, MdEdit, MdFavorite, MdFavoriteBorder} from "react-icons/all";
import makeStyles from "@material-ui/core/styles/makeStyles";
import classNames from "classnames";
import {Platform} from "../../Global/Platform/platform";
import {ErrorDataStore} from "../../Global/DataStore/ErrorDataStore";

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
		background: "#000",
		color: "#FFF",
		padding: "0.25rem",
		borderRadius: 3,
		marginBottom: 1,
		overflow: "hidden",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis"
	},
	whiteItem: {
		marginBottom: 1,
		background: "#FFF",
		color: "#000",
		border: "1px solid #000",
		padding: "0.25rem",
		borderRadius: 3,
		overflow: "hidden",
		whiteSpace: "nowrap",
		textOverflow: "ellipsis"
	}
}));

export const PackSummary: React.FC<IPackSummaryProps> = (props) =>
{
	const classes = useStyles();

	const [isFaved, setIsFaved] = useState(props.favorited);

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

	return (
		<Card elevation={5}>
			<CardHeader
				title={definition.pack.name}
				subheader={<span>
					Q:<strong>{definition.quantity.black}</strong> A:<strong>{definition.quantity.white}</strong>
				</span>}
			/>
			<CardContent>
				{!props.hideExamples && (
					<div className={classes.cardListWrap}>
						<div className={classNames(classes.cardList, classes.blackCardList)}>
							{definition.black.slice(0, 3).map(bc => (
								<div className={classes.blackItem}>{bc.content}</div>
							))}
						</div>
						<div className={classNames(classes.cardList, classes.whiteCardList)}>
							{definition.white.slice(0, 3).map(wc => (
								<div className={classes.whiteItem}>{wc}</div>
							))}
						</div>
					</div>
				)}
				<small style={{display: "block", opacity: 0.5, marginTop: 5}}>ID: {definition.pack.id}</small>
			</CardContent>
			<Divider style={{margin: "0.5rem 0"}}/>
			<CardActions>
				<Button onClick={setFavorite} startIcon={isFaved ? <MdFavorite/> : <MdFavoriteBorder/>}>
					{isFaved ? "Unfavorite" : "Favorite"}
				</Button>
				<Button
					component={p => <Link {...p} to={SiteRoutes.PackCreate.resolve({id: definition.pack.id})}/>}
					startIcon={props.canEdit && <MdEdit/>}
					endIcon={!props.canEdit && <FaArrowRight/>}
				>
					{props.canEdit ? "Edit" : "View Details"}
				</Button>
			</CardActions>
		</Card>
	);
};