import {WithBuildVersion} from "./abcPlatform";

type valueof<T> = T[keyof T]
export type ValuesOf<T> = T[keyof T]

export type PlayerMap = { [key: string]: GamePlayer };

export type PackTypes = "all" | "official" | "thirdParty" | "family";

export interface GamePlayer
{
	guid: string;
	nickname: string;
	wins: number;
	whiteCards: CardId[];
	levels?: string[];
	isSpectating: boolean;
	isRandom: boolean;
	isSubscriber?: boolean;
	hideGameAds?: boolean;
	kickedForTimeout?: boolean;
	isIdle?: boolean;
	isApproved?: boolean | null;
}

export interface CardId
{
	packId: string;
	cardIndex: number;
	customInput?: string;
}

export interface IGameSettings extends IGameClientSettings
{
	suggestedRoundsToWin?: number;
}

export interface IGameClientSettings
{
	hideDuringReveal: boolean;
	skipReveal: boolean;
	public: boolean;
	playerLimit: number;
	roundsToWin?: number;
	inviteLink: string | null;
	includedPacks: string[];
	includedCustomPackIds: string[];
	winnerBecomesCzar: boolean;
	roundTimeoutSeconds: number | null;
	allowCustoms: boolean;
	requireJoinApproval?: boolean;
	ownerIsPermaczar?: boolean;
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

export enum BackerType
{
	None = "None",
	"Hide Ads (Pay-what-you-want)" = "Hide Ads (Pay-what-you-want)",
	"Ad-free Games" = "Ad-free Games",
	Sponsor = "Sponsor",
	Owner = "Owner"
}

export interface IClientAuthStatus
{
	userId: string | null;
	accessToken: string | null;
	accessTokenExpiry: Date | null;
	levels: BackerType[];
}

export interface ICustomPackDataInput
{
	id: string | null;
	packName: string,
	whiteCards: string[],
	blackCards: string[],
	isNsfw: boolean,
	isPublic: boolean
	categories: valueof<typeof PackCategories>[];
}

export interface ICustomCardPack
{
	id: string;
	owner: string;
	definition: ICardPackDefinition;
	dateCreated: Date;
	dateUpdated: Date;
	isNsfw: boolean,
	isPublic: boolean
	favorites: number;
	categories: valueof<typeof PackCategories>[];
}

export interface IUserPackFavorite
{
	packId: string;
	userId: string;
}

export interface ICustomPackSearchResult
{
	packs: ICustomCardPack[];
	hasMore: boolean;
	userFavorites: PackFavorites;
}

export type PackFavorites = { [packId: string]: boolean };

export const PackCategories = [
	"General",
	"Insulting",
	"Non-English Language",
	"Movies, Music, & TV",
	"Family-Friendly",
	"Business",
	"Events & Holidays",
	"News & Politics",
	"Places & Things",
	"Hobbies & Activities",
] as const;

export interface PackSearch
{
	search: string | null;
	category: ValuesOf<typeof PackCategories> | null;
	nsfw: boolean | null;
	sort: PackSearchSort | null;
}

export type PackSearchSort = "favorites" | "newest" | "largest";