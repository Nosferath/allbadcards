import * as React from "react";
import Grid from "@material-ui/core/Grid";
import {WhiteCard} from "../../../UI/WhiteCard";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import {GameDataStore, IGameDataStorePayload} from "../../../Global/DataStore/GameDataStore";
import {IUserData, UserDataStore} from "../../../Global/DataStore/UserDataStore";
import sanitize from "sanitize-html";
import {LoadingButton} from "../../../UI/LoadingButton";
import {Typography} from "@material-ui/core";
import {CardId} from "../../../Global/Platform/Contract";

interface IRevealWhitesProps
{
	canReveal: boolean;
}

interface DefaultProps
{
}

type Props = IRevealWhitesProps & DefaultProps;
type State = IRevealWhitesState;

interface IRevealWhitesState
{
	gameData: IGameDataStorePayload;
	userData: IUserData;
	revealLoading: boolean;
}

export class RevealWhites extends React.Component <Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			gameData: GameDataStore.state,
			userData: UserDataStore.state,
			revealLoading: false
		};
	}

	public componentDidMount(): void
	{
		GameDataStore.listen(data => this.setState({
			gameData: data
		}));

		UserDataStore.listen(data => this.setState({
			userData: data
		}));
	}

	private onReveal = () =>
	{
		this.setState({
			revealLoading: true
		});

		GameDataStore.revealNext(this.state.userData.playerGuid)
			.finally(() => this.setState({
				revealLoading: false
			}));
	};

	public render()
	{
		const {
			gameData,
			revealLoading
		} = this.state;

		if (!gameData.game)
		{
			return null;
		}

		const game = gameData.game;
		const {
			settings,
			roundCardsCustom,
			roundCards,
			revealIndex,
			playerOrder: ogPlayerOrder,
			chooserGuid,
			players
		} = game;
		
		const cardBucket = settings.customWhites ? roundCardsCustom : roundCards;
		const playerOrder = ogPlayerOrder ?? Object.keys(players);
		const roundPlayerOrder = playerOrder.filter(a => a !== chooserGuid);
		const roundCardKeys = Object.keys(cardBucket ?? {});
		const roundPlayers = Object.keys(cardBucket ?? {});
		const remainingPlayerGuids = Object.keys(players ?? {})
			.filter(pg => !(pg in (cardBucket ?? {})) && pg !== chooserGuid);
		const remainingPlayers = remainingPlayerGuids.map(pg => unescape(players?.[pg]?.nickname));
		const realRevealIndex = revealIndex ?? -1;
		const revealedIndex = realRevealIndex % roundPlayers.length;
		const playerGuidAtIndex = roundPlayerOrder[isNaN(revealedIndex) ? 0 : revealedIndex];
		const cardsIdsRevealed = cardBucket?.[playerGuidAtIndex] ?? [];
		const cardsRevealed = settings.customWhites
			? cardsIdsRevealed as string[]
			: (cardsIdsRevealed as CardId[]).map(cid => gameData.roundCardDefs?.[cid.packId]?.[cid.cardIndex]);
		const timeToPick = remainingPlayers.length === 0;
		const revealMode = timeToPick && realRevealIndex < roundCardKeys.length;

		if (!revealMode)
		{
			return null;
		}

		const totalCardLength = roundCardKeys.length;
		const lastCard = realRevealIndex === totalCardLength - 1;
		const label = lastCard ? "See All Cards" : "Next";
		const canSeeReveal = this.props.canReveal || !game.settings.hideDuringReveal;

		return (
			<Grid item xs={12} sm={6} md={4} lg={3}>
				{(realRevealIndex >= 0 && canSeeReveal) && (
					<>
						<WhiteCard key={revealedIndex} style={{marginBottom: "0.5rem"}}>
							{cardsRevealed.map(card => card && (
								<>
									<div dangerouslySetInnerHTML={{__html: sanitize(unescape(card))}}/>
									<Divider style={{margin: "1rem 0"}}/>
								</>
							))}
							{this.props.canReveal && (
								<LoadingButton loading={revealLoading} color={"secondary"} variant={"contained"} onClick={this.onReveal}>
									{label}
								</LoadingButton>
							)}
						</WhiteCard>
					</>
				)}
				{realRevealIndex > -1 && (
					<Typography>Revealed: {realRevealIndex + 1} / {totalCardLength}</Typography>
				)}
				{realRevealIndex === -1 && this.props.canReveal && (
					<LoadingButton loading={revealLoading} color={"secondary"} variant={"contained"} onClick={this.onReveal}>
						Show me the cards!
					</LoadingButton>
				)}
			</Grid>
		);
	}
}