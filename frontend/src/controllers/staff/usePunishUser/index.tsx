type Punishment = { id: number; userId: string; type: string; reason: string; expiresAt: string; staffId: string; createdAt: string };
type Response = Fetch2Response & { data: Punishment };

export function usePunishUser() {
    const punishUser = (userId: string, type: "BAN" | "MUTE", reason: string, durationMinutes?: number) => new Promise<Response>((resolve, reject) => window.fetch2.post(`/api/staff/users/${userId}/punishments`, { type, reason, durationMinutes })
        .then((res: Response) => resolve(res))
        .catch(reject));

    return { punishUser };
}
