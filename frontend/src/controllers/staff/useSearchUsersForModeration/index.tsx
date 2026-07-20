type ModerationUser = { id: string; username: string };
type Response = Fetch2Response & { data: ModerationUser[] };

export function useSearchUsersForModeration() {
    const searchUsersForModeration = (search: string) => new Promise<Response>((resolve, reject) => window.fetch2.get(`/api/staff/moderation/users?search=${encodeURIComponent(search)}`)
        .then((res: Response) => resolve(res))
        .catch(reject));

    return { searchUsersForModeration };
}
