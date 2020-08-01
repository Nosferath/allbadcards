import * as React from "react";
import {ComponentType} from "react";
import {Redirect, Route, Switch} from "react-router";
import {ContainerProgress} from "@UI/AllBadCards/ContainerProgress";
import {SiteRoutes} from "../Global/Routes/Routes";
import {useDataStore} from "../Global/Utils/HookUtils";
import {AuthDataStore} from "../Global/DataStore/AuthDataStore";
import {UserDataStore} from "../Global/DataStore/UserDataStore";

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
				<Suspender importer={() => import("../Areas/AllBadCards/GameDashboard/GameDashboard")}/>
			</Route>
			<Route path={SiteRoutes.Game.path}>
				<Suspender importer={() => import("../Areas/AllBadCards/Game/Game")}/>
			</Route>
			<Route path={SiteRoutes.Games.path}>
				<Suspender importer={() => import("../Areas/AllBadCards/GameList/GameList")}/>
			</Route>
			<Route path={SiteRoutes.PackCreate.path}>
				<Suspender importer={() => import("../Areas/AllBadCards/Pack/Create")}/>
			</Route>
			<Route path={SiteRoutes.MyPacks.path}>
				<Suspender importer={() => import("../Areas/AllBadCards/Packs/MyPacks")}/>
			</Route>
			<Route path={SiteRoutes.PacksBrowser.path}>
				<Suspender importer={() => import("../Areas/AllBadCards/Packs/PacksBrowser")}/>
			</Route>
			<Route path={SiteRoutes.CardCastExport.path}>
				<Suspender importer={() => import("../Areas/AllBadCards/CardCastExport/CardCastExport")}/>
			</Route>
			<Route path={SiteRoutes.Settings.path}>
				<Suspender importer={() => import("../Areas/AllBadCards/User/Settings")}/>
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
