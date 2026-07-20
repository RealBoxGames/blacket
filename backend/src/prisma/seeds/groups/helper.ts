import { PermissionType } from "@blacket/core";
import type { GroupSeed } from "../types";

export const helperGroup: GroupSeed = {
    name: "Helper",
    permissions: [
        PermissionType.MUTE_USERS
    ],
    image: "{cdn}/content/badges/Helper.png",
    priority: 10
};
