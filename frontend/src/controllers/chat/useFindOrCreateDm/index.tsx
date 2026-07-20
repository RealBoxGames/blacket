type Response = Fetch2Response & { data: { roomId: number } };

export function useFindOrCreateDm() {
    const findOrCreateDm = (userId: string) => new Promise<Response>((resolve, reject) => window.fetch2.post(`/api/chat/dm/${userId}`, {})
        .then((res: Response) => resolve(res))
        .catch(reject));

    return { findOrCreateDm };
}
