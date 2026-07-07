import { useTranslation } from "react-i18next";
import { Button, Card, Chip } from "@shared/ui";
import { Can } from "@shared/auth/Can";
import { MEDIA_INTENT } from "../status";
import type { MediaItem } from "../types";

/** Deterministic hue from the id so thumbnails stay stable & varied offline. */
function hue(id: string): number {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

export function MediaCard({
  item,
  busy,
  onModerate,
}: {
  item: MediaItem;
  busy: boolean;
  onModerate: (status: "APPROVED" | "REJECTED") => void;
}) {
  const { t } = useTranslation("media");
  const h = hue(item.id);

  return (
    <Card className="media-card">
      <div
        className="media-card__thumb"
        style={{ background: `linear-gradient(135deg, hsl(${h} 40% 82%), hsl(${(h + 40) % 360} 45% 68%))` }}
      >
        <span className="media-card__type">
          {item.type === "AUDIO" ? (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 10v4h4l5 5V5L7 10H3z" />
              <path d="M16 8a5 5 0 0 1 0 8" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M3 15l5-4 4 3 3-2 6 5" />
              <circle cx="8.5" cy="8.5" r="1.5" />
            </svg>
          )}
        </span>
        <span className="media-card__badges">
          <Chip intent="neutral" size="sm">{t(`type.${item.type}`)}</Chip>
          {item.type === "AUDIO" && item.durationSec != null && (
            <Chip intent="neutral" size="sm">{t("duration", { sec: item.durationSec })}</Chip>
          )}
          {item.locale && <Chip intent="neutral" size="sm">{item.locale.toUpperCase()}</Chip>}
        </span>
      </div>

      <div className="media-card__body">
        <div className="media-card__head">
          <span className="media-card__title">{item.title}</span>
          <Chip intent={MEDIA_INTENT[item.status]} size="sm" dot>
            {t(`status.${item.status}`)}
          </Chip>
        </div>
        <p className="media-card__meta">
          {item.poiName} · {t("by", { partner: item.uploadedBy })}
        </p>

        {item.status === "PENDING" && (
          <Can role="MEDIA_MODERATOR" fallback={<p className="media-card__ro">{t("readOnly", { ns: "common" })}</p>}>
            <div className="media-card__actions">
              <Button variant="danger" size="sm" disabled={busy} onClick={() => onModerate("REJECTED")}>
                {t("reject")}
              </Button>
              <Button variant="primary" size="sm" disabled={busy} onClick={() => onModerate("APPROVED")}>
                {t("approve")}
              </Button>
            </div>
          </Can>
        )}
      </div>
    </Card>
  );
}
