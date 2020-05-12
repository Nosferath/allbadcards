import {DataStore} from "./DataStore";
import {ChatPayload} from "../Platform/Contract";
import {SocketDataStore} from "./SocketDataStore";
import deepEqual from "deep-equal";

export interface ChatDataStorePayload
{
	chat: ChatPayload[];
	unseenChatMessages: number;
	newMessages: boolean;
}

class _ChatDataStore extends DataStore<ChatDataStorePayload>
{
	private initialized = false;

	public static Instance = new _ChatDataStore({
		chat: [],
		unseenChatMessages: 0,
		newMessages: false
	});

	public initialize()
	{
		if (this.initialized)
		{
			return;
		}

		this.initialized = true;

		SocketDataStore.listen(data =>
		{
			if (data.updateType === "chat" && data.chatPayload)
			{
				const lastMessageSame = deepEqual(this.state.chat[this.state.chat.length - 1], data.chatPayload);
				this.update({
					chat: !lastMessageSame
						? [...this.state.chat, data.chatPayload]
						: this.state.chat,
					unseenChatMessages: this.state.unseenChatMessages + (lastMessageSame ? 0 : 1)
				});
			}
		}, undefined, false);
	}

	public acknowledge()
	{
		this.update({
			unseenChatMessages: 0
		});
	}
}

export const ChatDataStore = _ChatDataStore.Instance;