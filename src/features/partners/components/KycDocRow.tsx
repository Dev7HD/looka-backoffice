import { useTranslation } from "react-i18next";
import { Button, Chip } from "@shared/ui";
import { Can } from "@shared/auth/Can";
import { DOC_INTENT } from "../status";
import type { KycDocStatus, KycDocument } from "../types";

export function KycDocRow({
  doc,
  busy,
  onSet,
}: {
  doc: KycDocument;
  busy: boolean;
  onSet: (status: KycDocStatus) => void;
}) {
  const { t } = useTranslation("partners");
  return (
    <li className="kyc-row">
      <div className="kyc-row__main">
        <span className="kyc-row__type">{t(`docType.${doc.type}`)}</span>
        <span className="kyc-row__file mono">{doc.fileName}</span>
      </div>
      <Chip intent={DOC_INTENT[doc.status]} size="sm" dot>
        {t(`docStatus.${doc.status}`)}
      </Chip>
      <Can role="PARTNER_MANAGER">
        <div className="kyc-row__actions">
          <Button
            variant="ghost"
            size="sm"
            disabled={busy || doc.status === "VERIFIED"}
            onClick={() => onSet("VERIFIED")}
          >
            {t("verifyDoc")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={busy || doc.status === "REJECTED"}
            onClick={() => onSet("REJECTED")}
          >
            {t("rejectDoc")}
          </Button>
        </div>
      </Can>
    </li>
  );
}
