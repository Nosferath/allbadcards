export interface Patron
{
	userId: string
	settings: PatronSettings;
	accessToken: string;
	accessTokenExpiry: Date;
	refresh_token: string;
	refresh_expiry: Date;
}

export interface PatronSettings
{
	nickname: string;
	favoritePackIds: string[];
}

export interface IClientAuthStatus
{
	userId: string | null;
	accessToken: string | null;
	accessTokenExpiry: Date | null;
	levels: string[]
}