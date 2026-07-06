# Backend integration

The app runs on in-memory fixtures by default. Point it at real services by
flipping the mock flags in `.env.local` (see `.env.example`).

| Concern   | Flag / var                                    | Status |
| --------- | --------------------------------------------- | ------ |
| Auth      | `VITE_AUTH_MODE=backend`                       | ✅ wired |
| REST API  | `VITE_USE_MOCK_API=false` + `VITE_API_BASE_URL` | ✅ partial (see below) |
| Dispatch  | `VITE_USE_MOCK_WS=false` + `VITE_WS_URL`        | ⚠️ per-ride only (see gaps) |
| Maps      | `VITE_MAPBOX_TOKEN`                            | ✅ wired |

Auth mode also accepts `keycloak` (direct SSO) and `mock` (in-app dev login).
No component calls `fetch` directly — everything goes through
`src/shared/api/client.ts` (attaches `Authorization: Bearer`, routes `401` to a
forced re-login, `apiUpload` for multipart).

### Errors, locale & rate limits
- **Single entry point:** all calls hit the edge-gateway (`VITE_API_BASE_URL`,
  e.g. `http://localhost:8080`) — never a service or Keycloak directly.
- **RFC 7807:** non-2xx responses parse `application/problem+json` into
  `ApiError { status, code, detail, title, errors, retryAfter }`. **Branch on
  `code`** (stable i18n key), never on `detail` (localized). `src/shared/api/errors.ts`
  maps each catalog code (`billing.points.insufficient`, `catalog.poi.not_found`,
  `logistics.ride.illegal_transition`, …) to an `errors` i18n string;
  `AsyncBoundary` shows the resolved message.
- **Domain "not found" is `422`**, not 404 (backend maps all domain-rule
  violations to 422).
- **Accept-Language:** every request sends the active UI locale (`<html lang>` →
  `fr|en|es|ar`); the backend localizes `detail` and content with `→ en` fallback.
- **`401`** clears the session (re-login); **`403`** = token lacks the endpoint's
  permission; **`429`** carries `Retry-After` (seconds) on `ApiError.retryAfter`.

## Wired to real backend contracts

### Auth — `src/shared/auth/backend.ts` (`AUTH_MODE=backend`)
- `POST /auth/login` `{username,password,offline:false}` → `TokenResponse`
- `POST /auth/refresh` `{refreshToken}` → `TokenResponse` (auto, ~30s before expiry)
- `POST /auth/logout` `{refreshToken}` → `204`
- JWT decoded for `sub`, `groups`, `realm_access.roles` (permissions). The
  `backoffice` group maps to full access; raw permissions exposed via
  `hasPermission(...)`.

### POI catalog — `src/features/pois/api.ts` (`poi:edit`/`poi:view`)
- `GET  /admin/pois/{id}` → `PoiAdminResponse` (full `{fr,en,es,ar}` maps)
- `POST /admin/pois` → `201 {id}`  ·  `PUT /admin/pois/{id}` → `204`
  (body = `PoiUpsertRequest`: `name`, `description`, `audioGuide`, `latitude`,
  `longitude`, `category`, `owner`)
- ⚠️ The catalog stores a **point**, not a polygon — the geofence editor is
  client-side only and not round-tripped.

### Preferences — `src/features/settings/api.ts`
- `GET /me/preferences` → `PreferencesResponse` (language **code**, theme UPPER)
- `PUT /me/preferences` → full replacement. The UI edits language + theme and
  **round-trips the rest untouched** (units, notifications, voice, …). Language
  is sent as the enum **name** (`FR`), theme as UPPER (`DARK`).

### Media upload — `src/features/media/api.ts` (`media:upload`)
- `POST /media` multipart `file` → `201 {id}` (`uploadMedia`)
- `GET /media/{id}` → `302` presigned (`mediaUrl`)

### FCM notifications — `src/shared/notifications/` (web push)
- `POST /me/devices` `{token, platform:"WEB"}` → `204` (register/upsert)
- `GET  /me/devices` → `[{token, platform}]`
- `DELETE /me/devices/{token}` → `204`
- Web token minted via Firebase Messaging (`fcm.ts`, lazy-loaded, code-split) —
  requires `VITE_FCM_*` + `VITE_FCM_VAPID_KEY` and `public/firebase-messaging-sw.js`.
  Without config, `HAS_FCM` is false and the Settings → Notifications card shows
  "not configured" (dev backend runs `guide.fcm.enabled=false`).
- Lifecycle (`useFcmLifecycle`, mounted in the shell): foreground pushes → toast;
  silent re-register on login when permission is already granted. Enable flow
  (`useEnableNotifications`) prompts permission, mints the token, registers it.
- **Subscriptions** live in Preferences, not devices: the `notifications` map
  (`NotificationChannel` PUSH/EMAIL × `NotificationCategory` RIDES/TOURS/
  PROMOTIONS/WALLET) is modelled in `shared/notifications/categories.ts` and
  edited via the Settings → Notifications matrix, persisted through
  `PUT /me/preferences` (full replacement — other prefs round-trip untouched).
- Sending is service-to-service (`POST /internal/notifications` with a
  `category`) — not called by the client; the back-office only registers to
  receive and manages which categories reach which channel.

## No back-office endpoint yet — mock-only

These screens have **no documented gateway contract** and stay on fixtures
until the backend exposes them:

- **Partners approval / KYC** — partners are created via `POST /admin/users`
  into the `partner` group; there is no approval/KYC review API.
- **Drivers admin / suspend** — drivers are `POST /admin/users` accounts; there
  is no admin roster/suspend API (location is driver-app only).
- **Ledger** — billing is event-driven and internal (`/internal/points/**`,
  service-to-service). The back-office observes outcomes; no admin ledger API.
- **Dispatch fleet board** — there is no "all active rides" feed, so the board
  roster + its map stay simulated. **Per-ride tracking is real**, though:
  `useRideTracking(rideId)` (`src/features/dispatch/tracking.ts`) connects to
  `ws://<VITE_WS_URL>/ws/rides/{rideId}` and consumes `STATUS`/`LOCATION`
  frames (`RideStatus` = `REQUESTED/VALIDATED/ACCEPTED/IN_PROGRESS/COMPLETED/
  CANCELLED/ABANDONED`). The JWT is sent as a **`?token=` query param** — browsers
  can't set an `Authorization` header on the WS handshake. Set `VITE_WS_URL`
  (no trailing slash) + `VITE_USE_MOCK_WS=false` to enable; ready to drop into a
  ride-detail view once a ride-list endpoint exists.

## Not yet surfaced in the UI (endpoints exist)

- **User admin** — `POST /admin/users` (`users:manage`)
- **Permission admin** — `GET/POST /admin/permissions`, `GET/PUT /admin/permissions/groups/{group}` (`permissions:manage`)

## Roles → permissions

`AppRole` (`src/shared/auth/roles.ts`) drives route/action gating in mock mode.
In backend mode the JWT carries backend **permissions** (`poi:edit`, …) and
**groups**; a `backoffice` token resolves to full access. Group defaults are
editable via the permission-admin API and take effect on the user's next token.
