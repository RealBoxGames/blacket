export function useRevokePunishment() {
    const revokePunishment = (punishmentId: number) => new Promise<Fetch2Response>((resolve, reject) => window.fetch2.delete(`/api/staff/punishments/${punishmentId}`, {})
        .then((res: Fetch2Response) => resolve(res))
        .catch(reject));

    return { revokePunishment };
}
