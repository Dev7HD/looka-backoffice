import type { Locale } from "@shared/i18n/config";
import type { Theme } from "@shared/theme/theme";
import type { NotificationPrefs } from "@shared/notifications/categories";

/** Per-admin preferences — same /me/preferences endpoint as the other apps.
 *  Only the fields the back-office edits are modelled; the rest of the backend
 *  preference object is preserved untouched on write. */
export interface AdminPreferences {
  language: Locale;
  theme: Theme;
  /** Channel → subscribed categories (backend `notifications` map). */
  notifications: NotificationPrefs;
}
