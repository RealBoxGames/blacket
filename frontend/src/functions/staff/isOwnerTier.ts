const OWNER_TIER_GROUPS = ["Owner", "Developer"];

// Mirrors backend/src/core/constants.ts's OWNER_TIER_GROUPS - used purely to
// show/hide UI, the backend re-checks this on every restricted request.
export function isOwnerTier(user: any): boolean {
    const badges: { name: string }[] = user?.badges ?? [];

    return badges.some((badge) => OWNER_TIER_GROUPS.includes(badge.name));
}
