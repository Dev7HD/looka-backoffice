# Workflows

End-to-end flows across the backend. Each step shows the **client-facing** call (through the gateway
`:8080`) and the server-side effect. DTOs are defined in [schemas.md](schemas.md).

---

## Authentication & sessions

All auth is backend-mediated — clients never call Keycloak. The backend holds the confidential
`louka-backend` client secret and performs the token exchange.

```
1. Register (customer)      POST /auth/register {username,email,firstName,lastName,password}
                            → backend: Keycloak Admin API creates the user in group `customer`,
                              then password-grants a token → 201 TokenResponse
2. Login                    POST /auth/login {username,password,offline}
                            → backend: password grant on louka-backend (scope openid[+offline_access])
                              → 200 TokenResponse
3. Use the API              Authorization: Bearer <accessToken> on every protected call
4. Refresh (no re-login)    POST /auth/refresh {refreshToken} → 200 TokenResponse
5. Logout                   POST /auth/logout {refreshToken} → 204 (token revoked)
```

- **Offline tokens:** mobile apps send `offline=true` (default) → the refresh token is an
  `offline_access` token that survives SSO-session expiry, so the user stays logged in indefinitely
  (until logout). The back-office sends `offline=false` → session-bound tokens.
- **The JWT** contains `sub` (user id), `groups` (e.g. `["customer"]`), and `realm_access.roles` (the
  permissions). The app decodes it to drive UI; the backend re-checks every permission server-side.

## Account & user administration

```
Self-service     PUT  /me/account           {email,firstName,lastName}   → 204   (updates Keycloak)
                 POST /me/account/password  {newPassword}                → 204
Back-office      POST /admin/users          {…,group}  [users:manage]    → 201 {userId}
```
Partners and drivers do **not** self-register — the back-office creates them into the `partner`/`driver`
group via `POST /admin/users`.

## Permission administration

Permissions are Keycloak realm roles; each group has default permissions. The back-office edits them
live (`permissions:manage`):

```
GET  /admin/permissions                       → list all permissions
POST /admin/permissions {name,description}     → define a NEW permission (usable in guards)
GET  /admin/permissions/groups/{group}         → a group's current permissions
PUT  /admin/permissions/groups/{group} {add,remove}  → re-assign group defaults
```
A change takes effect for a user on their **next token** (login or refresh). New permission names can be
enforced by adding `@PreAuthorize("hasAuthority('<name>')")` on the relevant endpoint in a backend release.

## Preferences & propagation

```
GET /me/preferences                       → current preferences (or language-defaulted for a new user)
PUT /me/preferences {full preference set} → 204/200
```
On change the aggregate emits `UserPreferencesChangedEvent` to the outbox → Kafka → consumed
idempotently by **ai-engine** (chat/voice language), **notifications** (channel/category prefs) and
**logistics**. The user's language is also embedded in the JWT for cheap reads. Clients cache
preferences locally and re-sync on change.

## POI discovery & i18n

- **Mobile:** `GET /pois/{id}` and `GET /pois/search?q=` return **PoiSummaryResponse** resolved to a
  single language from `Accept-Language`/`?lang=` (fallback `→ en`). Never raw locale maps.
- **Editor (back-office / partner):** `GET /admin/pois/{id}` returns **PoiAdminResponse** with the full
  `{fr,en,es,ar}` maps for editing. `POST/PUT /admin/pois` accept full maps (`poi:edit`).
- Writes persist to PostgreSQL (JSONB) + emit `PoiPublished`; the Elasticsearch index (per-language
  analyzers) is refreshed off the response path and reconciled from the event stream.

## Ride lifecycle

The centerpiece. A ride moves through a guarded state machine; terminal states are distinct so billing
applies the right compensation.

```
                         POST /rides (customer, ride:request)
                                      │  emits TourRequested → billing LOCKS pointsCost in escrow
                                      ▼
        REQUESTED ──validate(auto)──► VALIDATED ──accept──► ACCEPTED ──start──► IN_PROGRESS ──complete──► COMPLETED
            │                             │                    │                     │
            │  cancel                     │ cancel             │ cancel              │ abandon
            ▼                             ▼                    ▼                     ▼
         CANCELLED (refund)           CANCELLED            CANCELLED             ABANDONED (consume)
```

Client calls (all through the gateway):

| Actor | Call | Permission | Effect |
| :-- | :-- | :-- | :-- |
| customer | `POST /rides` `{pickup,dropoff,pointsCost}` | `ride:request` | create + auto-validate; `TourRequested` → **billing locks points** |
| driver | `POST /rides/{id}/accept` | `ride:accept` | Redisson-guarded — exactly one driver wins → `ACCEPTED` (`RideAccepted`) |
| driver | `POST /rides/{id}/start` | `ride:manage` | `ACCEPTED → IN_PROGRESS` (`RideStarted`) |
| driver | `POST /rides/{id}/complete` | `ride:manage` | `IN_PROGRESS → COMPLETED` → **billing consumes** (partner paid) |
| customer | `POST /rides/{id}/cancel` | `ride:request` | pre-pickup only → `CANCELLED` → **billing refunds** |
| customer | `POST /rides/{id}/abandon` | `ride:request` | after start → `ABANDONED` → **billing consumes** |
| any | `GET /rides/{id}` | authenticated | current `RideResponse` |

Illegal transitions (e.g. cancel after start, accept an already-taken ride, complete a non-started ride)
return `422 logistics.ride.illegal_transition`. An accept that loses the race returns
`200 {outcome:"ALREADY_TAKEN"}`.

### No-double-accept (Redisson)

