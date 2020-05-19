import React, {useEffect, useState} from "react";
import {Avatar, Button, Card, CardActions, CardContent, CardHeader, createStyles, Divider, Grid, IconButton, Typography} from "@material-ui/core";
import {Pagination} from "@material-ui/lab";
import {Platform} from "../../Global/Platform/platform";
import {ClientGameItem} from "../../Global/Platform/Contract";
import {FaArrowAltCircleRight, FaPlus} from "react-icons/all";
import {useHistory} from "react-router";
import {ErrorDataStore} from "../../Global/DataStore/ErrorDataStore";
import {Link} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {SiteRoutes} from "../../Global/Routes/Routes";

const useStyles = makeStyles(theme => createStyles({
	cardContainer: {
		padding: "1rem 0",
		minHeight: "50vh"
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

const PacksBrowser = () =>
{
	const [currentPage, setCurrentPage] = useState(0);
	const [currentPageGames, setCurrentPageGames] = useState<ClientGameItem[]>([]);
	const [gameIdSearch, setGameIdSearch] = useState("");
	const history = useHistory();

	useEffect(() =>
	{
		updatePageGames(currentPage);
	}, []);

	const updatePageGames = (page: number) =>
	{
		Platform.getGames(page)
			.then(data =>
			{
				setCurrentPageGames(data.games);
			});
	};

	const handleChange = (event: React.ChangeEvent<unknown>, value: number) =>
	{
		setCurrentPage(value - 1);
		updatePageGames(value - 1);
	};

	const searchGame = () =>
	{
		Platform.getGame(gameIdSearch)
			.then(() => history.push(`/game/${gameIdSearch}`))
			.catch(ErrorDataStore.add);
	};

	const onEnter = (e: React.KeyboardEvent) =>
	{
		if (e.which === 13)
		{
			searchGame();
		}
	};

	const classes = useStyles();

	return (
		<div>
			<Typography variant={"h5"}>
				Want to create your own card pack?
			</Typography>
			<div style={{padding: "1rem 0"}}>
				<Button startIcon={<FaPlus/>} size={"large"} style={{fontSize: "1.25rem"}} color={"secondary"} variant={"contained"} component={p => <Link {...p} to={SiteRoutes.PackCreate.resolve()} />}>
					Create My Custom Pack
				</Button>
			</div>
			<div>

			</div>
			<Divider style={{margin: "2rem 0"}}/>
			<Typography variant={"h5"}>
				Custom Packs
			</Typography>
			<Typography variant={"subtitle2"}>
				To add a game to this list, turn on Settings&nbsp;&raquo;&nbsp;General&nbsp;&raquo;&nbsp;Make&nbsp;Public
			</Typography>
			<Pagination page={currentPage + 1} count={currentPageGames.length >= 8 ? currentPage + 8 : currentPage + 1} onChange={handleChange} style={{marginTop: "1rem"}}/>
			<Grid container spacing={2} className={classes.cardContainer}>
				{currentPageGames.map(game => (
					<Grid item xs={12} sm={6} md={4} lg={3}>
						<Card elevation={5}>
							<CardHeader
								title={<>{unescape(game.players[game.ownerGuid].nickname)}'s game</>}
								subheader={
									<>{Object.keys(game.players).length} / {game.settings.playerLimit} players</>
								}

							/>
							<Divider/>
							<CardContent>
								<Typography className={classes.cardListItem}>
									<Avatar className={classes.avatar}>
										<span className={classes.avatarText}>{game.settings.includedPacks.length + game.settings.includedCardcastPacks.length}</span>
									</Avatar> included packs
								</Typography>
								<Typography className={classes.cardListItem}>
									<Avatar className={classes.avatar}>
										<span className={classes.avatarText}>{game.settings.roundsToWin}</span>
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
						</Card>
					</Grid>
				))}
			</Grid>
			<Pagination page={currentPage + 1} count={currentPageGames.length >= 8 ? currentPage + 8 : currentPage + 1} onChange={handleChange}/>
		</div>
	);
};

export default PacksBrowser;