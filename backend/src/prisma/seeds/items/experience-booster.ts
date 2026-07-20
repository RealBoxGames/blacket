import { ItemType } from "@blacket/core";
import type { ItemSeed } from "../types";

export const experienceBoosterItem: ItemSeed = {
    name: "Experience Booster",
    description: "Boosts everyone's XP gains from chat and pack opens for 1 hour.",
    rarity: "Legendary",
    image: "{cdn}/content/items/placeholder.png",
    canUse: true,
    canTrade: true,
    canAuction: true,
    type: ItemType.BOOSTER,
    boosterDuration: 3600,
    boosterMultiplier: 3
};
