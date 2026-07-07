import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, CardHeader, Chip, useToast } from "@shared/ui";
import { useReports, useResolveReport } from "./hooks";
import type { ReportStatus } from "./api";

const RESOLUTIONS: ReportStatus[] = ["REVIEWED", "DISMISSED", "ACTION_TAKEN"];

export function ReportsPage() {
  const { t } = useTranslation("reports");
  const toast = useToast();
  const reports = useReports("OPEN");
  const resolve = useResolveReport();

  const act = (id: string, status: ReportStatus) => {
    resolve.mutate({ id, status }, { onSuccess: () => toast.show({ title: t("resolved"), intent: "success" }) });
  };

  return (
    <div className="page-stack">
      <Card>
        <CardHeader title={t("openReports")} />
        <CardBody>
          {(reports.data ?? []).length === 0 ? (
            <p className="muted">{t("empty")}</p>
          ) : (
            <ul className="ads-list">
              {(reports.data ?? []).map((r) => (
                <li key={r.id} className="ads-item">
                  <div>
                    <strong>{t("partner")} {r.partnerId}</strong>
                    <Chip intent="warning" size="sm">{t(`reasons.${r.reason}`)}</Chip>
                    <div className="muted">{r.comment}</div>
                    <div className="muted">{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="ads-actions">
                    {RESOLUTIONS.map((res) => (
                      <Button key={res} size="sm" variant={res === "ACTION_TAKEN" ? "primary" : "secondary"}
                        onClick={() => act(r.id, res)} disabled={resolve.isPending}>
                        {t(`actions.${res}`)}
                      </Button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
