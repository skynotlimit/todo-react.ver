/**
 * Quest UI helpers — maps the existing Priority enum onto a "rarity" aesthetic
 * (Common / Rare / Epic) used by the quest card and progress display.
 *
 * The DB schema is unchanged. This is purely a presentation layer.
 */

export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Rarity = "common" | "rare" | "epic";

export const rarityOf: Record<Priority, Rarity> = {
  LOW: "common",
  MEDIUM: "rare",
  HIGH: "epic",
};

export const xpOf: Record<Priority, number> = {
  LOW: 10,
  MEDIUM: 25,
  HIGH: 50,
};

/** Tailwind-arbitrary-value style strings for inline rarity styling. */
export const rarityVars: Record<Rarity, React.CSSProperties> = {
  common: {
    ["--rarity" as string]: "var(--rarity-common)",
    ["--rarity-bg" as string]: "var(--rarity-common-bg)",
  },
  rare: {
    ["--rarity" as string]: "var(--rarity-rare)",
    ["--rarity-bg" as string]: "var(--rarity-rare-bg)",
  },
  epic: {
    ["--rarity" as string]: "var(--rarity-epic)",
    ["--rarity-bg" as string]: "var(--rarity-epic-bg)",
  },
};

export const rarityLabel: Record<Rarity, string> = {
  common: "COMMON",
  rare: "RARE",
  epic: "EPIC",
};

export const rarityIcon: Record<Rarity, string> = {
  common: "🛡",
  rare: "⚔",
  epic: "👑",
};
