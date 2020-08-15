import * as React from "react";
import {RouteComponentProps, withRouter} from "react-router";

interface IErrorBoundaryProps
{
}

interface DefaultProps
{
}

type Props = IErrorBoundaryProps & DefaultProps;
type State = IErrorBoundaryState;

interface IErrorBoundaryState
{
	hasError: boolean;
	error: Error | null;
	errorInfo: React.ErrorInfo | null;
}

/** This class exists to handle error cases more gracefully than having the app just disappear.
 *  * If a child component errors out, it will display a message with error details */
class ThrowawayErrorBoundaryInternal extends React.Component<RouteComponentProps<{}>, IErrorBoundaryState>
{
	private static EmailLineBreak = "%0D%0A";

	constructor(props: RouteComponentProps<{}>)
	{
		super(props);

		this.state = {
			hasError: false,
			error: null,
			errorInfo: null,
		};
	}

	public componentDidCatch(error: Error, errorInfo: React.ErrorInfo)
	{
		this.setState({hasError: true, error, errorInfo});
	}

	public render()
	{
		if (this.state.hasError)
		{
			return null;
		}

		return this.props.children;
	}
}

export const ThrowawayErrorBoundary = withRouter(ThrowawayErrorBoundaryInternal);