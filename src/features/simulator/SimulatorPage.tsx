import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Field,
  Input,
  useToast,
} from "@shared/ui";
import { useState } from "react";
import { SimulatorMap } from "./components/SimulatorMap";
import { useSimulator } from "./useSimulator";
import {
  useDeleteTour,
  useNearbyDrivers,
  useSaveTour,
  useSavedTours,
  useSuggestTour,
} from "./hooks";
import type { TourPreference } from "./types";
import "./simulator.css";

const PREFERENCES: TourPreference[] = ["TOURIST", "TOURIST_FOOD", "TOURIST_FOOD_COFFEE"];

export function SimulatorPage() {
  const { t } = useTranslation("simulator");
  const toast = useToast();
  const [state, dispatch] = useSimulator();
  const suggest = useSuggestTour();
  const nearby = useNearbyDrivers();
  const saveTour = useSaveTour();
  const savedTours = useSavedTours();
  const deleteTour = useDeleteTour();

  const [tourName, setTourName] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const runSuggest = () => {
    if (!state.origin) return;
    suggest.mutate(
      {
        latitude: state.origin.latitude,
        longitude: state.origin.longitude,
        preference: state.preference,
        stops: state.stops,
        exclude: state.removedIds,
      },
      {
        onSuccess: (s) => dispatch({ type: "setRoute", stops: s.stops, total: s.totalDistanceMeters }),
        onError: () => toast.show({ title: t("suggestError"), intent: "critical" }),
      }
    );
  };

  const requestNewStop = () => {
    if (!state.origin) return;
    const last = state.route[state.route.length - 1];
    const from = last ?? { latitude: state.origin.latitude, longitude: state.origin.longitude };
    suggest.mutate(
      {
        latitude: from.latitude,
        longitude: from.longitude,
        preference: state.preference,
        stops: 1,
        exclude: [...state.removedIds, ...state.route.map((s) => s.poiId)],
      },
      {
        onSuccess: (s) => {
          if (s.stops[0]) dispatch({ type: "appendStop", stop: s.stops[0] });
          else toast.show({ title: t("noMoreStops"), intent: "warning" });
        },
      }
    );
  };

  const askDriver = (index: number) => {
    const from = index === 0 ? state.origin! : state.route[index - 1];
    nearby.mutate(
      { lat: from.latitude, lon: from.longitude },
      { onSuccess: (drivers) => dispatch({ type: "setLegDrivers", index, drivers }) }
    );
  };

  const doSaveTour = () => {
    if (!tourName || !scheduledAt || state.route.length === 0) return;
    saveTour.mutate(
      {
        name: tourName,
        scheduledAt: new Date(scheduledAt).toISOString(),
        stops: state.route.map((s, i) => ({ poiId: s.poiId, driver: state.legMode[i] === "DRIVE" })),
      },
      {
        onSuccess: () => {
          toast.show({ title: t("tourSaved"), intent: "success" });
          setTourName("");
          setScheduledAt("");
        },
        onError: () => toast.show({ title: t("saveError"), intent: "critical" }),
      }
    );
  };

  const km = (m: number) => (m / 1000).toFixed(2);

  return (
    <div className="sim">
      <Card className="sim__map-card">
        <CardHeader
          title={t("title")}
          actions={
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "reset" })}>
              {t("reset")}
            </Button>
          }
        />
        <CardBody>
          <p className="sim__hint">
            {state.origin ? t("originSet") : t("pickHint")}
          </p>
          <SimulatorMap
            origin={state.origin}
            stops={state.route}
            onPick={(lat, lon) => dispatch({ type: "pickOrigin", latitude: lat, longitude: lon })}
          />
        </CardBody>
      </Card>

      {/* --- Configure --- */}
      <Card className="sim__config">
        <CardHeader title={t("configure")} />
        <CardBody>
          <Field label={t("preference")} htmlFor="sim-pref">
            <div className="sim__prefs" id="sim-pref">
              {PREFERENCES.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`sim__pref${state.preference === p ? " sim__pref--on" : ""}`}
                  onClick={() => dispatch({ type: "setPreference", preference: p })}
                >
                  {t(`prefs.${p}`)}
                </button>
              ))}
            </div>
          </Field>
          <Field label={t("stops")} htmlFor="sim-stops">
            <Input
              id="sim-stops"
              type="number"
              min={1}
              max={15}
              value={state.stops}
              onChange={(e) => dispatch({ type: "setStops", stops: Number(e.target.value) })}
            />
          </Field>
        </CardBody>
        <CardFooter>
          <Button
            variant="primary"
            size="sm"
            disabled={!state.origin || suggest.isPending}
            onClick={runSuggest}
          >
            {suggest.isPending ? t("suggesting") : t("suggest")}
          </Button>
        </CardFooter>
      </Card>

      {/* --- Route --- */}
      {state.route.length > 0 && (
        <Card className="sim__route">
          <CardHeader
            title={t("route")}
            actions={<Chip intent="brass" size="sm">{t("totalKm", { km: km(state.totalDistanceMeters) })}</Chip>}
          />
          <CardBody>
            <ol className="sim__stops">
              {state.route.map((s, i) => (
                <li key={s.poiId} className="sim__stop">
                  <span className="sim__stop-num">{s.order}</span>
                  <div className="sim__stop-main">
                    <div className="sim__stop-name">
                      {s.name}
                      <Chip intent={roleIntent(s.role)} size="sm">{t(`roles.${s.role}`)}</Chip>
                    </div>
                    <div className="sim__leg">
                      {i === 0 ? t("fromOrigin") : t("fromPrev")} · {km(s.legDistanceMeters)} km ·{" "}
                      <span className={`sim__mode sim__mode--${(state.legMode[i] ?? "WALK").toLowerCase()}`}>
                        {t(`mode.${state.legMode[i] ?? "WALK"}`)}
                      </span>
                      <button
                        type="button"
                        className="sim__driver-btn"
                        onClick={() => askDriver(i)}
                        disabled={nearby.isPending}
                      >
                        {t("needDriver")}
                      </button>
                      {state.legDrivers[i] !== undefined && (
                        <span className="sim__drivers">
                          {state.legDrivers[i].length === 0
                            ? t("noDrivers")
                            : t("driversFound", { count: state.legDrivers[i].length })}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="sim__remove"
                    aria-label={t("removeStop")}
                    onClick={() => dispatch({ type: "removeStop", poiId: s.poiId })}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ol>
            <Button variant="secondary" size="sm" disabled={suggest.isPending} onClick={requestNewStop}>
              {t("requestNewStop")}
            </Button>
          </CardBody>
          <CardFooter>
            <Field label={t("tourName")} htmlFor="sim-name">
              <Input id="sim-name" value={tourName} onChange={(e) => setTourName(e.target.value)}
                placeholder={t("tourNamePlaceholder")} />
            </Field>
            <Field label={t("schedule")} htmlFor="sim-when">
              <Input id="sim-when" type="datetime-local" value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)} />
            </Field>
            <Button
              variant="primary"
              size="sm"
              disabled={!tourName || !scheduledAt || saveTour.isPending}
              onClick={doSaveTour}
            >
              {t("saveTour")}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* --- Saved future tours --- */}
      <Card className="sim__saved">
        <CardHeader title={t("savedTours")} />
        <CardBody>
          {(savedTours.data ?? []).length === 0 ? (
            <p className="sim__empty">{t("noSavedTours")}</p>
          ) : (
            <ul className="sim__saved-list">
              {(savedTours.data ?? []).map((tour) => (
                <li key={tour.id} className="sim__saved-item">
                  <div>
                    <strong>{tour.name}</strong>
                    <span className="sim__saved-meta">
                      {new Date(tour.scheduledAt).toLocaleString()} · {t("stopCount", { count: tour.stopCount })}
                    </span>
                  </div>
                  <div className="sim__saved-actions">
                    <Chip intent="success" size="sm">{tour.status}</Chip>
                    <button type="button" className="sim__remove" onClick={() => deleteTour.mutate(tour.id)}>
                      ✕
                    </button>
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

function roleIntent(role: string): "brass" | "warning" | "info" {
  if (role === "FOOD") return "warning";
  if (role === "COFFEE") return "info";
  return "brass";
}
