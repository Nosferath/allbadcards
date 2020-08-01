const Names = [
	"Stupid",
	"Idiot",
	"Moron",
	"Fool",
	"Numbskull",
	"Baby",
	"Boomer",
	"Caveman",
	"Clown",
	"Creep",
	"Dimwit",
	"Dolt",
	"Farty",
	"Freak",
	"Goose",
	"Jerk",
	"Joker",
	"Loser",
	"Nerd",
	"Nimrod",
	"Nitwit",
	"Pooface",
	"Scumbag",
	"Simpleton",
	"Turdy",
	"Wierdo"
];

const LastNameFormat = [
	"O'_",
	"_ington",
	"Mc_",
	", Son of _",
	"of the _ Clan",
	"Van_",
	"_by",
	"_ius",
	"_son",
	"_sbury",
	"Fitz_",
	"_sley",
	"_ingham",
	"St. _"
];

export const MakeName = () =>
{
	const fnIndex = Math.floor(Names.length * Math.random());
	const lnIndex = Math.floor(Names.length * Math.random());
	const lnFormatIndex = Math.floor(LastNameFormat.length * Math.random());
	const randomFirst = Names[fnIndex];
	const randomLastFormat = LastNameFormat[lnFormatIndex];
	const randomLast = randomLastFormat.replace("_", Names[lnIndex]);

	return `${randomFirst} ${randomLast}`;
};