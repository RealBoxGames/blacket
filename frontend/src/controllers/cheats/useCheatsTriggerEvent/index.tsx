import { CheatsTriggerEventDto } from "@blacket/types";

export function useCheatsTriggerEvent() {
    const triggerEvent = (dto: CheatsTriggerEventDto) => new Promise<Fetch2Response>((resolve, reject) => window.fetch2.post("/api/cheats/event", dto)
        .then((res: Fetch2Response) => resolve(res))
        .catch(reject));

    return { triggerEvent };
}
