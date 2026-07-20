// Actions restricted to the top of the role hierarchy (editing roles,
// blook/pack/news/booster management, badge assignment, deleting accounts)
// check membership in these groups specifically, on top of whatever raw
// permission also gates the endpoint - so granting a permission to some
// other group later can't accidentally unlock these.
export const OWNER_TIER_GROUPS = ["Owner", "Developer"];

// giving out blooks or currency (staff user-editor, /give) is restricted to
// this one account specifically, not the whole Owner/Developer tier
export const CHEATS_USER_ID = "17845087677786996"; // FRANXE