Accept acquires a Redis lock `ride:accept:{rideId}` (`tryLock` waitTime 0 = fail-fast, leaseTime 10s
auto-release). Two concurrent accepts → the loser gets `ALREADY_TAKEN`; only one `RideAccepted` is
emitted. Guaranteed across all service instances.

### Billing settlement (event-driven, internal)

logistics emits distinct events; billing consumes them idempotently and settles the escrow lock keyed by
`referenceId = rideId`:

| Ride event | Billing action |
| :-- | :-- |
| `TourRequested` | lock `pointsCost` (available balance → escrow) — optimistic-lock `@Version`, retried on conflict |
| `RideCompleted` / `RideAbandoned` | **consume** the lock (points spent, partner compensated) |
| `RideCancelled` | **refund** the lock (points back to balance) |

Double-spend is impossible: concurrent locks on one account conflict on `@Version`; the loser reloads
against the debited balance and fails with `422 billing.points.insufficient`.

## Driver matchmaking (PostGIS)

```
Driver reports position   PUT /drivers/me/location {latitude,longitude,available}  → 204
Find nearby drivers       GET /drivers/nearby?lat=&lon=&radius=&limit=             → [{driverId,distanceMeters}]
```
Positions are stored as `geography(Point,4326)`; the query uses `ST_DWithin` (radius, GIST-indexed) +
`ST_Distance` ordering — nearest first.

## Real-time ride tracking (WebSocket)

```
Customer & driver connect:   ws://localhost:8080/ws/rides/{rideId}   (JWT bearer on the handshake)
Driver → server (GPS tick):  {"latitude":34.02,"longitude":-6.81}
Server → subscribers:        {"type":"LOCATION",…}  and  {"type":"STATUS","status":"ACCEPTED",…}
```
Every ride transition broadcasts a `STATUS` frame; the driver's frames broadcast as `LOCATION`. Fan-out is
Redis pub/sub (Redisson reactive topic, channel `ride:track:{rideId}`) so it works across all instances.
The handshake is authenticated by the resource-server chain.

## Points balance

`GET /me/points/balance` → `{userId, balance}` for the authenticated user (routed to billing-ledger).
Balance is mutated only by ride outcomes (see billing settlement above), never directly by clients.

## AI chat (SSE)

```
GET /ai/chat?message=...            (Accept-Language sets the reply language)
→ text/event-stream:
   event: message   data: {"seq":0,"delta":"Bonjour","done":false}
   event: message   data: {"seq":1,"delta":", comment ...","done":false}
   event: done      data: {"seq":9,"delta":"","done":true}
```
The system prompt (with the user's language + guide persona) is built server-side; Gemini streams token
deltas relayed as SSE.

## Voice — ephemeral token (direct Gemini Live)

```
1. POST /ai/voice/token                       (authenticated)
2. backend validates the points balance (Feign → billing, fail-closed)
      insufficient → 422 ai.voice.insufficient_points
      ok           → mints a Gemini Live ephemeral token bound server-side to model + locale + prompt
3. → 200 VoiceToken {token,model,expiresAt,newSessionExpiresAt}
4. the CLIENT connects DIRECTLY to the Gemini Live WebSocket with this token (low latency; the API key
   never leaves the backend). Gemini function-calls route back through the client → backend commands.
```

## Push notifications (FCM)

Every app (customer, partner/driver, back-office web) registers its FCM device token and receives pushes.

```
Register (on login / token refresh)   POST   /me/devices        {token, platform}   → 204
List own devices                       GET    /me/devices                            → [{token,platform}]
Unregister (on logout)                 DELETE /me/devices/{token}                     → 204
Send to a user (service-to-service)    POST   /internal/notifications {userId,title,body,category,data} → 202 {reached}
```
- A token is upserted (`ON CONFLICT DO UPDATE`) — re-install or account switch reassigns it.
- **Sending:** the notification service loads the user's tokens and pushes via the Firebase Admin SDK
  (multicast, chunked at 500). With `guide.fcm.enabled=false` (local dev) a logging sender is used, so no
  Firebase project is needed.
- **Triggering:** other services call `/internal/notifications` after a domain event (ride accepted,
  points changed, promo). In production this is driven by a Kafka consumer filtered by the user's
  notification preferences (`UserPreferencesChangedEvent` keeps prefs in sync). `category` maps to the
  preference categories RIDES/TOURS/PROMOTIONS/WALLET.

## Media upload & serving

```
Upload   POST /media  (multipart `file`)  [media:upload]  → 201 {id}
         → object stored in Ceph/S3; metadata persisted; key = <type>/<id>
Serve    GET  /media/{id}                 (authenticated)  → 302 → presigned URL (client GETs bytes from Ceph)
Contract GET  /internal/media/{id}        (service-to-service) → MediaResponse {id,url,contentType}
```
Downloads are never proxied through the backend — clients fetch bytes directly from a time-limited
presigned URL.

## Eventing & consistency (async architecture)

- **Writes** never dual-write. A command persists the aggregate **and** an `outbox` row in one DB
  transaction. **Debezium** (CDC, Outbox Event Router SMT) relays outbox rows to **Kafka**, keeping the
  reactive services off the Kafka write path.
- **Consumers** are idempotent: a `processed_events` table (event_id PK, `INSERT … ON CONFLICT DO
  NOTHING`) dedupes redeliveries in the same transaction as the business mutation.
- **Event envelope:** `{ eventId, eventType, occurredAt, aggregateId, payload }`.
- **Reads** across services are synchronous via OpenFeign wrapped in a Resilience4j circuit breaker with
  a hardcoded fallback (e.g. billing fails **closed** → no voice token on outage; media → placeholder URL).
