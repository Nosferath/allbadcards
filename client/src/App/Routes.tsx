import * as React from "react";
import {ComponentType} from "react";
import {Redirect, Route, Switch} from "react-router";
import {ContainerProgress} from "../AllBadCards/UI/ContainerProgress";
import {SiteRoutes} from "../AllBadCards/Global/Routes/Routes";
import {useDataStore} from "../Shared/Global/Utils/HookUtils";
import {AuthDataStore} from "../Shared/Global/DataStore/AuthDataStore";
import {UserDataStore} from "../Shared/Global/DataStore/UserDataStore";

interface IRoutesProps
{
}

interface DefaultProps
{
}

type Props = IRoutesProps & DefaultProps;
type State = IRoutesState;

interface IRoutesState
{
}

export const Routes: React.FC<Props> = (props) =>
{
	const authData = useDataStore(AuthDataStore);
	const userData = useDataStore(UserDataStore);

	if(!authData.loaded || !userData.loaded)
	{
		return <ContainerProgress />;
	}

	return (
		<Switch>
			<Route exact path={"/"}>
				<Suspender importer={() => import("../AllBadCards/Areas/GameDashboard/GameDashboard")}/>
			</Route>
			<Route path={SiteRoutes.Game.path}>
				<Suspender importer={() => import("../AllBadCards/Areas/Game/Game")}/>
			</Route>
			<Route path={SiteRoutes.Games.path}>
				<Suspender importer={() => import("../AllBadCards/Areas/GameList/GameList")}/>
			</Route>
			<Route path={SiteRoutes.PackCreate.path}>
				<Suspender importer={() => import("../AllBadCards/Areas/Pack/Create")}/>
			</Route>
			<Route path={SiteRoutes.MyPacks.path}>
				<Suspender importer={() => import("../AllBadCards/Areas/Packs/MyPacks")}/>
			</Route>
			<Route path={SiteRoutes.PacksBrowser.path}>
				<Suspender importer={() => import("../AllBadCards/Areas/Packs/PacksBrowser")}/>
			</Route>
			<Route path={SiteRoutes.CardCastExport.path}>
				<Suspender importer={() => import("../AllBadCards/Areas/CardCastExport/CardCastExport")}/>
			</Route>
			<Route path={SiteRoutes.Settings.path}>
				<Suspender importer={() => import("../AllBadCards/Areas/User/Settings")}/>
			</Route>
			<Route>
				<Redirect to={"/"}/>
			</Route>
		</Switch>
	);
};

const Suspender: React.FC<{ importer: () => Promise<{ default: ComponentType<any> }> }> = ({importer}) =>
{
	const LazyComponent = React.lazy(importer);

	return (
		<React.Suspense fallback={<ContainerProgress/>}>
			<LazyComponent/>
		</React.Suspense>
	);
};
