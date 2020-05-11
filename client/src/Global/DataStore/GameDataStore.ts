import {DataStore} from "./DataStore";
import {GamePayload, IWhiteCard, Platform} from "../Platform/platform";
import {UserDataStore} from "./UserDataStore";
import deepEqual from "deep-equal";
import {ArrayFlatten} from "../Utils/ArrayUtils";
import {CardCastApi, IDeck} from "isomorphic-cardcast-api";
import {CardId, ChatPayload, ClientGameItem, IBlackCardDefinition, ICardPackSummary, IGameSettings} from "../Platform/Contract";
import {ErrorDataStore} from "./ErrorDataStore";
import {BrowserUtils} from "../Utils/BrowserUtils";
import {AudioUtils} from "../Utils/AudioUtils";
import {gamesOwnedLsKey} from "../../Areas/GameDashboard/GameDashboard";
import moment from "moment";

export type WhiteCardMap = {
	[packId: string]: {
		[cardIndex: number]: IWhiteCard
	}
};

export interface IGameDataStorePayload
{
	/**
	 * This is used just to SET settings. Reading settings should be done using the `game` property
	 */
	ownerSettings: IGameSettings,
	hasConnection: boolean;
	loaded: boolean;
	familyMode: boolean;
	game: GamePayload | null;
	chat: ChatPayload[];
	loadedPacks: ICardPackSummary[];
	roundStartTime: moment.Moment;
	cardcastPackDefs: { [key: string]: IDeck };
	cardcastPacksLoading: boolean;
	roundCardDefs: WhiteCardMap;
	playerCardDefs: WhiteCardMap;
	blackCardDef: IBlackCardDefinition | null;
	lostConnection: boolean;
}

let manualClose = false;
let connectionOpen = false;

class _GameDataStore extends DataStore<IGameDataStorePayload>
{
	private static InitialState: IGameDataStorePayload = {
		loaded: false,
		hasConnection: false,
		familyMode: location.hostname.startsWith("not."),
		game: null,
		chat: [],
		loadedPacks: [],
		roundCardDefs: {},
		playerCardDefs: {},
		cardcastPackDefs: {},
		cardcastPacksLoading: false,
		blackCardDef: null,
		roundStartTime: moment(),
		ownerSettings: {
			skipReveal: false,
			hideDuringReveal: false,
			includedCardcastPacks: [],
			includedPacks: [],
			inviteLink: null,
			playerLimit: 50,
			customWhites: false,
			public: false,
			roundsToWin: 7,
			winnerBecomesCzar: false,
			roundTimeoutSeconds: 60
		},
		lostConnection: false
	};

	public static Instance = new _GameDataStore(_GameDataStore.InitialState);

	private ws: WebSocket | null = null;

	public initialize()
	{
		if (this.ws)
		{
			this.ws.close();
			manualClose = true;
		}

		const isLocal = !!location.hostname.match("local");
		const protocol = location.protocol === "http:" ? "ws:" : "wss:";
		const url = isLocal
			? `ws://${location.hostname}:8080`
			: `${protocol}//${location.hostname}`;

		this.ws = new WebSocket(url);

		this.ws.onopen = (e) =>
		{
			manualClose = false;
			connectionOpen = true;
			console.log(e);
			this.ws?.send(JSON.stringify(UserDataStore.state));

			this.update({
				hasConnection: true,
				lostConnection: false
			});
		};

		this.ws.onmessage = (e) =>
		{
			const parsed = JSON.parse(e.data);
			if("game" in parsed)
			{
				const data = JSON.parse(e.data) as { game: GamePayload };
				if (!this.state.game?.id || data.game.id === this.state.game?.id)
				{
					if (!data.game.roundCardsCustom)
					{
						data.game.roundCardsCustom = {};
					}
					this.update(data);
				}
			}
			else if("chat" in parsed)
			{
				const data = JSON.parse(e.data) as { chat: ChatPayload };
				if (!this.state.game?.id || data.chat.gameId === this.state.game?.id)
				{
					this.update({
						chat: [...this.state.chat, data.chat]
					});
				}
			}
		};

		this.ws.onclose = () =>
		{
			connectionOpen = false;
			if (!manualClose)
			{
				this.retry();
			}
		};
	}

