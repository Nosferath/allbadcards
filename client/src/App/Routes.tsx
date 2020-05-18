import * as React from "react";
import {ComponentType} from "react";
import {Redirect, Route, Switch} from "react-router";
import {ContainerProgress} from "../UI/ContainerProgress";
import {SiteRoutes} from "../Global/Routes/Routes";

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

export class Routes extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {};
	}

	public render()
	{
		return (
			<Switch>
				<Route exact path={"/"}>
					<Suspender importer={() => import("../Areas/GameDashboard/GameDashboard")}/>
				</Route>
				<Route path={SiteRoutes.Game.path}>
					<Suspender importer={() => import("../Areas/Game/Game")}/>
				</Route>
				<Route path={SiteRoutes.Games.path}>
					<Suspender importer={() => import("../Areas/GameList/GameList")}/>
				</Route>
				<Route path={SiteRoutes.CardCastExport.path}>
					<Suspender importer={() => import("../Areas/CardCastExport/CardCastExport")}/>
				</Route>
				<Route>
					<Redirect to={"/"}/>
				</Route>
			</Switch>
		);
	}
}

const Suspender: React.FC<{ importer: () => Promise<{ default: ComponentType<any> }> }> = ({importer}) =>
{
	const LazyComponent = React.lazy(importer);

	return (
		<React.Suspense fallback={<ContainerProgress/>}>
			<LazyComponent/>
		</React.Suspense>
	);
};
