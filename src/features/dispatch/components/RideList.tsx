import { useTranslation } from "react-i18next";
import { StatusPill } from "@shared/ui";
import type { LiveRide } from "../types";

export function RideList({
  rides,
  selectedId,
  onSelect,
}: {
  rides: LiveRide[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation("dispatch");
  if (rides.length === 0)
    return <p className="rides__empty">{t("noActive")}</p>;

  return (
    <ul className="rides">
      {rides.map((r) => {
        const active = r.id === selectedId;
        return (
          <li key={r.id}>
            <button
              type="button"
              className={"ride" + (active ? " ride--active" : "")}
              aria-current={active}
              onClick={() => onSelect(r.id)}
            >
              <div className="ride__top">
                <span className="ride__id mono">{r.id}</span>
                <StatusPill status={r.status} size="sm" label={t(`status.${r.status}`)} />
              </div>
              <div className="ride__meta">
                <span>{r.partner}</span>
                <span aria-hidden="true">·</span>
                <span>{r.driver}</span>
                <span className="ride__pax mono" title={t("passengers")}>
                  {r.passengers}×
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
