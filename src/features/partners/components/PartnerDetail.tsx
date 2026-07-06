import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Field,
  Textarea,
} from "@shared/ui";
import { Can } from "@shared/auth/Can";
import { PARTNER_INTENT } from "../status";
import { useReviewPartner, useSetDocStatus } from "../hooks";
import type { PartnerDetail as Detail } from "../types";
import { KycDocRow } from "./KycDocRow";

export function PartnerDetail({ partner }: { partner: Detail }) {
  const { t, i18n } = useTranslation("partners");
  const review = useReviewPartner();
  const setDoc = useSetDocStatus();
  const [note, setNote] = useState("");

  const busy = review.isPending || setDoc.isPending;
  const allVerified = partner.documents.every((d) => d.status === "VERIFIED");
  const decided = partner.status === "VERIFIED" || partner.status === "REJECTED";

  const dateFmt = new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" });

  const decide = (decision: "VERIFIED" | "REJECTED" | "CHANGES_REQUESTED") =>
    review.mutate({ id: partner.id, decision, note: note.trim() || undefined });

  return (
    <Card>
      <CardHeader
        title={
          <span className="detail__title">
            {partner.businessName}
            <Chip intent={PARTNER_INTENT[partner.status]} size="sm" dot>
              {t(`status.${partner.status}`)}
            </Chip>
          </span>
        }
        actions={
          <span className="detail__submitted">
            {t("submitted")} {dateFmt.format(new Date(partner.submittedAt))}
          </span>
        }
      />
      <CardBody>
        <section className="detail__grid">
          <Info label={t("contactName")}>{partner.contactName}</Info>
          <Info label={t("email")}>
            <a href={`mailto:${partner.email}`}>{partner.email}</a>
          </Info>
          <Info label={t("phone")}>
            <span className="mono">{partner.phone}</span>
          </Info>
          <Info label={t("address")}>{partner.addressLine}</Info>
          <Info label={t("catalog")}>
            {t("catalogCount", { count: partner.catalogCount })}
          </Info>
          <Info label={t("city", { defaultValue: "City" })}>{partner.city}</Info>
        </section>

        <h3 className="detail__section-title">{t("kyc")}</h3>
        <ul className="kyc">
          {partner.documents.map((doc) => (
            <KycDocRow
              key={doc.id}
              doc={doc}
              busy={busy}
              onSet={(status) =>
                setDoc.mutate({ partnerId: partner.id, docId: doc.id, status })
              }
            />
          ))}
        </ul>

        {!decided && (
          <div className="detail__note">
            <Field label={t("note")} htmlFor={`note-${partner.id}`}>
              <Textarea
                id={`note-${partner.id}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("notePlaceholder")}
              />
            </Field>
          </div>
        )}
      </CardBody>

      {!decided && (
        <Can
          role="PARTNER_MANAGER"
          fallback={
            <CardFooter>
              <span className="detail__hint">{t("readOnly", { ns: "common" })}</span>
            </CardFooter>
          }
        >
          <CardFooter>
            {!allVerified && (
              <span className="detail__hint">{t("blockedByDocs")}</span>
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              onClick={() => decide("CHANGES_REQUESTED")}
            >
              {t("actions.requestChanges")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={busy}
              onClick={() => decide("REJECTED")}
            >
              {t("actions.reject")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={busy || !allVerified}
              onClick={() => decide("VERIFIED")}
            >
              {t("actions.approve")}
            </Button>
          </CardFooter>
        </Can>
      )}
    </Card>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="info">
      <span className="info__label eyebrow">{label}</span>
      <span className="info__value">{children}</span>
    </div>
  );
}
