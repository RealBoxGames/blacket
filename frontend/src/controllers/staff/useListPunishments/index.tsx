type Punishment = { id: number; userId: string; type: string; reason: string; expiresAt: string; staffId: string; createdAt: string };
type Response = Fetch2Response & { data: Punishment[] };

export function useListPunishments() {
    const listPunishments = (userId: string) => new Promise<Response>((resolve, reject) => window.fetch2.get(`/api/staff/users/${userId}/punishments`)
        .then((res: Response) => resolve(res))
        .catch(reject));

    return { listPunishments };
}
