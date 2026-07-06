import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AsyncBoundary } from "@shared/ui";
import { useMedia, useModerateMedia } from "./hooks";
import { MEDIA_STATUSES } from "./status";
import { MediaCard } from "./components/MediaCard";
import type { MediaStatus } from "./types";
import "./media.css";

export function MediaPage() {
  const { t } = useTranslation("media");
  const [status, setStatus] = useState<MediaStatus | undefined>("PENDING");
  const media = useMedia(status);
  const moderate = useModerateMedia();

  return (
    <div className="media">
      <div className="media__filters">
        <button
          type="button"
          className={"chip chip--sm " + (status ? "chip--neutral" : "chip--primary")}
          onClick={() => setStatus(undefined)}
        >
          {t("filterAll")}
        </button>
        {MEDIA_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={"chip chip--sm " + (status === s ? "chip--primary" : "chip--neutral")}
            onClick={() => setStatus(s)}
          >
            {t(`status.${s}`)}
          </button>
        ))}
      </div>

      <AsyncBoundary
        isLoading={media.isLoading}
        isError={media.isError}
        error={media.error}
        onRetry={() => void media.refetch()}
      >
        {(media.data?.items.length ?? 0) === 0 ? (
          <p className="media__empty">{t("empty")}</p>
        ) : (
          <div className="media__grid">
            {media.data!.items.map((item) => (
              <MediaCard
                key={item.id}
                item={item}
                busy={moderate.isPending}
                onModerate={(next) => moderate.mutate({ id: item.id, status: next })}
              />
            ))}
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
