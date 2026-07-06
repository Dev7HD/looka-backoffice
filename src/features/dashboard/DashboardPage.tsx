import { Link } from "react-router-dom";
import { Card, Chip } from "@shared/ui";
import "./DashboardPage.css";

const KPIS = [
  { label: "Active rides", value: "42", delta: "+8", intent: "success" as const },
  { label: "Pending partners", value: "7", delta: "review", intent: "warning" as const },
  { label: "Escrow balance", value: "128,400", intent: "primary" as const, mono: true },
  { label: "Abandoned (24h)", value: "3", delta: "−1", intent: "critical" as const },
];

export function DashboardPage() {
  return (
    <div className="dash">
      <div className="dash__kpis">
        {KPIS.map((k) => (
          <Card key={k.label} pad hover>
            <p className="eyebrow">{k.label}</p>
            <p className={"dash__value" + (k.mono ? " mono" : "")}>{k.value}</p>
            {k.delta && (
              <Chip intent={k.intent} size="sm">
                {k.delta}
              </Chip>
            )}
          </Card>
        ))}
      </div>

      <Card pad>
        <p style={{ color: "var(--c-ink-soft)" }}>
          Charts, live dispatch and approvals land here. Meanwhile, browse the{" "}
          <Link to="/design" style={{ color: "var(--c-primary)", fontWeight: 600 }}>
            design system
          </Link>
          .
        </p>
      </Card>
    </div>
  );
}
