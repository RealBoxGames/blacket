import { useEffect, useState } from "react";
import { useSocket } from "@stores/SocketStore/index";
import { SocketMessageType } from "@blacket/types";
import styles from "./cheatsEventOverlay.module.scss";

interface CheatsEventPayload {
    visual: "rgb" | "snow" | "none";
    text: string | null;
    durationSeconds: number;
}

export default function CheatsEventOverlay() {
    const { socket } = useSocket();
    const [event, setEvent] = useState<CheatsEventPayload | null>(null);

    useEffect(() => {
        if (!socket) return;

        let hideTimeout: ReturnType<typeof setTimeout>;

        const onEvent = (data: CheatsEventPayload) => {
            clearTimeout(hideTimeout);

            setEvent(data);
            hideTimeout = setTimeout(() => setEvent(null), data.durationSeconds * 1000);
        };

        socket.on(SocketMessageType.CHEATS_EVENT, onEvent);

        return () => {
            clearTimeout(hideTimeout);
            socket.off(SocketMessageType.CHEATS_EVENT, onEvent);
        };
    }, [socket]);

    if (!event) return null;

    return (
        <div className={styles.overlayContainer}>
            {event.visual === "rgb" && <div className={styles.rgbOverlay} />}

            {event.visual === "snow" && (
                <div className={styles.snowContainer}>
                    {Array.from({ length: 70 }).map((_, i) => (
                        <div
                            key={i}
                            className={styles.snowflake}
                            style={{
                                left: `${Math.random() * 100}%`,
                                width: `${4 + Math.random() * 6}px`,
                                height: `${4 + Math.random() * 6}px`,
                                animationDuration: `${5 + Math.random() * 6}s`,
                                animationDelay: `${Math.random() * 5}s`,
                                opacity: 0.4 + Math.random() * 0.6
                            }}
                        />
                    ))}
                </div>
            )}

            {event.text && <div className={styles.eventText}>{event.text}</div>}
        </div>
    );
}
