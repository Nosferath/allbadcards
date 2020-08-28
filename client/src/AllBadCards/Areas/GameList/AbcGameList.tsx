import React from "react";
import {Avatar, CardActions, CardContent, CardHeader, createStyles, Divider, IconButton, Typography} from "@material-ui/core";
import {AbcPlatform} from "@AbcGlobal/Platform/abcPlatform";
import {FaArrowAltCircleRight} from "react-icons/all";
import {Link} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {getTrueRoundsToWin} from "@AbcGlobal/Utils/GameUtils";
import {AbstractGameList} from "@UI/AbstractGameList";

const useStyles = makeStyles(theme => createStyles({
	cardContainer: {
		padding: "1rem 0"
	},
	avatar: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "2rem",
		height: "2rem",
		marginRight: "0.5rem",
		background: theme.palette.secondary.main
	},
	avatarText: {
		color: theme.palette.secondary.contrastText,
		fontSize: "0.75rem"
	},
	cardListItem: {
		display: "flex",
		padding: "0.5rem 0",
		alignItems: "center"
	},
	actions: {
		justifyContent: "flex-end"
	}
}));

const AbcGameList = () =>
{
	const classes = useStyles();

	return <AbstractGameList
		findGameById={AbcPlatform.getGame}
		getGamesForPage={AbcPlatform.getGames}
		renderGameSummary={game => (
			<>
				<CardHeader
					title={<>{unescape(game.players?.[game.ownerGuid]?.nickname)}'s game</>}
					subheader={
						<>{Object.keys(game.players).length} / {game.settings.playerLimit} players</>
					}

				/>
				<Divider/>
				<CardContent>
					<Typography className={classes.cardListItem}>
						<Avatar className={classes.avatar}>
							<span className={classes.avatarText}>{game.settings.includedPacks.length + game.settings.includedCustomPackIds.length}</span>
						</Avatar> included packs
					</Typography>
					<Typography className={classes.cardListItem}>
						<Avatar className={classes.avatar}>
							<span className={classes.avatarText}>{getTrueRoundsToWin(game)}</span>
						</Avatar> rounds to win
					</Typography>
					<Typography className={classes.cardListItem}>
						{game.started && <>In Progress</>}
						{!game.started && <>Not Started</>}
					</Typography>
				</CardContent>
				<Divider/>
				<CardActions className={classes.actions}>
					<Typography variant={"caption"} style={{opacity: 0.75, flex: 1}}>
						<em>{game.id}</em>
					</Typography>
					<IconButton color={"secondary"} component={p => <Link {...p} to={`/game/${game.id}`}/>}>
						<FaArrowAltCircleRight/>
					</IconButton>
				</CardActions>
			</>
		)}
	/>;
};

export default AbcGameList;