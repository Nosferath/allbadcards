import React from "react";
import AbstractGameDashboard from "../../../Shared/UI/AbstractGameDashboard";

export const HoldEmGameDashboard: React.FC = () =>
{
	return (
		<AbstractGameDashboard
			tagline={"play. bluff. win."}
			logo={<span>Hold Em</span>}
			joinButtons={null}
		/>
	);
}