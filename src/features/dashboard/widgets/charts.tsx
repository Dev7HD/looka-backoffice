import { Bar, Doughnut, Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useTranslation } from "react-i18next";
import { AsyncBoundary } from "@shared/ui";
import "./register";
import type { MetricRange } from "../api";
import { chartPalette, useThemeVersion } from "../theme";
import { useDriverStatus, useMetricSeries, useRideOutcomes, useTopPois } from "../hooks";

/** #rrggbb (design token) → rgba() so we can add fill opacity without hardcode. */
function alpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Shared axis/grid styling for the cartesian charts. */
function axes(pal: ReturnType<typeof chartPalette>): ChartOptions<"line" | "bar">["scales"] {
  return {
    x: { ticks: { color: pal.inkSoft }, grid: { display: false } },
    y: { ticks: { color: pal.inkSoft }, grid: { color: pal.line }, beginAtZero: true },
  };
}

const FILL_HEIGHT = "relative h-full w-full";

export function RidesLineWidget({ range = "7d" }: { range?: MetricRange }) {
  const { t } = useTranslation("dashboard");
  const version = useThemeVersion();
  const q = useMetricSeries("rides", range);
  const pal = chartPalette();

  return (
    <AsyncBoundary isLoading={q.isLoading} isError={q.isError} error={q.error} onRetry={q.refetch}>
      <div className={FILL_HEIGHT}>
        {q.data && (
          <Line
            key={version}
            data={{
              labels: q.data.labels,
              datasets: [
                {
                  label: t("kpi.activeRides"),
                  data: q.data.values,
                  borderColor: pal.series[0],
                  backgroundColor: alpha(pal.series[0], 0.15),
                  fill: true,
                  tension: 0.35,
                  pointRadius: 2,
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: axes(pal),
              plugins: { legend: { display: false } },
            }}
          />
        )}
      </div>
    </AsyncBoundary>
  );
}

export function RevenueBarWidget() {
  const { t } = useTranslation("dashboard");
  const version = useThemeVersion();
  const q = useMetricSeries("revenue");
  const pal = chartPalette();

  return (
    <AsyncBoundary isLoading={q.isLoading} isError={q.isError} error={q.error} onRetry={q.refetch}>
      <div className={FILL_HEIGHT}>
        {q.data && (
          <Bar
            key={version}
            data={{
              labels: q.data.labels,
              datasets: [
                {
                  label: t("widgets.chart-revenue"),
                  data: q.data.values,
                  backgroundColor: pal.series[1],
                  borderRadius: 4,
                  maxBarThickness: 28,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: axes(pal),
              plugins: { legend: { display: false } },
            }}
          />
        )}
      </div>
    </AsyncBoundary>
  );
}

export function OutcomesDoughnutWidget() {
  const { t } = useTranslation("dashboard");
  const version = useThemeVersion();
  const q = useRideOutcomes();
  const pal = chartPalette();

  return (
    <AsyncBoundary isLoading={q.isLoading} isError={q.isError} error={q.error} onRetry={q.refetch}>
      <div className={FILL_HEIGHT}>
        {q.data && (
          <Doughnut
            key={version}
            data={{
              labels: [t("outcomes.completed"), t("outcomes.cancelled"), t("outcomes.abandoned")],
              datasets: [
                {
                  data: [q.data.completed, q.data.cancelled, q.data.abandoned],
                  backgroundColor: [pal.series[3], pal.inkSoft, pal.series[4]],
                  borderColor: pal.surface,
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: "62%",
              plugins: { legend: { position: "bottom", labels: { color: pal.ink, boxWidth: 12 } } },
            }}
          />
        )}
      </div>
    </AsyncBoundary>
  );
}

export function DriverStatusWidget() {
  const { t } = useTranslation("dashboard");
  const version = useThemeVersion();
  const q = useDriverStatus();
  const pal = chartPalette();

  return (
    <AsyncBoundary isLoading={q.isLoading} isError={q.isError} error={q.error} onRetry={q.refetch}>
      <div className={FILL_HEIGHT}>
        {q.data && (
          <Doughnut
            key={version}
            data={{
              labels: [t("driver.online"), t("driver.onRide"), t("driver.offline")],
              datasets: [
                {
                  data: [q.data.online, q.data.onRide, q.data.offline],
                  backgroundColor: [pal.series[3], pal.series[2], pal.inkSoft],
                  borderColor: pal.surface,
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: "62%",
              plugins: { legend: { position: "bottom", labels: { color: pal.ink, boxWidth: 12 } } },
            }}
          />
        )}
      </div>
    </AsyncBoundary>
  );
}

export function TopPoisWidget() {
  const { t } = useTranslation("dashboard");
  const version = useThemeVersion();
  const q = useTopPois();
  const pal = chartPalette();

  return (
    <AsyncBoundary isLoading={q.isLoading} isError={q.isError} error={q.error} onRetry={q.refetch}>
      <div className={FILL_HEIGHT}>
        {q.data && (
          <Bar
            key={version}
            data={{
              labels: q.data.map((p) => p.name),
              datasets: [
                {
                  label: t("widgets.chart-top-pois"),
                  data: q.data.map((p) => p.visits),
                  backgroundColor: pal.series[0],
                  borderRadius: 4,
                  maxBarThickness: 22,
                },
              ],
            }}
            options={{
              indexAxis: "y",
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { ticks: { color: pal.inkSoft }, grid: { color: pal.line }, beginAtZero: true },
                y: { ticks: { color: pal.inkSoft }, grid: { display: false } },
              },
              plugins: { legend: { display: false } },
            }}
          />
        )}
      </div>
    </AsyncBoundary>
  );
}
