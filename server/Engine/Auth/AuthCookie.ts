import {IClientAuthStatus} from "./UserContract";
import {Request, Response} from "express";
import {AuthEncryption} from "./AuthEncryption";
import {Config} from "../../../config/config";

export class AuthCookie
{
	private static Encryption = new AuthEncryption();
	private static AuthCookieName = "auth";

	public static set(userData: IClientAuthStatus, res: Response)
	{
		const encrypted = AuthCookie.encodeUserInfo(userData);

		res.cookie(AuthCookie.AuthCookieName, encrypted, {
			expires: new Date(Date.now() + (1000 * 60 * 60 * 24 * 30)),
			httpOnly: false,
			domain: Config.domain.split(":")[0]
		});
	}

	public static get(req: Request)
	{
		const authCookie = req.cookies[AuthCookie.AuthCookieName];
		if (authCookie)
		{
			return AuthCookie.decodeUserInfo(authCookie);
		}
	}

	public static clear(res: Response)
	{
		res.clearCookie(AuthCookie.AuthCookieName, {
			domain: Config.domain.split(":")[0]
		});
	}

	private static encodeUserInfo(userData: IClientAuthStatus): string
	{
		return this.Encryption.encrypt(JSON.stringify(userData));
	}

	private static decodeUserInfo(encoded: string): IClientAuthStatus
	{
		const decrypted = this.Encryption.decrypt(encoded);

		return JSON.parse(decrypted) as IClientAuthStatus;
	}
}