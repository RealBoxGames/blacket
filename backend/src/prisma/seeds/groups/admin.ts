import { PermissionType } from "@blacket/core";
import type { GroupSeed } from "../types";

export const adminGroup: GroupSeed = {
    name: "Admin",
    permissions: [
        PermissionType.MUTE_USERS,
        PermissionType.BAN_USERS,
        PermissionType.BLACKLIST_USERS
    ],
    image: "{cdn}/content/badges/Admin.png",
    priority: 50
};