	public getDefaultPacks(packs: ICardPackSummary[])
	{
		const officialDefaults = packs.filter(a =>
			!a.packId.match(/pax|conversion|gencon|mass_effect|midterm|house_of_cards|jack_white|hawaii|desert_bus|reject|geek/gi)
			&& a.isOfficial
		);

		const thirdPartyDefaults = packs.filter(a =>
			!a.isOfficial
			&& !!a.packId.match(/crabs|carbs|guards|punishment/gi)
		);

		return [...officialDefaults, ...thirdPartyDefaults].map(p => p.packId);
	}

	public storeOwnedGames(game: ClientGameItem)
	{
		const gamesOwnedString = localStorage.getItem(gamesOwnedLsKey) ?? "[]";
		const gamesOwned = JSON.parse(gamesOwnedString) as string[];
		gamesOwned.push(game.id);
		localStorage.setItem(gamesOwnedLsKey, JSON.stringify(gamesOwned));
	}

	public clear()
	{
		this.ws?.close();
		this.update(_GameDataStore.InitialState);
	}

	public reconnect()
	{
		this.retry(5);
	}

	private retry(count = 0)
	{
		this.update({
			hasConnection: false
		});

		console.log("Lost server connection. Retrying...", count);

		this.initialize();

		setTimeout(() =>
		{
			if (!connectionOpen)
			{
				if (count < 5)
				{
					this.retry(count + 1);
				}
				else
				{
					this.update({
						lostConnection: true
					});
				}
			}
		}, 2000);
	}

	protected update(data: Partial<IGameDataStorePayload>)
	{
		let prev = {...this.state};

		super.update(data);

		console.groupCollapsed("[GameDataStore] Update...");
		console.log("New: ", data);
		console.log("Prev: ", prev);
		console.log("Result:", this.state);
		console.groupEnd();

		const meGuid = UserDataStore.state.playerGuid;

		const prevBuildVersion = prev.game?.buildVersion;
		const newBuildVersion = this.state.game?.buildVersion;
		if (prevBuildVersion && newBuildVersion && prevBuildVersion !== newBuildVersion)
		{
			location.href = location.href + "";
		}

		if (this.state.ownerSettings
			&& this.state.game
			&& this.state.loaded
			&& prev.loaded
			&& !deepEqual(prev.ownerSettings, this.state.ownerSettings)
			&& this.state.game.ownerGuid === UserDataStore.state.playerGuid)
		{
			Platform.updateSettings(
				this.state.game.ownerGuid,
				this.state.game.id,
				this.state.ownerSettings)
				.catch(ErrorDataStore.add);
		}

		if (!deepEqual(prev.game?.roundCards, this.state.game?.roundCards))
		{
			this.loadRoundCards();
		}

		const iAmAPlayer = meGuid in (this.state.game?.players ?? {});
		if (iAmAPlayer && !deepEqual(prev.game?.players[meGuid], this.state.game?.players[meGuid]))
		{
			this.loadPlayerCards(meGuid);
		}

		if (!deepEqual(prev.game?.blackCard, this.state.game?.blackCard))
		{
			this.loadBlackCard();
		}

		const newCardcastPacks = this.state.ownerSettings.includedCardcastPacks.filter(p => !prev.ownerSettings?.includedCardcastPacks.includes(p));

		if (newCardcastPacks.length > 0)
		{
			this.update({
				cardcastPacksLoading: true
			});
		}

		if(!prev.game?.roundStarted && this.state.game?.roundStarted)
		{
			this.update({
				roundStartTime: moment()
			});
		}

		let loaded = 0;
		newCardcastPacks.forEach(pack =>
		{
			CardCastApi.getDeck(pack)
				.then(packData =>
				{
					this.update({
						cardcastPackDefs: {
							...this.state.cardcastPackDefs,
							[pack]: packData
						}
					});
				})
				.finally(() =>
				{
					loaded++;
					if (loaded === newCardcastPacks.length)
					{
						this.update({
							cardcastPacksLoading: false
						});
					}
				});
		});

		const becameCzar = prev.game?.chooserGuid !== meGuid && this.state.game?.chooserGuid === meGuid;
		if(becameCzar)
		{
			AudioUtils.multiTone(3);
		}
	}

