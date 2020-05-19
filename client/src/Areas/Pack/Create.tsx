import React, {useEffect, useState} from "react";
import {Button, Divider, FormControl, FormControlLabel, FormGroup, Grid, InputLabel, MenuItem, Select, Switch, TextField, Typography} from "@material-ui/core";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {BlackCard} from "../../UI/BlackCard";
import {Alert, AlertTitle} from "@material-ui/lab";
import {useDataStore} from "../../Global/Utils/HookUtils";
import {PackCreatorDataStore} from "../../Global/DataStore/PackCreatorDataStore";
import {WhiteCard} from "../../UI/WhiteCard";
import {AuthDataStore} from "../../Global/DataStore/AuthDataStore";
import {Confirmation} from "../../UI/Confirmation";
import {FaSave} from "react-icons/all";
import {useHistory, useParams} from "react-router";
import {SiteRoutes} from "../../Global/Routes/Routes";
import {PackCategories} from "../../Global/Platform/Contract";
import {ValuesOf} from "../../../../server/Engine/Games/Game/GameContract";

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

const Create = () =>
{
	const params = useParams<{ id?: string }>();
	const classes = useStyles();
	const authState = useDataStore(AuthDataStore);
	const packCreatorData = useDataStore(PackCreatorDataStore);
	const history = useHistory();

	useEffect(() =>
	{
		if (params.id)
		{
			PackCreatorDataStore.hydrate(params.id);
		}
		else
		{
			PackCreatorDataStore.reset();
		}
	}, []);

	const canEdit = authState.userId === packCreatorData.ownerId;

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

			<Grid item xs={12}>
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

			<Grid item xs={12} md={12} lg={6} className={classes.section}>
				<Typography variant={"h5"}>Black Cards ({packCreatorData.blackCards?.length ?? 0})</Typography>
				<Divider className={classes.divider}/>
				<Grid container spacing={3} style={{marginBottom: "1rem"}}>
					{packCreatorData.blackCards.map((value, index) => (
						<EditableBlack
							value={value}
							index={index}
							canEdit={canEdit}
							focus={index === packCreatorData.blackCards.length - 1}
							onEdit={PackCreatorDataStore.editBlackCard}
							onRemove={PackCreatorDataStore.removeBlackCard}
							updateErrorState={PackCreatorDataStore.setBlackCardErrorState}
						/>
					))}
				</Grid>
				{canEdit && (
					<>
						<Button variant={"contained"} color={"secondary"} onClick={PackCreatorDataStore.addBlackCard}>
							Add Card
						</Button>
						<Alert color={"info"} style={{marginTop: "1rem"}}>
							<Typography variant={"subtitle2"}>Use _ to represent a blank</Typography>
						</Alert>
					</>
				)}
			</Grid>

			<Grid item xs={12} md={12} lg={6} className={classes.section}>
				<Typography variant={"h5"}>White Cards ({packCreatorData.whiteCards?.length ?? 0})</Typography>
				<Divider className={classes.divider}/>
				<Grid container spacing={3} style={{marginBottom: "1rem"}}>
					{packCreatorData.whiteCards.map((value, index) => (
						<EditableWhite
							value={value}
							index={index}
							canEdit={canEdit}
							focus={index === packCreatorData.whiteCards.length - 1}
							onEdit={PackCreatorDataStore.editWhiteCard}
							onRemove={PackCreatorDataStore.removeWhiteCard}
							updateErrorState={PackCreatorDataStore.setWhiteCardErrorState}
						/>
					))}
				</Grid>
				{canEdit && (
					<Button variant={"contained"} color={"secondary"} onClick={PackCreatorDataStore.addWhiteCard}>
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

interface IEditableCard
{
	index: number;
	focus: boolean;
	value: string;
	canEdit: boolean;
	onEdit: (index: number, value: string) => void;
	onRemove: (index: number) => void;
	updateErrorState: (index: number, hasError: boolean) => void;
}

const EditableBlack: React.FC<IEditableCard> = (props) =>
{
	const classes = useStyles();

	const [error, setError] = useState("");
	const inputRef = React.useRef<HTMLInputElement>();

	useEffect(() =>
	{
		if (props.focus)
		{
			setTimeout(() =>
			{
				inputRef?.current?.focus();
			}, 200);
		}
	}, [])

	const updateError = (errorVal: string) =>
	{
		setError(errorVal);
		props.updateErrorState(props.index, !!errorVal);
	};

	const onEdit = (value: string) =>
	{
		props.onEdit(props.index, value);

		const underscores = value.match(/_/g) ?? [];
		if (underscores.length > 3)
		{
			updateError("You can use a maximum of 3 blanks");
		}
		else
		{
			updateError("");
		}
	};

	return (
		<Grid item sm={12} lg={6}>
			<BlackCard className={classes.shortCard} actions={props.canEdit && (
				<Button onClick={() => props.onRemove(props.index)} style={{color: "white"}}>Remove</Button>
			)}>
				<TextField
					variant={"outlined"}
					value={props.value}
					color={"primary"}
					error={!!error}
					helperText={error}
					disabled={!props.canEdit}
					fullWidth
					multiline
					inputRef={inputRef}
					classes={{
						root: classes.blackCardTextField
					}}
					inputProps={{
						className: classes.blackInput,
					}}
					onChange={e => onEdit(e.currentTarget.value)}
				/>
			</BlackCard>
		</Grid>
	)
};

const EditableWhite: React.FC<IEditableCard> = (props) =>
{
	const classes = useStyles();

	return (
		<Grid item sm={12} lg={6}>
			<WhiteCard className={classes.shortCard} actions={props.canEdit && (
				<Button onClick={() => props.onRemove(props.index)} style={{color: "black"}}>Remove</Button>
			)}>
				<TextField
					variant={"outlined"}
					value={props.value}
					fullWidth
					multiline
					disabled={!props.canEdit}
					classes={{
						root: classes.whiteCardTextField
					}}
					inputProps={{
						className: classes.whiteInput
					}}
					onChange={e => props.onEdit(props.index, e.currentTarget.value)}
				/>
			</WhiteCard>
		</Grid>
	)
};

export default Create;