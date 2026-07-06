# Design — Backoffice (Admin)

Source of truth: `../design/` (synced to claude.ai/design project **"Guide App Design System"**). Shared palette/type/shape: see `../client-app/DESIGN.md`. Backoffice is an **operated UI** — summary before detail, state encoded as pills/chips/stripes.

## Shell
Dark-ink left sidebar (220px): Dashboard, Tours & POIs, Partners, Drivers, Dispatch, Ledger, Media, Settings. Top bar: title, search, admin chip. Content on paper ground, white cards (radius 14, line border). Desktop-first ~1280px; tables scroll in their own `overflow-x: auto` container.

## Screens (previews in `../design/backoffice/`)
| Screen | File | Notes |
| :-- | :-- | :-- |
| Dashboard | `dashboard.html` | KPI cards, rides area chart, live dispatch mini-list, pending approvals |
| POI editor | `poi-editor.html` | Form + map split; editable geofence polygon w/ vertex handles; save/cancel footer |
| Partners approval | `partners-approval.html` | Queue → detail; KYC doc states; approve / request changes / reject |
| Dispatch monitor | `dispatch-monitor.html` | Live map + active rides list, all ride statuses, WebSocket live indicator |
| Ledger | `ledger.html` | Summary cards, typed transaction chips (LOCK/CAPTURE/REFUND/TOP-UP/COMPENSATION), escrow health |

## Behavior notes for implementers
- Status vocabulary identical to backend/mobile: PENDING · VALIDATED · IN TOUR · COMPLETED · CANCELLED (muted, full refund) · ABANDONED (critical, points consumed + partner compensated).
- Ledger rows come in pairs: lock→capture (abandoned/completed) and lock→refund (cancelled); compensation entries reference partner.
- All numeric columns `tabular-nums`; TXN/ride IDs mono.
- WCAG AA: keyboard focus visible, labels on all controls, contrast ≥4.5:1 body text.
- **i18n:** UI in FR/EN/ES/AR via react-i18next; AR = RTL (`dir="rtl"` + CSS logical properties). POI/tour editors expose per-language tabs (FR/EN/ES/AR, AR inputs RTL) with translation-completeness indicator — required before publish.