	private loadRoundCards()
	{
		const toLoad = this.state.game?.roundCards ?? [];

		const cardIds = ArrayFlatten<number>(Object.values(toLoad));

		return this.loadWhiteCardMap(cardIds)
			.then(roundCardDefs => this.update({
				roundCardDefs
			}));
	}

	private loadPlayerCards(playerGuid: string)
	{
		const toLoad = this.state.game?.players[playerGuid].whiteCards;
		if (!toLoad)
		{
			return;
		}

		const cardIds = Object.values(toLoad);

		return this.loadWhiteCardMap(cardIds)
			.then(playerCardDefs => this.update({
				playerCardDefs
			}));
	}

	private loadBlackCard()
	{
		const blackCard = this.state.game?.blackCard;
		if ((!blackCard || blackCard.cardIndex === -1) && blackCard?.cardIndex !== 0)
		{
			return Promise.resolve();
		}

		return Platform.getBlackCard(blackCard)
			.then(blackCardDef => this.update({
				blackCardDef
			}));
	}

	private async loadWhiteCardMap(cardIds: CardId[]): Promise<WhiteCardMap>
	{
		const data = await Platform.getWhiteCards(cardIds);

		let map: WhiteCardMap = {};
		data.forEach((cardDef, index) =>
		{
			const cardId = cardIds[index];
			if (!(cardId.packId in map))
			{
				map[cardId.packId] = {};
			}

			map[cardId.packId][cardId.cardIndex] = cardDef;
		});

		console.log(map);

		return map;
	}

	public hydrate(gameId: string)
	{
		this.update({
			loaded: false
		});

		console.log("[GameDataStore] Hydrating...", gameId);

		return Platform.getGame(gameId)
			.then(data =>
			{
				this.update({
					loaded: true,
					game: data as GamePayload,
					ownerSettings: data.settings
				});

				if (this.state.loadedPacks.length === 0)
				{
					Platform.getPacks(this.state.familyMode ? "family" : undefined)
						.then(data =>
						{
							let ownerSettings = {...this.state.ownerSettings};
							// If this is a game that was just created, set the default packs
							if (this.state.game?.playerOrder.length === 0 && !this.state.game?.started)
							{
								const defaultPacks = this.getDefaultPacks(data);
								ownerSettings.includedPacks = defaultPacks;
							}

							this.update({
								loadedPacks: data,
								ownerSettings
							});
						});
				}
			})
			.catch(e =>
			{
				this.update({
					loaded: true,
				});
				console.error(e);
			});
	}

	public playWhiteCards(cardIds: CardId[] | undefined, userGuid: string)
	{
		BrowserUtils.scrollToTop();

		console.log("[GameDataStore] Played white cards...", cardIds, userGuid);

		if (!this.state.game || !cardIds)
		{
			throw new Error("Invalid card or game!");
		}

		return Platform.playCards(this.state.game.id, userGuid, cardIds)
			.catch(e => console.error(e));
	}

	public playCustomCards(cards: string[] | undefined, userGuid: string)
	{
		BrowserUtils.scrollToTop();

		console.log("[GameDataStore] Played white cards...", cards, userGuid);

		if (!this.state.game || !cards)
		{
			throw new Error("Invalid card or game!");
		}

		return Platform.playCardsCustom(this.state.game.id, userGuid, cards)
			.catch(e => console.error(e));
	}

	public chooseWinner(chooserGuid: string, winningPlayerGuid: string)
	{
		BrowserUtils.scrollToTop();

		if (!this.state.game || !chooserGuid)
		{
			throw new Error("Invalid card or game!");
		}

		return Platform.selectWinnerCard(this.state.game.id, chooserGuid, winningPlayerGuid)
			.catch(e => console.error(e));
	}

