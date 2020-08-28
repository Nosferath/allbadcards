export interface BaseGameSettings
{
	public: boolean;
}

export interface IBaseGame<TSettings extends BaseGameSettings = BaseGameSettings>
{
	dateUpdated: Date;
	settings: TSettings;
}