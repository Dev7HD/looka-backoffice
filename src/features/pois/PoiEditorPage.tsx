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
import {
  useDeletePoi,
  usePoi,
  usePoiList,
  useSavePoi,
  useSetPoiPublished,
} from "./hooks";
import { PoiGallery } from "./components/PoiGallery";
import { emptyLocalized, POI_CATEGORIES, type LngLat, type PoiCategory, type PoiDraft } from "./types";
import { isPublishable, missingLocales } from "./completeness";
import { LocalizedTabs } from "./components/LocalizedTabs";
import { GeofenceMap } from "@shared/map/GeofenceMap";
import { Can } from "@shared/auth/Can";

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
  // Pick an existing POI from the backend catalog to edit, or start a new one.
  const list = usePoiList();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = usePoi(selectedId);
  const save = useSavePoi();
  const del = useDeletePoi();
  const setPublished = useSetPoiPublished();

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

  const selectPoi = (id: string) => {
    if (id === "") {
      setSelectedId(null);
      setDraft(EMPTY_DRAFT);
      setDirty(false);
    } else {
      setSelectedId(id);
    }
  };

  const poiLabel = (p: { id: string; name: Record<Locale, string> }) =>
    p.name[active]?.trim() || p.name.en?.trim() || p.id;

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

  const doDelete = () => {
    if (!selectedId) return;
    if (!window.confirm(t("confirmDelete"))) return;
    del.mutate(selectedId, {
      onSuccess: () => {
        setSelectedId(null);
        setDraft(EMPTY_DRAFT);
        setDirty(false);
      },
    });
  };

  const doToggleEnabled = () => {
    if (!selectedId) return;
    setPublished.mutate({ id: selectedId, published: !query.data?.published });
  };

  const resetDraft = () => {
    if (!query.data) return;
    const { id, published: _p, ...rest } = query.data;
    setDraft({ id, ...rest });
    setDirty(false);
  };

  const dir = dirFor(active);

  return (
    <div className="grid grid-cols-1 items-start gap-5 min-[960px]:grid-cols-2">
      {/* --- Form panel --- */}
      <Card className="min-[960px]:col-start-1 min-[960px]:row-start-1">
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
        <CardBody className="flex flex-col gap-5">
          <Field label={t("selectPoi")} htmlFor="poi-select">
            <select
              id="poi-select"
              className="input"
              value={selectedId ?? ""}
              onChange={(e) => selectPoi(e.target.value)}
            >
              <option value="">{t("newPoi")}</option>
              {(list.data ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {poiLabel(p)}
                </option>
              ))}
            </select>
          </Field>

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

          <div className="flex flex-col gap-4">
            <LocalizedTabs active={active} onSelect={setActive} complete={complete} />
            <div className="flex flex-col gap-4" dir={dir}>
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

      {/* --- Gallery panel (existing POIs only) --- */}
      {selectedId && (
        <Card className="min-[960px]:col-start-1 min-[960px]:row-start-2">
          <CardHeader title={t("gallery")} />
          <CardBody>
            <PoiGallery poiId={selectedId} />
          </CardBody>
        </Card>
      )}

      {/* --- Map panel --- */}
      <Card className="min-[960px]:col-start-2 min-[960px]:row-start-1">
        <CardHeader
          title={t("geofence")}
          actions={
            <span className="font-mono text-12 tabular-nums text-ink-soft">
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
          <p className="mt-3 text-12 text-ink-soft">
            {t("mapHint", { count: draft.geofence.length })}
          </p>
        </CardBody>
      </Card>

      {/* --- Save / publish footer --- */}
      <Card className="min-[960px]:col-span-2">
        <CardFooter>
          <div className="me-auto">
            {missing.length === 0 ? (
              <Chip intent="success" size="sm" dot>
                {t("allTranslated")}
              </Chip>
            ) : (
              <span className="text-12 font-medium text-brass">
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
            fallback={<span className="text-12 font-medium text-brass">{t("readOnly", { ns: "common" })}</span>}
          >
            {selectedId && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={del.isPending}
                  onClick={doDelete}
                >
                  {t("delete")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={setPublished.isPending}
                  onClick={doToggleEnabled}
                >
                  {query.data?.published ? t("disable") : t("enable")}
                </Button>
              </>
            )}
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
