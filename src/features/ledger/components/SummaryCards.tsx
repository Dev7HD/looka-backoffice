import { useTranslation } from "react-i18next";
import { Card, Chip } from "@shared/ui";
import { HEALTH_INTENT } from "../txn";
import type { EscrowSummary } from "../types";

export function SummaryCards({ summary }: { summary: EscrowSummary }) {
  const { t, i18n } = useTranslation("ledger");
  const nf = new Intl.NumberFormat(i18n.language);

  const metrics = [
    { key: "escrowBalance", value: nf.format(summary.escrowBalance), primary: true },
    { key: "refundedToday", value: nf.format(summary.refundedToday) },
    { key: "topUpsToday", value: nf.format(summary.topUpsToday) },
    { key: "lockRetries", value: nf.format(summary.lockRetries) },
  ];

  return (
    <div className="ledger__summary">
      {metrics.map((m) => (
        <Card key={m.key} pad hover>
          <p className="eyebrow">{t(`summary.${m.key}`)}</p>
          <p className={"ledger__metric mono" + (m.primary ? " ledger__metric--lg" : "")}>
            {m.value}
          </p>
        </Card>
      ))}
      <Card pad hover>
        <p className="eyebrow">{t("summary.health")}</p>
        <div className="ledger__health">
          <Chip intent={HEALTH_INTENT[summary.health]} dot>
            {t(`health.${summary.health}`)}
          </Chip>
        </div>
      </Card>
    </div>
  );
}
