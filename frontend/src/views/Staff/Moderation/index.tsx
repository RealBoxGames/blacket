import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@stores/UserStore/index";
import { useModal } from "@stores/ModalStore/index";
import { SearchBox, Button } from "@components/index";
import styles from "../staff.module.scss";

import { PermissionTypeEnum } from "@blacket/types";

import { useSearchUsersForModeration } from "@controllers/staff/useSearchUsersForModeration";
import ModerationPanel from "../components/ModerationPanel";

type ModerationUser = { id: string; username: string };

export default function ModerationPage() {
    const { user } = useUser();
    const { createModal } = useModal();
    const { searchUsersForModeration } = useSearchUsersForModeration();

    const [search, setSearch] = useState<string>("");
    const [results, setResults] = useState<ModerationUser[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    if (!user || !user.hasPermission(PermissionTypeEnum.MUTE_USERS)) return <Navigate to="/login" />;

    const doSearch = () => {
        setLoading(true);

        searchUsersForModeration(search)
            .then((res) => setResults(res.data))
            .catch(() => setResults([]))
            .finally(() => setLoading(false));
    };

    return (
        <div className={styles.panelContainer}>
            <div className={styles.userManager}>
                <SearchBox
                    placeholder="Search for a user..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") doSearch(); }}
                    buttons={[{ icon: "fas fa-search", tooltip: "Search", onClick: doSearch }]}
                />

                {loading && <div className={styles.status}>Loading...</div>}
                {!loading && results.length === 0 && <div className={styles.status}>No users loaded. Search above to get started.</div>}

                <div className={styles.userList}>
                    {results.map((moderationUser) => (
                        <div key={moderationUser.id} className={styles.userRow}>
                            <div className={styles.userInfo}>
                                <div className={styles.username}>{moderationUser.username}</div>
                            </div>

                            <Button.GenericButton onClick={() => createModal(<ModerationPanel userId={moderationUser.id} username={moderationUser.username} />)}>Moderate</Button.GenericButton>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
