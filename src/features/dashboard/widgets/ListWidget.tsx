import { useTranslation } from "react-i18next";
import { AsyncBoundary } from "@shared/ui";
import { usePendingPartners } from "../hooks";

/** Pending-partner approvals list. Times formatted in the active locale. */
export function PendingPartnersWidget() {
  const { t, i18n } = useTranslation("dashboard");
  const q = usePendingPartners();
  const df = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium", timeStyle: "short" });

  return (
    <AsyncBoundary isLoading={q.isLoading} isError={q.isError} error={q.error} onRetry={q.refetch}>
      {q.data && q.data.length === 0 ? (
        <p className="text-12 text-ink-soft">{t("emptyPending")}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {(q.data ?? []).map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-13 font-medium text-ink">{p.name}</p>
                <p className="font-mono text-11 text-ink-soft">{p.id}</p>
              </div>
              <span className="shrink-0 text-11 text-ink-soft">{df.format(new Date(p.submittedAt))}</span>
            </li>
          ))}
        </ul>
      )}
    </AsyncBoundary>
  );
}
