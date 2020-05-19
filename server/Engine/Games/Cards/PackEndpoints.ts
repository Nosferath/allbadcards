import {Express} from "express";
import {logRequest, onExpressError, sendWithBuildVersion} from "../../../Utils/ExpressUtils";
import {PackManager} from "./PackManager";
import {FilterQuery} from "mongodb";
import {ICustomCardPack} from "../Game/GameContract";

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

	app.get("/api/packs/mine", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const result = await PackManager.getPacksForOwner(req);
			sendWithBuildVersion({
				result
			}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.get("/api/packs/search", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const query: FilterQuery<ICustomCardPack> = {
				isNsfw: req.query.nsfw === "true",
			};

			if(req.query.category)
			{
				query.categories = {
					$in: [req.query.category]
				};
			}

			if(req.query.search)
			{
				query["definition.pack.name"] = '.*' + req.query.search + '.*';
			}

			const result = await PackManager.getPacks(req, query);

			sendWithBuildVersion({
				result
			}, res);
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

	app.post("/api/pack/favorite", async (req, res, next) =>
	{
		logRequest(req);
		try
		{
			const pack = await PackManager.addFavorite(req, req.body.packId);
			sendWithBuildVersion(pack, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/pack/unfavorite", async (req, res, next) =>
	{
		logRequest(req);
		try
		{
			const pack = await PackManager.removeFavorite(req, req.body.packId);
			sendWithBuildVersion(pack, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});
};