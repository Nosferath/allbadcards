import {createSocketMessageClass} from "./SocketMessage";
import {ChatPayload} from "../../Games/Game/Contract";

export const ChatMessage = createSocketMessageClass<ChatPayload>("chat");