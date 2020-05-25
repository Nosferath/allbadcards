import React, {createRef, useState} from "react";
import {Button, DialogContent, IconButton, Link} from "@material-ui/core";
import {FaRegQuestionCircle, FaUpload} from "react-icons/all";
import {CloseableDialog} from "../../../UI/CloseableDialog";
import {ErrorDataStore} from "../../../Global/DataStore/ErrorDataStore";
import {AbcPackSchema, validatePackInput} from "./schema";
import {PackCreatorDataStore} from "../../../Global/DataStore/PackCreatorDataStore";
import {ICardPackDefinition} from "../../../Global/Platform/Contract";
import {BrowserUtils} from "../../../Global/Utils/BrowserUtils";
import {selectElementText} from "../../../Global/Utils/DomUtils";

export const JsonUpload: React.FC = () =>
{
	const [helpOpen, setHelpOpen] = useState(false);
	const [disclaimerOpen, setDisclaimerOpen] = useState(false);
	const [schemaOpen, setSchemaOpen] = useState(false);
	const inputRef = createRef<HTMLInputElement>();
	const preRef = createRef<HTMLPreElement>();

	const uploadClick = () =>
	{
		inputRef.current?.click();
	};

	const clearInput = () =>
	{
		if (inputRef.current)
		{
			inputRef.current.value = "";
		}
	};

	const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) =>
	{
		const file = e.target.files?.[0];
		if (file)
		{
			const p = new Promise<string | ArrayBuffer>((resolve, reject) =>
			{
				try
				{
					const reader = new FileReader();
					reader.addEventListener("load", e =>
					{
						const result = e.target?.result;
						if (result)
						{
							resolve(result);
						}
					});
					reader.readAsText(file);
				}
				catch (e)
				{
					reject(e);
				}
			});

			p.then(validate)
				.catch(ErrorDataStore.add);

			setDisclaimerOpen(false);
		}
	};

	const validate = (result: string | ArrayBuffer) =>
	{
		const stringResult = result.toString();
		let obj: any;
		try
		{
			obj = JSON.parse(stringResult);
		}
		catch (e)
		{
			ErrorDataStore.add(new Error("This file isn't valid JSON."));
			clearInput();
			return;
		}

		try
		{
			const validateResult = validatePackInput(obj);
			if (validateResult.valid)
			{
				const pack = obj as ICardPackDefinition;
				PackCreatorDataStore.hydrateFromData(pack);

				setTimeout(BrowserUtils.scrollToTop, 250);
			}
			else
			{
				validateResult.errors.forEach(e =>
				{
					ErrorDataStore.add(new Error(e.stack))
				});
			}
		}
		catch (e)
		{
			ErrorDataStore.add(e);
		}

		clearInput();
	};

	return (
		<div>
			<Button startIcon={<FaUpload/>} variant={"outlined"} onClick={() => setDisclaimerOpen(true)}>
				Add from JSON
			</Button>
			<IconButton onClick={() => setHelpOpen(true)}>
				<FaRegQuestionCircle/>
			</IconButton>
			<CloseableDialog open={helpOpen} onClose={() => setHelpOpen(false)} TitleProps={{children: "What is 'Add from JSON'?"}}>
				<DialogContent>
					Instead of using the All Bad Cards tools to create a card pack, you can also do it manually using text files.
				</DialogContent>
			</CloseableDialog>
			<CloseableDialog open={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} TitleProps={{children: "Disclaimer"}}>
				<DialogContent dividers>
					Loading a pack will <strong>add to any previous cards already present in this pack</strong>. If you do it more than once, you will end up with duplicate cards.
					<br/>
					<br/>
					<input
						accept="application/json"
						hidden
						id="raised-button-file"
						type="file"
						ref={inputRef}
						onChange={onFileSelected}
					/>

					<Link component="button" onClick={() => setSchemaOpen(true)} color={"secondary"}>
						View JSON Schema
					</Link>

					<br/>
					<br/>

					<label htmlFor="raised-button-file">
						<Button startIcon={<FaUpload/>} variant={"contained"} onClick={uploadClick} style={{marginBottom: "1rem"}} color={"secondary"}>
							I understand! Let's do it.
						</Button>
					</label>
				</DialogContent>
			</CloseableDialog>
			<CloseableDialog open={schemaOpen} onClose={() => setSchemaOpen(false)} TitleProps={{children: "Card Pack JSON Schema"}} maxWidth={"lg"}>
				<DialogContent dividers>
					<pre onClick={() => selectElementText(preRef.current)} ref={preRef}>
						{JSON.stringify(AbcPackSchema, null, 2)}
					</pre>
				</DialogContent>
			</CloseableDialog>
		</div>
	);
};