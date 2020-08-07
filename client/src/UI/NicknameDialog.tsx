import * as React from "react";
import {useState} from "react";
import {DialogTitle, Typography} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import {useDataStore} from "@Global/Utils/HookUtils";
import {EnvDataStore} from "@Global/DataStore/EnvDataStore";

interface INicknameDialogProps
{
	open: boolean;
	onClose: () => void;
	onConfirm: (nickname: string) => void;
	title: React.ReactNode;
}

interface DefaultProps
{
}

type Props = INicknameDialogProps & DefaultProps;
type State = INicknameDialogState;

interface INicknameDialogState
{
	nickname: string;
}

export const NicknameDialog: React.FC<Props> = (props) =>
{
	const [nickname, setNickname] = useState("");
	const envData = useDataStore(EnvDataStore);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) =>
	{
		setNickname(e.currentTarget.value);
	};

	const onConfirm = () =>
	{
		if (nickname.trim().length > 0)
		{
			props.onConfirm(nickname);
			props.onClose();
		}
	};

	const onEnter = (e: React.KeyboardEvent) =>
	{
		if (e.which === 13)
		{
			onConfirm();
		}
	};

	const {
		onClose,
		open,
		title,
		children
	} = props;

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle id="form-dialog-title">{title}</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin="dense"
					id="name"
					label="Nickname"
					type="nickname"
					color={"secondary"}
					onChange={onChange}
					onKeyPress={onEnter}
					inputProps={{
						maxLength: 50
					}}
					fullWidth
				/>

				{!envData.site?.family && (
					<Typography style={{display: "block", paddingTop: "2rem"}} variant={"caption"}>
						Disclaimer: This game is meant for adults and includes content that is often considered insulting and rude.
						If you or a party member are sensitive to profanity and offensive language, consider trying the
						<a href={"https://notallbad.cards"}> Family-friendly edition!</a>
					</Typography>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onConfirm} color="secondary" variant={"contained"}>
					Confirm
				</Button>
			</DialogActions>
		</Dialog>
	);
}