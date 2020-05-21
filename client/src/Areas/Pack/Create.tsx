import React, {useEffect, useState} from "react";
import {Button, Divider, FormControl, FormControlLabel, FormGroup, Grid, InputLabel, MenuItem, Select, Switch, TextField, Typography, useMediaQuery} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {Alert, AlertTitle, Pagination} from "@material-ui/lab";
import {useDataStore} from "../../Global/Utils/HookUtils";
import {PackCreatorDataStore} from "../../Global/DataStore/PackCreatorDataStore";
import {AuthDataStore} from "../../Global/DataStore/AuthDataStore";
import {Confirmation} from "../../UI/Confirmation";
import {FaSave} from "react-icons/all";
import {useHistory, useParams} from "react-router";
import {SiteRoutes} from "../../Global/Routes/Routes";
import {PackCategories} from "../../Global/Platform/Contract";
import {ValuesOf} from "../../../../server/Engine/Games/Game/GameContract";
import {BrowserUtils} from "../../Global/Utils/BrowserUtils";
import {ContainerProgress} from "../../UI/ContainerProgress";
import {JsonUpload} from "./Create/JsonUpload";
import {EditableWhite} from "./Create/EditableWhite";
import {EditableBlack} from "./Create/EditableBlack";

const useStyles = makeStyles(theme => ({
	divider: {
		margin: "1rem 0"
	},
	blackInput: {
		color: theme.palette.secondary.contrastText
	},
	whiteInput: {
		color: theme.palette.primary.contrastText
	},
	section: {
		marginTop: "2rem"
	},
	blackCardTextField: {
		'& .MuiOutlinedInput-root': {
			'& fieldset': {
				borderColor: 'white',
			},
		},
	},
	whiteCardTextField: {
		'& .MuiOutlinedInput-root': {
			'& fieldset': {
				borderColor: 'black',
			},
		},
	},
	shortCard: {
		minHeight: "0",
		height: "100%"
	},
	confirmation: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "center"
	}
}));

const perPage = 10;

const getRenderedCards = <T extends any>(cards: T[], page: number) =>
{
	const cardCount = cards.length;
	const pageCount = Math.ceil(cardCount / perPage);
	const sliceStart = (page - 1) * perPage;

	return {
		cards: cards?.slice(sliceStart, sliceStart + perPage),
		pageCount: Math.max(pageCount, 1)
	};
};

