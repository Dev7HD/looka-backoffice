import { apiRequest, mockDelay, USE_MOCK_API } from "@shared/api/client";
import { DEFAULT_LOCALE, type Locale } from "@shared/i18n/config";
import { getStoredTheme, type Theme } from "@shared/theme/theme";
import {
  DEFAULT_NOTIFICATION_PREFS,
  normalizeNotificationPrefs,
} from "@shared/notifications/categories";
import type { AdminPreferences } from "./types";

const PREFS_KEY = "louka.prefs";

/** Backend PreferencesResponse (identity-auth). Full preference set — the app
 *  edits language, theme + notifications and round-trips the rest untouched. */
interface BackendPreferences {
  language: string; // code, e.g. "fr"
  theme: "LIGHT" | "DARK" | "SYSTEM";
  units?: string;
  currencyDisplay?: string;
  notifications?: Record<string, string[]>;
  voice?: Record<string, unknown>;
  accessibility?: Record<string, unknown>;
  privacy?: Record<string, unknown>;
}

// Retain the full server object so PUT (full replacement) preserves fields the
// back-office UI does not expose.
let lastFull: BackendPreferences | null = null;

const toLocale = (code: string): Locale =>
  (["fr", "en", "es", "ar"].includes(code.toLowerCase())
    ? code.toLowerCase()
    : DEFAULT_LOCALE) as Locale;
const toLangName = (l: Locale) => l.toUpperCase(); // FR/EN/ES/AR
const toTheme = (t: BackendPreferences["theme"]): Theme => t.toLowerCase() as Theme;
const toThemeName = (t: Theme) => t.toUpperCase() as BackendPreferences["theme"];

function fromBackend(b: BackendPreferences): AdminPreferences {
  return {
    language: toLocale(b.language),
    theme: toTheme(b.theme),
    notifications: normalizeNotificationPrefs(b.notifications),
  };
}

export async function getPreferences(): Promise<AdminPreferences> {
  if (USE_MOCK_API) return mockDelay(readStored());
  const b = await apiRequest<BackendPreferences>("/me/preferences");
  lastFull = b;
  return fromBackend(b);
}

export async function updatePreferences(
  prefs: AdminPreferences
): Promise<AdminPreferences> {
  if (USE_MOCK_API) {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    return mockDelay(prefs);
  }
  // Full replacement — merge edits onto the last known server state.
  const body: Record<string, unknown> = {
    ...(lastFull ?? {}),
    language: toLangName(prefs.language),
    theme: toThemeName(prefs.theme),
    notifications: prefs.notifications,
  };
  await apiRequest<void>("/me/preferences", { method: "PUT", body });
  if (lastFull) {
    lastFull = {
      ...lastFull,
      language: prefs.language,
      theme: toThemeName(prefs.theme),
      notifications: prefs.notifications,
    };
  }
  return prefs;
}

function readStored(): AdminPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AdminPreferences>;
      return {
        language: (parsed.language ?? DEFAULT_LOCALE) as Locale,
        theme: parsed.theme ?? getStoredTheme(),
        notifications: normalizeNotificationPrefs(
          parsed.notifications as Record<string, string[]> | undefined
        ),
      };
    }
  } catch {
    /* fall through to derived defaults */
  }
  const lang = (localStorage.getItem("louka.locale") ?? DEFAULT_LOCALE) as Locale;
  return {
    language: lang,
    theme: getStoredTheme(),
    notifications: DEFAULT_NOTIFICATION_PREFS,
  };
}