	public revealNext(userGuid: string)
	{
		if (!this.state.game)
		{
			throw new Error("Invalid card or game!");
		}

		return Platform.revealNext(this.state.game.id, userGuid)
			.catch(e => console.error(e));
	}

	public skipBlack(userGuid: string)
	{
		if (!this.state.game)
		{
			throw new Error("Invalid card or game!");
		}

		return Platform.skipBlack(this.state.game.id, userGuid)
			.catch(e => console.error(e));
	}

	public startRound(userGuid: string)
	{
		BrowserUtils.scrollToTop();

		if (!this.state.game)
		{
			throw new Error("Invalid card or game!");
		}

		return Platform.startRound(this.state.game.id, userGuid)
			.catch(e => console.error(e));
	}

	public addRandomPlayer(userGuid: string)
	{
		if (!this.state.game)
		{
			throw new Error("Invalid card or game!");
		}

		return Platform.addRandomPlayer(this.state.game.id, userGuid)
			.catch(e => console.error(e));
	}

	public setIncludedPacks(includedPacks: string[])
	{
		this.setSetting({
			includedPacks
		});
	}

	public setIncludedCardcastPacks(includedCardcastPacks: string[])
	{
		const currentIncluded = this.state.ownerSettings.includedCardcastPacks;

		this.setSetting({
			includedCardcastPacks
		});
	}

	public setRequiredRounds(rounds: number)
	{
		this.setSetting({
			roundsToWin: rounds
		});
	}

	public setPlayerLimit(limit: number)
	{
		this.setSetting({
			playerLimit: limit
		});
	}

	public setRoundTimeout(seconds: number)
	{
		this.setSetting({
			roundTimeoutSeconds: seconds
		});
	}

	public setHideDuringReveal(hideDuringReveal: boolean)
	{
		this.setSetting({
			hideDuringReveal
		});
	}

	public setWinnerBecomesCzar(winnerBecomesCzar: boolean)
	{
		this.setSetting({
			winnerBecomesCzar
		});
	}

	public setGamePublic(isPublic: boolean)
	{
		this.setSetting({
			public: isPublic
		});
	}

	public setCustomWhites(customWhites: boolean)
	{
		this.setSetting({
			customWhites
		});
	}

	public setSkipReveal(skipReveal: boolean)
	{
		this.setSetting({
			skipReveal
		});
	}

	private setSetting(partial: Partial<IGameSettings>)
	{
		this.update({
			ownerSettings: {
				...this.state.ownerSettings,
				...partial
			}
		});
	}

	public setInviteLink(url: string)
	{
		this.update({
			ownerSettings: {
				...this.state.ownerSettings,
				inviteLink: url
			}
		});
	}

	public restart(playerGuid: string)
	{
		this.update({
			loaded: false
		});

		const game = this.state.game;
		if (!game)
		{
			throw new Error("Invalid card or game!");
		}

		return Platform.restart(game.id, playerGuid).then(() =>
		{
			this.update({
				loaded: true
			});
		});
	}

	public forfeit(playerGuid: string, cardsNeeded: number)
	{
		const game = this.state.game;
		if (!game)
		{
			throw new Error("Invalid card or game!");
		}

		const toPlay: CardId[] = [];
		const myCards = game.players[playerGuid].whiteCards;
		while (toPlay.length < cardsNeeded)
		{
			let cardIndex = Math.floor(Math.random() * myCards.length);
			const card = myCards[cardIndex];
			if (!toPlay.find(a => deepEqual(card, a)))
			{
				toPlay.push(card);
			}
		}

		BrowserUtils.scrollToTop();

		return this.playWhiteCards(toPlay, playerGuid)
			.then(() =>
			{
				Platform.forfeit(game.id, playerGuid, toPlay);
			});
	}
}

export const GameDataStore = _GameDataStore.Instance;