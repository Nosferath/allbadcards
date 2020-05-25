type Environments = "local" | "prod" | "beta";

declare const __SERVER_ENV__: Environments;
declare const __PORT__: number;
declare const __VERSION__: number;
declare const __OUTPUT_DIR__: string;

const env = typeof __SERVER_ENV__ !== "undefined" ? __SERVER_ENV__ : "local";
const port = typeof __PORT__ !== "undefined" ? __PORT__ : 5000;
const version = typeof __VERSION__ !== "undefined" ? __VERSION__ : Date.now();
const outputDir = typeof __OUTPUT_DIR__ !== "undefined" ? __OUTPUT_DIR__ : "none";

export class Config
{
	public static Environment = env;
	public static Port = port;
	public static Version = version;
	public static OutputDir = outputDir;

	public static get host()
	{
		const domain = this.domain;

		return `${this.protocol}${domain}`;
	}

	public static getHostWithSubdomain(subdomain: string)
	{
		const fixedSubdomain = subdomain.length > 0
			? subdomain.endsWith(".")
				? subdomain
				: `${subdomain}.`
			: "";

		return `${this.protocol}${fixedSubdomain}${this.domain}`;
	}

	public static get domain()
	{
		let host = "allbad.cards";

		switch (this.Environment)
		{
			case "local":
				host = "jlauer.local:5000";
				break;
			case "beta":
				host = "beta.allbad.cards";
				break;
			case "prod":
				host = "allbad.cards";
				break;
		}

		return host;
	}

	private static get protocol()
	{
		let protocol = `https://`;

		if(this.Environment === "local")
		{
			protocol = `http://`;
		}

		return protocol;
	}
}

