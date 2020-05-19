import React, {useEffect, useState} from "react";
import {Button, Divider, FormControl, FormControlLabel, FormGroup, Grid, Switch, TextField, Typography} from "@material-ui/core";
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

	if (!authState.authorized)
	{
		return (
			<Alert color={"error"}>
				<AlertTitle>Log In</AlertTitle>
				This page requires you to log in. You can log in at the top right corner.
			</Alert>
		);
	}

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

	return (
		<Grid container spacing={3}>
			<Grid item xs={12}>
				<TextField
					value={packCreatorData.packName}
					error={packCreatorData.packName.length < 3}
					helperText={packCreatorData.packName.length < 3 && "Give this pack a name"}
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
			</Grid>

			<Grid item xs={12}>
				<FormControl component="fieldset">
					<FormGroup>
						<FormControlLabel
							control={<Switch checked={packCreatorData.isNsfw} onChange={e => PackCreatorDataStore.setIsNsfw(e.target.checked)}/>}
							label="NSFW?"
						/>
						<FormControlLabel
							control={<Switch checked={packCreatorData.isPublic} onChange={e => PackCreatorDataStore.setIsPublic(e.target.checked)}/>}
							label="Make Public"
						/>
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
							onEdit={PackCreatorDataStore.editBlackCard}
							onRemove={PackCreatorDataStore.removeBlackCard}
							updateErrorState={PackCreatorDataStore.setBlackCardErrorState}
						/>
					))}
				</Grid>
				<Button variant={"contained"} color={"secondary"} onClick={PackCreatorDataStore.addBlackCard}>
					Add Card
				</Button>
				<Alert color={"info"} style={{marginTop: "1rem"}}>
					<Typography variant={"subtitle2"}>Use _ to represent a blank</Typography>
				</Alert>
			</Grid>

			<Grid item xs={12} md={12} lg={6} className={classes.section}>
				<Typography variant={"h5"}>White Cards ({packCreatorData.whiteCards?.length ?? 0})</Typography>
				<Divider className={classes.divider}/>
				<Grid container spacing={3} style={{marginBottom: "1rem"}}>
					{packCreatorData.whiteCards.map((value, index) => (
						<EditableWhite
							value={value}
							index={index}
							onEdit={PackCreatorDataStore.editWhiteCard}
							onRemove={PackCreatorDataStore.removeWhiteCard}
							updateErrorState={PackCreatorDataStore.setWhiteCardErrorState}
						/>
					))}
				</Grid>
				<Button variant={"contained"} color={"secondary"} onClick={PackCreatorDataStore.addWhiteCard}>
					Add Card
				</Button>
			</Grid>
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
		</Grid>
	);
};

interface IEditableCard
{
	index: number;
	value: string;
	onEdit: (index: number, value: string) => void;
	onRemove: (index: number) => void;
	updateErrorState: (index: number, hasError: boolean) => void;
}

const EditableBlack: React.FC<IEditableCard> = (props) =>
{
	const classes = useStyles();

	const [error, setError] = useState("");

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
			<BlackCard className={classes.shortCard} actions={<>
				<Button onClick={() => props.onRemove(props.index)} style={{color: "white"}}>Remove</Button>
			</>}>
				<TextField
					variant={"outlined"}
					value={props.value}
					color={"primary"}
					error={!!error}
					helperText={error}
					fullWidth
					multiline
					classes={{
						root: classes.blackCardTextField
					}}
					inputProps={{
						className: classes.blackInput
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
			<WhiteCard className={classes.shortCard} actions={<>
				<Button onClick={() => props.onRemove(props.index)} style={{color: "black"}}>Remove</Button>
			</>}>
				<TextField
					variant={"outlined"}
					value={props.value}
					fullWidth
					multiline
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