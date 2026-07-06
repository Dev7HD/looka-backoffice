import { useTranslation } from "react-i18next";
import { Chip } from "@shared/ui";
import { PARTNER_INTENT } from "../status";
import type { PartnerSummary } from "../types";

export function PartnerQueue({
  partners,
  selectedId,
  onSelect,
  loading,
}: {
  partners: PartnerSummary[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  const { t, i18n } = useTranslation("partners");
  const dateFmt = new Intl.DateTimeFormat(i18n.language, {
    day: "2-digit",
    month: "short",
  });

  if (loading) return <p className="queue__empty">{t("loading", { ns: "common" })}</p>;
  if (partners.length === 0)
    return <p className="queue__empty">{t("noPartners")}</p>;

  return (
    <ul className="queue">
      {partners.map((p) => {
        const active = p.id === selectedId;
        return (
          <li key={p.id}>
            <button
              type="button"
              className={"queue__item" + (active ? " queue__item--active" : "")}
              aria-current={active}
              onClick={() => onSelect(p.id)}
            >
              <div className="queue__row">
                <span className="queue__name">{p.businessName}</span>
                <Chip intent={PARTNER_INTENT[p.status]} size="sm">
                  {t(`status.${p.status}`)}
                </Chip>
              </div>
              <div className="queue__meta">
                <span>{p.city}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {t("submitted")} {dateFmt.format(new Date(p.submittedAt))}
                </span>
                {p.pendingDocs > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="queue__pending">
                      {t("pendingDocs", { count: p.pendingDocs })}
                    </span>
                  </>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
