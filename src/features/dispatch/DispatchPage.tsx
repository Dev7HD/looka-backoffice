import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader, Chip, StatusPill } from "@shared/ui";
import { useDispatch } from "./useDispatch";
import { LiveMap } from "./components/LiveMap";
import { RideList } from "./components/RideList";
import { LiveIndicator } from "./components/LiveIndicator";
import "./dispatch.css";

const SUMMARY: { status: "IN_TOUR" | "VALIDATED" | "PENDING"; intent: "brass" | "primary" | "info" }[] = [
  { status: "IN_TOUR", intent: "brass" },
  { status: "VALIDATED", intent: "primary" },
  { status: "PENDING", intent: "info" },
];

export function DispatchPage() {
  const { t } = useTranslation("dispatch");
  const { rides, ended, counts, status } = useDispatch();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="dispatch">
      <div className="dispatch__bar">
        <div className="dispatch__counts">
          {SUMMARY.map((s) => (
            <Chip key={s.status} intent={s.intent} size="sm" dot>
              {counts[s.status] ?? 0} {t(`status.${s.status}`)}
            </Chip>
          ))}
        </div>
        <LiveIndicator status={status} />
      </div>

      <Card className="dispatch__map">
        <CardHeader title={t("liveMap")} />
        <CardBody>
          <LiveMap rides={rides} selectedId={selectedId} onSelect={setSelectedId} />
        </CardBody>
      </Card>

      <div className="dispatch__side">
        <Card>
          <CardHeader
            title={t("activeRides")}
            actions={<span className="dispatch__total mono">{rides.length}</span>}
          />
          <RideList rides={rides} selectedId={selectedId} onSelect={setSelectedId} />
        </Card>

        {ended.length > 0 && (
          <Card>
            <CardHeader title={t("recentOutcomes")} />
            <ul className="ended">
              {ended.map((r) => (
                <li key={`${r.id}-${r.updatedAt}`} className="ended__row">
                  <span className="ended__id mono">{r.id}</span>
                  <StatusPill status={r.status} size="sm" label={t(`status.${r.status}`)} />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
