import React, {useEffect, useState} from "react";
import {Button, createStyles, Divider, FormControl, FormControlLabel, FormGroup, Grid, InputLabel, MenuItem, Select, Switch, TextField, Typography} from "@material-ui/core";
import {Pagination} from "@material-ui/lab";
import {Platform} from "../../Global/Platform/platform";
import {ClientGameItem, ICustomPackSearchResult, PackCategories} from "../../Global/Platform/Contract";
import {FaPlus} from "react-icons/all";
import {ErrorDataStore} from "../../Global/DataStore/ErrorDataStore";
import {Link} from "react-router-dom";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {SiteRoutes} from "../../Global/Routes/Routes";
import {PackSummary} from "./PackSummary";
import {ValuesOf} from "../../../../server/Engine/Games/Game/GameContract";
import {useDataStore} from "../../Global/Utils/HookUtils";
import {AuthDataStore} from "../../Global/DataStore/AuthDataStore";

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
	},
	searchForm: {
		flexDirection: "initial",
		alignItems: "center",
		marginTop: "2rem"
	}
}));

let searchTimer = 0;

const PacksBrowser = () =>
{
	const [currentPage, setCurrentPage] = useState(0);
	const [currentPageGames, setCurrentPageGames] = useState<ClientGameItem[]>([]);
	const [myPacks, setMyPacks] = useState<ICustomPackSearchResult | null>(null);
	const [searchedPacks, setSearchedPacks] = useState<ICustomPackSearchResult | null>(null);

	const [searchCategory, setSearchCategory] = useState<ValuesOf<typeof PackCategories> | undefined>(undefined);
	const [searchText, setSearchText] = useState("");
	const [searchNsfw, setSearchNsfw] = useState(true);
	const authData = useDataStore(AuthDataStore);

	useEffect(() =>
	{
		if (authData.authorized)
		{
			Platform.getMyPacks()
				.then(data =>
				{
					setMyPacks(data.result);
				})
				.catch(ErrorDataStore.add);
		}

		searchPacks(0);
	}, []);

	useEffect(() => {
		searchPacks(0);
	}, [searchText, searchNsfw, searchCategory]);

	const searchPacks = (page = 0) =>
	{
		window.clearTimeout(searchTimer);

		searchTimer = window.setTimeout(() =>
		{
			Platform.searchPacks({
				nsfw: searchNsfw,
				category: searchCategory ?? undefined,
				search: searchText
			}, page)
				.then(data =>
				{
					setSearchedPacks(data.result);
				})
				.catch(ErrorDataStore.add);
		}, 250);
	};

	const handleChange = (event: React.ChangeEvent<unknown>, value: number) =>
	{
		setCurrentPage(value - 1);
		searchPacks(value - 1);
	};

	const classes = useStyles();

	return (
		<div>
			<Typography variant={"h5"}>
				My Card Packs
			</Typography>
			<div style={{padding: "1rem 0"}}>
				<Button startIcon={<FaPlus/>} size={"large"} style={{fontSize: "1.25rem"}} color={"secondary"} variant={"contained"} component={p => <Link {...p} to={SiteRoutes.PackCreate.resolve()}/>}>
					Create My Custom Pack
				</Button>
			</div>
			<Grid container spacing={3}>
				{myPacks?.packs?.map(pack => (
					<Grid item xs={12} sm={6} md={4} lg={3}>
						<PackSummary hideExamples={true} canEdit={true} pack={pack} favorited={myPacks.userFavorites[pack.definition.pack.id]}/>
					</Grid>
				))}
			</Grid>
			<Divider style={{margin: "2rem 0"}}/>
			<Typography variant={"h5"}>
				Search Custom Packs
			</Typography>
			<Typography variant={"subtitle2"}>
				Favorite a pack to make it easier to add to new games!
			</Typography>
			<Grid item xs={12}>
				<FormControl component="fieldset">
					<FormGroup classes={{
						root: classes.searchForm
					}}>

						<FormControl style={{width: "15rem", marginRight: "1rem"}} variant="outlined">
							<TextField
								value={searchText}
								variant="outlined"
								placeholder={"Search"}
								onChange={e => setSearchText(e.target.value)}
								color={"secondary"}
							/>
						</FormControl>

						<FormControl style={{width: "15rem", marginRight: "1rem"}} variant="outlined">
							<InputLabel id="input-categories">Search Category</InputLabel>
							<Select
								labelId="input-categories"
								id="demo-simple-select-outlined"
								label="Category"
								value={searchCategory}
								MenuProps={{
									anchorOrigin: {
										vertical: "bottom",
										horizontal: "left"
									},
									getContentAnchorEl: null
								}}
								onChange={e => setSearchCategory(e.target.value as ValuesOf<typeof PackCategories>)}
							>
								<MenuItem key={undefined} value={undefined}>
									None
								</MenuItem>
								{PackCategories.map((cat) => (
									<MenuItem key={cat} value={cat}>
										{cat}
									</MenuItem>
								))}
							</Select>
						</FormControl>

						<FormControlLabel
							control={<Switch checked={searchNsfw} onChange={e => setSearchNsfw(e.target.checked)}/>}
							label="NSFW"
						/>
					</FormGroup>
				</FormControl>
			</Grid>
			<Pagination page={currentPage + 1} count={currentPageGames.length >= 8 ? currentPage + 8 : currentPage + 1} onChange={handleChange} style={{marginTop: "1rem"}}/>
			<Grid container spacing={2} className={classes.cardContainer}>
				{searchedPacks?.packs?.map(pack => (
					<Grid item xs={12} sm={6} md={4} lg={3}>
						<PackSummary canEdit={pack.owner === authData.userId} pack={pack} favorited={searchedPacks.userFavorites[pack.definition.pack.id]}/>
					</Grid>
				))}

				{(!searchedPacks?.packs?.length) ? (
					<Typography>No results.</Typography>
				) : undefined}
			</Grid>
			<Pagination page={currentPage + 1} count={currentPageGames.length >= 8 ? currentPage + 8 : currentPage + 1} onChange={handleChange}/>
		</div>
	);
};

export default PacksBrowser;