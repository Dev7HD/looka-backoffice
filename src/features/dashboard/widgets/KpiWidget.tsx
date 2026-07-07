import { useTranslation } from "react-i18next";
import { AsyncBoundary } from "@shared/ui";
import { useKpis } from "../hooks";
import type { DashboardKpis } from "../api";

type KpiField = keyof DashboardKpis;

/** Single big-number KPI. `field` selects which metric off the KPIs payload. */
export function KpiWidget({ field, currency = false }: { field: KpiField; currency?: boolean }) {
  const { t, i18n } = useTranslation("dashboard");
  const q = useKpis();
  const nf = new Intl.NumberFormat(i18n.language);

  return (
    <AsyncBoundary isLoading={q.isLoading} isError={q.isError} error={q.error} onRetry={q.refetch}>
      <div className="flex h-full flex-col justify-center gap-1">
        <p className="eyebrow text-ink-soft">{t(`kpi.${field}`)}</p>
        <p className="font-display text-28 font-semibold tabular-nums text-ink">
          {q.data ? nf.format(q.data[field]) : "—"}
          {currency && <span className="ms-1 text-16 text-ink-soft">{t("points")}</span>}
        </p>
      </div>
    </AsyncBoundary>
  );
}
