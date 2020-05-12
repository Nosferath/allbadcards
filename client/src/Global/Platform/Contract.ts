import {CardPackMap} from "../../../../server/Games/Contract";
import {WithBuildVersion} from "./platform";

export type PlayerMap = { [key: string]: GamePlayer };

export interface GamePlayer
{
	guid: string;
	nickname: string;
	wins: number;
	whiteCards: CardId[];
	isSpectating: boolean;
	isRandom: boolean;
}

export interface CardId
{
	packId: string;
	cardIndex: number;
}

export interface IGameSettings
{
	hideDuringReveal: boolean;
	skipReveal: boolean;
	public: boolean;
	playerLimit: number;
	roundsToWin: number;
	inviteLink: string | null;
	includedPacks: string[];
	includedCardcastPacks: string[];
	winnerBecomesCzar: boolean;
	customWhites: boolean;
	roundTimeoutSeconds: number;
}

export interface GamesList extends WithBuildVersion
{
	games: ClientGameItem[];
}

export interface ChatPayload
{
	message: string;
	playerGuid: string;
	gameId: string;
}

export interface ClientGameItem
{
	id: string;
	dateCreated: Date;
	roundIndex: number;
	roundStarted: boolean;
	ownerGuid: string;
	chooserGuid: string | null;
	started: boolean;
	players: PlayerMap;
	spectators: PlayerMap;
	pendingPlayers: PlayerMap;
	kickedPlayers: PlayerMap;
	blackCard: CardId;
	// key = player guid, value = white card ID
	roundCards: { [playerGuid: string]: CardId[] };
	roundCardsCustom: { [playerGuid: string]: string[] } | undefined;
	playerOrder: string[];
	revealIndex: number;
	lastWinner: GamePlayer | undefined;
	settings: IGameSettings;
}

export interface GamePayload extends ClientGameItem
{
	buildVersion: number;
}

export interface ICardTypes
{
	types: ICardType[];
}

export type CardTypeId = "official" | "thirdparty";

export interface ICardType
{
	id: CardTypeId;
	name: string;
	packs: string[];
	quantity: number;
}

export interface ICardPackQuantity
{
	black: number;
	white: number;
	total: number;
}

export interface ICardPackTypeDefinition
{
	packs: ICardPackSummary[];
}

export interface ICardPackSummary
{
	name: string;
	packId: string;
	isOfficial: boolean;
	quantity: ICardPackQuantity;
}

export interface ICardPackDefinition
{
	pack: {
		name: string;
		id: string;
	};
	quantity: ICardPackQuantity;
	black: IBlackCardDefinition[];
	white: string[];
	dateStoredMs?: number;
}

export interface IBlackCardDefinition
{
	content: string;
	pick: number;
	draw: number;
}