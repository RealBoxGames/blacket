import { PermissionType } from "@blacket/core";
import type { GroupSeed } from "../types";

export const ownerGroup: GroupSeed = {
    name: "Owner",
    permissions: Object.values(PermissionType),
    image: "{cdn}/content/badges/Owner.png",
    priority: 100
};
