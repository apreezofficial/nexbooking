"use client";

import { use } from "react";
import { Download, FileX, Share2 } from "lucide-react";
import { api } from "@/lib/dashboard/api";
import { naira } from "@/lib/dashboard/data";
import { useReceipts, useRun } from "@/lib/dashboard/hooks";
import { Page } from "../DashboardShell";
import { Badge, Button, Card, Divider, PageHeader, Row, StateView } from "../ui";

export default function ReceiptScreen({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = use(params);
  const receipt = useReceipts().find((item) => item.ref === ref);
  const { run, notify } = useRun();

  if (!receipt) {
    return (
      <Page>
        <PageHeader title="Receipt" back="/dashboard/account/invoices" />
        <StateView icon={FileX} title="We couldn’t find that receipt" body="Your other receipts are in Invoices & receipts." primary={{ label: "See all receipts", href: "/dashboard/account/invoices" }} />
      </Page>
    );
  }

  const share = async () => {
    const text = `EdeBooking receipt ${receipt.ref} · ${receipt.studio} · ${naira(receipt.total)}`;
    try {
      if (navigator.share) await navigator.share({ title: `Receipt ${receipt.ref}`, text });
      else {
        await navigator.clipboard.writeText(text);
        notify("Receipt details copied.");
      }
    } catch {
      /* the share sheet was dismissed */
    }
  };

  return (
    <Page>
      <PageHeader title="Receipt" back="/dashboard/account/invoices" />
      <Card className="d-receipt">
        <Badge status={receipt.status === "Paid" ? "Confirmed" : "Refunded"} label={receipt.status === "Paid" ? "✓ Paid" : "Refunded"} />
        <b className="d-receipt-total">{naira(receipt.total)}</b>
        <small className="d-muted">{receipt.paidAt}</small>
        <Divider />
        <div className="d-receipt-rows">
          <Row label="Receipt no." value={receipt.ref} />
          <Row label="Studio" value={receipt.studio} />
          <Row label="Service" value={receipt.service} />
          <Row label="Staff" value={receipt.staff} />
          <Row label="Appointment" value={receipt.appointment} />
          <Row label="Paid with" value={receipt.paidWith} />
          <Row label="Transaction" value={receipt.transaction} />
          <Divider />
          <Row label="Subtotal" value={naira(receipt.subtotal)} />
          <Row label="VAT (7.5%)" value={naira(receipt.vat)} />
          <Divider />
          <Row label="Total" value={naira(receipt.total)} strong />
        </div>
      </Card>
      <div className="d-grid-2">
        <Button variant="outline" icon={Share2} onClick={share}>Share</Button>
        <Button icon={Download} onClick={() => void run(api.billing.downloadReceipt(receipt), "Receipt downloaded.")}>Download</Button>
      </div>
    </Page>
  );
}
