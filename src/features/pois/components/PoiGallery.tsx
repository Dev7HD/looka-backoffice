import { lazy, Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { cx } from "@shared/ui";
import { resolveMediaUrl, uploadMedia } from "@/features/media/api";
import {
  useAddPoiImage,
  usePoiImages,
  useRemovePoiImage,
  useSetPoiCover,
} from "../hooks";
import type { PoiImage } from "../types";

// Filerobot is heavy (canvas/konva) — load it only when the studio opens.
const ImageStudio = lazy(() =>
  import("./ImageStudio").then((m) => ({ default: m.ImageStudio }))
);

/** Resolve a media id to a presigned URL and render the thumbnail with its actions. */
function GalleryImage({
  image,
  onCover,
  onDelete,
  onEdit,
}: {
  image: PoiImage;
  onCover: () => void;
  onDelete: () => void;
  onEdit: (url: string) => void;
}) {
  const { t } = useTranslation("pois");
  const url = useQuery({
    queryKey: ["media", "url", image.mediaId],
    queryFn: () => resolveMediaUrl(image.mediaId),
  });

  // Semi-transparent white / black are intentional neutral primitives here:
  // on-image controls and a scrim that must read over arbitrary photos.
  const btn = "flex-1 rounded-sm px-1.5 py-1 text-12";

  return (
    <div className="group relative aspect-[3/2] overflow-hidden rounded-sm bg-line">
      {url.data ? (
        <img
          className="block size-full object-cover"
          src={url.data}
          alt=""
          crossOrigin="anonymous"
        />
      ) : (
        <div className="size-full animate-pulse bg-line" />
      )}
      {image.cover && (
        <span className="absolute start-2 top-2 rounded-pill bg-brass px-2 py-0.5 text-12 font-medium text-white">
          {t("cover")}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-b from-transparent to-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100">
        {!image.cover && (
          <button type="button" className={cx(btn, "bg-white/90 text-ink")} onClick={onCover}>
            {t("setCover")}
          </button>
        )}
        {url.data && (
          <button
            type="button"
            className={cx(btn, "bg-white/90 text-ink")}
            onClick={() => onEdit(url.data as string)}
          >
            {t("editImage")}
          </button>
        )}
        <button
          type="button"
          className={cx(btn, "bg-critical text-white")}
          onClick={onDelete}
        >
          {t("deleteImage")}
        </button>
      </div>
    </div>
  );
}

/** POI image gallery: upload, set cover, delete, and edit in the full image studio. */
export function PoiGallery({ poiId }: { poiId: string }) {
  const { t } = useTranslation("pois");
  const images = usePoiImages(poiId);
  const add = useAddPoiImage(poiId);
  const remove = useRemovePoiImage(poiId);
  const cover = useSetPoiCover(poiId);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const uploadAndAttach = async (file: File) => {
    setBusy(true);
    try {
      const { id } = await uploadMedia(file);
      await add.mutateAsync({ mediaId: id });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
        {(images.data ?? []).map((img) => (
          <GalleryImage
            key={img.mediaId}
            image={img}
            onCover={() => cover.mutate(img.mediaId)}
            onDelete={() => remove.mutate(img.mediaId)}
            onEdit={setEditing}
          />
        ))}
        {(images.data ?? []).length === 0 && (
          <p className="col-span-full text-12 text-ink-soft">{t("galleryEmpty")}</p>
        )}
      </div>

      <label
        className={cx(
          "self-start rounded-sm border border-dashed border-brass px-3.5 py-2 text-12 font-medium text-brass",
          busy ? "cursor-default opacity-60" : "cursor-pointer"
        )}
      >
        {busy ? t("uploading") : t("addImage")}
        <input
          type="file"
          accept="image/*"
          hidden
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadAndAttach(f);
            e.target.value = "";
          }}
        />
      </label>

      {editing && (
        <Suspense fallback={null}>
          <ImageStudio
            source={editing}
            onSave={uploadAndAttach}
            onClose={() => setEditing(null)}
          />
        </Suspense>
      )}
    </div>
  );
}
