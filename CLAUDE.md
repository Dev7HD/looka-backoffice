# Backoffice — Admin Web App

**Product:** Loüka · Admin — back-office for the Loüka ecosystem.

React + TypeScript admin/back-office for the AI-Powered Touristic Guide ecosystem. Authoritative guidance for any agent generating code in `backoffice/`.

> **Current stage:** documentation only. No application code yet.

---

## 1. Purpose

Internal web app for operators to manage the platform: tours, POIs, partners, drivers, users, billing/points, media, content moderation, and analytics. Consumes the `backend/` REST API — **backend contracts are the source of truth.**

## 2. Architecture

- **React + TypeScript** SPA. Strict TypeScript (`strict: true`).
- **Feature-based structure** — group by domain feature, not by file type.
- **Typed API client** against backend REST (mirror the backend contracts / OpenAPI). One generated or hand-written typed client layer; no ad-hoc `fetch` in components.
- **Auth:** Keycloak / JWT. Token stored securely, attached by the API client; route guards by role.

```
backoffice/
├── src/
│   ├── app/            # router, providers, layout shell
│   ├── features/
│   │   ├── tours/      # components, hooks, api, types per feature
│   │   ├── pois/
│   │   ├── partners/
│   │   ├── drivers/
│   │   ├── users/
│   │   ├── billing/
│   │   ├── dispatch/   # live ride monitoring
│   │   └── media/
│   ├── shared/         # design system, ui components, utils, api client, auth
│   └── main.tsx
```

## 3. Business Logic

- **Role-based access control** — operator roles gate features and actions.
- **Partner onboarding & approval** — review, approve/reject partners and their catalog.
- **POI & tour CRUD** — create/edit monuments, tour templates, geographical polygons.
- **Points & ledger oversight** — inspect balances, transactions, escrow, refunds/compensation; read-only into billing where mutations are backend-owned.
- **Dispatch monitoring** — observe active rides and their state (`pending` → `validated` → in-tour → `CANCELLED`/`ABANDONED`).
- **Media & moderation** — review uploaded images/audio.
- **Analytics** — usage, revenue, ride outcomes.

## 4. UI / UX

- **Dashboard IA:** left-nav by feature; top bar with role/context; content = tables, detail forms, maps.
- **Data tables:** sortable, filterable, paginated; server-side pagination against backend.
- **Forms:** typed, validated (schema-based), optimistic where safe.
- **Maps (Mapbox):** render POIs, geofences, and tour polygons; draw/edit polygons for catalog.
- **Real-time:** ride tracking via **WebSocket** (through edge-gateway); live position + state updates.
- **Design system:** the ecosystem-wide design system is the styling source of truth — tokens, components, and screen specs live in `../design/` (synced to claude.ai/design "Guide App Design System") and `DESIGN.md` in this folder. Implement it as a shared component library in `shared/`; consistent tokens (color, spacing, type); WCAG AA accessibility (keyboard nav, labels, contrast).

## 4b. Internationalization (FR · EN · ES · AR)

- **UI locales:** `fr`, `en`, `es`, `ar` via **react-i18next** (namespaced JSON per feature). **AR = RTL:** set `dir="rtl"` on root for `ar`, use CSS **logical properties** (`margin-inline-start`, `padding-inline-end`, `inset-inline`…) everywhere — never physical left/right for layout.
- **Content editing:** POI/tour editors expose **per-language tabs (FR/EN/ES/AR)** for every localized field; AR tab inputs render RTL. CRUD APIs exchange full locale maps `{fr,en,es,ar}`; completeness indicator per language (missing translations flagged before publish).
- **Formatting:** `Intl.*` APIs with active locale; IDs/amounts stay mono + `tabular-nums`.
- **Admin preferences:** each admin has own language/theme preference (same `/me/preferences` endpoint).

## 5. Conventions

- **State management:** server state via a data-fetching/cache library (e.g. React Query pattern); local/UI state via component state or a light store. Do not duplicate server state in global stores.
- **Data fetching:** all through the typed API client + query hooks per feature.
- **Styling:** one consistent approach (component library + tokens) — no mixed paradigms.
- **Testing:** component tests + integration tests against a mocked API; type-check in CI.

## 6. Cross-App Consistency

- Consumes `backend/` REST contracts; keep types in sync with backend DTOs.
- Auth = Keycloak/JWT. Maps = Mapbox.
- Understands the same ride terminal states as backend and mobile apps: `CANCELLED` (refund) vs `ABANDONED` (consumed + partner compensated).
