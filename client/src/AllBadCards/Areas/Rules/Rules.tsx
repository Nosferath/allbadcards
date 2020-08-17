import React from "react";
import {Container, Typography} from "@material-ui/core";
import {Link} from "react-router-dom";

const Rules = () =>
{
	return (
		<Container>
			<Typography variant={"h3"} component={"h1"}>How to Play: All Bad Cards</Typography>
			<hr style={{margin: "2rem 0"}}/>
			<Typography variant={"h6"}>
				<ol>
					<li>
						Each player receives 10 response cards.
					</li>
					<li>
						Each round starts with one prompt card, and one Card Queen.
					</li>
					<li>
						Choose a response card (or cards) from your hand that makes the funniest sentence by clicking the "Pick" button.
					</li>
					<li>
						Once you have decided which cards to play, click the "Play" button.
					</li>
					<li>
						After everyone plays their cards, the Card Queen chooses their favorite response.
					</li>
					<li>
						The player whose cards are chosen the most wins.
					</li>
				</ol>
			</Typography>
			<Typography style={{marginTop: "3rem"}} variant={"h3"}>What are AI players?</Typography>
			<hr style={{margin: "2rem 0"}}/>
			<Typography variant={"h6"}>
				AI players are computer players that will play random cards. Sometimes it seems like they are alive, or funnier than you.
				<br/><br/>
				They are not alive.
			</Typography>
			<Typography style={{marginTop: "3rem"}} variant={"h3"}>Can I choose which cards are playable?</Typography>
			<hr style={{margin: "2rem 0"}}/>
			<Typography variant={"h6"}>
				Yes. The game owner can add or remove card packs from the default set in the game settings. The game owner can also add custom packs from our <Link to={"/packs"}>Packs</Link> page, or create their own.
			</Typography>
		</Container>
	);
};

export default Rules;