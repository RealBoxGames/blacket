import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@stores/UserStore/index";
import { Input, Button, ErrorContainer, Dropdown } from "@components/index";
import styles from "../staff.module.scss";

import { PermissionTypeEnum } from "@blacket/types";

type Booster = { id: number; type: string; multiplier: number; expiresAt: string; createdAt: string };

const TYPE_OPTIONS = [
    { label: "Chance", value: "CHANCE" },
    { label: "Experience", value: "EXPERIENCE" },
    { label: "Shiny", value: "SHINY" }
];

export default function StaffBoostersPage() {
    const { user } = useUser();

    const [boosters, setBoosters] = useState<Booster[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    const [type, setType] = useState<string>("CHANCE");
    const [multiplier, setMultiplier] = useState<string>("2");
    const [durationMinutes, setDurationMinutes] = useState<string>("60");
    const [creating, setCreating] = useState<boolean>(false);

    if (!user || !user.hasPermission(PermissionTypeEnum.MANAGE_DATA)) return <Navigate to="/login" />;

    const refresh = () => {
        setLoading(true);

        window.fetch2.get("/api/staff/cms/boosters")
            .then((res: Fetch2Response) => setBoosters(res.data))
            .catch(() => setBoosters([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        refresh();
    }, []);

    const submit = () => {
        setCreating(true);
        setError("");

        window.fetch2.post("/api/staff/cms/boosters", { type, multiplier: Number(multiplier), durationMinutes: Number(durationMinutes) })
            .then(() => refresh())
            .catch((res: Fetch2Response) => setError(res.data?.message ?? "Failed to activate booster."))
            .finally(() => setCreating(false));
    };

    const revoke = (id: number) => {
        window.fetch2.delete(`/api/staff/cms/boosters/${id}`, {})
            .then(() => setBoosters((current) => current.filter((b) => b.id !== id)))
            .catch((res: Fetch2Response) => setError(res.data?.message ?? "Failed to revoke booster."));
    };

    return (
        <div className={styles.panelContainer}>
            <div className={styles.userManager}>
                <div style={{ fontWeight: "bold", marginBottom: 5 }}>Activate Global Booster</div>

                <Dropdown options={TYPE_OPTIONS} onChange={(value) => setType(value)} />
                <Input type="number" placeholder="Multiplier" value={multiplier} onChange={(e) => setMultiplier(e.target.value)} />
                <Input type="number" placeholder="Duration in minutes" value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />

                {error !== "" && <ErrorContainer>{error}</ErrorContainer>}

                <Button.GenericButton onClick={submit}>{creating ? "Activating..." : "Activate"}</Button.GenericButton>

                <div style={{ fontWeight: "bold", margin: "20px 0 5px" }}>Active Boosters</div>

                {loading && <div className={styles.status}>Loading...</div>}
                {!loading && boosters.length === 0 && <div className={styles.status}>No active boosters.</div>}

                <div className={styles.userList}>
                    {boosters.map((booster) => (
                        <div key={booster.id} className={styles.userRow}>
                            <div className={styles.userInfo}>
                                <div className={styles.username}>{booster.type} x{booster.multiplier}</div>
                                <div className={styles.userStats}>Expires {new Date(booster.expiresAt).toLocaleString()}</div>
                            </div>

                            <Button.GenericButton onClick={() => revoke(booster.id)}>Revoke</Button.GenericButton>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
