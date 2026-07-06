import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, CardHeader, Chip } from "@shared/ui";
import { permissionState } from "@shared/notifications/fcm";
import { useDevices, useDeleteDevice } from "@shared/notifications/hooks";
import { useEnableNotifications } from "@shared/notifications/useNotifications";
import {
  isSubscribed,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  toggleSubscription,
  type NotificationChannel,
  type NotificationCategory,
} from "@shared/notifications/categories";
import { usePreferences, useUpdatePreferences } from "./hooks";

export function NotificationsCard() {
  const { t } = useTranslation("notifications");
  const { enable, busy, supported } = useEnableNotifications();
  const devices = useDevices(supported);
  const remove = useDeleteDevice();
  const prefs = usePreferences();
  const update = useUpdatePreferences();
  const permission = permissionState();

  const granted = permission === "granted";
  const blocked = permission === "denied";
  const subs = prefs.data?.notifications;

  const toggle = (channel: NotificationChannel, category: NotificationCategory) => {
    if (!prefs.data) return;
    update.mutate({
      ...prefs.data,
      notifications: toggleSubscription(prefs.data.notifications, channel, category),
    });
  };

  return (
    <Card>
      <CardHeader title={t("title")} />
      <CardBody>
        <p className="settings__hint">{t("description")}</p>

        <div className="notif__action">
          {!supported ? (
            <Chip intent="neutral" size="sm">{t("unsupported")}</Chip>
          ) : blocked ? (
            <Chip intent="critical" size="sm" dot>{t("blocked")}</Chip>
          ) : granted ? (
            <Chip intent="success" size="sm" dot>{t("enabled")}</Chip>
          ) : (
            <Button variant="primary" size="sm" disabled={busy} onClick={() => void enable()}>
              {busy ? t("busy") : t("enable")}
            </Button>
          )}
        </div>

        {/* Channel × category subscription matrix (backend `notifications` map) */}
        {subs && (
          <div className="notif__subs">
            <span className="eyebrow">{t("subscriptions")}</span>
            <table className="notif__matrix">
              <thead>
                <tr>
                  <th scope="col" className="notif__matrix-cat">{t("category")}</th>
                  {NOTIFICATION_CHANNELS.map((ch) => (
                    <th scope="col" key={ch}>{t(`channel.${ch}`)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NOTIFICATION_CATEGORIES.map((cat) => (
                  <tr key={cat}>
                    <th scope="row" className="notif__matrix-cat">{t(`category_v.${cat}`)}</th>
                    {NOTIFICATION_CHANNELS.map((ch) => (
                      <td key={ch}>
                        <input
                          type="checkbox"
                          className="notif__check"
                          checked={isSubscribed(subs, ch, cat)}
                          disabled={update.isPending}
                          aria-label={`${t(`channel.${ch}`)} · ${t(`category_v.${cat}`)}`}
                          onChange={() => toggle(ch, cat)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {supported && (
          <div className="notif__devices">
            <span className="eyebrow">{t("devices")}</span>
            {devices.data && devices.data.length > 0 ? (
              <ul className="notif__list">
                {devices.data.map((d) => (
                  <li key={d.token} className="notif__row">
                    <span className="notif__token mono">
                      {t("webPush")} · …{d.token.slice(-8)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={remove.isPending}
                      onClick={() => remove.mutate(d.token)}
                    >
                      {t("remove")}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="settings__hint">{t("noDevices")}</p>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
