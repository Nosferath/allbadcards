import {Express} from "express";
import {logRequest, onExpressError, sendWithBuildVersion} from "../../../Utils/ExpressUtils";
import {PackManager} from "./PackManager";

export const RegisterPackEndpoints = (app: Express, clientFolder: string) =>
{
	app.get("/api/pack/get", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const pack = await PackManager.getCustomPack(req.query.pack);
			sendWithBuildVersion(pack, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/pack/update", async (req, res, next) =>
	{
		logRequest(req);
		try
		{
			const pack = await PackManager.upsertPack(req, req.body.pack);
			sendWithBuildVersion(pack, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});
};