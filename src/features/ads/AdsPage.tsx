import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, CardHeader, Chip, useToast } from "@shared/ui";
import { useCampaigns, useCampaignStats, useReviewCampaign } from "./hooks";

export function AdsPage() {
  const { t } = useTranslation("ads");
  const toast = useToast();
  const queue = useCampaigns("PENDING_REVIEW");
  const review = useReviewCampaign();
  const [selected, setSelected] = useState<string | null>(null);
  const stats = useCampaignStats(selected);

  const decide = (id: string, decision: "ACTIVE" | "REJECTED") => {
    review.mutate({ id, decision }, {
      onSuccess: () => toast.show({ title: decision === "ACTIVE" ? t("approved") : t("rejected"), intent: decision === "ACTIVE" ? "success" : "neutral" }),
      onError: () => toast.show({ title: t("reviewError"), intent: "critical" }),
    });
  };

  return (
    <div className="page-stack">
      <Card>
        <CardHeader title={t("reviewQueue")} />
        <CardBody>
          {(queue.data ?? []).length === 0 ? (
            <p className="muted">{t("emptyQueue")}</p>
          ) : (
            <ul className="ads-list">
              {(queue.data ?? []).map((c) => (
                <li key={c.id} className="ads-item">
                  <div>
                    <strong>{c.name}</strong>
                    <span className="muted"> · {c.bidModel} {c.bidPoints} pts · {t("budget")} {c.budgetPoints}</span>
                    <div className="muted">{c.title.en ?? Object.values(c.title)[0]}</div>
                  </div>
                  <div className="ads-actions">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(c.id)}>{t("stats")}</Button>
                    <Button size="sm" variant="secondary" onClick={() => decide(c.id, "REJECTED")}>{t("reject")}</Button>
                    <Button size="sm" variant="primary" onClick={() => decide(c.id, "ACTIVE")}>{t("approve")}</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
      {selected && stats.data && (
        <Card>
          <CardHeader title={t("stats")} actions={<Chip size="sm">{selected}</Chip>} />
          <CardBody>
            <div className="stats-grid">
              <Stat label={t("impressions")} value={stats.data.impressions} />
              <Stat label={t("clicks")} value={stats.data.clicks} />
              <Stat label="CTR" value={`${(stats.data.ctr * 100).toFixed(1)}%`} />
              <Stat label={t("spent")} value={stats.data.spentPoints} />
              <Stat label={t("remaining")} value={stats.data.remainingBudget} />
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label muted">{label}</div>
    </div>
  );
}
