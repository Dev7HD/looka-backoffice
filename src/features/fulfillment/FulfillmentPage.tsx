import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, CardBody, CardHeader, Chip, Field, Input, Table, useToast } from "@shared/ui";
import type { Column } from "@shared/ui";
import { useAssignments, useFees, useUpdateFee } from "./hooks";
import type { Assignment, AssignmentKind } from "./api";

const KINDS: AssignmentKind[] = ["DRIVER_LEG", "FOOD_STOP", "COFFEE_STOP"];

export function FulfillmentPage() {
  const { t } = useTranslation("fulfillment");
  const toast = useToast();
  const fees = useFees();
  const updateFee = useUpdateFee();
  const assignments = useAssignments();
  const [edits, setEdits] = useState<Partial<Record<AssignmentKind, number>>>({});

  const save = (kind: AssignmentKind) => {
    const points = edits[kind];
    if (points == null) return;
    updateFee.mutate({ kind, points }, { onSuccess: () => toast.show({ title: t("feeSaved"), intent: "success" }) });
  };

  const columns: Column<Assignment>[] = [
    { key: "tour", header: t("tour"), render: (a) => a.tourId, mono: true },
    { key: "kind", header: t("kind"), render: (a) => t(`kinds.${a.kind}`) },
    { key: "partner", header: t("partner"), render: (a) => a.partnerId ?? "—", mono: true },
    { key: "fee", header: t("fee"), numeric: true, render: (a) => a.feePoints },
    { key: "status", header: t("status"), render: (a) => (
      <Chip intent={a.status === "CONFIRMED" ? "success" : a.status === "UNFILLED" ? "warning" : "neutral"} size="sm">
        {a.status}
      </Chip>
    ) },
  ];

  return (
    <div className="page-stack">
      <Card>
        <CardHeader title={t("fees")} />
        <CardBody>
          <div className="fees-grid">
            {KINDS.map((kind) => (
              <Field key={kind} label={t(`kinds.${kind}`)} htmlFor={`fee-${kind}`}>
                <div className="fees-row">
                  <Input id={`fee-${kind}`} type="number" min={0}
                    value={edits[kind] ?? fees.data?.[kind] ?? 0}
                    onChange={(e) => setEdits((s) => ({ ...s, [kind]: Number(e.target.value) }))} />
                  <Button size="sm" variant="secondary" onClick={() => save(kind)} disabled={updateFee.isPending}>
                    {t("save")}
                  </Button>
                </div>
              </Field>
            ))}
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHeader title={t("assignments")} />
        <CardBody>
          <Table columns={columns} rows={assignments.data ?? []} rowKey={(a) => a.id}
            empty={t("noAssignments")} />
        </CardBody>
      </Card>
    </div>
  );
}
