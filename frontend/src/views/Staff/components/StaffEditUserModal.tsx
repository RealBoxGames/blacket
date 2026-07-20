import { useEffect, useState } from "react";
import { useModal } from "@stores/ModalStore/index";
import { useUser } from "@stores/UserStore/index";
import { Modal, Button, ErrorContainer, Toggle } from "@components/index";

import { PermissionTypeEnum, StaffUserEntity } from "@blacket/types";

import { useStaffGroups } from "@controllers/staff/useStaffGroups";
import { useEditUserGroups } from "@controllers/staff/useEditUserGroups";
import { useDeleteUser } from "@controllers/staff/useDeleteUser";
import ModerationPanel from "./ModerationPanel";

type StaffGroup = { id: number; name: string; priority: number };

export default function StaffEditUserModal({ staffUser, isSuperAdmin, onUpdated, onDeleted }: {
    staffUser: StaffUserEntity;
    isSuperAdmin: boolean;
    onUpdated: (updated: StaffUserEntity) => void;
    onDeleted?: (userId: string) => void;
}) {
    const { closeModal } = useModal();
    const { user: currentUser } = useUser();

    const { getGroups } = useStaffGroups();
    const { editUserGroups } = useEditUserGroups();
    const { deleteUser } = useDeleteUser();

    const [error, setError] = useState<string>("");

    const [groups, setGroups] = useState<StaffGroup[]>([]);
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>(staffUser.groups.map((g) => g.id));
    const [groupsLoading, setGroupsLoading] = useState<boolean>(false);

    const canModerate = (currentUser?.hasPermission(PermissionTypeEnum.BAN_USERS) ||
        currentUser?.hasPermission(PermissionTypeEnum.MUTE_USERS) ||
        currentUser?.hasPermission(PermissionTypeEnum.BLACKLIST_USERS)) ?? false;

    const [deleteConfirming, setDeleteConfirming] = useState<boolean>(false);
    const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!isSuperAdmin) return;

        getGroups().then((res) => setGroups(res.data)).catch(() => setGroups([]));
    }, [isSuperAdmin]);

    const toggleGroup = (id: number) => {
        setSelectedGroupIds((current) => current.includes(id) ? current.filter((g) => g !== id) : [...current, id]);
    };

    const submitDelete = () => {
        if (!deleteConfirming) return setDeleteConfirming(true);

        setDeleteLoading(true);
        setError("");

        deleteUser(staffUser.id)
            .then(() => {
                onDeleted?.(staffUser.id);
                closeModal();
            })
            .catch((res) => setError(res.data?.message ?? "Failed to delete account."))
            .finally(() => setDeleteLoading(false));
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

            {canModerate && <ModerationPanel userId={staffUser.id} username={staffUser.username} showHeader={false} />}

            {isSuperAdmin && <>
                <Modal.ModalBody>
                    <div style={{ fontWeight: "bold", marginBottom: 5 }}>Roles</div>

                    {groups.map((group) => <Toggle key={group.id} checked={selectedGroupIds.includes(group.id)} onClick={() => toggleGroup(group.id)}>{group.name}</Toggle>)}
                </Modal.ModalBody>

                <Modal.ModalButtonContainer loading={groupsLoading}>
                    <Button.GenericButton onClick={saveGroups}>Save Roles</Button.GenericButton>
                </Modal.ModalButtonContainer>

                <Modal.ModalBody>
                    <div style={{ fontWeight: "bold", marginBottom: 5, color: "#E02424" }}>Danger Zone</div>
                    {deleteConfirming && <div>Click again to permanently delete this account.</div>}
                </Modal.ModalBody>

                <Modal.ModalButtonContainer loading={deleteLoading}>
                    <Button.GenericButton onClick={submitDelete}>{deleteConfirming ? "Confirm Delete Account" : "Delete Account"}</Button.GenericButton>
                </Modal.ModalButtonContainer>
            </>}

            {error !== "" && <ErrorContainer>{error}</ErrorContainer>}

            <Modal.ModalButtonContainer>
                <Button.GenericButton onClick={closeModal}>Close</Button.GenericButton>
            </Modal.ModalButtonContainer>
        </>
    );
}
