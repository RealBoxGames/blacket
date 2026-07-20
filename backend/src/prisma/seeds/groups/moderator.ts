import { PermissionType } from "@blacket/core";
import type { GroupSeed } from "../types";

export const moderatorGroup: GroupSeed = {
    name: "Moderator",
    permissions: [
        PermissionType.MUTE_USERS,
        PermissionType.BAN_USERS
    ],
    image: "{cdn}/content/badges/Moderator.png",
    priority: 30
};
