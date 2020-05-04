import * as React from "react";
import {Card, CardActions} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import {ReactNode} from "react";
import sanitize from "sanitize-html";
import {GameDataStore} from "../Global/DataStore/GameDataStore";

interface IBlackCardProps
{
	children?: string;
	packId?: string;
}

interface DefaultProps
{
}

type Props = IBlackCardProps & DefaultProps;
type State = IBlackCardState;

interface IBlackCardState
{
	elevation: number;
}

export class BlackCard extends React.Component<Props, State>
{
	constructor(props: Props)
	{
		super(props);

		this.state = {
			elevation: 2
		};
	}

	private onMouseEnter = () =>
	{
		this.setState({
			elevation: 10
		});
	};

	private onMouseLeave = () =>
	{
		this.setState({
			elevation: 2
		});
	};

	public render()
	{
		const children = this.props.children?.replace(/(_){1,}\1/g, "_").replace(/_/g, "_________") ?? "";
		const sanitized = sanitize(children);

		const packId = this.props.packId;
		let pack;
		if(packId)
		{
			pack = GameDataStore.state.loadedPacks.find(p => p.packId === packId);
		}

		return (
			<Card
				style={{
					minHeight: "25vh",
					cursor: "default",
					backgroundColor: "black",
					display: "flex",
					flexDirection: "column"
				}}
				elevation={this.state.elevation}
				onMouseEnter={this.onMouseEnter}
				onMouseLeave={this.onMouseLeave}
			>
				<CardContent style={{flex: 1}}>
					{pack && (
						<Typography variant={"caption"} style={{color: "white", opacity: 0.5}}>
							<em>{pack.name}</em>
						</Typography>
					)}
					<Typography variant={"h6"} style={{color: "white"}}>
						<span dangerouslySetInnerHTML={{__html: sanitized}} />
					</Typography>
				</CardContent>
				<CardActions>
					<Typography variant={"caption"} style={{color: "white", display: "flex", alignContent: "center"}}>
						<img src={"/public/logo-tiny-inverted.png"} width={18} style={{marginRight: "0.5rem"}} /> all bad cards
					</Typography>
				</CardActions>
			</Card>
		);
	}
}