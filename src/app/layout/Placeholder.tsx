import { Card, CardBody } from "@shared/ui";

/** Temporary stand-in for feature screens not yet built. */
export function Placeholder({ title }: { title: string }) {
  return (
    <Card>
      <CardBody>
        <p className="eyebrow">Coming soon</p>
        <h2 style={{ marginBlockStart: "var(--space-2)", fontFamily: "var(--font-display)" }}>
          {title}
        </h2>
        <p style={{ marginBlockStart: "var(--space-2)", color: "var(--c-ink-soft)" }}>
          This screen is scaffolded. Feature implementation lands here.
        </p>
      </CardBody>
    </Card>
  );
}
