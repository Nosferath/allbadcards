import {Request, Response} from "express";
import ClientOAuth2 from "client-oauth2";
import {Config} from "../../../config/config";
import {Database} from "../../DB/Database";
import {loadFileAsJson} from "../../Utils/FileUtils";
import {IClientAuthStatus, Patron} from "./UserContract";
import {PatreonConnector} from "./PatreonConnector";
import {AuthCookie} from "./AuthCookie";
import {MatchKeysAndValues} from "mongodb";

interface TokenWithExpires extends ClientOAuth2.Token
{
	expires: Date;
}

class _Auth
{
	public static Instance = new _Auth();

	private readonly id: string;
	private readonly secret: string;
	private client: ClientOAuth2;

	private constructor()
	{
		const keys = loadFileAsJson("./config/keys.json")[0];

		// Use the client id and secret you received when setting up your OAuth account
		this.id = keys.patreon.id;
		this.secret = keys.patreon.secret;
	}

	private static getRedirectUri()
	{
		return `${Config.host}/auth/redirect`;
	}

	public initialize()
	{
		this.client = new ClientOAuth2({
			clientId: this.id,
			clientSecret: this.secret,
			accessTokenUri: 'https://www.patreon.com/api/oauth2/token',
			authorizationUri: 'https://www.patreon.com/oauth2/authorize',
			redirectUri: _Auth.getRedirectUri(),
			scopes: ['notifications', 'gist']
		})
	}

	public authorize(req: Request, res: Response)
	{
		const uri = this.client.code.getUri();

		res.redirect(uri);
	}

	public async storeUserToken(req: Request, res: Response)
	{
		const redirectUri = _Auth.getRedirectUri();
		const tokenRefresher = this.client.code.getToken(req.originalUrl, {redirectUri});

		const token = await tokenRefresher;
		const user = await token.refresh() as TokenWithExpires;

		const profileData = await PatreonConnector.fetchUser(user.accessToken);
		const userId = profileData.data.id;
		const tokenExpiry = new Date(Date.now() + (1000 * 60));

		AuthCookie.set({
			accessToken: user.accessToken,
			accessTokenExpiry: tokenExpiry,
			userId,
			levels: []
		}, res);

		// Refresh the current users access token.
		const result = await this.updateDatabaseUser(userId, {
			userId: userId,
			accessToken: user.accessToken,
			refresh_token: user.refreshToken,
			refresh_expiry: user.expires
		}, true);

		// If first time, set the nickname
		if (result.upsertedCount >= 1)
		{
			await this.updateDatabaseUser(userId, {
				settings: {
					nickname: profileData.data.attributes.first_name
				}
			}, false);
		}
	}

	public async getRefreshAuthStatus(req: Request, res: Response): Promise<IClientAuthStatus>
	{
		if (!req.cookies)
		{
			req.cookies = {};
			console.log("AUTH: no cookies");
		}

		const storedUserData = AuthCookie.get(req);

		const authStatus: IClientAuthStatus = {
			accessToken: null,
			accessTokenExpiry: null,
			userId: null,
			levels: []
		};

		if (storedUserData)
		{
			authStatus.accessToken = storedUserData.accessToken;
			authStatus.userId = storedUserData.userId;

			const foundUsers = await Database.collections.users.find({
				id: storedUserData.userId
			}).toArray();

			if (foundUsers && foundUsers.length === 1)
			{
				const dbUser = foundUsers[0];

				const now = new Date();
				const refreshExpired = now > dbUser.refresh_expiry;
				if (refreshExpired)
				{
					authStatus.userId = null;
					authStatus.accessToken = null;

					// Return null for everything
					return authStatus;
				}

				const accessExpired = !storedUserData.accessTokenExpiry || now > storedUserData.accessTokenExpiry;
				if (accessExpired && storedUserData.accessToken)
				{
					try
					{
						const newCreatedToken = this.client.createToken(storedUserData.accessToken, dbUser.refresh_token, {});
						const newRefreshedToken = await newCreatedToken.refresh() as TokenWithExpires;

						const newUserData: IClientAuthStatus = {
							userId: storedUserData.userId,
							accessToken: newRefreshedToken.accessToken,
							accessTokenExpiry: new Date(Date.now() + (1000 * 60)),
							levels: []
						};

						authStatus.userId = newUserData.userId;
						authStatus.accessToken = newUserData.accessToken;

						await this.updateUserData(res, newUserData, newRefreshedToken);
					}
					catch (e)
					{
						console.error(e);

						return authStatus;
					}
				}
			}
		}

		authStatus.levels = await PatreonConnector.getSubscriberLevel(authStatus.userId, authStatus.accessToken);

		return authStatus;
	}

	private async updateUserData(res: Response, newUserData: IClientAuthStatus, newRefreshedToken: TokenWithExpires)
	{
		if (!newUserData.userId)
		{
			throw new Error("Cannot update user data without a user ID");
		}

		AuthCookie.set(newUserData, res);

		// Refresh the current users access token.
		await this.updateDatabaseUser(newUserData.userId, {
			accessToken: newRefreshedToken.accessToken,
			refresh_token: newRefreshedToken.refreshToken,
			refresh_expiry: newRefreshedToken.expires
		}, false);
	}

	private async updateDatabaseUser(userId: string, update: MatchKeysAndValues<Patron>, upsert = false)
	{
		// Refresh the current users access token.
		return await Database.collections.users.updateOne({userId}, {
			$set: update
		}, {
			upsert
		});
	}
}

export const Auth = _Auth.Instance;