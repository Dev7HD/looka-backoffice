import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardHeader,
  Chip,
  Table,
  type Column,
} from "@shared/ui";
import { useEscrowSummary, useLedger } from "./hooks";
import { SummaryCards } from "./components/SummaryCards";
import { TXN_INTENT, TXN_TYPES } from "./txn";
import type { LedgerEntry, TxnType } from "./types";
import "./ledger.css";

const PAGE_SIZE = 10;

export function LedgerPage() {
  const { t, i18n } = useTranslation("ledger");
  const [type, setType] = useState<TxnType | undefined>(undefined);
  const [page, setPage] = useState(0);
  const summary = useEscrowSummary();
  const ledger = useLedger(type, page, PAGE_SIZE);

  const nf = new Intl.NumberFormat(i18n.language, { signDisplay: "always" });
  const nfPlain = new Intl.NumberFormat(i18n.language);
  const timeFmt = new Intl.DateTimeFormat(i18n.language, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const setFilter = (next: TxnType | undefined) => {
    setType(next);
    setPage(0);
  };

  const columns: Column<LedgerEntry>[] = [
    { key: "id", header: t("col.txn"), render: (e) => e.id, mono: true },
    {
      key: "type",
      header: t("col.type"),
      render: (e) => (
        <Chip intent={TXN_INTENT[e.type]} size="sm">
          {t(`type.${e.type}`)}
        </Chip>
      ),
    },
    { key: "ride", header: t("col.ride"), render: (e) => e.rideId ?? "—", mono: true },
    { key: "partner", header: t("col.partner"), render: (e) => e.partner ?? "—" },
    {
      key: "amount",
      header: t("col.amount"),
      numeric: true,
      render: (e) => (
        <span className={e.points >= 0 ? "amt amt--pos" : "amt amt--neg"}>
          {nf.format(e.points)}
        </span>
      ),
    },
    {
      key: "balance",
      header: t("col.balance"),
      numeric: true,
      mono: true,
      render: (e) => nfPlain.format(e.balanceAfter),
    },
    {
      key: "time",
      header: t("col.time"),
      render: (e) => timeFmt.format(new Date(e.at)),
    },
  ];

  const total = ledger.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="ledger">
      <p className="ledger__note eyebrow">{t("readOnly")}</p>

      {summary.data && <SummaryCards summary={summary.data} />}

      <Card>
        <CardHeader
          title={t("transactions")}
          actions={
            <div className="ledger__filters">
              <button
                type="button"
                className={"chip chip--sm " + (type ? "chip--neutral" : "chip--primary")}
                onClick={() => setFilter(undefined)}
              >
                {t("filterAll")}
              </button>
              {TXN_TYPES.map((tt) => (
                <button
                  key={tt}
                  type="button"
                  className={"chip chip--sm " + (type === tt ? "chip--primary" : "chip--neutral")}
                  onClick={() => setFilter(tt)}
                >
                  {t(`type.${tt}`)}
                </button>
              ))}
            </div>
          }
        />
        <Table
          columns={columns}
          rows={ledger.data?.entries ?? []}
          rowKey={(e) => e.id}
          empty={ledger.isLoading ? t("loading", { ns: "common" }) : t("empty")}
        />
        <div className="ledger__pager">
          <span className="ledger__page">
            {t("page", { page: page + 1, pages })}
          </span>
          <div className="ledger__pager-btns">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              {t("prev")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page + 1 >= pages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
