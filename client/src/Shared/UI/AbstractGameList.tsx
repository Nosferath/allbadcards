import React, {useEffect, useState} from "react";
import {Card, createStyles, Divider, Grid, TextField, Typography} from "@material-ui/core";
import {Pagination} from "@material-ui/lab";
import {FaArrowAltCircleRight} from "react-icons/all";
import {useHistory} from "react-router";
import {ErrorDataStore} from "@AbcGlobal/DataStore/ErrorDataStore";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {JoinNewButtons} from "@AbcUI/JoinNewButtons";
import Helmet from "react-helmet";
import {AdResponsiveCard} from "@UI/Ads/sharedAds";

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

interface IAbstractGameListProps<TGameSummaryData>
{
	getGamesForPage: (page: number) => Promise<{ games: TGameSummaryData[] }>;
	findGameById: (id: string) => Promise<any>;
	renderGameSummary: (data: TGameSummaryData) => React.ReactNode;
}

export const AbstractGameList = <TGameSummaryData extends any>(props: IAbstractGameListProps<TGameSummaryData>) =>
{
	const [currentPage, setCurrentPage] = useState(0);
	const [currentPageGames, setCurrentPageGames] = useState<TGameSummaryData[]>([]);
	const [gameIdSearch, setGameIdSearch] = useState("");
	const history = useHistory();

	useEffect(() =>
	{
		updatePageGames(currentPage);
	}, []);

	const updatePageGames = (page: number) =>
	{
		props.getGamesForPage(page)
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
		props.findGameById(gameIdSearch)
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
			<Helmet>
				<title>Public Games</title>
			</Helmet>
			<Grid container>
				<Grid item xl={12}>
					<Typography variant={"h5"}>
						Know the name of your game?
					</Typography>
					<Typography variant={"subtitle2"}>
						Enter it below
					</Typography>
					<TextField
						id="standard-adornment-weight"
						placeholder={"Game (e.g. annoying-horse-43)"}
						value={gameIdSearch}
						onKeyDown={onEnter}
						onChange={(e) => setGameIdSearch(e.target.value)}
						InputProps={{
							endAdornment: <FaArrowAltCircleRight onClick={searchGame} style={{
								cursor: "pointer",
								fontSize: "1.5rem"
							}}/>
						}}
						variant={"outlined"}
						style={{minWidth: "20rem", margin: "1rem 0"}}
						aria-describedby="standard-weight-helper-text"
						inputProps={{
							'aria-label': 'game ID',
						}}
					/>
					<Typography variant={"h5"} style={{marginBottom: "1rem"}}>
						- or -
					</Typography>
					<JoinNewButtons hideJoin={true} fontSize={"1rem"}/>
				</Grid>
			</Grid>
			<Divider style={{margin: "2rem 0"}}/>
			<Typography variant={"h5"}>
				Public Games
			</Typography>
			<Typography variant={"subtitle2"}>
				To add a game to this list, turn on Settings&nbsp;&raquo;&nbsp;General&nbsp;&raquo;&nbsp;Make&nbsp;Public
			</Typography>
			<Pagination page={currentPage + 1} count={currentPageGames.length >= 8 ? currentPage + 2 : currentPage + 1} onChange={handleChange} style={{marginTop: "1rem"}}/>
			<Grid container spacing={2} className={classes.cardContainer}>
				{currentPageGames.map((game, i) => (
					<>
						<Grid item xs={12} sm={6} md={4} lg={3}>
							<Card elevation={5}>
								{props.renderGameSummary(game)}
							</Card>
						</Grid>
						{i % 3 === 2 && i > 1 && (
							<AdResponsiveCard />
						)}
					</>
				))}
			</Grid>
			<Typography variant={"subtitle2"} style={{opacity: 0.75, marginBottom: "1rem"}}>
				<em>Games idle for 15 minutes will not appear in this list</em>
			</Typography>
			<Pagination page={currentPage + 1} count={currentPageGames.length >= 8 ? currentPage + 2 : currentPage + 1} onChange={handleChange}/>
		</div>
	);
};