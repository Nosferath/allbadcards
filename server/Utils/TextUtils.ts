const regexList = [
	"b[a@][s\$][t\+][a@]rd",
	"b[e3][a@][s\$][t\+][i1][a@]?[l1]([i1][t\+]y)?",
	"b[e3][a@][s\$][t\+][i1][l1][i1][t\+]y",
	"b[e3][s\$][t\+][i1][a@][l1]([i1][t\+]y)?",
	"b[l1][o0]wj[o0]b[s\$]?",
	"c[l1][i1][t\+]",
	"(c|k|ck|q)un[t\+][s\$]?",
	"(c|k|ck|q)un[t\+][l1][i1](c|k|ck|q)",
	"(c|k|ck|q)un[t\+][l1][i1](c|k|ck|q)[e3]r",
	"(c|k|ck|q)un[t\+][l1][i1](c|k|ck|q)[i1]ng",
	"cyb[e3]r(ph|f)u(c|k|ck|q)",
	"(ph|f)[a@]g[s\$]?",
	"(ph|f)[a@]gg[i1]ng",
	"(ph|f)[a@]gg?[o0][t\+][s\$]?",
	"(ph|f)[a@]gg[s\$]",
	"(ph|f)[e3][l1][l1]?[a@][t\+][i1][o0]",
	"g[a@]y",
	"h[o0]m?m[o0]",
	"n[i1]gg?[e3]r[s\$]?",
]

export const ProfanityFilter = (toFilter: string) =>
{
	const found = regexList.find(reg => {
		const rx = new RegExp(reg, "gi");
		return toFilter.match(rx);
	});

	return found;
};