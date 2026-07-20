import { create } from "zustand";

import { useUser } from "@stores/UserStore";
import { useCachedUser } from "@stores/CachedUserStore";
import { useMessages } from "@controllers/chat/messages/useMessages";
import { useStartTyping } from "@controllers/chat/messages/roomId/useStartTyping";
import { useSendMessage } from "@controllers/chat/messages/useSendMessage";
import { useExecuteCommand } from "@controllers/chat/useExecuteCommand";

import { ClientMessage, ChatStore } from "./chatStore.d";

const COMMAND_REGEX = /^\/(\w+)(?:\s+([\s\S]*))?$/;

export const useChatStore = create<ChatStore>((set) => ({
    messages: [],
    loadingMessages: false,
    usersTyping: [],
    replyingTo: null,
    editing: null,
    mentions: 0,
    room: 0,

    setRoom: (room) => set({ room }),

    unreadDmUserIds: [],
    markDmUnread: (userId) => set((s) => s.unreadDmUserIds.includes(userId) ? s : { unreadDmUserIds: [...s.unreadDmUserIds, userId] }),
    clearDmUnread: (userId) => set((s) => s.unreadDmUserIds.includes(userId) ? { unreadDmUserIds: s.unreadDmUserIds.filter((id) => id !== userId) } : s),

    dms: [],
    setDms: (dms) => set({ dms }),
    touchDmRoom: (roomId) => set((s) => {
        const index = s.dms.findIndex((dm) => dm.roomId === roomId);
        if (index <= 0) return s;

        const dms = [...s.dms];
        const [entry] = dms.splice(index, 1);
        dms.unshift(entry);

        return { dms };
    }),

    setReplyingTo: (message) => set({ replyingTo: message }),
    setEditing: (message) => set({ editing: message }),

    resetMentions: () => set({ mentions: 0 }),

    fetchMessages: () => { },
    sendMessage: () => { },
    startTyping: () => { },

    _typingTimeout: null
}));

export function useChat() {
    const chatStore = useChatStore();

    const { user } = useUser();
    const { addCachedUser } = useCachedUser();
    const { getMessages } = useMessages();

    const fetchMessages = async (roomOverride?: number): Promise<ClientMessage[]> => {
        if (!user) return [];

        const r = roomOverride ?? chatStore.room;

        useChatStore.setState({ loadingMessages: true });

        const messages = await getMessages(r, 50).then((res) => res.data).catch(() => []);
        const userMap = new Map<string, boolean>();

        for (const m of messages) userMap.set(m.authorId, true);

        await Promise.all(Array.from(userMap.keys()).map((uid) => addCachedUser(uid)));

        // if the room changed again while this fetch was in flight (e.g. rapidly
        // switching between DMs), a slower earlier fetch resolving after a newer
        // one would otherwise clobber the correct messages with the wrong room's -
        // drop the result instead of committing it
        if (useChatStore.getState().room !== r) return messages;

        useChatStore.setState({ messages, loadingMessages: false });

        return messages;
    };

    const sendMessage = async (content: string) => {
        if (!user) return;

        const commandMatch = content.trim().match(COMMAND_REGEX);
        if (commandMatch) {
            const [, commandName, args] = commandMatch;

            useExecuteCommand().executeCommand(chatStore.room, commandName, args ?? "")
                .catch((res) => alert(res.data?.message ?? `Failed to run /${commandName}.`));

            return;
        }

        const nonce = Date.now().toString(36);
        const now = new Date();

        const message: ClientMessage = {
            id: nonce,
            roomId: chatStore.room,
            authorId: user.id,
            author: user,
            content,
            color: user.settings.chatColor,
            mentions: [],
            replyingToId: chatStore.replyingTo?.id ?? null,
            replyingTo: chatStore.replyingTo ?? undefined,
            createdAt: now,
            updatedAt: now,
            discordMessageId: null,
            deletedAt: null,
            editedAt: null,
            nonce
        };

        useChatStore.setState((s) => ({
            messages: [message, ...s.messages],
            replyingTo: null
        }));

        useSendMessage()
            .sendMessage(chatStore.room, {
                content,
                nonce,
                replyingTo: chatStore.replyingTo?.id
            }).catch((err) => {
                message.error = err?.data?.message || "Something went wrong.";

                useChatStore.setState((s) => ({ messages: s.messages.map((m) => (m.nonce === nonce ? message : m)) }));
            });
    };

    const startTyping = () => {
        const now = Date.now();

        const typingTimeout = chatStore._typingTimeout;
        if (typingTimeout && now - typingTimeout < 2000) return;

        useChatStore.setState({ _typingTimeout: now });
        useStartTyping().startTyping(chatStore.room);
    };

    return {
        ...chatStore,
        fetchMessages,
        sendMessage,
        startTyping
    };
}
