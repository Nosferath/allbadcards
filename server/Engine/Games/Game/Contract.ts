export type PlayerMap = { [key: string]: GamePlayer };
export type CardPack = { [cardIndex: number]: CardId };
export type CardPackMap = { [packId: string]: CardPack };

export interface IPlayer
{
	guid: string;
	secret: string;
}

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
	public: boolean;
	hideDuringReveal: boolean;
	skipReveal: boolean;
	playerLimit: number;
	password: string | null;
	roundsToWin: number;
	inviteLink: string | null;
	includedPacks: string[];
	includedCardcastPacks: string[];
	winnerBecomesCzar: boolean;
	customWhites: boolean;
	roundTimeoutSeconds: number | null;
}

export interface GameItem extends ClientGameItem
{
	dateUpdated: Date;
	usedBlackCards: CardPackMap;
	usedWhiteCards: CardPackMap;
}

export interface ClientGameItem
{
	dateCreated: Date;
	id: string;
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

export interface GamePayload extends Partial<ClientGameItem>
{
	buildVersion: number;
}

export interface ChatPayload
{
	message: string;
	playerGuid: string;
	gameId: string;
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