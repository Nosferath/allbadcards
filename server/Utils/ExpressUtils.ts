import {Request, Response} from "express";
import {logError, logMessage} from "../logger";
import {Config} from "../../config/config";
import {IPlayer} from "../Engine/Games/Game/GameContract";

export const onExpressError = (res: Response, error: Error, ...more: any[]) =>
{
	logError({message: error.message, stack: error.stack}, more);
	res.status(500).send({message: error.message, stack: error.stack});
	throw error;
};

export const sendWithBuildVersion = (data: any, res: Response) =>
{
	res.send({
		...data,
		buildVersion: Config.Version
	});
};

export const playerFromReq = (req: Request): IPlayer =>
{
	return {
		guid: req.cookies["guid"],
		secret: req.cookies["secret"]
	};
};

export const logRequest = (req: Request) =>
{
	const body = req.body
		? JSON.stringify(req.body)
		: undefined;

	const query = req.query
		? JSON.stringify(req.query)
		: undefined;

	logMessage(req.url, body, query);
};