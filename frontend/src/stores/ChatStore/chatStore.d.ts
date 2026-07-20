
import { Message, PublicUser } from "@blacket/types";

export interface ClientMessage extends Message {
    author: PublicUser;
    replyingTo?: ClientMessage | null;
    nonce?: string;
    error?: string;
}

export interface TypingUser {
    userId: string;
    startedTypingAt: number;
}

export interface DmEntry {
    roomId: number;
    otherUser: { id: string; username: string; avatar?: { blookId: number; shiny: boolean } | null } | null;
}

export interface ChatStore {
    messages: ClientMessage[];
    loadingMessages: boolean;
    usersTyping: TypingUser[];
    replyingTo: ClientMessage | null;
    setReplyingTo: (message: ClientMessage | null) => void;
    editing: ClientMessage | null;
    setEditing: (message: ClientMessage | null) => void;
    fetchMessages: (roomOverride?: number) => void;
    sendMessage: (content: string) => void;
    startTyping: () => void;
    mentions: number;
    resetMentions: () => void;
    room: number;
    setRoom: (room: number) => void;
    _typingTimeout: number | null;
    unreadDmUserIds: string[];
    markDmUnread: (userId: string) => void;
    clearDmUnread: (userId: string) => void;
    dms: DmEntry[];
    setDms: (dms: DmEntry[]) => void;
    touchDmRoom: (roomId: number) => void;
}
