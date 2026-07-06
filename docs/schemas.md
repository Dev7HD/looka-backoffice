# Schemas — Enums & DTOs

Canonical field-level reference for every request/response body and shared enum. App docs link here.
Types: `uuid` (string), `instant` (ISO-8601 UTC, e.g. `2026-07-05T10:00:00Z`), `long`/`double` (JSON number).
"Req" = required in requests.

---

## 1. Enums

| Enum | Values | Notes |
| :-- | :-- | :-- |
| **SupportedLanguage** | `FR` `EN` `ES` `AR` | Requests use the **name** (`FR`); responses use the **code** (`fr`). `AR` ⇒ RTL. Fallback chain `requested → en`. |
| **Theme** | `LIGHT` `DARK` `SYSTEM` | |
| **Units** | `METRIC` `IMPERIAL` | |
| **CurrencyDisplay** | `MAD` `EUR` `USD` | Display-only conversion of points. |
| **NotificationChannel** | `PUSH` `EMAIL` | |
| **NotificationCategory** | `RIDES` `TOURS` `PROMOTIONS` `WALLET` | |
| **PoiCategory** | `MONUMENT` `MUSEUM` `VIEWPOINT` `RESTAURANT` `PARK` `BEACH` `MARKET` `RELIGIOUS_SITE` `OTHER` | |
| **RideStatus** | `REQUESTED` `VALIDATED` `ACCEPTED` `IN_PROGRESS` `COMPLETED` `CANCELLED` `ABANDONED` | See the state machine in [workflows.md](workflows.md#ride-lifecycle). |
| **AcceptOutcome** | `ACCEPTED` `ALREADY_TAKEN` | Result of a driver accept attempt. |
| **SettlementReason** | `COMPLETED` `ABANDONED` `CANCELLED` | Drives billing compensation (internal). |
| **MediaType** | `IMAGE` `AUDIO` | Inferred from the upload content type. |
| **Platform** | `IOS` `ANDROID` `WEB` | Device platform for an FCM token. |

### Groups & permissions

| Group | Default permissions |
| :-- | :-- |
| `customer` | `poi:view`, `ride:request`, `media:upload`, `prefs:manage` |
| `partner` | `poi:view`, `poi:edit`, `tour:edit`, `media:upload`, `prefs:manage` |
| `driver` | `poi:view`, `ride:accept`, `ride:manage`, `prefs:manage` |
| `backoffice` | all of the above + `permissions:manage`, `users:manage` |

The JWT carries `groups` (e.g. `["customer"]`) and `realm_access.roles` (the permissions). Group defaults
are editable by the back-office — see [workflows.md](workflows.md#permission-administration).

---

## 2. Auth DTOs (identity-auth)

**TokenResponse** — returned by login/register/refresh
| Field | Type | Notes |
| :-- | :-- | :-- |
| accessToken | string | JWT; send as `Authorization: Bearer <accessToken>` |
| refreshToken | string | offline token for mobile (long-lived) |
| expiresIn | long | access-token lifetime, seconds |
| tokenType | string | `Bearer` |

```json
{ "accessToken": "eyJ...", "refreshToken": "eyJ...", "expiresIn": 900, "tokenType": "Bearer" }
```

**LoginRequest** — `username`* string, `password`* string, `offline` boolean (default `true`; back-office sends `false`).
**RegisterRequest** — `username`* string, `email` string(email), `firstName` string, `lastName` string, `password`* string.
**RefreshRequest** / **LogoutRequest** — `refreshToken`* string.
**UpdateAccountRequest** — `email` string, `firstName` string, `lastName` string.
**PasswordRequest** — `newPassword`* string (min 8).
**AdminCreateUserRequest** — `username`* , `email`, `firstName`, `lastName`, `password`* , `group`* (one of the group names).
**CreatedUser** — `userId` string.

## 3. Permission-admin DTOs (identity-auth, back-office)

**PermissionView** — `name` string (e.g. `poi:edit`), `description` string.
**CreatePermissionRequest** — `name`* string, `description` string.
**UpdateGroupRequest** — `add` string[], `remove` string[] (permission names).

## 4. Preferences DTOs (identity-auth)

**UpdatePreferencesRequest** (full replacement, `PUT /me/preferences`)
| Field | Type | Notes |
| :-- | :-- | :-- |
| language | SupportedLanguage (name) | `FR`/`EN`/`ES`/`AR` |
| theme | Theme | |
| units | Units | |
| currencyDisplay | CurrencyDisplay | |
| notifications | map | `{ "PUSH": ["RIDES","WALLET"], "EMAIL": ["TOURS"] }` |
| voice | object | `{ "languageOverride": "AR"\|null, "playbackSpeed": 1.25 }` (speed ∈ [0.5, 2.0]) |
| accessibility | object | `{ "reducedMotion": bool, "largerText": bool }` |
| privacy | object | `{ "analytics": bool, "marketing": bool }` — server stamps consent timestamps |

**PreferencesResponse** — same shape, except `language`/`voice.languageOverride` are **codes** (`fr`), and
`privacy` includes timestamps: `{ analytics, analyticsUpdatedAt, marketing, marketingUpdatedAt }` (`instant`|null).

```json
{
  "language": "fr", "theme": "DARK", "units": "METRIC", "currencyDisplay": "EUR",
  "notifications": { "PUSH": ["RIDES","WALLET"], "EMAIL": ["TOURS"] },
  "voice": { "languageOverride": "ar", "playbackSpeed": 1.25 },
  "accessibility": { "reducedMotion": true, "largerText": false },
  "privacy": { "analytics": true, "analyticsUpdatedAt": "2026-07-05T10:00:00Z", "marketing": false, "marketingUpdatedAt": null }
}
```

## 5. Catalog DTOs (tour-poi-catalog)

**PoiSummaryResponse** (mobile — resolved to one language)
| Field | Type | Notes |
| :-- | :-- | :-- |
| id | uuid | |
| name | string | resolved to the request locale |
| description | string | resolved |
| latitude / longitude | double | |
| thumbnailUrl | string\|null | resolve separately via media-storage |
| fallback | boolean | `true` if served from a circuit-breaker default |

**PoiUpsertRequest** (editor — full locale maps)
| Field | Type | Notes |
| :-- | :-- | :-- |
| name | map | `{ "fr":"…","en":"…","es":"…","ar":"…" }` (non-empty) |
| description | map | |
| audioGuide | map | audio-guide script per locale |
| latitude / longitude | double | |
| category | PoiCategory | |
| owner | uuid\|null | partner owner, optional |

**PoiAdminResponse** — `id` uuid, `name`/`description`/`audioGuide` maps, `latitude`, `longitude`,
`category`, `owner` uuid|null, `published` boolean.
**CreatedResponse** — `id` uuid.

## 6. Logistics DTOs (logistics-dispatch)

**GeoPointDto** — `latitude` double, `longitude` double.
**CreateRideRequest** — `pickup`* GeoPointDto, `dropoff`* GeoPointDto, `pointsCost`* long (>0).
**CreatedRide** — `rideId` uuid.
**AcceptResponse** — `outcome` AcceptOutcome.
**RideResponse** — `id` uuid, `status` RideStatus, `driverId` uuid|null, `pickup`/`dropoff` GeoPointDto, `pointsCost` long.
**LocationUpdate** — `latitude` double, `longitude` double, `available` boolean.
**NearbyDriverResponse** — `driverId` uuid, `distanceMeters` double.

**RideTrackingUpdate** (WebSocket frame, `ws://…/ws/rides/{rideId}`)
| Field | Type | Notes |
| :-- | :-- | :-- |
| type | string | `STATUS` or `LOCATION` |
| rideId | string | |
| status | string\|null | RideStatus name — set for `STATUS` |
| latitude / longitude | double\|null | set for `LOCATION` |
| occurredAt | instant | |

Inbound (driver → server): `{ "latitude": 34.02, "longitude": -6.81 }` → broadcast as a `LOCATION` frame.

## 7. AI DTOs (ai-engine)

**ChatChunk** (SSE `data:` payload) — `seq` long, `delta` string (token text), `done` boolean.
SSE event name is `message` for deltas, `done` for the final chunk.

**VoiceToken** — `token` string (Gemini Live ephemeral token), `model` string, `expiresAt` instant,
`newSessionExpiresAt` instant.

## 8. Media DTOs (media-storage)

**UploadResponse** — `id` uuid.
**MediaResponse** (contract served to other services) — `id` uuid, `url` string (presigned), `contentType` string, `placeholder` boolean.

## 9. Billing DTOs (billing-ledger — internal, service-to-service)

**MyBalance** (customer-facing, `GET /me/points/balance`) — `userId` uuid, `balance` long.
**BalanceResponse** (internal) — `userId` uuid, `balance` long, `degraded` boolean (true when served fail-closed).
**AmountRequest** — `amount` long (>0). **LockRequest** — `referenceId` string, `amount` long (>0).
**LockResponse** — `lockId` uuid. **SettleRequest** — `reason` SettlementReason.

## 10. Notification DTOs (notification)

**RegisterDeviceRequest** (`POST /me/devices`) — `token`* string (FCM registration token), `platform`* Platform.
**DeviceResponse** (`GET /me/devices`) — `token` string, `platform` Platform.
**SendNotificationRequest** (internal `POST /internal/notifications`) — `userId`* uuid, `title`* string,
`body`* string, `category` string|null (RIDES/TOURS/PROMOTIONS/WALLET), `data` map<string,string>.
**SendResult** — `reached` int (devices the push was accepted for).

## 11. Error body (all services) — RFC 7807

`Content-Type: application/problem+json`
| Field | Type | Notes |
| :-- | :-- | :-- |
| title | string | short summary |
| status | int | HTTP status |
| detail | string | localized message (per `Accept-Language`) |
| code | string | stable i18n key (e.g. `billing.points.insufficient`) — branch on this, not `detail` |
| errors | string[] | present on `400` validation — `"field: message"` entries |
| instance | string | request path |

Full code list in [README.md](README.md#error-catalog).
