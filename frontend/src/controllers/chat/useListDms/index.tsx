import { DmEntry } from "@stores/ChatStore/chatStore.d";

type Response = Fetch2Response & { data: DmEntry[] };

export function useListDms() {
    const listDms = () => new Promise<Response>((resolve, reject) => window.fetch2.get("/api/chat/dms")
        .then((res: Response) => resolve(res))
        .catch(reject));

    return { listDms };
}
