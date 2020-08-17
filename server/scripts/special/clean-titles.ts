import {PackManager} from "../../AllBadCards/Engine/Games/Cards/PackManager";
import {CardsDatabase} from "../../AllBadCards/Engine/Database/CardsDatabase";
import {ICardPackDefinition} from "../../AllBadCards/Engine/Games/Game/GameContract";
import cloneDeep from "clone-deep";
import {ProfanityFilter} from "../../Utils/TextUtils";

const levenshtein = require('fast-levenshtein');

/*
 This file exists to look through all packs and remove cards from them that are also part of the official card packs.
 */

const run = async () =>
{
	await CardsDatabase.initialize();

	const results = await filterAllPacks();

	return results;
};

let processed = 0;
const onProcessed = (packId: string, oldName: string, newName: string) =>
{
	processed++;
	const log = `PackId: ${packId} old: ${oldName}, new: ${newName}`;
	console.log(log);
	return log;
};

const filterAllPacks = async () =>
{
	const allPacks = await CardsDatabase.collections.packs.find().toArray();

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
		const doNothing = newPackDef.pack.name === packDef.pack.name;
		if (doNothing)
		{
			continue;
		}

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
		catch (e)
		{
			console.error(e);
		}

		onProcessed(pack.packId, pack.definition.pack.name, newPackDef.pack.name);
	}
};

const filterPackForValidity = (packDef: ICardPackDefinition): ICardPackDefinition =>
{
	const newDef = cloneDeep(packDef);

	const packNameWithoutVowels = packDef.pack.name.replace(/([aeiou]+)/gi, "");
	if (packNameWithoutVowels.match(/(crdsvs|gnst|hmnty|hmntyprtygm|hrblple|cncrt)/gi))
	{
		newDef.pack.name = "[Name Redacted]";
	}

	const hasProfanityInName = !!ProfanityFilter(packDef.pack.name);
	if(hasProfanityInName)
	{
		newDef.pack.name = "[Name Redacted]";
	}

	const initials = packDef.pack.name.split(" ").map(w => w.substr(0, 1)).join("").toLowerCase();
	if (initials.includes("cah"))
	{
		newDef.pack.name = "[Name Redacted]";
	}

	return newDef;
};

run()
	.then(result =>
	{
		console.log(result);
		process.exit(0);
	})
	.catch(e => console.error(e));