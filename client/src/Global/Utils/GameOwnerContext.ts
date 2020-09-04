import {GamePlayer} from "@Global/Platform/Contract";
import React from "react";

export const GameOwnerContext = React.createContext<GamePlayer | null>(null);
