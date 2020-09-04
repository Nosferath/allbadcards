export class AdBlockerMessageManager
{
	public static updateSeen()
	{
		sessionStorage.setItem("seenAdBlockerDate", Date.now().toString());
	}

	public static seenRecently(since = 20 * 60 * 1000)
	{
		const seenItem = sessionStorage.getItem("seenAdBlockerDate");
		if(!seenItem)
		{
			return false;
		}
		
		const lastSeenString = sessionStorage.getItem("seenAdBlockerDate") ?? String(Date.now());

		return Date.now() - parseInt(lastSeenString) < since;
	}
}