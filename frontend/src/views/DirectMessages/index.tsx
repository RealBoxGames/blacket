import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useUser } from "@stores/UserStore/index";
import { useChat, useChatStore } from "@stores/ChatStore/index";
import { Blook, Username } from "@components/index";
import { ChatMessagesContainer, ChatMessage, InputContainer } from "../Chat/components";
import { useListDms } from "@controllers/chat/useListDms";
import { useFindOrCreateDm } from "@controllers/chat/useFindOrCreateDm";
import styles from "./directMessages.module.scss";

type DmEntry = { roomId: number; otherUser: { id: string; username: string; avatar?: { blookId: number; shiny: boolean } | null } | null };

export default function DirectMessages() {
    const { user, getUserAvatarPath } = useUser();
    const { userId } = useParams<{ userId?: string }>();
    const navigate = useNavigate();

    const { listDms } = useListDms();
    const { findOrCreateDm } = useFindOrCreateDm();

    const { messages } = useChat();
    const { room, setRoom } = useChatStore();

    const [dms, setDms] = useState<DmEntry[]>([]);
    const [activeOtherUser, setActiveOtherUser] = useState<DmEntry["otherUser"]>(null);

    if (!user) return <Navigate to="/login" />;

    const refreshDms = () => {
        listDms().then((res) => setDms(res.data)).catch(() => setDms([]));
    };

    useEffect(() => {
        refreshDms();
    }, []);

    useEffect(() => {
        if (!userId) return;

        findOrCreateDm(userId)
            .then((res) => {
                setRoom(res.roomId);
                refreshDms();
            })
            .catch(() => { });
    }, [userId]);

    useEffect(() => {
        const entry = dms.find((d) => d.roomId === room);
        if (entry) setActiveOtherUser(entry.otherUser);
    }, [room, dms]);

    const memoizedMessages = useMemo(() => messages, [messages.length, messages.map((m) => m.id).join(",")]);

    return (
        <div className={styles.container}>
            <div className={styles.dmList}>
                {dms.length === 0 && <div className={styles.status}>No conversations yet. Visit someone's profile and click Direct Message to start one.</div>}

                {dms.map((dm) => dm.otherUser && (
                    <div
                        key={dm.roomId}
                        className={styles.dmListItem}
                        data-active={dm.roomId === room}
                        onClick={() => navigate(`/direct-messages/${dm.otherUser!.id}`)}
                    >
                        <Blook src={getUserAvatarPath(dm.otherUser as any)} shiny={dm.otherUser.avatar?.shiny} className={styles.dmAvatar} />
                        <Username user={dm.otherUser as any} />
                    </div>
                ))}
            </div>

            <div className={styles.dmChat}>
                {!userId && <div className={styles.status}>Select a conversation to start messaging.</div>}

                {userId && (
                    <>
                        {activeOtherUser && <div className={styles.dmChatHeader}>
                            <Username user={activeOtherUser as any} />
                        </div>}

                        <ChatMessagesContainer aboveInput={false}>
                            {memoizedMessages.map((message, index) => {
                                const prevMessage = memoizedMessages[index + 1];
                                const isNewUser = !prevMessage || prevMessage.authorId !== message.authorId;

                                return <ChatMessage
                                    key={message.id}
                                    message={message}
                                    newUser={isNewUser}
                                    mentionsMe={false}
                                    isSending={message.nonce !== undefined}
                                    isEditing={false}
                                />;
                            })}
                        </ChatMessagesContainer>

                        <InputContainer placeholder={`Message ${activeOtherUser?.username ?? ""}`} maxLength={2048} />
                    </>
                )}
            </div>
        </div>
    );
}
