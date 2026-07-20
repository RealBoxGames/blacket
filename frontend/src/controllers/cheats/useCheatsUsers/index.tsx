import { StaffUserEntity } from "@blacket/types";

type Response = Fetch2Response & { data: { total: number; users: StaffUserEntity[] } };

export function useCheatsUsers() {
    const listUsers = (search?: string) => new Promise<Response>((resolve, reject) => window.fetch2.get(`/api/cheats/users${search ? `?search=${encodeURIComponent(search)}` : ""}`)
        .then((res: Response) => resolve(res))
        .catch(reject));

    return { listUsers };
}
