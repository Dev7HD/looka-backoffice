import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardHeader, Chip, Table, type Column } from "@shared/ui";
import { Can } from "@shared/auth/Can";
import { useDrivers, useSetDriverStatus } from "./hooks";
import { DRIVER_INTENT, DRIVER_STATUSES } from "./status";
import type { Driver, DriverStatus } from "./types";
import "./drivers.css";

const PAGE_SIZE = 10;

export function DriversPage() {
  const { t, i18n } = useTranslation("drivers");
  const [status, setStatus] = useState<DriverStatus | undefined>(undefined);
  const [page, setPage] = useState(0);
  const drivers = useDrivers(status, page, PAGE_SIZE);
  const setDriver = useSetDriverStatus();

  const nf = new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  const setFilter = (next: DriverStatus | undefined) => {
    setStatus(next);
    setPage(0);
  };

  const columns: Column<Driver>[] = [
    { key: "id", header: t("col.id"), render: (d) => d.id, mono: true },
    {
      key: "name",
      header: t("col.name"),
      render: (d) => (
        <div className="drv__name">
          <span>{d.name}</span>
          <span className="drv__phone mono">{d.phone}</span>
        </div>
      ),
    },
    { key: "vehicle", header: t("col.vehicle"), render: (d) => d.vehicle },
    { key: "city", header: t("col.city"), render: (d) => d.city },
    {
      key: "status",
      header: t("col.status"),
      render: (d) => (
        <div className="drv__status">
          <Chip intent={DRIVER_INTENT[d.status]} size="sm" dot>
            {t(`status.${d.status}`)}
          </Chip>
          {d.currentRideId && (
            <span className="drv__ride mono">{t("onRide", { ride: d.currentRideId })}</span>
          )}
        </div>
      ),
    },
    { key: "rating", header: t("col.rating"), numeric: true, render: (d) => `★ ${nf.format(d.rating)}` },
    { key: "rides", header: t("col.rides"), numeric: true, render: (d) => d.ridesToday },
    {
      key: "actions",
      header: t("col.actions"),
      render: (d) => (
        <Can role="DISPATCHER">
          {d.status === "SUSPENDED" ? (
            <Button
              variant="ghost"
              size="sm"
              disabled={setDriver.isPending}
              onClick={() => setDriver.mutate({ id: d.id, status: "OFFLINE" })}
            >
              {t("reactivate")}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled={setDriver.isPending}
              onClick={() => setDriver.mutate({ id: d.id, status: "SUSPENDED" })}
            >
              {t("suspend")}
            </Button>
          )}
        </Can>
      ),
    },
  ];

  const total = drivers.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="drivers">
      <div className="drivers__filters">
        <button
          type="button"
          className={"chip chip--sm " + (status ? "chip--neutral" : "chip--primary")}
          onClick={() => setFilter(undefined)}
        >
          {t("filterAll")}
        </button>
        {DRIVER_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={"chip chip--sm " + (status === s ? "chip--primary" : "chip--neutral")}
            onClick={() => setFilter(s)}
          >
            {t(`status.${s}`)}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader
          title={t("title")}
          actions={<span className="drivers__total mono">{total}</span>}
        />
        <Table
          columns={columns}
          rows={drivers.data?.drivers ?? []}
          rowKey={(d) => d.id}
          empty={drivers.isLoading ? t("loading", { ns: "common" }) : t("empty")}
        />
        <div className="drivers__pager">
          <span className="drivers__page">{t("page", { page: page + 1, pages })}</span>
          <div className="drivers__pager-btns">
            <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              {t("prev")}
            </Button>
            <Button variant="secondary" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>
              {t("next")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
