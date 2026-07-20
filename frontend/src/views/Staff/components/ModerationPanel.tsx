import { useEffect, useState } from "react";
import { useUser } from "@stores/UserStore/index";
import { Modal, Input, Button, ErrorContainer } from "@components/index";

import { PermissionTypeEnum } from "@blacket/types";

import { usePunishUser } from "@controllers/staff/usePunishUser";
import { useListPunishments } from "@controllers/staff/useListPunishments";
import { useRevokePunishment } from "@controllers/staff/useRevokePunishment";
import { useIpBanUser } from "@controllers/staff/useIpBanUser";

type Punishment = { id: number; type: string; reason: string; expiresAt: string; createdAt: string };

export default function ModerationPanel({ userId, username, showHeader = true }: { userId: string; username: string; showHeader?: boolean }) {
    const { user: currentUser } = useUser();

    const { punishUser } = usePunishUser();
    const { listPunishments } = useListPunishments();
    const { revokePunishment } = useRevokePunishment();
    const { ipBanUser } = useIpBanUser();

    const canBan = currentUser?.hasPermission(PermissionTypeEnum.BAN_USERS) ?? false;
    const canMute = currentUser?.hasPermission(PermissionTypeEnum.MUTE_USERS) ?? false;
    const canIpBan = currentUser?.hasPermission(PermissionTypeEnum.BLACKLIST_USERS) ?? false;

    const [error, setError] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [duration, setDuration] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [punishments, setPunishments] = useState<Punishment[]>([]);

    useEffect(() => {
        listPunishments(userId).then((res) => setPunishments(res.data)).catch(() => setPunishments([]));
    }, [userId]);

    const durationMinutes = () => duration.trim() === "" ? undefined : Number(duration);

    const submit = (type: "BAN" | "MUTE") => {
        if (reason.trim() === "") return setError("A reason is required.");

        setLoading(true);
        setError("");

        punishUser(userId, type, reason, durationMinutes())
            .then((res) => {
                setPunishments((current) => [res.data, ...current]);
                setReason("");
                setDuration("");
            })
            .catch((res) => setError(res.data?.message ?? `Failed to ${type === "BAN" ? "ban" : "mute"} user.`))
            .finally(() => setLoading(false));
    };

    const submitIpBan = () => {
        if (reason.trim() === "") return setError("A reason is required.");

        setLoading(true);
        setError("");

        ipBanUser(userId, reason, durationMinutes())
            .then((res) => {
                setPunishments((current) => [res.data, ...current]);
                setReason("");
                setDuration("");
            })
            .catch((res) => setError(res.data?.message ?? "Failed to IP ban user."))
            .finally(() => setLoading(false));
    };

    const revoke = (punishmentId: number) => {
        setLoading(true);
        setError("");

        revokePunishment(punishmentId)
            .then(() => setPunishments((current) => current.filter((p) => p.id !== punishmentId)))
            .catch((res) => setError(res.data?.message ?? "Failed to revoke punishment."))
            .finally(() => setLoading(false));
    };

    return (
        <>
            {showHeader && <Modal.ModalHeader>Moderate {username}</Modal.ModalHeader>}

            <Modal.ModalBody>
                {!showHeader && <div style={{ fontWeight: "bold", marginBottom: 5 }}>Moderation</div>}

                {punishments.length > 0 && <div style={{ marginBottom: 10 }}>
                    {punishments.map((p) => <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <span>
                            <b>{p.type}</b> - {p.reason} (expires {new Date(p.expiresAt).getTime() - Date.now() > 1000 * 60 * 60 * 24 * 365 ? "never" : new Date(p.expiresAt).toLocaleString()})
                        </span>

                        <Button.GenericButton onClick={() => revoke(p.id)}>Revoke</Button.GenericButton>
                    </div>)}
                </div>}

                <Input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                <Input type="number" placeholder="Duration in minutes (blank = permanent)" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </Modal.ModalBody>

            <Modal.ModalButtonContainer loading={loading}>
                {canBan && <Button.GenericButton onClick={() => submit("BAN")}>Ban</Button.GenericButton>}
                {canMute && <Button.GenericButton onClick={() => submit("MUTE")}>Mute</Button.GenericButton>}
                {canIpBan && <Button.GenericButton onClick={submitIpBan}>IP Ban</Button.GenericButton>}
            </Modal.ModalButtonContainer>

            {error !== "" && <ErrorContainer>{error}</ErrorContainer>}
        </>
    );
}
