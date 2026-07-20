import { PermissionType } from "@blacket/core";
import type { GroupSeed } from "../types";

export const developerGroup: GroupSeed = {
    name: "Developer",
    permissions: Object.values(PermissionType),
    image: "{cdn}/content/badges/Developer.png",
    priority: 101
};
