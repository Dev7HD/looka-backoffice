import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Chip,
  StatusPill,
  Field,
  Input,
  Textarea,
  Table,
  type Column,
  type RideStatus,
} from "@shared/ui";
import "./ShowcasePage.css";

const SWATCHES: { name: string; token: string }[] = [
  { name: "Primary", token: "--c-primary" },
  { name: "Brass", token: "--c-brass" },
  { name: "Ink", token: "--c-ink" },
  { name: "Ink soft", token: "--c-ink-soft" },
  { name: "Success", token: "--c-success" },
  { name: "Warning", token: "--c-warning" },
  { name: "Info", token: "--c-info" },
  { name: "Critical", token: "--c-critical" },
  { name: "Paper", token: "--c-paper" },
  { name: "Surface", token: "--c-surface" },
  { name: "Line", token: "--c-line" },
  { name: "Primary soft", token: "--c-primary-soft" },
];

interface Ride {
  id: string;
  partner: string;
  status: RideStatus;
  points: number;
}
const RIDES: Ride[] = [
  { id: "RD-4821", partner: "Medina Tours", status: "IN_TOUR", points: 120 },
  { id: "RD-4820", partner: "Atlas Guides", status: "COMPLETED", points: 90 },
  { id: "RD-4819", partner: "Sahara Co.", status: "ABANDONED", points: 150 },
  { id: "RD-4818", partner: "Coastal Trips", status: "CANCELLED", points: 0 },
  { id: "RD-4817", partner: "Medina Tours", status: "PENDING", points: 60 },
];
const COLUMNS: Column<Ride>[] = [
  { key: "id", header: "Ride ID", render: (r) => r.id, mono: true },
  { key: "partner", header: "Partner", render: (r) => r.partner },
  { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} size="sm" /> },
  { key: "points", header: "Points", render: (r) => r.points.toLocaleString(), numeric: true },
];

export function ShowcasePage() {
  return (
    <div className="showcase">
      <header className="showcase__head">
        <h1>Design System</h1>
        <p>Central CSS tokens and shared component library.</p>
      </header>

      <section className="section">
        <h2>Color tokens</h2>
        <div className="swatches">
          {SWATCHES.map((s) => (
            <div className="swatch" key={s.token}>
              <div className="swatch__chip" style={{ background: `var(${s.token})` }} />
              <div className="swatch__label">
                <b>{s.name}</b>
                <span className="mono">{s.token}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2>Buttons</h2>
        <div className="row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Reject</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      <section className="section">
        <h2>Chips & ride status</h2>
        <div className="row">
          <Chip intent="primary">Primary</Chip>
          <Chip intent="success" dot>Active</Chip>
          <Chip intent="warning">Review</Chip>
          <Chip intent="info">Info</Chip>
          <Chip intent="critical" dot>Alert</Chip>
          <Chip intent="neutral">Draft</Chip>
        </div>
        <div className="row">
          {(["PENDING", "VALIDATED", "IN_TOUR", "COMPLETED", "CANCELLED", "ABANDONED"] as RideStatus[]).map(
            (s) => (
              <StatusPill key={s} status={s} />
            )
          )}
        </div>
      </section>

      <section className="section">
        <h2>Cards & forms</h2>
        <div className="grid-2">
          <Card>
            <CardHeader title="Partner review" actions={<Chip intent="warning" size="sm">Pending</Chip>} />
            <CardBody>
              <div className="row" style={{ flexDirection: "column", alignItems: "stretch", gap: "var(--space-4)" }}>
                <Field label="Business name" htmlFor="biz">
                  <Input id="biz" defaultValue="Medina Tours" />
                </Field>
                <Field label="Notes" hint="Visible to reviewers only" htmlFor="notes">
                  <Textarea id="notes" placeholder="Add a note…" />
                </Field>
                <Field label="License ID" error="Required before approval" htmlFor="lic">
                  <Input id="lic" invalid placeholder="LIC-…" />
                </Field>
              </div>
            </CardBody>
            <CardFooter>
              <Button variant="ghost" size="sm">Cancel</Button>
              <Button variant="primary" size="sm">Approve</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader title="Recent rides" />
            <Table columns={COLUMNS} rows={RIDES} rowKey={(r) => r.id} />
          </Card>
        </div>
      </section>
    </div>
  );
}
