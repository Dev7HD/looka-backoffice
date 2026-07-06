import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@shared/ui";
import { usePartner, usePartners } from "./hooks";
import { PartnerQueue } from "./components/PartnerQueue";
import { PartnerDetail } from "./components/PartnerDetail";
import "./partners.css";

export function PartnersPage() {
  const { t } = useTranslation("partners");
  const list = usePartners();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detail = usePartner(selectedId);

  // Auto-select first in queue once loaded.
  useEffect(() => {
    if (!selectedId && list.data && list.data.length > 0) {
      setSelectedId(list.data[0].id);
    }
  }, [list.data, selectedId]);

  return (
    <div className="partners">
      <aside className="partners__queue">
        <Card>
          <div className="partners__queue-head">
            <h2>{t("queue")}</h2>
          </div>
          <PartnerQueue
            partners={list.data ?? []}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={list.isLoading}
          />
        </Card>
      </aside>

      <section className="partners__detail">
        {detail.data ? (
          <PartnerDetail partner={detail.data} />
        ) : (
          <Card pad>
            <p className="partners__prompt">
              {detail.isLoading
                ? t("loading", { ns: "common" })
                : t("selectPrompt")}
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}
