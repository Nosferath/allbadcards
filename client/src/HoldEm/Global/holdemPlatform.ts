import {BaseCardGamePlatform} from "@Global/Platform/BaseCardGamePlatform";


class _HoldEmPlatform extends BaseCardGamePlatform<any, any, any, any>
{
	public static Instance = new _HoldEmPlatform();

}

export const HoldEmPlatform = _HoldEmPlatform.Instance;