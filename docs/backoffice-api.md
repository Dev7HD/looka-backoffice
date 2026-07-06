# Back-office API — React Admin

Consumer: the **back-office** web app. Group **`backoffice`** — permissions `poi:view`, `poi:edit`,
`tour:edit`, `media:upload`, `prefs:manage`, **`permissions:manage`**, **`users:manage`**.

Base URL `http://localhost:8080`. `Authorization: Bearer <accessToken>`. **Login with `offline=false`**
(admins hold session-bound, not long-lived offline, tokens).
DTOs → [schemas.md](schemas.md) · flows → [workflows.md](workflows.md) · errors → [README.md](README.md).

---

## 1. Auth

| Call | Body → Response |
| :-- | :-- |
| `POST /auth/login` (public) | `{username,password,offline:false}` → `200 TokenResponse` |
| `POST /auth/refresh` (public) | `{refreshToken}` → `200 TokenResponse` |
| `POST /auth/logout` (public) | `{refreshToken}` → `204` |

Seeded admin (dev): `admin` / `password`.

## 2. User administration — `users:manage`

### POST /admin/users
Create an account into any group (partner/driver/backoffice/customer).
```json
// request — AdminCreateUserRequest
{ "username": "driver2", "email": "d2@louka.app", "firstName": "Dee", "lastName": "Two",
  "password": "temp1234", "group": "driver" }
// 201 — CreatedUser
{ "userId": "…" }
```
Errors: `403` (missing `users:manage`), `400 error.validation`.

## 3. Permission administration — `permissions:manage`

Permissions are Keycloak realm roles; group defaults are role→group mappings. Changes take effect on each
user's **next token**. See [workflows](workflows.md#permission-administration).

### GET /admin/permissions
```json
// 200 — [PermissionView]
[ { "name": "poi:edit", "description": "Create/update POIs/tours" },
  { "name": "permissions:manage", "description": "Edit permissions + group assignments" } ]
```

### POST /admin/permissions
```json
{ "name": "tour:publish", "description": "Publish tour templates" }   // → 201
```
Defines a new permission. Enforce it by adding a `@PreAuthorize` guard on the target endpoint in a backend
release.

### GET /admin/permissions/groups/{group}
`group` ∈ `backoffice|partner|driver|customer` → `200 ["poi:view","poi:edit", …]`.

### PUT /admin/permissions/groups/{group}
```json
{ "add": ["tour:publish"], "remove": ["media:upload"] }   // → 204
```
Re-assigns a group's default permissions — changes what **all** members can do after they refresh.

## 4. Catalog administration — full CRUD

| Call | Permission | Body / Response |
| :-- | :-- | :-- |
| `POST /admin/pois` | `poi:edit` | **PoiUpsertRequest** (full locale maps) → `201 {id}` |
| `PUT /admin/pois/{id}` | `poi:edit` | **PoiUpsertRequest** → `204` |
| `GET /admin/pois/{id}` | `poi:view` | → `200 PoiAdminResponse` (raw `{fr,en,es,ar}` maps) |
| `GET /pois/{id}` · `/pois/search?q=` | authenticated | resolved public view |

Payload shape → [partner-app-api.md](partner-app-api.md#2-catalog-management--partner).

## 5. Media — `media:upload`

| Call | Notes |
| :-- | :-- |
| `POST /media` (multipart `file`) | → `201 {id}` |
| `GET /media/{id}` (authenticated) | `302` → presigned URL |

## 6. Push notifications (FCM — web)

The back-office web app registers an FCM **web** token to receive operational alerts.

| Call | Body / Response |
| :-- | :-- |
| `POST /me/devices` (authenticated) | `{token, platform: "WEB"}` → `204` |
| `GET /me/devices` (authenticated) | → `[{token, platform}]` |
| `DELETE /me/devices/{token}` (authenticated) | → `204` |

## 7. UI guidance

- Decode `groups` + `realm_access.roles` from the JWT to drive menu visibility; the backend still returns
  `403` on any missing permission — don't rely on client-side hiding for security.
- Editing a group's permissions changes access for **all** its users after their next token refresh.
- Billing/points and ride settlement are automatic (event-driven) — the back-office observes outcomes and
  does not mutate points directly. Billing endpoints (`/internal/points/**`) are service-to-service only,
  not exposed through the gateway.
