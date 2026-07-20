import { ItemType } from "@blacket/core";
import type { ItemSeed } from "../types";

export const rareBoosterItem: ItemSeed = {
    name: "Rare Booster",
    description: "Boosts everyone's pull chances for rarer blooks for 1 hour.",
    rarity: "Legendary",
    image: "{cdn}/content/items/1 Hour Booster.png",
    canUse: true,
    canTrade: true,
    canAuction: true,
    type: ItemType.BOOSTER,
    boosterDuration: 3600,
    boosterMultiplier: 3
};
