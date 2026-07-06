/** Notification subscription model — mirrors the backend Preferences
 *  `notifications` map (schemas.md §1 + §4). */

export const NOTIFICATION_CHANNELS = ["PUSH", "EMAIL"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_CATEGORIES = [
  "RIDES",
  "TOURS",
  "PROMOTIONS",
  "WALLET",
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

/** `{ PUSH: ["RIDES","WALLET"], EMAIL: ["TOURS"] }` */
export type NotificationPrefs = Record<NotificationChannel, NotificationCategory[]>;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  PUSH: [...NOTIFICATION_CATEGORIES],
  EMAIL: [],
};

/** Normalise an untrusted map (from the backend) into a full, ordered prefs. */
export function normalizeNotificationPrefs(
  raw: Partial<Record<string, string[]>> | undefined | null
): NotificationPrefs {
  const pick = (ch: NotificationChannel): NotificationCategory[] =>
    NOTIFICATION_CATEGORIES.filter((c) => raw?.[ch]?.includes(c));
  if (!raw) return { PUSH: [...NOTIFICATION_CATEGORIES], EMAIL: [] };
  return { PUSH: pick("PUSH"), EMAIL: pick("EMAIL") };
}

export function isSubscribed(
  prefs: NotificationPrefs,
  channel: NotificationChannel,
  category: NotificationCategory
): boolean {
  return prefs[channel].includes(category);
}

/** Toggle a single channel/category cell, returning a new prefs object. */
export function toggleSubscription(
  prefs: NotificationPrefs,
  channel: NotificationChannel,
  category: NotificationCategory
): NotificationPrefs {
  const has = prefs[channel].includes(category);
  const next = has
    ? prefs[channel].filter((c) => c !== category)
    : NOTIFICATION_CATEGORIES.filter(
        (c) => prefs[channel].includes(c) || c === category
      );
  return { ...prefs, [channel]: next };
}
