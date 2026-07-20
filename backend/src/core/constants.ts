// Actions restricted to the top of the role hierarchy (editing roles, /give,
// blook/pack/news/booster management, badge assignment, deleting accounts)
// check membership in these groups specifically, on top of whatever raw
// permission also gates the endpoint - so granting a permission to some
// other group later can't accidentally unlock these.
export const OWNER_TIER_GROUPS = ["Owner", "Developer"];
