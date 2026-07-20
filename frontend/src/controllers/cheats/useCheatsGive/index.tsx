import { CheatsGiveDto } from "@blacket/types";

export function useCheatsGive() {
    const give = (dto: CheatsGiveDto) => new Promise<Fetch2Response>((resolve, reject) => window.fetch2.post("/api/cheats/give", dto)
        .then((res: Fetch2Response) => resolve(res))
        .catch(reject));

    return { give };
}
