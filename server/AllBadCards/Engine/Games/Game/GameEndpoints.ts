import {Express} from "express";
import {GameManager} from "./GameManager";
import {CardManager} from "../Cards/CardManager";
import apicache from "apicache";
import {UserUtils} from "../../User/UserUtils";
import shortid from "shortid";
import {GameListManager} from "./GameListManager";
import {PackManager} from "../Cards/PackManager";
import {logRequest, onExpressError, playerFromReq, safeAuthedEndpoint, sendWithBuildVersion} from "../../../../Utils/ExpressUtils";
import {UserManager} from "../../User/UserManager";

const cache = apicache.middleware;

export const RegisterGameEndpoints = (app: Express, clientFolder: string) =>
{
	app.get("/api/abc/user/register", async (req, res) =>
	{
		try
		{
			let guid = req.cookies["guid"];

			const player = playerFromReq(req);
			const valid = UserManager.validateUser(player, false);

			// If there's a guid, but there's something wrong with it, clear the guid
			if (!player.guid || !player.secret || !valid)
			{
				guid = undefined;
			}

			if (!guid)
			{
				guid = shortid.generate();
				const secret = UserUtils.generateSecret(guid);

				const expires = new Date(Date.now() + (999 * 365 * 24 * 60 * 60 * 1000));

				res.cookie("secret", secret, {
					httpOnly: true,
					expires
				});

				res.cookie("guid", guid, {
					expires
				});
			}

			res.send({
				guid
			});
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.get("/api/abc/games/public", cache("15 seconds"), async (req, res) =>
	{
		logRequest(req);

		try
		{
			const games = await GameListManager.getGames(parseInt(req.query.zeroBasedPage));
			sendWithBuildVersion({games}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.get("/api/abc/game/get", async (req, res) =>
	{
		logRequest(req);

		try
		{
			const game = await GameManager.getGame(req.query.gameId);
			sendWithBuildVersion(game, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.get("/api/abc/game/get-white-card", cache("1 hour"), async (req, res) =>
	{
		logRequest(req);
		try
		{
			const card = await CardManager.getWhiteCard({
				cardIndex: parseInt(req.query.cardIndex),
				packId: req.query.packId
			});

			res.send({
				card
			});
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.get("/api/abc/game/get-packnames", cache("1 hour"), async (req, res) =>
	{
		try
		{
			const packs = await PackManager.getPackNames(req.query.type);

			res.send(packs);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.get("/api/abc/game/get-black-card", cache("1 hour"), async (req, res) =>
	{
		logRequest(req);
		try
		{
			const card = await CardManager.getBlackCard({
				packId: req.query.packId,
				cardIndex: parseInt(req.query.cardIndex)
			});

			res.send(card);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/create", async (req, res) =>
	{
		await safeAuthedEndpoint(req, res, async (authContext) =>
		{
			const player = playerFromReq(req);
			const game = await GameManager.createGame(req, authContext, player, req.body.nickname);
			sendWithBuildVersion({
				id: game.id
			}, res);
		});
	});

	app.post("/api/abc/game/join", async (req, res) =>
	{
		await safeAuthedEndpoint(req, res, async (authContext) =>
		{
			const player = playerFromReq(req);
			await GameManager.joinGame(
				authContext,
				player,
				req.body.gameId,
				req.body.nickname,
				JSON.parse(req.body.isSpectating ?? "false"),
				false);

			sendWithBuildVersion({success: true}, res);
		});
	});

	app.post("/api/abc/game/kick", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.kickPlayer(req.body.gameId, req.body.targetGuid, player);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/player-approval", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.setPlayerApproval(req.body.gameId, req.body.targetGuid, player, req.body.approved);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/start", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.startGame(
				req.body.gameId,
				player,
				req.body.settings);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/update-settings", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.updateSettings(
				req.body.gameId,
				player,
				req.body.settings);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/restart", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			let game = await GameManager.restartGame(req.body.gameId, player);
			await GameManager.startGame(
				game.id,
				player,
				game.settings
			);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/play-cards", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.playCard(req.body.gameId, player, req.body.cardIds);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/forfeit", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.myCardsSuck(req.body.gameId, player, req.body.playedCards);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/reveal-next", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.revealNext(req.body.gameId, player);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/skip-black", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.skipBlack(req.body.gameId, player);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/start-round", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.startRound(req.body.gameId, player);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/add-random-player", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.addRandomPlayer(req.body.gameId, player);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/select-winner-card", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.selectWinnerCard(req.body.gameId, player, req.body.winningPlayerGuid);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/send-chat", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);

			await GameManager.updateRedisChat(player, {
				gameId: req.body.gameId,
				message: escape(req.body.message),
				playerGuid: player.guid
			});

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.post("/api/abc/game/next-round", async (req, res) =>
	{
		logRequest(req);
		try
		{
			const player = playerFromReq(req);
			await GameManager.nextRound(req.body.gameId, player);

			sendWithBuildVersion({success: true}, res);
		}
		catch (error)
		{
			onExpressError(res, error, req.url, req.query, req.body);
		}
	});

	app.get("*", (req, res) =>
	{
		res.sendFile("index.html", {root: clientFolder});
	});
};