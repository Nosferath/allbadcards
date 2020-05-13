import {createSocketMessageClass} from "./SocketMessage";
import {GamePayload} from "../../Games/Game/Contract";

export const GameMessage = createSocketMessageClass<GamePayload>("game");