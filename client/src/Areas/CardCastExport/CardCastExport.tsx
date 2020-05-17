import React, {useState} from "react";
import {Container, Dialog, DialogContent, Grid, TextField} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {Platform} from "../../Global/Platform/platform";
import {ICardPackDefinition} from "../../Global/Platform/Contract";

const exportToJson = (objectData: any) =>
{
	let filename = "export.json";
	let contentType = "application/json;charset=utf-8;";
	if (window.navigator && window.navigator.msSaveOrOpenBlob)
	{
		var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(objectData, null, 2)))], {type: contentType});
		navigator.msSaveOrOpenBlob(blob, filename);
	}
	else
	{
		var a = document.createElement('a');
		a.download = filename;
		a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(objectData, null, 2));
		a.target = '_blank';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
};

const CardCastExport = () =>
{
	const [showDialog, setShowDialog] = useState(false);
	const [cardCastDeckCode, setCardCastDeckCode] = useState("");
	const [foundCodeData, setFoundCodeData] = useState<ICardPackDefinition | null>(null);

	const onFindCardCastDeck = () =>
	{
		Platform.getCardCastPackCached(cardCastDeckCode)
			.then(data =>
			{
				setFoundCodeData(data);
				setShowDialog(true);
			})
			.catch(e => alert("We could not find your card pack. Sorry!"));
	};

	return (
		<Container>
			<Grid container>
				<Grid item xs={12}>
					CardCast recently shut down. Fortunately, we have some decks cached in our data. If you (or anyone) ever played All Bad Cards with your deck, we may have a copy.
					<br/><br/>
					Try entering your 5-letter CardCast code below to see if we have it.
					<br/><br/>
					<TextField color={"secondary"} value={cardCastDeckCode} style={{margin: "0 1rem 1rem 0"}} size={"small"} onChange={e => setCardCastDeckCode(e.target.value)} id="outlined-basic" label="CardCast Deck Code" variant="outlined"/>
					<Button variant={"contained"} color={"secondary"} onClick={onFindCardCastDeck} disabled={cardCastDeckCode.length !== 5 && !cardCastDeckCode.includes(",")}>
						Find Deck
					</Button>
				</Grid>
			</Grid>
			<Dialog open={showDialog} onClose={() => setShowDialog(false)}>
				<DialogContent>
					We found your data!
					<br/>
					<br/>
					<Button variant={"contained"} onClick={() => exportToJson(foundCodeData)}>
						Download as JSON
					</Button>
				</DialogContent>
			</Dialog>
		</Container>
	)
};

export default CardCastExport;