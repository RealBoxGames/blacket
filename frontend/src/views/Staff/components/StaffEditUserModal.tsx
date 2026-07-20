import { useEffect, useState } from "react";
import { useModal } from "@stores/ModalStore/index";
import { useData } from "@stores/DataStore/index";
import { useUser } from "@stores/UserStore/index";
import { Modal, Input, Button, ErrorContainer, Dropdown, Toggle } from "@components/index";

import { PermissionTypeEnum, StaffUserEntity } from "@blacket/types";

import { useEditUserCurrency } from "@controllers/staff/useEditUserCurrency";
import { useGiveUserBlook } from "@controllers/staff/useGiveUserBlook";
import { useSetUserAvatar } from "@controllers/staff/useSetUserAvatar";
import { useStaffGroups } from "@controllers/staff/useStaffGroups";
import { useEditUserGroups } from "@controllers/staff/useEditUserGroups";
import { usePunishUser } from "@controllers/staff/usePunishUser";
import { useListPunishments } from "@controllers/staff/useListPunishments";
import { useRevokePunishment } from "@controllers/staff/useRevokePunishment";

type StaffGroup = { id: number; name: string; priority: number };
type Punishment = { id: number; type: string; reason: string; expiresAt: string; createdAt: string };

export default function StaffEditUserModal({ staffUser, isSuperAdmin, onUpdated }: {
    staffUser: StaffUserEntity;
    isSuperAdmin: boolean;
    onUpdated: (updated: StaffUserEntity) => void;
}) {
    const { closeModal } = useModal();
    const { blooks } = useData();
    const { user: currentUser } = useUser();

    const { editUserCurrency } = useEditUserCurrency();
    const { giveUserBlook } = useGiveUserBlook();
    const { setUserAvatar } = useSetUserAvatar();
    const { getGroups } = useStaffGroups();
    const { editUserGroups } = useEditUserGroups();
    const { punishUser } = usePunishUser();
    const { listPunishments } = useListPunishments();
    const { revokePunishment } = useRevokePunishment();

    const [error, setError] = useState<string>("");

    const [tokens, setTokens] = useState<number>(staffUser.tokens);
    const [diamonds, setDiamonds] = useState<number>(staffUser.diamonds);
    const [crystals, setCrystals] = useState<number>(staffUser.crystals);
    const [currencyLoading, setCurrencyLoading] = useState<boolean>(false);

    const blookOptions = blooks.map((blook) => ({ label: blook.name, value: blook.id }));

    const [blookId, setBlookId] = useState<number | null>(null);
    const [shiny, setShiny] = useState<boolean>(false);
    const [giveLoading, setGiveLoading] = useState<boolean>(false);

    const [avatarBlookId, setAvatarBlookId] = useState<number | null>(null);
    const [avatarShiny, setAvatarShiny] = useState<boolean>(false);
    const [avatarLoading, setAvatarLoading] = useState<boolean>(false);

    const [groups, setGroups] = useState<StaffGroup[]>([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>(staffUser.groups.map((g) => g.id));
    const [groupsLoading, setGroupsLoading] = useState<boolean>(false);

    const canBan = currentUser?.hasPermission(PermissionTypeEnum.BAN_USERS) ?? false;
    const canMute = currentUser?.hasPermission(PermissionTypeEnum.MUTE_USERS) ?? false;

    const [punishReason, setPunishReason] = useState<string>("");
    const [punishDuration, setPunishDuration] = useState<string>("");
    const [punishLoading, setPunishLoading] = useState<boolean>(false);
    const [punishments, setPunishments] = useState<Punishment[]>([]);

    useEffect(() => {
        if (!isSuperAdmin) return;

        getGroups().then((res) => setGroups(res.data)).catch(() => setGroups([]));
    }, [isSuperAdmin]);

    useEffect(() => {
        if (!canBan && !canMute) return;

        listPunishments(staffUser.id).then((res) => setPunishments(res.data)).catch(() => setPunishments([]));
    }, [canBan, canMute]);

    const saveCurrency = () => {
        setCurrencyLoading(true);
        setError("");

        editUserCurrency(staffUser.id, { tokens, diamonds, crystals })
            .then((res) => onUpdated(res.data))
            .catch((res) => setError(res.data?.message ?? "Failed to update currency."))
            .finally(() => setCurrencyLoading(false));
    };

    const giveBlook = () => {
        if (blookId === null) return setError("Pick a blook to give first.");

        setGiveLoading(true);
        setError("");

        giveUserBlook(staffUser.id, blookId, shiny)
            .then(() => alert(`Gave ${staffUser.username} the${shiny ? " shiny" : ""} ${blooks.find((b) => b.id === blookId)?.name}.`))
            .catch((res) => setError(res.data?.message ?? "Failed to give blook."))
            .finally(() => setGiveLoading(false));
    };

    const saveAvatar = () => {
        if (avatarBlookId === null) return setError("Pick a blook for the avatar first.");

        setAvatarLoading(true);
        setError("");

        setUserAvatar(staffUser.id, avatarBlookId, avatarShiny)
            .then((res) => onUpdated(res.data))
            .catch((res) => setError(res.data?.message ?? "Failed to set avatar."))
            .finally(() => setAvatarLoading(false));
    };

    const toggleGroup = (id: number) => {
        setSelectedGroupIds((current) => current.includes(id) ? current.filter((g) => g !== id) : [...current, id]);
    };

    const submitPunish = (type: "BAN" | "MUTE") => {
        if (punishReason.trim() === "") return setError("A reason is required.");

        setPunishLoading(true);
        setError("");

        const durationMinutes = punishDuration.trim() === "" ? undefined : Number(punishDuration);

        punishUser(staffUser.id, type, punishReason, durationMinutes)
            .then((res) => {
                setPunishments((current) => [res.data, ...current]);
                setPunishReason("");
                setPunishDuration("");
            })
            .catch((res) => setError(res.data?.message ?? `Failed to ${type === "BAN" ? "ban" : "mute"} user.`))
            .finally(() => setPunishLoading(false));
    };

    const revoke = (punishmentId: number) => {
        setPunishLoading(true);
        setError("");

        revokePunishment(punishmentId)
            .then(() => setPunishments((current) => current.filter((p) => p.id !== punishmentId)))
            .catch((res) => setError(res.data?.message ?? "Failed to revoke punishment."))
            .finally(() => setPunishLoading(false));
    };

    const saveGroups = () => {
        setGroupsLoading(true);
        setError("");

        editUserGroups(staffUser.id, selectedGroupIds)
            .then((res) => onUpdated(res.data))
            .catch((res) => setError(res.data?.message ?? "Failed to update roles."))
            .finally(() => setGroupsLoading(false));
    };

    return (
        <>
            <Modal.ModalHeader>Edit {staffUser.username}</Modal.ModalHeader>

            <Modal.ModalBody>
                <div style={{ fontWeight: "bold", marginBottom: 5 }}>Currency</div>

                <Input type="number" placeholder="Tokens" value={tokens} onChange={(e) => setTokens(Number(e.target.value))} />
                <Input type="number" placeholder="Diamonds" value={diamonds} onChange={(e) => setDiamonds(Number(e.target.value))} />
                <Input type="number" placeholder="Crystals" value={crystals} onChange={(e) => setCrystals(Number(e.target.value))} />
            </Modal.ModalBody>

            <Modal.ModalButtonContainer loading={currencyLoading}>
                <Button.GenericButton onClick={saveCurrency}>Save Currency</Button.GenericButton>
            </Modal.ModalButtonContainer>

            <Modal.ModalBody>
                <div style={{ fontWeight: "bold", marginBottom: 5 }}>Give Blook</div>

                <Dropdown options={blookOptions} onChange={(value) => setBlookId(value)} />
                <Toggle checked={shiny} onClick={() => setShiny((s) => !s)}>Shiny</Toggle>
            </Modal.ModalBody>

            <Modal.ModalButtonContainer loading={giveLoading}>
                <Button.GenericButton onClick={giveBlook}>Give Blook</Button.GenericButton>
            </Modal.ModalButtonContainer>

            <Modal.ModalBody>
                <div style={{ fontWeight: "bold", marginBottom: 5 }}>Set Avatar (PFP)</div>

                <Dropdown options={blookOptions} onChange={(value) => setAvatarBlookId(value)} />
                <Toggle checked={avatarShiny} onClick={() => setAvatarShiny((s) => !s)}>Shiny</Toggle>
            </Modal.ModalBody>

            <Modal.ModalButtonContainer loading={avatarLoading}>
                <Button.GenericButton onClick={saveAvatar}>Set Avatar</Button.GenericButton>
            </Modal.ModalButtonContainer>

            {(canBan || canMute) && <>
                <Modal.ModalBody>
                    <div style={{ fontWeight: "bold", marginBottom: 5 }}>Moderation</div>

                    {punishments.length > 0 && <div style={{ marginBottom: 10 }}>
                        {punishments.map((p) => <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <span>
                                <b>{p.type}</b> - {p.reason} (expires {new Date(p.expiresAt).getTime() - Date.now() > 1000 * 60 * 60 * 24 * 365 ? "never" : new Date(p.expiresAt).toLocaleString()})
                            </span>

                            <Button.GenericButton onClick={() => revoke(p.id)}>Revoke</Button.GenericButton>
                        </div>)}
                    </div>}

                    <Input placeholder="Reason" value={punishReason} onChange={(e) => setPunishReason(e.target.value)} />
                    <Input type="number" placeholder="Duration in minutes (blank = permanent)" value={punishDuration} onChange={(e) => setPunishDuration(e.target.value)} />
                </Modal.ModalBody>

                <Modal.ModalButtonContainer loading={punishLoading}>
                    {canBan && <Button.GenericButton onClick={() => submitPunish("BAN")}>Ban</Button.GenericButton>}
                    {canMute && <Button.GenericButton onClick={() => submitPunish("MUTE")}>Mute</Button.GenericButton>}
                </Modal.ModalButtonContainer>
            </>}

            {isSuperAdmin && <>
                <Modal.ModalBody>
                    <div style={{ fontWeight: "bold", marginBottom: 5 }}>Roles</div>

                    {groups.map((group) => <Toggle key={group.id} checked={selectedGroupIds.includes(group.id)} onClick={() => toggleGroup(group.id)}>{group.name}</Toggle>)}
                </Modal.ModalBody>

                <Modal.ModalButtonContainer loading={groupsLoading}>
                    <Button.GenericButton onClick={saveGroups}>Save Roles</Button.GenericButton>
                </Modal.ModalButtonContainer>
            </>}

            {error !== "" && <ErrorContainer>{error}</ErrorContainer>}

            <Modal.ModalButtonContainer>
                <Button.GenericButton onClick={closeModal}>Close</Button.GenericButton>
            </Modal.ModalButtonContainer>
        </>
    );
}
