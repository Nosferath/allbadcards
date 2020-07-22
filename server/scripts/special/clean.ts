import {PackManager} from "../../Engine/Games/Cards/PackManager";
import {Database} from "../../DB/Database";
import {ICardPackDefinition} from "../../Engine/Games/Game/GameContract";

const levenshtein = require('fast-levenshtein');

/*
This file exists to look through all packs and remove cards from them that are also part of the official card packs.
 */

const run = async () =>
{
	await Database.initialize();

	const results = await filterAllPacks();

	return results;
};

let processed = 0;
const onProcessed = (packId: string, result: string, total: number) =>
{
	processed++;
	const log = `PackId: ${packId} result: ${result}. Processed: ${processed} of ${total}`;
	console.log(log);
	return log;
};

const filterAllPacks = async () =>
{
	const allPacks = await Database.collections.packs.find().toArray();
	const allPacksLength = allPacks.length;

	let results: string[] = [];

	let upserts: Promise<any>[] = [];
	let deletes: Promise<any>[] = [];

	const sortedPacks = allPacks.sort((a, b) =>
	{
		return (a.definition.black.length + a.definition.white.length) - (b.definition.black.length + b.definition.white.length);
	}).slice(1);
	for (const pack of sortedPacks)
	{
		const packDef = pack.definition;
		packDef.white = Array.from(new Set(packDef.white));

		console.log(`${pack.packId} size: ${pack.definition.white.length + pack.definition.black.length}`);

		const newPackDef = filterPackForValidity(packDef);
		const amountRemaining = (newPackDef.black.length + newPackDef.white.length) / (packDef.black.length + packDef.white.length);

		const doDelete = amountRemaining < 0.5;
		const doNothing = amountRemaining === 1;
		if (doNothing)
		{
			onProcessed(pack.packId, "no changes", allPacksLength);
			continue;
		}

		if (!doDelete)
		{
			try
			{
				await PackManager.upsertPack(undefined, {
					categories: pack.categories,
					id: pack.packId,
					whiteCards: Array.from(new Set(newPackDef.white)),
					blackCards: Array.from(new Set(newPackDef.black.map(bc => bc.content))),
					packName: newPackDef.pack.name,
					isNsfw: pack.isNsfw,
					isPublic: pack.isPublic
				}, true);
			}
			catch(e)
			{
				console.error(e);
			}
		}
		else
		{
			try
			{
				await Database.collections.packs.deleteOne({
					["definition.pack.id"]: pack.packId
				})
			}
			catch(e)
			{
				console.error(e);
			}
		}

		const oldBc = packDef.black.length;
		const newbc = newPackDef.black.length;
		const oldWc = packDef.white.length;
		const newWc = newPackDef.white.length;

		const result = `Queued to be ${doDelete ? "Deleted" : "Filtered"}. W: ${newWc} / ${oldWc} | B: ${newbc} / ${oldBc}`;
		results.push(result);
		console.log(result);
		onProcessed(pack.packId, result, allPacksLength);
	}

	return results;
};

const filterPackForValidity = (packDef: ICardPackDefinition): ICardPackDefinition =>
{
	const newDef = {...packDef};

	newDef.white = packDef.white.filter((w1o, w1c) =>
	{
		const w1 = w1o.substr(0, 500);
		let valid = true;

		// If it's one or two words, we can ignore the test
		const wordCount = w1.split(" ").length;
		if(wordCount > 2)
		{
			for (const w2 of PackManager.officialPackWhiteCards)
			{
				const l = levenshtein.get(w2, w1);
				if (l < w2.length / 4)
				{
					console.log("Duplicate: " + w1c + " // " + w2);
					valid = false;
					break;
				}
			}
		}

		return valid;
	});

	newDef.black = packDef.black.filter((b1) =>
	{
		let valid = true;
		for (const b2 of PackManager.officialPackBlackCards)
		{
			const l = levenshtein.get(b2, b1);
			if (l < b2.length / 4)
			{
				console.log("Duplicate: " + b2);
				valid = false;
				break;
			}
		}

		return valid;
	});

	return newDef;
};

run()
	.then(result =>
	{
		console.log(result);
		process.exit(0);
	})
	.catch(e => console.error(e));