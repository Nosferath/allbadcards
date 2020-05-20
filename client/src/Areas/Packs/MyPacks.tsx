import React, {useEffect, useState} from "react";
import {Button, createStyles, Grid, Typography} from "@material-ui/core";
import {Platform} from "../../Global/Platform/platform";
import {ICustomPackSearchResult, PackCategories} from "../../Global/Platform/Contract";
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

const MyPacks = () =>
{
	const [currentPage, setCurrentPage] = useState(0);
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

	const packCount = searchedPacks?.packs?.length ?? 0;

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
		</div>
	);
};

export default MyPacks;