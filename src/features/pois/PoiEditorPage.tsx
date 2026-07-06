import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { dirFor, LOCALES, type Locale } from "@shared/i18n/config";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Field,
  Input,
  Textarea,
} from "@shared/ui";
import { usePoi, useSavePoi } from "./hooks";
import { emptyLocalized, POI_CATEGORIES, type LngLat, type PoiCategory, type PoiDraft } from "./types";
import { isPublishable, missingLocales } from "./completeness";
import { LocalizedTabs } from "./components/LocalizedTabs";
import { GeofenceMap } from "@shared/map/GeofenceMap";
import { Can } from "@shared/auth/Can";
import "./pois.css";

const CATEGORIES = POI_CATEGORIES;

const EMPTY_DRAFT: PoiDraft = {
  category: "MONUMENT",
  name: emptyLocalized(),
  description: emptyLocalized(),
  audioGuide: emptyLocalized(),
  center: { lng: -7.9938, lat: 31.6242 },
  geofence: [],
};

export function PoiEditorPage() {
  const { t } = useTranslation("pois");
  const query = usePoi("poi-01"); // single-POI editor demo
  const save = useSavePoi();

  const [draft, setDraft] = useState<PoiDraft>(EMPTY_DRAFT);
  const [active, setActive] = useState<Locale>("fr");
  const [dirty, setDirty] = useState(false);

  // Hydrate draft from server once loaded.
  useEffect(() => {
    if (query.data) {
      const { id, published: _p, ...rest } = query.data;
      setDraft({ id, ...rest });
      setDirty(false);
    }
  }, [query.data]);

  const complete = useMemo(
    () =>
      LOCALES.reduce((acc, l) => {
        acc[l] = !!draft.name[l].trim() && !!draft.description[l].trim();
        return acc;
      }, {} as Record<Locale, boolean>),
    [draft]
  );
  const missing = missingLocales(draft);
  const publishable = isPublishable(draft);

  const patch = (p: Partial<PoiDraft>) => {
    setDraft((d) => ({ ...d, ...p }));
    setDirty(true);
  };
  const setName = (v: string) =>
    patch({ name: { ...draft.name, [active]: v } });
  const setDesc = (v: string) =>
    patch({ description: { ...draft.description, [active]: v } });
  const setGeofence = (geofence: LngLat[]) => patch({ geofence });

  const doSave = (publish: boolean) =>
    save.mutate(
      { draft, publish },
      { onSuccess: () => setDirty(false) }
    );

  const resetDraft = () => {
    if (!query.data) return;
    const { id, published: _p, ...rest } = query.data;
    setDraft({ id, ...rest });
    setDirty(false);
  };

  const dir = dirFor(active);

  return (
    <div className="poi">
      {/* --- Form panel --- */}
      <Card className="poi__form">
        <CardHeader
          title={t("title")}
          actions={
            query.data?.published ? (
              <Chip intent="success" size="sm" dot>
                {t("published")}
              </Chip>
            ) : (
              <Chip intent="warning" size="sm">
                {t("draft")}
              </Chip>
            )
          }
        />
        <CardBody>
          <Field label={t("category")} htmlFor="poi-cat">
            <select
              id="poi-cat"
              className="input"
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value as PoiCategory })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`categories.${c}`)}
                </option>
              ))}
            </select>
          </Field>

          <div className="poi__i18n">
            <LocalizedTabs active={active} onSelect={setActive} complete={complete} />
            <div className="poi__i18n-fields" dir={dir}>
              <Field label={t("name")} htmlFor="poi-name">
                <Input
                  id="poi-name"
                  dir={dir}
                  value={draft.name[active]}
                  onChange={(e) => setName(e.target.value)}
                  invalid={!draft.name[active].trim()}
                  placeholder={t("namePlaceholder")}
                />
              </Field>
              <Field label={t("description")} htmlFor="poi-desc">
                <Textarea
                  id="poi-desc"
                  dir={dir}
                  value={draft.description[active]}
                  onChange={(e) => setDesc(e.target.value)}
                  invalid={!draft.description[active].trim()}
                  placeholder={t("descriptionPlaceholder")}
                />
              </Field>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* --- Map panel --- */}
      <Card className="poi__map">
        <CardHeader
          title={t("geofence")}
          actions={
            <span className="poi__coords mono">
              {draft.center.lat.toFixed(4)}, {draft.center.lng.toFixed(4)}
            </span>
          }
        />
        <CardBody>
          <GeofenceMap
            center={draft.center}
            points={draft.geofence}
            onChange={setGeofence}
          />
          <p className="poi__map-hint">
            {t("mapHint", { count: draft.geofence.length })}
          </p>
        </CardBody>
      </Card>

      {/* --- Save / publish footer --- */}
      <Card className="poi__footer">
        <CardFooter>
          <div className="poi__completeness">
            {missing.length === 0 ? (
              <Chip intent="success" size="sm" dot>
                {t("allTranslated")}
              </Chip>
            ) : (
              <span className="poi__missing">
                {t("missingTranslations")}:{" "}
                {missing.map((l) => l.toUpperCase()).join(", ")}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            disabled={!dirty || save.isPending}
            onClick={resetDraft}
          >
            {t("cancel", { ns: "common" })}
          </Button>
          <Can
            role="CATALOG_MANAGER"
            fallback={<span className="poi__missing">{t("readOnly", { ns: "common" })}</span>}
          >
            <Button
              variant="secondary"
              size="sm"
              disabled={save.isPending}
              onClick={() => doSave(false)}
            >
              {t("saveDraft")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!publishable || save.isPending}
              onClick={() => doSave(true)}
            >
              {t("publish")}
            </Button>
          </Can>
        </CardFooter>
      </Card>
    </div>
  );
}
