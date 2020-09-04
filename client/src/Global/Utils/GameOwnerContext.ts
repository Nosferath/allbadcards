import React from "react";
import {GamePlayer} from "@AbcGlobal/Platform/Contract";

export const GameOwnerContext = React.createContext<GamePlayer | null>(null);
