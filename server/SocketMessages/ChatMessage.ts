import {createSocketMessageClass} from "./SocketMessage";
import {ChatPayload, GamePayload} from "../Games/Contract";

export const ChatMessage = createSocketMessageClass<ChatPayload>("chat");