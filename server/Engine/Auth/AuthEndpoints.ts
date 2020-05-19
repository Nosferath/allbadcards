import {Express} from "express";
import {Auth} from "./Auth";
import {Config} from "../../../config/config";
import {logRequest, onExpressError, sendWithBuildVersion} from "../../Utils/ExpressUtils";

export const RegisterAuthEndpoints = (app: Express, clientFolder: string) =>
{
	app.get("/auth/authorize", (req, res) =>
	{
		Auth.authorize(req, res);
	});

	app.get("/auth/redirect", async (req, res) =>
	{
		try
		{
			await Auth.storeUserToken(req, res);
		}
		catch (e)
		{
			throw e;
		}

		const host = Config.host.replace("local:5000", "local:3000");

		const state = decodeURIComponent(req.query.state) || "/";

		res.redirect(host + state);
	});

	app.get("/auth/status", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const result = await Auth.getRefreshAuthStatus(req, res);

			sendWithBuildVersion({
				status: result
			}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});
};