const Create = () =>
{
	const params = useParams<{ id?: string }>();
	const classes = useStyles();
	const authState = useDataStore(AuthDataStore);
	const packCreatorData = useDataStore(PackCreatorDataStore);
	const history = useHistory();
	const [loading, setLoading] = useState(false);

	const [whitePage, setWhitePage] = useState(1);
	const [blackPage, setBlackPage] = useState(1);

	const mobile = useMediaQuery('(max-width:768px)');

	useEffect(() =>
	{
		if (params.id)
		{
			setLoading(true);
			PackCreatorDataStore.hydrate(params.id)
				.finally(() =>
				{
					setLoading(false);
					setTimeout(() =>
					{
						BrowserUtils.scrollToTop();
					}, 250);
				});
		}
		else
		{
			PackCreatorDataStore.reset();
		}
	}, []);

	const canEdit = !packCreatorData.ownerId || authState.userId === packCreatorData.ownerId;

	const save = () =>
	{
		PackCreatorDataStore.save()
			.then(pack =>
			{
				if (!params.id)
				{
					history.push(SiteRoutes.PackCreate.resolve({
						id: pack.definition.pack.id
					}));
				}
			});
	};

	const whiteCardPage = getRenderedCards(packCreatorData.whiteCards, whitePage);
	const blackCardPage = getRenderedCards(packCreatorData.blackCards, blackPage);

	const addBlackCard = () =>
	{
		PackCreatorDataStore.addBlackCard();
		setBlackPage(blackCardPage.pageCount);
	};

	const addWhiteCard = () =>
	{
		PackCreatorDataStore.addWhiteCard();
		setWhitePage(whiteCardPage.pageCount);
	};

	const validityMessage = PackCreatorDataStore.getValidity();

	if (!authState.authorized && !params.id)
	{
		return (
			<Alert color={"error"}>
				<AlertTitle>Log In</AlertTitle>
				This page requires you to log in. You can log in at the top right corner.
			</Alert>
		);
	}

	if (loading)
	{
		return <ContainerProgress/>;
	}

	return (
		<Grid container spacing={3}>
			<Grid item xs={12}>
				{canEdit ? (
					<TextField
						disabled={!canEdit}
						value={packCreatorData.packName}
						error={packCreatorData.packName.length < 3}
						helperText={packCreatorData.packName.length < 3 && "Name Required"}
						onChange={e => PackCreatorDataStore.setPackName(e.currentTarget.value)}
						variant={"outlined"}
						placeholder={"Pack Name"}
						InputProps={{
							color: "secondary"
						}}
						inputProps={{
							maxLength: 100
						}}
					/>
				) : (
					<Typography variant={"h2"}>{packCreatorData.packName}</Typography>
				)}
			</Grid>

			<Grid item md={9} xs={12}>
				<FormControl component="fieldset">
					<FormGroup>
						<FormControlLabel
							disabled={!canEdit}
							control={<Switch checked={packCreatorData.isNsfw} onChange={e => PackCreatorDataStore.setIsNsfw(e.target.checked)}/>}
							label="NSFW?"
						/>
						<FormControlLabel
							disabled={!canEdit}
							control={<Switch checked={packCreatorData.isPublic} onChange={e => PackCreatorDataStore.setIsPublic(e.target.checked)}/>}
							label="Make Public"
						/>

						<FormControl error={packCreatorData.categories.length === 0} style={{width: "20rem", marginTop: "1rem"}} variant="outlined" disabled={!canEdit}>
							<InputLabel id="input-categories">Select up to 3 categories</InputLabel>
							<Select
								labelId="input-categories"
								id="demo-simple-select-outlined"
								label="Select up to 3 categories"
								multiple
								value={packCreatorData.categories}
								MenuProps={{
									anchorOrigin: {
										vertical: "bottom",
										horizontal: "left"
									},
									getContentAnchorEl: null
								}}
								onChange={e => PackCreatorDataStore.setCategories(e.target.value as ValuesOf<typeof PackCategories>[])}
							>
								{PackCategories.map((cat) => (
									<MenuItem key={cat} value={cat}>
										{cat}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</FormGroup>
				</FormControl>
			</Grid>

			{canEdit && (
				<Grid item xs={12} md={3} style={{display: "flex", alignItems: "flex-end", justifyContent: mobile ? "flex-start" : "flex-end"}}>
					<JsonUpload/>
				</Grid>
			)}
			<Grid item xs={12} md={12} lg={6} className={classes.section}>
				<Typography variant={"h5"}>Questions ({packCreatorData.blackCards?.length ?? 0})</Typography>
				<Divider className={classes.divider}/>
				<Grid container spacing={3} style={{marginBottom: "1rem"}}>
					<Grid item xs={12}>
						<Pagination count={blackCardPage.pageCount} page={blackPage} onChange={(_, page) => setBlackPage(page)}/>
					</Grid>

					{blackCardPage.cards.map((value, index) => (
						<EditableBlack
							key={index}
							value={value}
							index={index + ((blackPage - 1) * perPage)}
							canEdit={canEdit}
							focus={index === blackCardPage.cards.length - 1}
							onEdit={PackCreatorDataStore.editBlackCard}
							onRemove={PackCreatorDataStore.removeBlackCard}
							updateErrorState={PackCreatorDataStore.setBlackCardErrorState}
						/>
					))}

					<Grid item xs={12}>
						<Pagination count={blackCardPage.pageCount} page={blackPage} onChange={(_, page) => setBlackPage(page)}/>
					</Grid>

				</Grid>
				{canEdit && (
					<>
						<Button variant={"contained"} color={"secondary"} onClick={addBlackCard}>
							Add Card
						</Button>
						<Alert color={"info"} style={{marginTop: "1rem"}}>
							<Typography variant={"subtitle2"}>Use _ to represent a blank</Typography>
						</Alert>
					</>
				)}
			</Grid>

			<Grid item xs={12} md={12} lg={6} className={classes.section}>
				<Typography variant={"h5"}>Answers ({packCreatorData.whiteCards?.length ?? 0})</Typography>
				<Divider className={classes.divider}/>
				<Grid container spacing={3} style={{marginBottom: "1rem"}}>
					<Grid item xs={12}>
						<Pagination count={whiteCardPage.pageCount} page={whitePage} onChange={(_, page) => setWhitePage(page)}/>
					</Grid>

					{whiteCardPage.cards.map((value, index) => (
						<EditableWhite
							key={index}
							value={value}
							index={index + ((whitePage - 1) * perPage)}
							canEdit={canEdit}
							focus={index === whiteCardPage.cards.length - 1}
							onEdit={PackCreatorDataStore.editWhiteCard}
							onRemove={PackCreatorDataStore.removeWhiteCard}
							updateErrorState={PackCreatorDataStore.setWhiteCardErrorState}
						/>
					))}

					<Grid item xs={12}>
						<Pagination count={whiteCardPage.pageCount} page={whitePage} onChange={(_, page) => setWhitePage(page)}/>
					</Grid>
				</Grid>
				{canEdit && (
					<Button variant={"contained"} color={"secondary"} onClick={addWhiteCard}>
						Add Card
					</Button>
				)}
			</Grid>

			{canEdit && (
				<Confirmation>
					<div className={classes.confirmation}>
						{validityMessage ? (
							<Alert color={"error"}>
								<AlertTitle>Cannot Save</AlertTitle>
								{validityMessage}
							</Alert>
						) : (
							<Button
								size={"large"}
								color={"secondary"}
								variant={"contained"}
								startIcon={<FaSave/>}
								disabled={!!validityMessage || !packCreatorData.isEdited}
								onClick={save}
							>
								Save
							</Button>
						)}
					</div>
				</Confirmation>
			)}
		</Grid>
	);
};





export default Create;